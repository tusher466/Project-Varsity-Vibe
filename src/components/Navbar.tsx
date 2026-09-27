import React from 'react';
import { ShoppingBag, Search, Lock, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleSheetConfig } from '../types';
import { DIULogo } from './DIULogo';

interface NavbarProps {
  currentTab: 'store' | 'track' | 'owner';
  setCurrentTab: (tab: 'store' | 'track' | 'owner') => void;
  isOwnerAuthenticated: boolean;
  sheetConfig: GoogleSheetConfig | null;
  onOpenOwnerAuth: () => void;
  pendingOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isOwnerAuthenticated,
  sheetConfig,
  onOpenOwnerAuth,
  pendingOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#071D36] border-b border-[#0E3560] shadow-xl text-slate-100 backdrop-blur-md">
      {/* Top Varsity Announcement Strip */}
      <div className="bg-gradient-to-r from-[#0B4D9C] via-[#093D7D] to-[#15803D] py-1.5 px-4 text-xs font-medium text-white flex items-center justify-between border-b border-white/10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span className="font-bold tracking-wide uppercase text-[11px] text-emerald-300">DIU Pre-Orders Open</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline text-white/90 text-xs font-medium">Free custom back name & number sublimated print with every jersey</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {sheetConfig ? (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition hover:underline font-medium"
                title="View Connected Google Sheet"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-mono text-[11px]">Sheet Connected</span>
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-sky-200/90">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Google Sheet Ready to Connect</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Varsity Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Campus Identity */}
          <div
            onClick={() => setCurrentTab('store')}
            className="cursor-pointer group flex items-center gap-3 transition-transform hover:scale-[1.01]"
          >
            <DIULogo size="lg" />
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentTab('store')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === 'store'
                  ? 'bg-[#0B4D9C] text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Jersey Designs</span>
              <span className="sm:hidden">Store</span>
            </button>

            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === 'track'
                  ? 'bg-[#0B4D9C] text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

            {/* Owner Portal Access Button */}
            <button
              onClick={() => {
                if (isOwnerAuthenticated) {
                  setCurrentTab('owner');
                } else {
                  onOpenOwnerAuth();
                }
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                currentTab === 'owner'
                  ? 'bg-emerald-700 border-emerald-500 text-white shadow-md ring-1 ring-emerald-400'
                  : isOwnerAuthenticated
                  ? 'bg-slate-800/90 border-slate-700 text-emerald-400 hover:bg-slate-700 hover:border-emerald-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isOwnerAuthenticated ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Owner Part</span>
              {isOwnerAuthenticated && pendingOrdersCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
