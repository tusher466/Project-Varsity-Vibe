import React, { useState } from 'react';
import { RotateCw, Sparkles, Shield } from 'lucide-react';

interface JerseyPreviewProps {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backName?: string;
  backNumber?: string;
  jerseyName?: string;
  viewMode?: 'front' | 'back' | 'split';
  className?: string;
  showToggle?: boolean;
}

export const JerseyPreview: React.FC<JerseyPreviewProps> = ({
  primaryColor = '#0B1B3D',
  secondaryColor = '#D4AF37',
  textColor = '#FFFFFF',
  backName = 'VARSITY',
  backNumber = '26',
  jerseyName = 'Varsity Athletic',
  viewMode = 'back',
  className = '',
  showToggle = true,
}) => {
  const [currentView, setCurrentView] = useState<'front' | 'back'>(viewMode === 'split' ? 'back' : viewMode);

  const displayBackName = (backName || 'YOUR NAME').trim().toUpperCase();
  const displayBackNumber = (backNumber || '00').trim();

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {/* View Switcher Button */}
      {showToggle && (
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => setCurrentView(prev => prev === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-stone-800 shadow-md border border-stone-200 hover:bg-stone-50 transition cursor-pointer backdrop-blur"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Show {currentView === 'front' ? 'Back View' : 'Front View'}</span>
          </button>
        </div>
      )}

      {/* View Indicator Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-stone-900/80 text-amber-300 backdrop-blur border border-amber-500/30">
          <Shield className="w-3 h-3 text-amber-400" />
          {currentView === 'front' ? 'Front Side' : 'Back Customization'}
        </span>
      </div>

      {/* SVG Jersey Graphic */}
      <div className="w-full max-w-[340px] aspect-[4/5] flex items-center justify-center filter drop-shadow-xl transition-all duration-300">
        <svg
          viewBox="0 0 400 480"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle fabric gradient */}
            <linearGradient id={`grad-${primaryColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
              <stop offset="60%" stopColor={primaryColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>

            {/* Jersey Body Shadow */}
            <filter id="jerseyShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.35" />
            </filter>

            {/* Pattern for athletic mesh texture */}
            <pattern id="meshTexture" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.7" fill="#ffffff" fillOpacity="0.08" />
              <circle cx="5" cy="5" r="0.7" fill="#ffffff" fillOpacity="0.08" />
            </pattern>
          </defs>

          {/* Group with slight breathing room */}
          <g filter="url(#jerseyShadow)">
            {/* Main Jersey Body & Sleeves Outline */}
            <path
              d="M 120 70 
                 C 140 85, 170 95, 200 95 
                 C 230 95, 260 85, 280 70 
                 L 360 120 
                 C 375 130, 370 160, 345 190 
                 L 310 170 
                 L 315 420 
                 C 315 435, 295 440, 200 440 
                 C 105 440, 85 435, 85 420 
                 L 90 170 
                 L 55 190 
                 C 30 160, 25 130, 40 120 
                 Z"
              fill={primaryColor}
              stroke="#111111"
              strokeWidth="2.5"
            />

            {/* Fabric texture overlay */}
            <path
              d="M 120 70 
                 C 140 85, 170 95, 200 95 
                 C 230 95, 260 85, 280 70 
                 L 360 120 
                 C 375 130, 370 160, 345 190 
                 L 310 170 
                 L 315 420 
                 C 315 435, 295 440, 200 440 
                 C 105 440, 85 435, 85 420 
                 L 90 170 
                 L 55 190 
                 C 30 160, 25 130, 40 120 
                 Z"
              fill="url(#meshTexture)"
            />

            {/* Left Sleeve Stripe Band */}
            <path
              d="M 44 140 L 72 178 L 62 186 L 36 148 Z"
              fill={secondaryColor}
            />
            <path
              d="M 48 132 L 53 138 L 80 174 L 75 178 Z"
              fill="#FFFFFF"
            />

            {/* Right Sleeve Stripe Band */}
            <path
              d="M 356 140 L 328 178 L 338 186 L 364 148 Z"
              fill={secondaryColor}
            />
            <path
              d="M 352 132 L 347 138 L 320 174 L 325 178 Z"
              fill="#FFFFFF"
            />

            {/* Side Ergonomic Accent Panels */}
            <path
              d="M 90 200 Q 115 310 95 420 L 85 420 L 90 200 Z"
              fill={secondaryColor}
              opacity="0.9"
            />
            <path
              d="M 310 200 Q 285 310 305 420 L 315 420 L 310 200 Z"
              fill={secondaryColor}
              opacity="0.9"
            />

            {/* Bottom Hem Stripe */}
            <path
              d="M 85 425 C 140 436, 260 436, 315 425 L 315 440 C 260 450, 140 450, 85 440 Z"
              fill={secondaryColor}
            />

            {/* Ribbed Collar */}
            {currentView === 'front' ? (
              <path
                d="M 120 70 
                   C 145 135, 255 135, 280 70 
                   C 255 105, 145 105, 120 70 Z"
                fill={secondaryColor}
                stroke="#111111"
                strokeWidth="1.5"
              />
            ) : (
              <path
                d="M 120 70 
                   C 150 85, 250 85, 280 70 
                   C 250 80, 150 80, 120 70 Z"
                fill={secondaryColor}
                stroke="#111111"
                strokeWidth="1.5"
              />
            )}

            {/* FRONT VIEW CONTENT */}
            {currentView === 'front' && (
              <g>
                {/* Varsity Chest Crest / Badge */}
                <g transform="translate(140, 180)">
                  <circle cx="60" cy="40" r="32" fill="#000000" fillOpacity="0.2" />
                  <circle cx="60" cy="40" r="30" fill={secondaryColor} />
                  <circle cx="60" cy="40" r="26" fill={primaryColor} />
                  <path
                    d="M 50 30 L 70 30 L 75 45 L 60 55 L 45 45 Z"
                    fill={secondaryColor}
                  />
                  <text
                    x="60"
                    y="43"
                    textAnchor="middle"
                    fill={primaryColor}
                    fontFamily="'Cinzel', serif"
                    fontSize="13"
                    fontWeight="900"
                  >
                    V
                  </text>
                </g>

                {/* Front Varsity Arch Text */}
                <text
                  x="200"
                  y="280"
                  textAnchor="middle"
                  fill={textColor}
                  stroke={secondaryColor}
                  strokeWidth="1.5"
                  fontFamily="'Cinzel', 'Playfair Display', serif"
                  fontSize="28"
                  fontWeight="800"
                  letterSpacing="3"
                >
                  VARSITY
                </text>

                <text
                  x="200"
                  y="308"
                  textAnchor="middle"
                  fill={secondaryColor}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="5"
                >
                  ATHLETIC DIVISION
                </text>

                {/* Small Front Chest Number */}
                <text
                  x="200"
                  y="360"
                  textAnchor="middle"
                  fill={textColor}
                  stroke="#111111"
                  strokeWidth="1"
                  fontFamily="'Teko', sans-serif"
                  fontSize="48"
                  fontWeight="700"
                >
                  {displayBackNumber}
                </text>

                {/* Authentic Authentic Locker Tag at Hem */}
                <rect x="250" y="390" width="45" height="30" rx="3" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
                <rect x="253" y="393" width="39" height="24" rx="2" fill="#0F172A" />
                <text x="272" y="405" textAnchor="middle" fill="#FBBF24" fontSize="6" fontWeight="bold">OFFICIAL</text>
                <text x="272" y="413" textAnchor="middle" fill="#FFFFFF" fontSize="5">VARSITY GEAR</text>
              </g>
            )}

            {/* BACK VIEW CONTENT (Customizer Name & Number) */}
            {currentView === 'back' && (
              <g>
                {/* Back Upper Yoke Seam */}
                <path
                  d="M 125 100 Q 200 120 275 100"
                  fill="none"
                  stroke={secondaryColor}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  opacity="0.6"
                />

                {/* BACK NAME (Student Custom Name) with Varsity Arch effect */}
                <g>
                  {/* Subtle drop shadow for name */}
                  <text
                    x="202"
                    y="172"
                    textAnchor="middle"
                    fill="#000000"
                    opacity="0.6"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontSize={displayBackName.length > 10 ? '22' : '26'}
                    fontWeight="900"
                    letterSpacing="4"
                  >
                    {displayBackName}
                  </text>
                  {/* Actual text with contrast outline */}
                  <text
                    x="200"
                    y="170"
                    textAnchor="middle"
                    fill={textColor}
                    stroke={secondaryColor}
                    strokeWidth="1"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontSize={displayBackName.length > 10 ? '22' : '26'}
                    fontWeight="900"
                    letterSpacing="4"
                  >
                    {displayBackName}
                  </text>
                </g>

                {/* BACK NUMBER (Large Varsity Number) */}
                <g>
                  {/* Heavy 3D Drop Shadow */}
                  <text
                    x="206"
                    y="314"
                    textAnchor="middle"
                    fill={secondaryColor}
                    opacity="0.9"
                    fontFamily="'Teko', sans-serif"
                    fontSize="135"
                    fontWeight="700"
                  >
                    {displayBackNumber}
                  </text>
                  {/* Foreground Number */}
                  <text
                    x="200"
                    y="310"
                    textAnchor="middle"
                    fill={textColor}
                    stroke="#111111"
                    strokeWidth="3"
                    fontFamily="'Teko', sans-serif"
                    fontSize="135"
                    fontWeight="700"
                  >
                    {displayBackNumber}
                  </text>
                </g>

                {/* Lower Varsity Campus Signature */}
                <text
                  x="200"
                  y="370"
                  textAnchor="middle"
                  fill={secondaryColor}
                  fontFamily="'Cinzel', serif"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="3"
                >
                  COLLEGIATE PRIDE
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-stone-700 tracking-wide">
          {jerseyName}
        </p>
        <span className="text-[11px] text-stone-600 font-medium">
          {currentView === 'back' ? (
            <>Customized: <strong className="text-amber-800">{displayBackName}</strong> • #{displayBackNumber}</>
          ) : (
            'Official Varsity Front Match Cut'
          )}
        </span>
      </div>
    </div>
  );
};
