import { JerseyDesign, StudentOrder, GoogleSheetConfig, OrderStatus } from '../types';

const STORAGE_KEYS = {
  DESIGNS: 'varsity_vibe_designs_v2',
  ORDERS: 'varsity_vibe_orders_v2',
  SHEET_CONFIG: 'varsity_vibe_sheet_config_v2',
  ADMIN_EMAILS: 'varsity_admin_emails_v1',
};

export const DEFAULT_ADMIN_EMAIL = 'mdtusherhossen701@gmail.com';

export const INITIAL_DESIGNS: JerseyDesign[] = [
  {
    id: 'diu-navy-emerald-2026',
    name: 'DIU Official Varsity Navy Match Kit',
    edition: 'Daffodil International University Inter-Faculty 2026',
    price: 650,
    currency: 'BDT',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
    description: 'Official DIU match kit engineered with breathable moisture-wicking Dri-FIT interlock fabric. Features the DIU university badge print, athletic raglan sleeves, and custom name/number sublimation.',
    primaryColor: '#0B4D9C', // DIU Royal Navy Blue
    secondaryColor: '#16A34A', // DIU Emerald Green
    textColor: '#FFFFFF',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    isPreOrderOpen: true,
    fabricType: 'Sublimated Dri-FIT Interlock 190 GSM',
    createdAt: '2026-09-01T10:00:00Z',
    isDemo: true,
  },
  {
    id: 'diu-cse-tech-black',
    name: 'DIU CSE & SWE Cyber Tech Edition',
    edition: 'Faculty of Science & Information Technology (FSIT)',
    price: 680,
    currency: 'BDT',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    description: 'Tailored for DIU Tech, Hackathon, and Gaming tournaments. Matte carbon black body with DIU cyber blue piping and high-contrast reflective back lettering.',
    primaryColor: '#091E3A', // DIU Deep Navy
    secondaryColor: '#38BDF8', // DIU Electric Cyan
    textColor: '#FFFFFF',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    isPreOrderOpen: true,
    fabricType: 'Micro Jacquard Honeycomb Mesh 195 GSM',
    createdAt: '2026-09-05T12:30:00Z',
    isDemo: true,
  },
  {
    id: 'diu-emerald-athletics',
    name: 'DIU Emerald Pride Athletic Kit',
    edition: 'DIU Sports Club & Annual Campus Gala',
    price: 620,
    currency: 'BDT',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
    description: 'Vibrant DIU signature emerald green with royal navy chest accents. High elasticity four-way stretch fabric with odor-resistant finish for intense match days.',
    primaryColor: '#16A34A', // DIU Green
    secondaryColor: '#0B4D9C', // DIU Blue
    textColor: '#FFFFFF',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isPreOrderOpen: true,
    fabricType: 'Air-Flow Micro Mesh 190 GSM',
    createdAt: '2026-09-10T14:15:00Z',
    isDemo: true,
  },
  {
    id: 'diu-heritage-gold',
    name: 'DIU Heritage Gold Varsity Kit',
    edition: 'DIU Championship & Alumni Memorial Edition',
    price: 700,
    currency: 'BDT',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    description: 'Crisp white body with official DIU double royal blue collar and gold foil varsity details. Designed for university tournaments, convocations, and campus pride.',
    primaryColor: '#0B4D9C', // Royal Blue
    secondaryColor: '#EAB308', // Varsity Gold
    textColor: '#FFFFFF',
    availableSizes: ['M', 'L', 'XL', 'XXL', '3XL'],
    isPreOrderOpen: true,
    fabricType: 'Quick-Dry Pro Matte Lycra 200 GSM',
    createdAt: '2026-09-15T09:00:00Z',
    isDemo: true,
  }
];

export const INITIAL_ORDERS: StudentOrder[] = [
  {
    id: 'VIBE-701',
    timestamp: '2026-09-26T14:20:00Z',
    studentName: 'Md. Tusher Hossen',
    studentId: '211-15-4921',
    department: 'Software Engineering (SWE)',
    phone: '01712345678',
    jerseyId: 'diu-navy-emerald-2026',
    jerseyName: 'DIU Official Varsity Navy Match Kit',
    backName: 'TUSHER',
    backNumber: '10',
    size: 'L',
    quantity: 1,
    unitPrice: 650,
    totalPrice: 650,
    status: 'Printing',
    pickupLocation: 'DIU Daffodil Smart City (DSC) Booth',
    notes: 'Please ensure high-definition back print.',
    syncedToSheet: true,
    syncedAt: '2026-09-26T14:22:00Z'
  },
  {
    id: 'VIBE-702',
    timestamp: '2026-09-26T16:45:00Z',
    studentName: 'Farhan Sadik',
    studentId: '222-15-8831',
    department: 'Computer Science & Engineering (CSE)',
    phone: '01898765432',
    jerseyId: 'diu-cse-tech-black',
    jerseyName: 'DIU CSE & SWE Cyber Tech Edition',
    backName: 'FARHAN',
    backNumber: '07',
    size: 'XL',
    quantity: 1,
    unitPrice: 680,
    totalPrice: 680,
    status: 'Confirmed',
    pickupLocation: 'DIU DSC Knowledge Tower',
    notes: 'Paid via bKash',
    syncedToSheet: true,
    syncedAt: '2026-09-26T16:50:00Z'
  }
];

