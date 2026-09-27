import React, { useState } from 'react';
import { 
  PlusCircle, 
  Edit3, 
  ClipboardList, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Check, 
  Clock, 
  Printer, 
  Upload, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  LogOut,
  Shirt,
  Sparkles,
  ChevronRight,
  Download,
  Eye,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { JerseyDesign, StudentOrder, GoogleSheetConfig, OrderStatus } from '../types';
import { 
  createVarsityOrderSpreadsheet, 
  syncMultipleOrdersToSheet,
  getSpreadsheetMetadata,
  resolveOrInitOrdersTab
} from '../services/sheetsService';
import { ConfirmModal } from './ConfirmModal';
import { googleSignIn, logoutGoogle, getAccessToken } from '../services/googleAuth';
import { DIULogo } from './DIULogo';

interface OwnerPortalProps {
  designs: JerseyDesign[];
  orders: StudentOrder[];
  sheetConfig: GoogleSheetConfig | null;
  onSaveSheetConfig: (config: GoogleSheetConfig | null) => void;
  onAddDesign: (design: Omit<JerseyDesign, 'id' | 'createdAt'>) => void;
  onPurgeDemoDesigns?: () => void;
  onUpdateDesign: (id: string, updates: Partial<JerseyDesign>) => void;
  onDeleteDesign: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateMultipleOrdersStatus: (orderIds: string[], status: OrderStatus) => void;
  onMarkOrderSynced: (orderId: string, synced: boolean) => void;
  onLogoutOwner: () => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  designs,
  orders,
  sheetConfig,
  onSaveSheetConfig,
  onAddDesign,
  onPurgeDemoDesigns,
  onUpdateDesign,
  onDeleteDesign,
  onUpdateOrderStatus,
  onUpdateMultipleOrdersStatus,
  onMarkOrderSynced,
  onLogoutOwner,
}) => {
  // Navigation within Owner Part:
  // "In owner part only few options show. New jersecy upload, edit existing designs, and manage pending orders with status tracking."
  const [activeTab, setActiveTab] = useState<'orders' | 'upload' | 'designs'>('orders');

  // Filter & Search states for orders
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk Selection and Status Update states
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Completed');
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // States for New Jersey Upload
  const [newJerseyName, setNewJerseyName] = useState('');
  const [newJerseyEdition, setNewJerseyEdition] = useState('');
  const [newJerseyPrice, setNewJerseyPrice] = useState(650);
  const [newJerseyFabric, setNewJerseyFabric] = useState('Sublimated Dri-FIT Interlock 190 GSM');
  const [newJerseyDescription, setNewJerseyDescription] = useState('');
  const [newJerseyPrimaryColor, setNewJerseyPrimaryColor] = useState('#0B4D9C');
  const [newJerseySecondaryColor, setNewJerseySecondaryColor] = useState('#16A34A');
  const [newJerseyImage, setNewJerseyImage] = useState('');
  const [newJerseySizes, setNewJerseySizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // States for Editing existing design
  const [editingDesign, setEditingDesign] = useState<JerseyDesign | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // States for Google Sheet operations
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetNotice, setSheetNotice] = useState<{ type: 'success' | 'error'; text: string; action?: 'reauth' } | null>(null);
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const hasDemoDesigns = designs.some(
    d => d.isDemo || d.id.startsWith('diu-') || (d.imageUrl && d.imageUrl.includes('unsplash.com'))
  );

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      o.id.toLowerCase().includes(term) ||
      o.studentName.toLowerCase().includes(term) ||
      o.department.toLowerCase().includes(term) ||
      o.phone.includes(term) ||
      o.backName.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const printingCount = orders.filter(o => o.status === 'Printing').length;
  const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const unsyncedCount = orders.filter(o => !o.syncedToSheet).length;

  // Handlers: Bulk selection & status update
  const handleToggleOrderSelect = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllToggle = () => {
    const visibleIds = filteredOrders.map(o => o.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedOrderIds([]);
  };

  const handleApplyBulkStatus = () => {
    if (selectedOrderIds.length === 0) return;
    onUpdateMultipleOrdersStatus(selectedOrderIds, bulkStatus);
    setBulkNotice(`Updated ${selectedOrderIds.length} order${selectedOrderIds.length > 1 ? 's' : ''} to "${bulkStatus}"!`);
    setSelectedOrderIds([]);
    setTimeout(() => setBulkNotice(null), 4000);
  };

  // Handler: Handle Image upload from local file
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewJerseyImage(reader.result as string);
        setUploadError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Replace image on existing design card
  const handleReplaceCardImage = (designId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateDesign(designId, { 
          imageUrl: reader.result as string,
          isDemo: false 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Replace image in edit modal
  const handleEditModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingDesign) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingDesign({
          ...editingDesign,
          imageUrl: reader.result as string,
          isDemo: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Create new jersey
  // Prompt requirement: "When I upload any jersey image just show that image. Don't add demo jersey image. Replace the demo image with uploaded image."
  const handleCreateJersey = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!newJerseyName.trim()) {
      setUploadError('Please provide a name for the jersey design.');
      return;
    }

    if (!newJerseyImage.trim()) {
      setUploadError('Please upload your jersey image first. The uploaded jersey image will replace all demo images.');
      return;
    }

    // Call onAddDesign which replaces demo designs in storage
    onAddDesign({
      name: newJerseyName.trim(),
      edition: newJerseyEdition.trim() || 'DIU Campus Edition 2026',
      price: Number(newJerseyPrice) || 650,
      currency: 'BDT',
      fabricType: newJerseyFabric.trim() || 'Sublimated Dri-FIT Interlock 190 GSM',
      description: newJerseyDescription.trim() || 'Official varsity match jersey with moisture wicking fabric, raglan cut, and custom sublimation.',
      imageUrl: newJerseyImage.trim(),
      primaryColor: newJerseyPrimaryColor,
      secondaryColor: newJerseySecondaryColor,
      textColor: '#FFFFFF',
      availableSizes: newJerseySizes.length > 0 ? newJerseySizes : ['S', 'M', 'L', 'XL', 'XXL'],
      isPreOrderOpen: true,
      isDemo: false,
    });

    setUploadSuccess(true);
    setNewJerseyName('');
    setNewJerseyEdition('');
    setNewJerseyDescription('');
    setNewJerseyImage('');

    setTimeout(() => {
      setUploadSuccess(false);
      setActiveTab('designs');
    }, 1200);
  };

  // Handler: Save design edits
  const handleSaveDesignEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    onUpdateDesign(editingDesign.id, {
      ...editingDesign,
      isDemo: false,
    });
    setEditingDesign(null);
  };

  // Handler: Connect or create new Google Sheet
  const handleCreateGoogleSheet = async () => {
    try {
      setIsCreatingSheet(true);
      setSheetNotice(null);

      const authResult = await googleSignIn();
      if (!authResult) {
        setSheetNotice({
          type: 'error',
          text: 'Google Sign-in was cancelled or closed before completing. Keep the pop-up open to finish, or paste an existing Google Sheet link below.',
        });
        setIsCreatingSheet(false);
        return;
      }

      const newSheet = await createVarsityOrderSpreadsheet(`Varsity Vibe Orders - ${new Date().getFullYear()}`);

      const newConfig: GoogleSheetConfig = {
        spreadsheetId: newSheet.id,
        spreadsheetTitle: `Varsity Vibe Orders - ${new Date().getFullYear()}`,
        spreadsheetUrl: newSheet.url,
        sheetName: 'Orders',
        isAutoSyncEnabled: true,
        lastSyncTime: new Date().toISOString(),
      };

      onSaveSheetConfig(newConfig);

      if (orders.length > 0) {
        await syncMultipleOrdersToSheet(newSheet.id, orders, newSheet.sheetName || 'Orders');
        orders.forEach(o => onMarkOrderSynced(o.id, true));
      }

      setSheetNotice({
        type: 'success',
        text: `Successfully created and linked master Google Sheet: "${newConfig.spreadsheetTitle}"!`,
      });
    } catch (err: any) {
      setSheetNotice({
        type: 'error',
        text: err?.message || 'Failed to authenticate and create Google Sheet. Please try again.',
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Handler: Link existing Google Sheet via URL or ID with tab resolution
  const handleLinkExistingSheet = async () => {
    if (!customSheetInput.trim()) return;

    let sheetId = customSheetInput.trim();
    const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    setIsSyncingSheet(true);
    setSheetNotice(null);

    try {
      const token = await getAccessToken();
      let resolvedTitle = 'Linked Varsity Master Orders Sheet';
      let resolvedTab = 'Orders';

      if (token) {
        const meta = await getSpreadsheetMetadata(sheetId, token);
        if (meta?.title) {
          resolvedTitle = meta.title;
        }
        const resolved = await resolveOrInitOrdersTab(sheetId, token, 'Orders');
        resolvedTab = resolved.tabName;
      }

      const newConfig: GoogleSheetConfig = {
        spreadsheetId: sheetId,
        spreadsheetTitle: resolvedTitle,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
        sheetName: resolvedTab,
        isAutoSyncEnabled: true,
        lastSyncTime: new Date().toISOString(),
      };

      onSaveSheetConfig(newConfig);
      setCustomSheetInput('');
      setShowLinkInput(false);

      if (token && orders.length > 0) {
        const res = await syncMultipleOrdersToSheet(sheetId, orders, resolvedTab);
        if (res.success) {
          orders.forEach(o => onMarkOrderSynced(o.id, true));
          setSheetNotice({
            type: 'success',
            text: `Connected "${resolvedTitle}" (Tab: ${res.resolvedTabName || resolvedTab}) & synced ${orders.length} orders!`,
          });
        } else {
          setSheetNotice({
            type: 'success',
            text: `Google Sheet linked successfully! (Tab: ${resolvedTab}). Click "Sync to Sheet" to push orders.`,
          });
        }
      } else {
        setSheetNotice({
          type: 'success',
          text: `Google Sheet linked successfully! Orders will map to tab "${resolvedTab}".`,
        });
      }
    } catch (err: any) {
      setSheetNotice({
        type: 'error',
        text: err?.message || 'Failed to inspect linked sheet. Sheet linked with default settings.',
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleDisconnectSheet = () => {
    onSaveSheetConfig(null);
    setSheetNotice({
      type: 'success',
      text: 'Google Sheet unlinked. You can connect a new sheet anytime.',
    });
  };

  // Handler: Authorize Google Sheets with required scopes and auto-sync
  const handleAuthorizeSheets = async () => {
    try {
      setIsSyncingSheet(true);
      setSheetNotice(null);
      const authResult = await googleSignIn();
      if (!authResult) {
        setSheetNotice({
          type: 'error',
          text: 'Google Sign-in was cancelled. Keep the pop-up window open to grant Google Sheets permission.',
        });
        return;
      }

      setSheetNotice({
        type: 'success',
        text: 'Google account authorized with Google Sheets permissions! Syncing orders now...',
      });

      // Auto-retry sync to connected sheet if one exists
      if (sheetConfig) {
        const ordersToSync = orders.filter(o => !o.syncedToSheet);
        const targetOrders = ordersToSync.length > 0 ? ordersToSync : orders;
        const res = await syncMultipleOrdersToSheet(
          sheetConfig.spreadsheetId, 
          targetOrders, 
          sheetConfig.sheetName || 'Orders'
        );
        if (res.success) {
          targetOrders.forEach(o => onMarkOrderSynced(o.id, true));
          onSaveSheetConfig({
            ...sheetConfig,
            sheetName: res.resolvedTabName || sheetConfig.sheetName || 'Orders',
            lastSyncTime: new Date().toISOString(),
          });
          setSheetNotice({
            type: 'success',
            text: `Successfully authorized and synchronized ${targetOrders.length} orders to Google Sheet (Tab: ${res.resolvedTabName || sheetConfig.sheetName || 'Orders'})!`,
          });
        } else {
          setSheetNotice({
            type: 'error',
            text: res.error || 'Failed to sync after authorization. Please check sheet permissions.',
          });
        }
      }
    } catch (err: any) {
      setSheetNotice({
        type: 'error',
        text: err?.message || 'Failed to authorize Google Sheets. Please try again.',
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Handler: Manual 1-click sync all orders to Google Sheet
  const handleSyncOrdersToSheet = async () => {
    if (!sheetConfig) {
      setSheetNotice({
        type: 'error',
        text: 'Please connect or create a Google Sheet first.',
      });
      return;
    }

    try {
      setIsSyncingSheet(true);
      setSheetNotice(null);

      const ordersToSync = orders.filter(o => !o.syncedToSheet);
      const targetOrders = ordersToSync.length > 0 ? ordersToSync : orders;

      const res = await syncMultipleOrdersToSheet(
        sheetConfig.spreadsheetId, 
        targetOrders, 
        sheetConfig.sheetName || 'Orders'
      );
      if (res.success) {
        targetOrders.forEach(o => onMarkOrderSynced(o.id, true));
        onSaveSheetConfig({
          ...sheetConfig,
          sheetName: res.resolvedTabName || sheetConfig.sheetName || 'Orders',
          lastSyncTime: new Date().toISOString(),
        });
        setSheetNotice({
          type: 'success',
          text: `Successfully synchronized ${targetOrders.length} orders to Google Sheet (Tab: ${res.resolvedTabName || sheetConfig.sheetName || 'Orders'})!`,
        });
      } else if (res.requiresAuth) {
        setSheetNotice({
          type: 'error',
          text: res.error || 'Google Sheets permission required. Please click "Authorize Google Sheets".',
          action: 'reauth',
        });
      } else {
        throw new Error(res.error || 'Failed to append orders to Google Sheet.');
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      const errMsg = err?.message || '';
      const isAuthErr = errMsg.includes('permission') || errMsg.includes('scope') || errMsg.includes('insufficient');
      setSheetNotice({
        type: 'error',
        text: isAuthErr 
          ? 'Google Sheets authorization required. Please authorize to grant permissions.'
          : (errMsg || 'Sync failed. You may need to reconnect Google Sheets.'),
        action: isAuthErr ? 'reauth' : undefined,
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Handler: Export CSV for factory / local backup
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Student Name', 'Student ID', 'Department', 'Phone', 'Jersey Edition', 'Size', 'Back Name', 'Back Number', 'Quantity', 'Total Price', 'Status', 'Pickup Point', 'Notes'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.timestamp).toLocaleDateString(),
      `"${o.studentName.replace(/"/g, '""')}"`,
      o.studentId,
      `"${o.department}"`,
      o.phone,
      `"${o.jerseyName}"`,
      o.size,
      `"${o.backName}"`,
      o.backNumber,
      o.quantity,
      o.totalPrice,
      o.status,
      `"${o.pickupLocation}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Varsity_Vibe_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Owner Header Bar */}
      <div className="bg-gradient-to-br from-[#06182E] via-[#071D36] to-[#0B4D9C] border border-[#0E3A6E] rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <DIULogo variant="crest" size="md" className="hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Varsity Vibe Owner Part
              </span>
              <span className="text-xs text-sky-200">Restricted Administration</span>
            </div>
            <h1 className="font-classic text-2xl sm:text-3xl font-black text-white mt-1">
              Store Owner Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-normal">
              Upload new jersey designs, replace demo jerseys with your uploaded images, track pending student orders, and sync to Google Sheets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onLogoutOwner}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer backdrop-blur"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Owner Mode</span>
          </button>
        </div>
      </div>

      {/* Google Sheet Integration Hub Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Google Sheet Master Database
                </h3>
                {sheetConfig ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-3 h-3" /> Ready to Connect
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {sheetConfig ? (
                  <>
                    Syncing student jersey orders with spreadsheet:{' '}
                    <strong className="text-slate-900">{sheetConfig.spreadsheetTitle}</strong>
                  </>
                ) : (
                  'All student jersey orders are stored in one central Google Sheet for varsity management.'
                )}
              </p>
            </div>
          </div>

          {/* Sheet Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {sheetConfig ? (
              <>
                <a
                  href={sheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Sheet in Drive</span>
                </a>

                <button
                  type="button"
                  disabled={isSyncingSheet}
                  onClick={handleSyncOrdersToSheet}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheet ? 'Syncing...' : `Sync to Sheet (${unsyncedCount} Pending)`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnectSheet}
                  className="px-2.5 py-2 text-[11px] font-semibold text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Unlink this spreadsheet"
                >
                  Change Sheet
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isCreatingSheet}
                  onClick={handleCreateGoogleSheet}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isCreatingSheet ? 'Creating Sheet...' : 'Auto-Create Google Sheet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition cursor-pointer"
                >
                  {showLinkInput ? 'Close Link Box' : 'Link Existing Sheet URL'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              title="Download CSV for print shop or local backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Inline Box to Link Existing Google Sheet */}
        {showLinkInput && !sheetConfig && (
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="Paste Google Sheet URL (https://docs.google.com/spreadsheets/d/.../edit) or Sheet ID"
              value={customSheetInput}
              onChange={(e) => setCustomSheetInput(e.target.value)}
              className="flex-1 w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleLinkExistingSheet}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              Link Sheet
            </button>
          </div>
        )}

        {sheetNotice && (
          <div className={`p-3 rounded-xl text-xs flex flex-wrap items-center gap-2 justify-between ${
            sheetNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {sheetNotice.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{sheetNotice.text}</span>
            </div>
            {sheetNotice.action === 'reauth' && (
              <button
                type="button"
                onClick={handleAuthorizeSheets}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Authorize Google Sheets</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Primary Owner Navigation Options */}
      {/* USER PROMPT: "In owner part only few options show. New jersecy upload, edit existing designs, and manage pending orders with status tracking." */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#0B4D9C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 border-b-0'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Manage Pending Orders</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#0B4D9C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 border-b-0'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Jersey Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('designs')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'designs'
              ? 'bg-[#0B4D9C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 border-b-0'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Existing Designs ({designs.length})</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: MANAGE PENDING ORDERS WITH STATUS TRACKING */}
      {/* ================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
              <p className="font-classic text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
              <span className="text-[11px] text-slate-400">Pre-orders collected</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending</span>
              <p className="font-classic text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
              <span className="text-[11px] text-amber-600">Needs review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Printing</span>
              <p className="font-classic text-2xl font-bold text-purple-800 mt-1">{printingCount}</p>
              <span className="text-[11px] text-purple-600">In production</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Ready for Pickup</span>
              <p className="font-classic text-2xl font-bold text-blue-800 mt-1">{readyCount}</p>
              <span className="text-[11px] text-blue-600">At campus booth</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</span>
              <p className="font-classic text-2xl font-bold text-emerald-800 mt-1">{completedCount}</p>
              <span className="text-[11px] text-emerald-600">Fulfilled orders</span>
            </div>
          </div>

          {/* Bulk Update Success Alert */}
          {bulkNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bulkNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setBulkNotice(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by student, ID, phone, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0B4D9C]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
              {[
                { id: 'all', label: 'All' },
                { id: 'Pending', label: 'Pending' },
                { id: 'Confirmed', label: 'Confirmed' },
                { id: 'Printing', label: 'Printing' },
                { id: 'Ready for Pickup', label: 'Ready' },
                { id: 'Completed', label: 'Completed' },
                { id: 'Delivered', label: 'Delivered' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#0B4D9C] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* BULK ACTION TOOLBAR (Shown when 1 or more orders are selected via checkboxes) */}
          {selectedOrderIds.length > 0 && (
            <div className="bg-[#071D36] text-white p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl border border-blue-500/30 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shadow">
                  {selectedOrderIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {selectedOrderIds.length} order{selectedOrderIds.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Bulk update tracking status across varsity orders at once
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-300 font-semibold">Set status to:</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                    className="bg-slate-800 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Printing">Printing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleApplyBulkStatus}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Selected ({selectedOrderIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-2">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No orders matching your criteria</h4>
                <p className="text-xs text-slate-500">Try adjusting the filter or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label="Select all visible orders"
                          checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.includes(o.id))}
                          onChange={handleSelectAllToggle}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-[#0B4D9C]"
                        />
                      </th>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Student & Faculty</th>
                      <th className="py-3 px-4">Jersey Model</th>
                      <th className="py-3 px-4">Custom Print (Name & #)</th>
                      <th className="py-3 px-4">Size & Qty</th>
                      <th className="py-3 px-4">Payable</th>
                      <th className="py-3 px-4">Status Tracking</th>
                      <th className="py-3 px-4 text-center">Sheet Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrderIds.includes(order.id);

                      return (
                      <tr 
                        key={order.id} 
                        className={`transition hover:bg-blue-50/40 ${
                          isSelected ? 'bg-blue-50/70' : 'bg-white'
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select order ${order.id}`}
                            checked={isSelected}
                            onChange={() => handleToggleOrderSelect(order.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-[#0B4D9C]"
                          />
                        </td>

                        {/* Order ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.timestamp).toLocaleDateString()} {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Student Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{order.studentName}</div>
                          <div className="text-[11px] text-slate-500">{order.department}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {order.studentId} • 📞 {order.phone}</div>
                        </td>

                        {/* Jersey */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block line-clamp-1">
                            {order.jerseyName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            📍 {order.pickupLocation}
                          </span>
                        </td>

                        {/* Custom Back Print */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                            <span className="font-mono font-black tracking-wider text-xs uppercase">{order.backName}</span>
                            <span className="text-emerald-400">|</span>
                            <span className="font-mono font-black text-sm">#{order.backNumber}</span>
                          </div>
                        </td>

                        {/* Size & Qty */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-bold border border-slate-200">
                            {order.size}
                          </span>
                          <span className="ml-2 text-slate-600">x{order.quantity}</span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {order.totalPrice} BDT
                        </td>

                        {/* Status Tracking Dropdown */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border focus:outline-none transition cursor-pointer ${
                              order.status === 'Completed' ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-extrabold' :
                              order.status === 'Pending' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                              order.status === 'Confirmed' ? 'bg-blue-50 border-blue-300 text-blue-900' :
                              order.status === 'Printing' ? 'bg-purple-50 border-purple-300 text-purple-900' :
                              order.status === 'Ready for Pickup' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                              order.status === 'Delivered' ? 'bg-slate-100 border-slate-300 text-slate-800' :
                              'bg-rose-50 border-rose-300 text-rose-800'
                            }`}
                          >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Printing">Printing</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Sheet Sync */}
                        <td className="py-3.5 px-4 text-center">
                          {order.syncedToSheet ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700" title="Synchronized to Google Sheet">
                              <Check className="w-3.5 h-3.5" />
                              Synced
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSyncOrdersToSheet()}
                              className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded border border-amber-300 transition cursor-pointer"
                            >
                              Sync Now
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: NEW JERSEY UPLOAD */}
      {/* USER PROMPT: "When I upload any jersey image just show that image. Don't add demo jersey image. Replace the demo image with uploaded image." */}
      {/* ================================================================= */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="max-w-3xl mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4D9C]">
              Varsity Design Studio
            </span>
            <h2 className="font-classic text-2xl font-black text-slate-900 mt-1">
              Upload New Jersey Design
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Upload your new varsity jersey image. Once uploaded, the demo images will be completely replaced with this uploaded jersey image, and students will immediately be able to view and pre-order.
            </p>
          </div>

          {uploadError && (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>New jersey uploaded! Demo images have been replaced with your uploaded design.</span>
            </div>
          )}

          <form onSubmit={handleCreateJersey} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                {/* Title & Edition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jersey Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DIU Varsity Champions Jersey"
                      value={newJerseyName}
                      onChange={(e) => setNewJerseyName(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Edition / Faculty Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inter-Faculty Cup 2026"
                      value={newJerseyEdition}
                      onChange={(e) => setNewJerseyEdition(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Price & Fabric */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Selling Price (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={10}
                      value={newJerseyPrice}
                      onChange={(e) => setNewJerseyPrice(Number(e.target.value))}
                      className="w-full text-sm font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fabric Material Specification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sublimated Dri-FIT Interlock 190 GSM"
                      value={newJerseyFabric}
                      onChange={(e) => setNewJerseyFabric(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Jersey Image Upload - Strictly enforced */}
                <div className="space-y-2 p-4 bg-blue-50/40 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0B4D9C]">
                      Upload Jersey Photo (Replaces Demo Images) *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-slate-50 border-2 border-dashed border-[#0B4D9C] rounded-xl text-xs font-bold text-[#0B4D9C] transition cursor-pointer shadow-sm">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Choose Jersey File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <span className="text-xs text-slate-400 font-medium">OR URL</span>

                    <input
                      type="url"
                      placeholder="Paste Image URL directly"
                      value={newJerseyImage}
                      onChange={(e) => setNewJerseyImage(e.target.value)}
                      className="flex-1 w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Upload your real varsity shirt photo or mock-up. Only this uploaded image will be shown across the app.
                  </p>
                </div>

                {/* Available Sizes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Available Sizes for Students
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map(sz => {
                      const isSelected = newJerseySizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewJerseySizes(newJerseySizes.filter(s => s !== sz));
                            } else {
                              setNewJerseySizes([...newJerseySizes, sz]);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#0B4D9C] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jersey Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the jersey fit, fabric feel, badge details, and print quality..."
                    value={newJerseyDescription}
                    onChange={(e) => setNewJerseyDescription(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Side: Exact Uploaded Jersey Image Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4D9C] mb-3 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Live Uploaded Jersey Preview
                </span>
                
                {newJerseyImage ? (
                  <div className="w-full space-y-3">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-lg group">
                      <img
                        src={newJerseyImage}
                        alt="Uploaded Jersey"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                        Uploaded Jersey Image
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-md shadow border border-emerald-500/40">
                        {newJerseyPrice} BDT
                      </div>
                    </div>

                    <div className="bg-[#071D36] text-white p-4 rounded-xl border border-[#0E3560] text-xs space-y-1">
                      <p className="font-bold text-sm text-white">{newJerseyName || 'Untitled Jersey'}</p>
                      <p className="text-[11px] text-emerald-400">{newJerseyEdition || 'DIU Campus Edition'}</p>
                      <p className="text-[10px] text-slate-300">{newJerseyFabric}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2 bg-white">
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No Image Uploaded Yet</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Choose an image file from your device or paste a URL on the left. The exact uploaded image will be shown here and will replace all demo images.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/30 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Uploaded Jersey</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: EDIT EXISTING DESIGNS */}
      {/* ================================================================= */}
      {activeTab === 'designs' && (
        <div className="space-y-6">
          {/* Header & Demo Removal Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-classic text-xl font-bold text-slate-900">
                Catalog Designs ({designs.length})
              </h2>
              <p className="text-xs text-slate-500">
                Edit pricing, upload replacement photos, toggle pre-orders, or purge demo items.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hasDemoDesigns && onPurgeDemoDesigns && (
                <button
                  type="button"
                  onClick={onPurgeDemoDesigns}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                  title="Remove stock demo photos so only your uploaded jerseys appear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Demo Jerseys</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0B4D9C] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Upload New Jersey</span>
              </button>
            </div>
          </div>

          {designs.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Shirt className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Jersey Designs in Catalog</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your first custom jersey image to display it in the varsity student storefront.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 bg-[#0B4D9C] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Upload Jersey Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden group">
                    <img
                      src={design.imageUrl}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        design.isPreOrderOpen ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {design.isPreOrderOpen ? 'Pre-Order Active' : 'Pre-Order Closed'}
                      </span>
                      {design.isDemo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                          Demo Image
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                      {design.price} {design.currency}
                    </div>

                    {/* Quick Replace Image Overlay on Hover */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <label className="px-3.5 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition">
                        <Upload className="w-4 h-4 text-[#0B4D9C]" />
                        <span>Replace with Uploaded Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReplaceCardImage(design.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4D9C]">
                        {design.edition}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                        {design.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {design.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateDesign(design.id, { isPreOrderOpen: !design.isPreOrderOpen })}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                          design.isPreOrderOpen
                            ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                        }`}
                      >
                        {design.isPreOrderOpen ? 'Close Pre-Orders' : 'Open Pre-Orders'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingDesign(design)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Edit Design Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(design.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="Delete Design"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Design Modal */}
      {editingDesign && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-classic text-lg font-bold text-slate-900">
                Edit Jersey Design
              </h3>
              <button
                onClick={() => setEditingDesign(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDesignEdits} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jersey Name
                </label>
                <input
                  type="text"
                  required
                  value={editingDesign.name}
                  onChange={(e) => setEditingDesign({ ...editingDesign, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B4D9C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edition Subtitle
                </label>
                <input
                  type="text"
                  value={editingDesign.edition}
                  onChange={(e) => setEditingDesign({ ...editingDesign, edition: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B4D9C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDesign.price}
                    onChange={(e) => setEditingDesign({ ...editingDesign, price: Number(e.target.value) })}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    value={editingDesign.fabricType}
                    onChange={(e) => setEditingDesign({ ...editingDesign, fabricType: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Upload New Image in Edit Modal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Replace Jersey Image
                </label>
                <div className="flex gap-2 items-center">
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-[#0B4D9C]" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditModalImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste Image URL"
                    value={editingDesign.imageUrl}
                    onChange={(e) => setEditingDesign({ ...editingDesign, imageUrl: e.target.value })}
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Current Image Thumbnail */}
              {editingDesign.imageUrl && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={editingDesign.imageUrl}
                    alt="Current Design"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingDesign.description}
                  onChange={(e) => setEditingDesign({ ...editingDesign, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDesign(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B4D9C] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Jersey Design?"
        message="Are you sure you want to delete this jersey design? It will no longer be visible in the student store. Existing placed orders will not be affected."
        confirmLabel="Yes, Delete Design"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteDesign(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
