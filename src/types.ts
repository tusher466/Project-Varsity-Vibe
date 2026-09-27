export type OrderStatus = 'Pending' | 'Confirmed' | 'Printing' | 'Ready for Pickup' | 'Delivered' | 'Completed' | 'Cancelled';

export interface JerseyDesign {
  id: string;
  name: string;
  edition: string;
  price: number;
  currency: string;
  imageUrl: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  availableSizes: string[];
  isPreOrderOpen: boolean;
  fabricType: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface StudentOrder {
  id: string;
  timestamp: string;
  studentName: string;
  studentId: string;
  department: string;
  phone: string;
  jerseyId: string;
  jerseyName: string;
  backName: string;
  backNumber: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  pickupLocation: string;
  notes?: string;
  syncedToSheet: boolean;
  syncedAt?: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  sheetName: string;
  isAutoSyncEnabled: boolean;
  lastSyncTime?: string;
}
