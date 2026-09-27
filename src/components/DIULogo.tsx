import React from 'react';

interface VarsityLogoProps {
  className?: string;
  variant?: 'full' | 'crest' | 'header';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkText?: boolean;
}

export const VarsityLogo: React.FC<VarsityLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  darkText = false,
}) => {
  // Height scale
  const heightClass = 
    size === 'sm' ? 'h-8' : 
    size === 'lg' ? 'h-12' : 
    size === 'xl' ? 'h-16' : 'h-10';

  // Crisp, simple, modern classic collegiate Varsity Vibe Emblem
  const Emblem = (
    <svg
      viewBox="0 0 100 100"
      className={`${heightClass} w-auto shrink-0 select-none filter drop-shadow-sm`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hex-Shield Outline */}
      <polygon
        points="50,4 92,20 84,72 50,96 16,72 8,20"
        fill="#071D36"
        stroke="#16A34A"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Inner Accent Inset */}
      <polygon
        points="50,11 85,25 78,68 50,89 22,68 15,25"
        fill="#0B4D9C"
        stroke="#38BDF8"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        strokeLinejoin="round"
      />

      {/* Top Victory Stars */}
      <circle cx="50" cy="22" r="2.8" fill="#FBBF24" />
      <circle cx="41" cy="23.5" r="1.8" fill="#FBBF24" opacity="0.8" />
      <circle cx="59" cy="23.5" r="1.8" fill="#FBBF24" opacity="0.8" />

      {/* Athletic Varsity "V" Monogram with Bevel Layering */}
      {/* Left wing of primary V */}
      <polygon
        points="30,34 42,34 50,68 45,68"
        fill="#FFFFFF"
      />
      {/* Right wing of primary V */}
      <polygon
        points="70,34 58,34 50,68 55,68"
        fill="#E2E8F0"
      />
      {/* Bevel highlight */}
      <polygon
        points="50,68 42,34 50,34"
        fill="#38BDF8"
        opacity="0.9"
      />

      {/* Dynamic Emerald V Accent ribbon */}
      <path
        d="M 28 42 L 50 78 L 72 42 L 67 42 L 50 71 L 33 42 Z"
        fill="#22C55E"
      />
    </svg>
  );

  if (variant === 'crest') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {Emblem}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {Emblem}

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-classic text-xl sm:text-2xl font-black tracking-tight ${darkText ? 'text-slate-900' : 'text-white'}`}>
            Varsity
          </span>
          <span className="font-display italic text-xl sm:text-2xl font-bold text-emerald-400">
            Vibe
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${darkText ? 'text-[#0B4D9C]' : 'text-sky-300'}`}>
            DIU Campus Store
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${darkText ? 'text-slate-500' : 'text-slate-300'}`}>
            Jersey Hub
          </span>
        </div>
      </div>
    </div>
  );
};

// Also export as DIULogo so existing references remain 100% compatible
export const DIULogo = VarsityLogo;
