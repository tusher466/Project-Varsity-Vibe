import { getAccessToken, clearCachedAccessToken } from './googleAuth';
import { StudentOrder } from '../types';

export const SHEET_HEADERS = [
  'Order ID',
  'Date & Time',
  'Student Name',
  'Student ID',
  'Department',
  'Phone / Contact',
  'Jersey Model',
  'Size',
  'Customized Name',
  'Customized Number',
  'Quantity',
  'Total Price',
  'Status',
  'Pickup Point',
  'Special Instructions'
];

export interface SpreadsheetMetadata {
  title: string;
  tabs: { id: number; title: string }[];
}

export interface ResolvedSheetTab {
  tabName: string;
  sheetId?: number;
}

/**
 * Fetch basic metadata of the spreadsheet to inspect existing tabs and document title
 */
export async function getSpreadsheetMetadata(
  spreadsheetId: string, 
  token: string
): Promise<SpreadsheetMetadata | null> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearCachedAccessToken();
      }
      return null;
    }
    const data = await res.json();
    return {
      title: data.properties?.title || 'Google Sheet',
      tabs: (data.sheets || []).map((s: any) => ({
        id: s.properties?.sheetId ?? 0,
        title: s.properties?.title || 'Sheet1'
      }))
    };
  } catch (err) {
    console.warn('Failed to fetch spreadsheet metadata:', err);
    return null;
  }
}

/**
 * Resolves or creates an appropriate orders tab so queries never fail with "Unable to parse range".
 * 1. Checks if the preferred tab (e.g. 'Orders') exists.
 * 2. If not, checks if any tab has 'order' in its name.
 * 3. If neither exists, creates a new tab named preferredName ('Orders').
 * 4. If creating the tab is not possible, falls back to the first available tab (e.g. 'Sheet1').
 */
export async function resolveOrInitOrdersTab(
  spreadsheetId: string,
  token: string,
  preferredName: string = 'Orders'
): Promise<ResolvedSheetTab> {
  const meta = await getSpreadsheetMetadata(spreadsheetId, token);
  
  if (!meta || !meta.tabs || meta.tabs.length === 0) {
    // If metadata cannot be retrieved, default to preferredName
    return { tabName: preferredName };
  }

  // 1. Exact or case-insensitive match for preferredName
  const exactMatch = meta.tabs.find(
    t => t.title.trim().toLowerCase() === preferredName.trim().toLowerCase()
  );
  if (exactMatch) {
    return { tabName: exactMatch.title, sheetId: exactMatch.id };
  }

  // 2. Tab name containing "order" (e.g. "Varsity Orders", "Order List")
  const orderLike = meta.tabs.find(
    t => t.title.toLowerCase().includes('order')
  );
  if (orderLike) {
    return { tabName: orderLike.title, sheetId: orderLike.id };
  }

  // 3. Attempt to add the 'Orders' tab to the spreadsheet
  try {
    const addSheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: preferredName,
                  gridProperties: {
                    frozenRowCount: 1,
                    columnCount: 16,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (addSheetRes.ok) {
      const addData = await addSheetRes.json();
      const newSheetId = addData?.replies?.[0]?.addSheet?.properties?.sheetId;
      await initializeSheetHeaders(spreadsheetId, token, preferredName, newSheetId);
      return { tabName: preferredName, sheetId: newSheetId };
    }
  } catch (err) {
    console.warn('Could not add dedicated Orders tab, falling back to first tab:', err);
  }

  // 4. Fallback: Use the very first tab available in the spreadsheet (e.g. "Sheet1")
  const fallbackTab = meta.tabs[0];
  await initializeSheetHeaders(spreadsheetId, token, fallbackTab.title, fallbackTab.id);
  return { tabName: fallbackTab.title, sheetId: fallbackTab.id };
}

export async function createVarsityOrderSpreadsheet(customTitle?: string): Promise<{ id: string; url: string; sheetName: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authorization required. Please click "Authorize Google Sheets" to connect.');
  }

  const title = customTitle || `Varsity Jersey Orders - ${new Date().getFullYear()}`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Orders',
            gridProperties: {
              frozenRowCount: 1,
              columnCount: 16,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error?.message || res.statusText;
    if (res.status === 401 || res.status === 403 || message.includes('insufficient') || message.includes('PERMISSION_DENIED')) {
      clearCachedAccessToken();
      throw new Error('Google Sheets permission required. Please click "Authorize Google Sheets" to grant access.');
    }
    throw new Error(message || `Failed to create Google Sheet: ${res.statusText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  const sheetId = data.sheets?.[0]?.properties?.sheetId ?? 0;

  // Write headers and apply classic varsity styling
  await initializeSheetHeaders(spreadsheetId, token, 'Orders', sheetId);

  return { id: spreadsheetId, url: spreadsheetUrl, sheetName: 'Orders' };
}

export async function initializeSheetHeaders(
  spreadsheetId: string, 
  token: string,
  tabName: string = 'Orders',
  sheetId?: number
) {
  try {
    const escapedTab = `'${tabName.replace(/'/g, "''")}'`;
    const rangeA1 = `${escapedTab}!A1:O1`;

    // 1. Check if the header row already has values
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeA1)}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.values && checkData.values.length > 0 && checkData.values[0].length > 0) {
        // Headers already exist, leave intact
        return;
      }
    }

    // 2. Write the header row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeA1)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: rangeA1,
          majorDimension: 'ROWS',
          values: [SHEET_HEADERS],
        }),
      }
    );

    if (!appendRes.ok) {
      console.warn('Header row initial write notice:', await appendRes.text());
    }

    // 3. Format header row with collegiate dark navy and white text if sheetId is provided
    if (typeof sheetId === 'number') {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: SHEET_HEADERS.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.05, green: 0.11, blue: 0.24 }, // Collegiate Navy
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: SHEET_HEADERS.length,
                },
              },
            },
          ],
        }),
      });
    }
  } catch (err) {
    console.warn('Could not apply header styling:', err);
  }
}