export const StorageService = {
  // Designs
  getDesigns(): JerseyDesign[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DESIGNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(INITIAL_DESIGNS));
      return INITIAL_DESIGNS;
    }
    try {
      const parsed: JerseyDesign[] = JSON.parse(raw);
      return parsed;
    } catch {
      return INITIAL_DESIGNS;
    }
  },

  hasDemoDesigns(): boolean {
    const designs = this.getDesigns();
    return designs.some(d => d.isDemo || d.id.startsWith('diu-') || (d.imageUrl && d.imageUrl.includes('unsplash.com')));
  },

  purgeDemoDesigns(): void {
    const designs = this.getDesigns();
    const nonDemo = designs.filter(d => !d.isDemo && !d.id.startsWith('diu-') && !(d.imageUrl && d.imageUrl.includes('unsplash.com')));
    this.saveDesigns(nonDemo);
  },

  saveDesigns(designs: JerseyDesign[]) {
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(designs));
    window.dispatchEvent(new Event('varsity_designs_updated'));
  },

  addDesign(design: Omit<JerseyDesign, 'id' | 'createdAt'>, replaceDemo: boolean = true): JerseyDesign {
    const currentDesigns = this.getDesigns();
    
    // Check if we should replace demo designs:
    // If replaceDemo is true and there are demo designs, discard the demo designs so ONLY the uploaded jersey is shown!
    let targetDesigns: JerseyDesign[];
    if (replaceDemo) {
      targetDesigns = currentDesigns.filter(d => !d.isDemo && !d.id.startsWith('diu-') && !(d.imageUrl && d.imageUrl.includes('unsplash.com')));
    } else {
      targetDesigns = [...currentDesigns];
    }

    const newDesign: JerseyDesign = {
      ...design,
      id: `jersey-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    targetDesigns.unshift(newDesign);
    this.saveDesigns(targetDesigns);
    return newDesign;
  },

  updateDesign(id: string, updates: Partial<JerseyDesign>): JerseyDesign | null {
    const designs = this.getDesigns();
    const index = designs.findIndex(d => d.id === id);
    if (index === -1) return null;
    designs[index] = { ...designs[index], ...updates, isDemo: false };
    this.saveDesigns(designs);
    return designs[index];
  },

  deleteDesign(id: string): boolean {
    const designs = this.getDesigns();
    const filtered = designs.filter(d => d.id !== id);
    if (filtered.length === designs.length) return false;
    this.saveDesigns(filtered);
    return true;
  },

  // Orders
  getOrders(): StudentOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: StudentOrder[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('varsity_orders_updated'));
  },

  addOrder(order: Omit<StudentOrder, 'id' | 'timestamp' | 'status' | 'syncedToSheet'>): StudentOrder {
    const orders = this.getOrders();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: StudentOrder = {
      ...order,
      id: `VIBE-${randomSuffix}`,
      timestamp: new Date().toISOString(),
      status: 'Pending',
      syncedToSheet: false,
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;
    orders[index].status = status;
    this.saveOrders(orders);
    return true;
  },

  updateMultipleOrdersStatus(orderIds: string[], status: OrderStatus): number {
    const orders = this.getOrders();
    const idSet = new Set(orderIds);
    let count = 0;
    orders.forEach(o => {
      if (idSet.has(o.id)) {
        o.status = status;
        count++;
      }
    });
    if (count > 0) {
      this.saveOrders(orders);
    }
    return count;
  },

  markOrderSynced(orderId: string, synced = true) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;
    orders[index].syncedToSheet = synced;
    orders[index].syncedAt = synced ? new Date().toISOString() : undefined;
    this.saveOrders(orders);
  },

  // Sheet Config
  getSheetConfig(): GoogleSheetConfig | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveSheetConfig(config: GoogleSheetConfig | null) {
    if (!config) {
      localStorage.removeItem(STORAGE_KEYS.SHEET_CONFIG);
    } else {
      localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
    }
    window.dispatchEvent(new Event('varsity_sheet_config_updated'));
  },

  // Owner Admin Verified Access
  getAdminEmails(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAILS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAILS, JSON.stringify([DEFAULT_ADMIN_EMAIL]));
      return [DEFAULT_ADMIN_EMAIL];
    }
    try {
      const list: string[] = JSON.parse(raw);
      if (!list.includes(DEFAULT_ADMIN_EMAIL)) {
        list.unshift(DEFAULT_ADMIN_EMAIL);
        localStorage.setItem(STORAGE_KEYS.ADMIN_EMAILS, JSON.stringify(list));
      }
      return list;
    } catch {
      return [DEFAULT_ADMIN_EMAIL];
    }
  },

  addAdminEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) return false;
    const list = this.getAdminEmails();
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAILS, JSON.stringify(list));
      return true;
    }
    return false;
  },

  removeAdminEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    if (normalized === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      return false; // Cannot remove primary owner email
    }
    const list = this.getAdminEmails().filter(e => e.toLowerCase() !== normalized);
    localStorage.setItem(STORAGE_KEYS.ADMIN_EMAILS, JSON.stringify(list));
    return true;
  },

  isAuthorizedAdmin(email?: string | null): boolean {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const list = this.getAdminEmails();
    return list.some(admin => admin.toLowerCase() === normalized);
  },
};
