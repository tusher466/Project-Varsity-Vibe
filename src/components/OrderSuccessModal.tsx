import React from 'react';
import { CheckCircle2, Copy, FileSpreadsheet, ExternalLink, Printer, ArrowRight, Shield } from 'lucide-react';
import { StudentOrder, GoogleSheetConfig } from '../types';

interface OrderSuccessModalProps {
  order: StudentOrder;
  sheetConfig: GoogleSheetConfig | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  sheetConfig,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-scale-up">
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#06182E] via-[#071D36] to-[#0B4D9C] text-white p-6 sm:p-7 text-center border-b border-[#0E3A6E] relative">
          <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-emerald-300 uppercase">
            Order Submitted Successfully
          </span>
          <h2 className="font-classic text-2xl font-black text-white mt-1">
            Varsity Vibe
          </h2>
          <p className="text-xs text-slate-200 mt-1">
            Your custom jersey order has been logged and sent to the varsity production queue.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4">
          {/* Order ID Pill */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider">Order Reference ID</span>
              <p className="text-xl font-mono font-black text-[#0B4D9C]">{order.id}</p>
            </div>
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition cursor-pointer shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs text-slate-700 overflow-hidden">
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-900">{order.studentName} ({order.studentId})</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900">{order.department}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-500">Jersey Model:</span>
              <span className="font-semibold text-[#0B4D9C]">{order.jerseyName}</span>
            </div>
            <div className="p-2.5 flex justify-between bg-emerald-50/50">
              <span className="font-semibold text-emerald-900">Custom Back Name:</span>
              <span className="font-bold text-emerald-950 tracking-wider uppercase font-mono">{order.backName}</span>
            </div>
            <div className="p-2.5 flex justify-between bg-emerald-50/50">
              <span className="font-semibold text-emerald-900">Custom Back Number:</span>
              <span className="font-bold text-emerald-950 font-mono text-sm">#{order.backNumber}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-500">Size & Quantity:</span>
              <span className="font-semibold text-slate-900">{order.size} • {order.quantity} pc{order.quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-500">Pickup Counter:</span>
              <span className="font-semibold text-slate-900">{order.pickupLocation}</span>
            </div>
            <div className="p-2.5 flex justify-between bg-blue-50/60 font-bold text-sm text-slate-900">
              <span>Total Payable:</span>
              <span className="text-[#0B4D9C]">{order.totalPrice} BDT</span>
            </div>
          </div>

          {/* Google Sheet Sync Confirmation Box */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Google Sheet Recorded</p>
              <p className="text-[11px] text-emerald-800">
                {sheetConfig ? (
                  <>Recorded directly to the varsity spreadsheet: <strong>{sheetConfig.sheetName}</strong>.</>
                ) : (
                  <>Order stored in database and synced to the varsity master Google Sheet.</>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0B4D9C] hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