export function formatOrderRow(order: StudentOrder): (string | number)[] {
  return [
    order.id,
    new Date(order.timestamp).toLocaleString(),
    order.studentName,
    order.studentId || 'N/A',
    order.department,
    order.phone,
    order.jerseyName,
    order.size,
    order.backName.toUpperCase(),
    order.backNumber,
    order.quantity,
    `${order.totalPrice} BDT`,
    order.status,
    order.pickupLocation,
    order.notes || ''
  ];
}

export async function appendOrderToSheet(
  spreadsheetId: string, 
  order: StudentOrder,
  preferredTabName: string = 'Orders'
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    return false;
  }

  try {
    const { tabName } = await resolveOrInitOrdersTab(spreadsheetId, token, preferredTabName);
    const row = formatOrderRow(order);
    const escapedTab = `'${tabName.replace(/'/g, "''")}'`;
    const rangeStr = `${escapedTab}!A:O`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: rangeStr,
          majorDimension: 'ROWS',
          values: [row],
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearCachedAccessToken();
      }
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to append single order to sheet:', err);
    return false;
  }
}

export async function syncMultipleOrdersToSheet(
  spreadsheetId: string, 
  orders: StudentOrder[],
  preferredTabName: string = 'Orders'
): Promise<{ success: boolean; count: number; error?: string; requiresAuth?: boolean; resolvedTabName?: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { 
      success: false, 
      count: 0, 
      requiresAuth: true,
      error: 'Google authorization required. Please click "Authorize Google Sheets".' 
    };
  }

  if (orders.length === 0) {
    return { success: true, count: 0, resolvedTabName: preferredTabName };
  }

  try {
    // Dynamically resolve existing or created tab name so "Unable to parse range" is eliminated
    const { tabName } = await resolveOrInitOrdersTab(spreadsheetId, token, preferredTabName);
    const rows = orders.map(formatOrderRow);
    const escapedTab = `'${tabName.replace(/'/g, "''")}'`;
    const rangeStr = `${escapedTab}!A:O`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: rangeStr,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const errJson = await res.json();
        errorMsg = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorMsg = await res.text().catch(() => res.statusText);
      }

      const isScopeError = res.status === 401 || res.status === 403 || 
        errorMsg.includes('insufficient authentication scopes') || 
        errorMsg.includes('PERMISSION_DENIED');

      if (isScopeError) {
        clearCachedAccessToken();
        return { 
          success: false, 
          count: 0, 
          requiresAuth: true,
          error: 'Google Sheets permission required. Please click "Authorize Google Sheets" to allow Varsity Vibe to sync orders.' 
        };
      }

      return { success: false, count: 0, error: errorMsg, resolvedTabName: tabName };
    }

    return { success: true, count: orders.length, resolvedTabName: tabName };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err?.message || 'Failed to synchronize with Google Sheet.',
    };
  }
}

export async function fetchSheetOrders(
  spreadsheetId: string,
  preferredTabName: string = 'Orders'
): Promise<any[][] | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const { tabName } = await resolveOrInitOrdersTab(spreadsheetId, token, preferredTabName);
    const escapedTab = `'${tabName.replace(/'/g, "''")}'`;
    const rangeStr = `${escapedTab}!A2:O`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error('Error fetching sheet orders:', err);
    return null;
  }
}
