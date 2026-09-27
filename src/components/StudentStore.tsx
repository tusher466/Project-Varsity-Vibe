import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Shield, 
  Shirt, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Award, 
  Ruler, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { JerseyDesign } from '../types';
import { JerseyPreview } from './JerseyPreview';

interface StudentStoreProps {
  designs: JerseyDesign[];
  onSelectJerseyForOrder: (jersey: JerseyDesign) => void;
  onOpenTrackTab: () => void;
}

export const StudentStore: React.FC<StudentStoreProps> = ({
  designs,
  onSelectJerseyForOrder,
  onOpenTrackTab,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [previewCustomName, setPreviewCustomName] = useState<string>('VARSITY');
  const [previewCustomNumber, setPreviewCustomNumber] = useState<string>('26');

  const filteredDesigns = designs.filter(d => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'open') return d.isPreOrderOpen;
    return d.edition.toLowerCase().includes(selectedFilter.toLowerCase()) || 
           d.name.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06182E] via-[#092B54] to-[#0B4D9C] text-white rounded-3xl border border-[#0E3A6E] shadow-2xl p-6 sm:p-10 lg:p-12">
        {/* Decorative Backdrop Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Pitch */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Daffodil International University • Varsity Vibe</span>
            </div>

            <h1 className="font-classic text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-wide">
              WEAR YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-200 to-white">
                DIU CAMPUS PRIDE
              </span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              High-performance sublimated campus jerseys engineered for DIU inter-faculty tournaments, sports fests, and student life. Every pre-order includes <strong>free custom back name and number printing</strong>.
            </p>

            {/* Quick Benefits Badge Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200 bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/15">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Name & #</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200 bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/15">
                <Award className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Micro Dri-FIT 190g</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200 bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/15 col-span-2 sm:col-span-1">
                <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                <span>DSC Campus Pickup</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href="#catalog-section"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition cursor-pointer"
              >
                <span>Browse Designs & Order</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenTrackTab}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur transition cursor-pointer"
              >
                <span>Track Existing Order</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Featured Jersey Display (Shows Real Uploaded Image) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm bg-[#071D36]/90 rounded-2xl p-5 border border-white/15 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Featured DIU Match Kit
                </span>
                <span className="text-[10px] text-sky-200 font-mono">2026 Batch</span>
              </div>

              {/* Uploaded Jersey Image as Hero Showcase */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-inner group flex items-center justify-center">
                {designs[0]?.imageUrl ? (
                  <img
                    src={designs[0].imageUrl}
                    alt={designs[0]?.name || 'DIU Varsity Jersey'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-300">
                    <Shirt className="w-12 h-12 mx-auto text-emerald-400 mb-2 opacity-80" />
                    <p className="font-bold text-xs">DIU Varsity Match Kit</p>
                    <p className="text-[10px] text-slate-400">Upload your jersey design in Owner Part</p>
                  </div>
                )}
                
                {/* Floating Live Name/Number Preview Badge */}
                <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/90 backdrop-blur-md rounded-lg p-2.5 border border-emerald-500/40 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Custom Sublimation
                    </span>
                    <p className="font-mono text-sm font-black text-emerald-300 uppercase tracking-widest">
                      {previewCustomName || 'VARSITY'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Number</span>
                    <span className="font-mono text-lg font-black text-white">
                      #{previewCustomNumber || '10'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Name/Number Simulation Inputs */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-[9px] text-slate-300 uppercase font-bold">Try Your Name</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={previewCustomName}
                    onChange={(e) => setPreviewCustomName(e.target.value.toUpperCase())}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-950/80 border border-white/20 rounded-lg text-emerald-300 focus:outline-none focus:border-emerald-400 uppercase"
                    placeholder="NAME"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-300 uppercase font-bold">Your Number</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={previewCustomNumber}
                    onChange={(e) => setPreviewCustomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-950/80 border border-white/20 rounded-lg text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
                    placeholder="10"
                  />
                </div>
              </div>

              {designs[0] && (
                <button
                  type="button"
                  onClick={() => onSelectJerseyForOrder(designs[0])}
                  className="w-full mt-3 py-2 px-3 bg-[#0B4D9C] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Pre-Order {designs[0].name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Jersey Showcase */}
      <section id="catalog-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B4D9C]">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>DIU Campus Pre-Order Catalog</span>
            </div>
            <h2 className="font-classic text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Available Jersey Editions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select your favorite design, enter your department and custom back name/number to pre-order.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Designs' },
              { id: 'open', label: 'Pre-Order Open' },
              { id: 'DIU', label: 'Official DIU' },
              { id: 'Tech', label: 'Tech & Gaming' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#0B4D9C] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDesigns.map((jersey) => (
            <div
              key={jersey.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
            >
              {/* Image / Real Uploaded Jersey Photo */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                {jersey.imageUrl ? (
                  <img
                    src={jersey.imageUrl}
                    alt={jersey.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Shirt className="w-10 h-10 mx-auto text-emerald-400 mb-1" />
                    <span className="text-xs font-semibold">Jersey Preview</span>
                  </div>
                )}

                {/* Pre-Order Tag */}
                <div className="absolute top-3 left-3">
                  {jersey.isPreOrderOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Open for Pre-Order
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 shadow-md">
                      Batch Closed
                    </span>
                  )}
                </div>

                {/* Price Tag Pill */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-emerald-400 border border-emerald-500/40 shadow-md font-mono">
                  {jersey.price} {jersey.currency}
                </div>
              </div>

              {/* Jersey Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#0B4D9C] font-bold block">
                    {jersey.edition}
                  </span>
                  <h3 className="font-classic text-base font-bold text-slate-900 leading-snug group-hover:text-[#0B4D9C] transition">
                    {jersey.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {jersey.description}
                  </p>
                </div>

                {/* Sizes and Details */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sizes:</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      {jersey.availableSizes.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Fabric:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{jersey.fabricType}</span>
                  </div>

                  {/* Order Button */}
                  <button
                    type="button"
                    onClick={() => onSelectJerseyForOrder(jersey)}
                    disabled={!jersey.isPreOrderOpen}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                      jersey.isPreOrderOpen
                        ? 'bg-[#0B4D9C] hover:bg-blue-700 text-white shadow-blue-900/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>{jersey.isPreOrderOpen ? 'Customize & Pre-Order' : 'Pre-Order Ended'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Order Instructions & Process */}
      <section className="bg-gradient-to-r from-blue-50/80 to-emerald-50/80 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4D9C]">
            Simple 3-Step Procedure
          </span>
          <h3 className="font-classic text-xl sm:text-2xl font-bold text-slate-900">
            How Varsity Vibe Pre-Orders Work
          </h3>
          <p className="text-xs text-slate-600">
            Direct DIU student ordering connected straight to the official master Google Sheet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-left space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B4D9C] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900">Choose Design & Custom Back</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your DIU jersey edition, specify your department, custom back name, jersey number, and size.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-left space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900">Saved to Google Sheet</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your customized order is automatically recorded in the university master Google Sheet and assigned an Order ID.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-left space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900">Pick Up at DIU Campus</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect your finished sublimated jersey at Daffodil Smart City (DSC) or your chosen department booth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
