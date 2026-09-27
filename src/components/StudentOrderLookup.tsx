import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, AlertCircle, Phone, ArrowLeft, Printer, ShieldAlert } from 'lucide-react';
import { StudentOrder, OrderStatus } from '../types';

interface StudentOrderLookupProps {
  orders: StudentOrder[];
  initialSearchQuery?: string;
  onBackToStore: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Placed', desc: 'Received & logged in Google Sheet' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Verified and queued for print production' },
  { status: 'Printing', label: 'In Printing', desc: 'Custom back name & number sublimating' },
  { status: 'Ready for Pickup', label: 'Ready for Pickup', desc: 'Arrived at campus distribution counter' },
  { status: 'Delivered', label: 'Delivered', desc: 'Handed over to student' },
];

export const StudentOrderLookup: React.FC<StudentOrderLookupProps> = ({
  orders,
  initialSearchQuery = '',
  onBackToStore,
}) => {
  const [query, setQuery] = useState(initialSearchQuery);
  const [hasSearched, setHasSearched] = useState(Boolean(initialSearchQuery));

  const trimmed = query.trim().toLowerCase();

  const matchingOrders = orders.filter(o => {
    if (!trimmed) return false;
    return (
      o.id.toLowerCase() === trimmed ||
      o.phone.replace(/[^0-9]/g, '').includes(trimmed.replace(/[^0-9]/g, '')) ||
      o.studentId.toLowerCase() === trimmed ||
      o.studentName.toLowerCase().includes(trimmed)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Printing': return 2;
      case 'Ready for Pickup': return 3;
      case 'Delivered':
      case 'Completed': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jersey Store</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0B4D9C] flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="font-classic text-2xl sm:text-3xl font-black text-slate-900">
            Track Your Varsity Jersey Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your <strong>Order ID</strong> (e.g. VIBE-701) or your <strong>registered Phone Number</strong>.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Search by Order ID (VIBE-...) or Phone (017...)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4D9C] focus:bg-white transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#0B4D9C] hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Results Section */}
        {hasSearched && (
          <div className="pt-6 border-t border-slate-100 space-y-6">
            {matchingOrders.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Matching Orders Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find an order matching "{query}". Check if your Order ID or phone number was typed correctly, or contact the varsity store booth.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Found {matchingOrders.length} Order{matchingOrders.length > 1 ? 's' : ''}
                </p>

                {matchingOrders.map((order) => {
                  const currentStepIdx = getStepIndex(order.status);
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-5 p-5 sm:p-6"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-slate-900">{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' :
                              order.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              order.status === 'Printing' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              order.status === 'Delivered' ? 'bg-slate-200 text-slate-800' :
                              order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Placed on {new Date(order.timestamp).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500">Total Payable</p>
                          <p className="font-classic text-xl font-bold text-[#0B4D9C]">
                            {order.totalPrice} BDT
                          </p>
                        </div>
                      </div>

                      {/* Progress Stepper */}
                      {!isCancelled ? (
                        <div className="py-2">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;

                              return (
                                <div
                                  key={step.status}
                                  className={`p-3 rounded-xl border text-center transition-all ${
                                    isCurrent
                                      ? 'bg-blue-50 border-[#0B4D9C] ring-2 ring-blue-500/20 shadow-sm'
                                      : isCompleted
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                      : 'bg-white border-slate-200 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-center mb-1.5">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-slate-300" />
                                    )}
                                  </div>
                                  <p className="font-bold text-xs text-slate-900 leading-tight">
                                    {step.label}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                                    {step.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>This order was cancelled. Please contact the varsity store booth for queries.</span>
                        </div>
                      )}

                      {/* Order Spec Snapshot */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Jersey Edition</span>
                          <span className="font-bold text-slate-800">{order.jerseyName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Back Print Customization</span>
                          <span className="font-bold font-mono text-emerald-700 uppercase">
                            {order.backName} #{order.backNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Size & Quantity</span>
                          <span className="font-bold text-slate-800">{order.size} (Qty: {order.quantity})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Pickup Location</span>
                          <span className="font-bold text-slate-800">{order.pickupLocation}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
