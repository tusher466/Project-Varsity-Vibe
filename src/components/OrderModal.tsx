import React, { useState } from 'react';
import { X, Check, AlertCircle, ShoppingBag, ShieldCheck, Ruler, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { JerseyDesign, StudentOrder } from '../types';
import { JerseyPreview } from './JerseyPreview';
import confetti from 'canvas-confetti';

interface OrderModalProps {
  jersey: JerseyDesign;
  onClose: () => void;
  onSubmitOrder: (orderData: Omit<StudentOrder, 'id' | 'timestamp' | 'status' | 'syncedToSheet'>) => Promise<StudentOrder>;
}

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Software Engineering (SWE)',
  'Information Technology & Management (ITM)',
  'Electrical & Electronic Engineering (EEE)',
  'Textile Engineering (TE)',
  'Pharmacy',
  'Business Administration (BBA)',
  'English',
  'Journalism, Media & Communication (JMC)',
  'Law (LLB)',
  'Civil Engineering (CE)',
  'Architecture (ARCH)',
  'Other / Campus Staff'
];

const PICKUP_POINTS = [
  'DIU Daffodil Smart City (DSC) - Main Booth',
  'Knowledge Tower Ground Floor Counter',
  'DIU TSC & Student Lounge Desk',
  'Dhanmondi Campus Pick-up Point',
  'Faculty Department Office'
];

const SIZE_GUIDE = [
  { size: 'XS', chest: '36"', length: '26"' },
  { size: 'S', chest: '38"', length: '27"' },
  { size: 'M', chest: '40"', length: '28"' },
  { size: 'L', chest: '42"', length: '29"' },
  { size: 'XL', chest: '44"', length: '30"' },
  { size: 'XXL', chest: '46"', length: '31"' },
  { size: '3XL', chest: '48"', length: '32"' },
];

