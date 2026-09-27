import React, { useState, useEffect } from 'react';
import { 
  JerseyDesign, 
  StudentOrder, 
  GoogleSheetConfig, 
  OrderStatus 
} from './types';
import { StorageService } from './services/storageService';
import { initAuth, logoutGoogle } from './services/googleAuth';
import { appendOrderToSheet } from './services/sheetsService';

import { Navbar } from './components/Navbar';
import { StudentStore } from './components/StudentStore';
import { StudentOrderLookup } from './components/StudentOrderLookup';
import { OwnerPortal } from './components/OwnerPortal';
import { OrderModal } from './components/OrderModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { Shield, Sparkles, FileSpreadsheet, Lock } from 'lucide-react';
import { DIULogo } from './components/DIULogo';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'store' | 'track' | 'owner'>('store');
  const [designs, setDesigns] = useState<JerseyDesign[]>([]);
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);

  // Modals & Active selections
  const [selectedJersey, setSelectedJersey] = useState<JerseyDesign | null>(null);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<StudentOrder | null>(null);
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');

  // Load initial data from StorageService & register event listeners
  useEffect(() => {
    setDesigns(StorageService.getDesigns());
    setOrders(StorageService.getOrders());
    setSheetConfig(StorageService.getSheetConfig());

    const handleDesignsUpdate = () => {
      setDesigns(StorageService.getDesigns());
    };
    const handleOrdersUpdate = () => {
      setOrders(StorageService.getOrders());
    };
    const handleSheetConfigUpdate = () => {
      setSheetConfig(StorageService.getSheetConfig());
    };

    window.addEventListener('varsity_designs_updated', handleDesignsUpdate);
    window.addEventListener('varsity_orders_updated', handleOrdersUpdate);
    window.addEventListener('varsity_sheet_config_updated', handleSheetConfigUpdate);

    // Initialize Firebase Auth listener for Google Sheets access
    initAuth(
      (user) => {
        if (StorageService.isAuthorizedAdmin(user.email)) {
          setIsOwnerAuthenticated(true);
        } else {
          setIsOwnerAuthenticated(false);
        }
      },
      () => {
        setIsOwnerAuthenticated(false);
      }
    );

    return () => {
      window.removeEventListener('varsity_designs_updated', handleDesignsUpdate);
      window.removeEventListener('varsity_orders_updated', handleOrdersUpdate);
      window.removeEventListener('varsity_sheet_config_updated', handleSheetConfigUpdate);
    };
  }, []);

  // Handle student placing a custom order
  const handlePlaceOrder = async (
    orderData: Omit<StudentOrder, 'id' | 'timestamp' | 'status' | 'syncedToSheet'>
  ): Promise<StudentOrder> => {
    // 1. Save to local storage first (instant persistence)
    const newOrder = StorageService.addOrder(orderData);

    // 2. If Google Sheet is connected, attempt direct sync
    if (sheetConfig?.spreadsheetId) {
      try {
        const synced = await appendOrderToSheet(sheetConfig.spreadsheetId, newOrder, sheetConfig.sheetName || 'Orders');
        if (synced) {
          StorageService.markOrderSynced(newOrder.id, true);
          newOrder.syncedToSheet = true;
        }
      } catch (err) {
        console.warn('Google Sheet background append notice (order kept safe in local queue):', err);
      }
    }

    // 3. Open receipt modal
    setSelectedJersey(null);
    setLastSubmittedOrder(newOrder);

    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, status);
  };

  const handleUpdateMultipleOrdersStatus = (orderIds: string[], status: OrderStatus) => {
    StorageService.updateMultipleOrdersStatus(orderIds, status);
  };

  const handleAddDesign = (designData: Omit<JerseyDesign, 'id' | 'createdAt'>) => {
    StorageService.addDesign(designData);
  };

  const handlePurgeDemoDesigns = () => {
    StorageService.purgeDemoDesigns();
  };

  const handleUpdateDesign = (id: string, updates: Partial<JerseyDesign>) => {
    StorageService.updateDesign(id, updates);
  };

  const handleDeleteDesign = (id: string) => {
    StorageService.deleteDesign(id);
  };

  const handleSaveSheetConfig = (config: GoogleSheetConfig | null) => {
    StorageService.saveSheetConfig(config);
  };

  const handleMarkOrderSynced = (orderId: string, synced: boolean) => {
    StorageService.markOrderSynced(orderId, synced);
  };

  const handleLogoutOwner = async () => {
    await logoutGoogle();
    setIsOwnerAuthenticated(false);
    setCurrentTab('store');
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-serif-classic">
      {/* Varsity Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOwnerAuthenticated={isOwnerAuthenticated}
        sheetConfig={sheetConfig}
        onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* STUDENT STOREFRONT */}
        {currentTab === 'store' && (
          <StudentStore
            designs={designs}
            onSelectJerseyForOrder={(jersey) => setSelectedJersey(jersey)}
            onOpenTrackTab={() => setCurrentTab('track')}
          />
        )}

        {/* ORDER TRACKING FOR STUDENTS */}
        {currentTab === 'track' && (
          <StudentOrderLookup
            orders={orders}
            initialSearchQuery={trackQuery}
            onBackToStore={() => setCurrentTab('store')}
          />
        )}

        {/* OWNER MANAGEMENT PORTAL */}
        {currentTab === 'owner' && (
          isOwnerAuthenticated ? (
            <OwnerPortal
              designs={designs}
              orders={orders}
              sheetConfig={sheetConfig}
              onSaveSheetConfig={handleSaveSheetConfig}
              onAddDesign={handleAddDesign}
              onPurgeDemoDesigns={handlePurgeDemoDesigns}
              onUpdateDesign={handleUpdateDesign}
              onDeleteDesign={handleDeleteDesign}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateMultipleOrdersStatus={handleUpdateMultipleOrdersStatus}
              onMarkOrderSynced={handleMarkOrderSynced}
              onLogoutOwner={handleLogoutOwner}
            />
          ) : (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0B4D9C] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="font-classic text-2xl font-bold text-slate-900">
                Owner Authentication Required
              </h2>
              <p className="text-xs text-slate-600">
                Please unlock the Owner Portal to upload new designs, manage catalog items, and supervise order tracking.
              </p>
              <button
                type="button"
                onClick={() => setIsOwnerAuthOpen(true)}
                className="px-6 py-2.5 bg-[#0B4D9C] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                Sign In to Owner Portal
              </button>
            </div>
          )
        )}
      </main>

      {/* MODALS */}
      {/* 1. Custom Order Form Modal */}
      {selectedJersey && (
        <OrderModal
          jersey={selectedJersey}
          onClose={() => setSelectedJersey(null)}
          onSubmitOrder={handlePlaceOrder}
        />
      )}

      {/* 2. Order Success & Printable Slip Modal */}
      {lastSubmittedOrder && (
        <OrderSuccessModal
          order={lastSubmittedOrder}
          sheetConfig={sheetConfig}
          onClose={() => setLastSubmittedOrder(null)}
          onTrackOrder={(orderId) => {
            setTrackQuery(orderId);
            setCurrentTab('track');
          }}
        />
      )}

      {/* 3. Owner Access Authentication Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        onAuthenticated={() => {
          setIsOwnerAuthenticated(true);
          setCurrentTab('owner');
        }}
      />

      {/* Modern Classic Varsity Footer */}
      <footer className="mt-auto bg-[#071D36] border-t border-[#0E3560] text-slate-300 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <DIULogo variant="full" size="md" />
          </div>

          <div className="flex items-center gap-6 text-slate-300 text-xs flex-wrap justify-center font-medium">
            <button
              onClick={() => setCurrentTab('store')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Browse Jerseys
            </button>
            <button
              onClick={() => setCurrentTab('track')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Track Order Status
            </button>
            <button
              onClick={() => {
                if (isOwnerAuthenticated) setCurrentTab('owner');
                else setIsOwnerAuthOpen(true);
              }}
              className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Owner Access</span>
            </button>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            <p className="font-semibold text-slate-200">Google Sheets Sync Master Database Connected</p>
            <p className="text-slate-400 mt-0.5">© {new Date().getFullYear()} Varsity Vibe • Daffodil International University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