export const OrderModal: React.FC<OrderModalProps> = ({ jersey, onClose, onSubmitOrder }) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState('');
  const [phone, setPhone] = useState('');
  const [backName, setBackName] = useState('');
  const [backNumber, setBackNumber] = useState('10');
  const [size, setSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [pickupLocation, setPickupLocation] = useState(PICKUP_POINTS[0]);
  const [notes, setNotes] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedDepartment = department === 'Other / Campus Staff' ? (customDept || 'General Campus') : department;
  const totalPrice = jersey.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your active phone number for pickup confirmation.');
      return;
    }
    if (!backName.trim()) {
      setErrorMsg('Please specify the Back Name for your jersey.');
      return;
    }
    if (!backNumber.trim()) {
      setErrorMsg('Please specify the Back Number for your jersey.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitOrder({
        studentName: studentName.trim(),
        studentId: studentId.trim() || 'N/A',
        department: selectedDepartment,
        phone: phone.trim(),
        jerseyId: jersey.id,
        jerseyName: jersey.name,
        backName: backName.trim().toUpperCase(),
        backNumber: backNumber.trim(),
        size,
        quantity,
        unitPrice: jersey.price,
        totalPrice,
        pickupLocation,
        notes: notes.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#071D36] text-white px-6 py-4 flex items-center justify-between border-b border-[#0E3560]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Varsity Vibe Pre-Order
                </span>
              </div>
              <h2 className="font-classic text-lg sm:text-xl font-bold text-white mt-0.5">
                {jersey.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Real Uploaded Jersey Photo & Customization Spec */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              {/* UPLOADED JERSEY IMAGE: Strictly shows the actual uploaded jersey image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group flex items-center justify-center">
                {jersey.imageUrl ? (
                  <img
                    src={jersey.imageUrl}
                    alt={jersey.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-4">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-500 mb-1" />
                    <span className="text-xs font-semibold">Varsity Jersey Design</span>
                  </div>
                )}
                
                {/* Uploaded Jersey Tag */}
                <div className="absolute top-2.5 left-2.5 bg-[#0B4D9C]/95 text-white backdrop-blur text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-white/20">
                  Uploaded Jersey Design
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 text-emerald-400 backdrop-blur font-mono text-xs font-bold px-3 py-1 rounded-md border border-emerald-500/40 shadow-md">
                  {jersey.price} {jersey.currency}
                </div>
              </div>

              {/* Live Back Name & Number Print Spec Card */}
              <div className="bg-[#071D36] text-white rounded-xl p-4 border border-[#0E3560] shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Custom Print Preview
                  </span>
                  <span className="text-[10px] text-sky-200 font-medium">Sublimated on Jersey</span>
                </div>

                <div className="grid grid-cols-12 gap-2 bg-slate-900/80 rounded-lg p-3 border border-white/5 items-center">
                  <div className="col-span-8">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Back Print Name</span>
                    <p className="font-mono text-lg font-black tracking-widest text-emerald-300 uppercase truncate">
                      {backName || 'YOUR NAME'}
                    </p>
                  </div>
                  <div className="col-span-4 text-right border-l border-white/10 pl-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Number</span>
                    <p className="font-mono text-2xl font-black text-white">
                      #{backNumber || '00'}
                    </p>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 text-center italic">
                  Printed in high-definition varsity athletic typography on jersey back
                </p>
              </div>

              {/* Jersey Fabric & Specifications Card */}
              <div className="bg-white rounded-xl p-3.5 text-xs border border-slate-200 text-slate-600 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Fabric:</span>
                  <span className="text-[#0B4D9C] font-bold">{jersey.fabricType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>University Edition:</span>
                  <span className="font-medium text-slate-700">{jersey.edition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Print Quality:</span>
                  <span className="font-medium text-emerald-700">Non-fade Sublimation</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-900 font-bold">
                  <span>Unit Price:</span>
                  <span className="text-sm text-[#0B4D9C]">{jersey.price} {jersey.currency}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Order Input Fields */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Personal Student Details */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B4D9C] border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>1. Student Identity (DIU)</span>
                  <span className="text-[11px] font-normal text-slate-400">* Required</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Tusher Hossen"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student ID / Roll No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 211-15-4921"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      DIU Department / Faculty *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none focus:bg-white transition"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {department === 'Other / Campus Staff' && (
                      <input
                        type="text"
                        placeholder="Type Department Name"
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        className="mt-2 w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01700-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Jersey Customization: Back Name & Back Number */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B4D9C] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>2. Custom Back Print Details</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-800">Free custom print</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Back Name (Jersey Print) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      placeholder="e.g. TUSHER"
                      value={backName}
                      onChange={(e) => setBackName(e.target.value.toUpperCase())}
                      className="w-full text-sm font-bold tracking-wider uppercase px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">
                      Max 14 letters. Capitalized automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Back Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      placeholder="e.g. 07, 10, 99"
                      value={backNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setBackNumber(val);
                      }}
                      className="w-full text-sm font-bold tracking-widest px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">
                      Select your varsity number (00-99).
                    </p>
                  </div>
                </div>
              </div>

              {/* Sizing & Quantity */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    3. Size & Quantity Selection
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-[#0B4D9C] hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{showSizeGuide ? 'Hide Size Chart' : 'View Size Chart'}</span>
                  </button>
                </div>

                {/* Size Chart Accordion */}
                {showSizeGuide && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 overflow-x-auto">
                    <table className="w-full text-center">
                      <thead>
                        <tr className="border-b border-slate-200 font-bold text-slate-800">
                          <th className="py-1">Size</th>
                          {SIZE_GUIDE.map(s => <th key={s.size} className="py-1 px-1.5">{s.size}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="font-semibold text-left py-1">Chest (in)</td>
                          {SIZE_GUIDE.map(s => <td key={s.size} className="py-1">{s.chest}</td>)}
                        </tr>
                        <tr>
                          <td className="font-semibold text-left py-1">Length (in)</td>
                          {SIZE_GUIDE.map(s => <td key={s.size} className="py-1">{s.length}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Size Radio Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Size *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {jersey.availableSizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            size === s
                              ? 'bg-[#0B4D9C] text-white shadow-sm ring-2 ring-blue-500 ring-offset-1'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Quantity *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-8 text-center text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-600 font-medium">
                        jersey{quantity > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DIU Campus Distribution Point *
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none focus:bg-white transition"
                  >
                    {PICKUP_POINTS.map(point => (
                      <option key={point} value={point}>{point}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Payment Trx ID, preferred printing placement, batch note..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B4D9C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Total & Submit Actions */}
              <div className="bg-[#071D36] text-white p-4 rounded-xl flex items-center justify-between gap-4 border border-[#0E3560]">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Grand Total ({quantity} items)</p>
                  <p className="font-classic text-xl font-bold text-emerald-400">
                    {totalPrice} {jersey.currency}
                  </p>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Directly logged to Varsity Google Sheet
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Pre-Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
