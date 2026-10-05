import React from 'react';

export const FloatingDebris: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* 1. Yellow Flash Starburst (8-point) - Top Right */}
      <div className="absolute top-16 right-36 rotate-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5">
          <path d="M24 0 L29 17 L46 12 L33 24 L46 36 L29 31 L24 48 L19 31 L2 36 L15 24 L2 12 L19 17 Z" />
        </svg>
      </div>

      {/* 2. Sharp 4-Point Sparkle - Left Margin */}
      <div className="absolute top-1/3 left-12 rotate-[-15deg]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="#FF4A1C" stroke="#14110F" strokeWidth="2">
          <path d="M16 0 C16 9 23 16 32 16 C23 16 16 23 16 32 C16 23 9 16 0 16 C9 16 16 9 16 0 Z" />
        </svg>
      </div>

      {/* 3. Masking Tape Strip with Hand Annotation - Bottom Left */}
      <div className="absolute bottom-28 left-8 rotate-[-6deg] bg-[#FFD93B] border-[2px] border-[#14110F] px-3 py-1 shadow-[3px_3px_0_#14110F]">
        <span className="font-mono text-xs font-black tracking-wider text-[#14110F]">
          ISO 400 EXP.24
        </span>
      </div>

      {/* 4. Film Canister - Bottom Right Margin */}
      <div className="absolute bottom-16 right-24 rotate-[15deg]">
        <svg width="36" height="54" viewBox="0 0 36 54" fill="none" stroke="#14110F" strokeWidth="2.5">
          <rect x="3" y="10" width="30" height="40" rx="3" fill="#14110F" />
          <rect x="7" y="14" width="22" height="16" fill="#FFD93B" />
          <circle cx="18" cy="5" r="4" fill="#FF4A1C" stroke="#14110F" strokeWidth="2" />
          <line x1="12" y1="38" x2="24" y2="38" stroke="#FFFDF6" strokeWidth="2" />
        </svg>
      </div>

      {/* 5. Crossed Viewfinder Reticle - Top Center */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-60">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#14110F" strokeWidth="2">
          <circle cx="18" cy="18" r="14" />
          <line x1="18" y1="0" x2="18" y2="36" />
          <line x1="0" y1="18" x2="36" y2="18" />
        </svg>
      </div>

      {/* 6. Hand-drawn Arrow SVG - Pointing to Ticket Stub */}
      <div className="absolute top-[280px] right-[460px] rotate-[10deg] hidden xl:block">
        <svg width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="#14110F" strokeWidth="3" strokeLinecap="round">
          <path d="M5 15 Q30 5 50 15" />
          <path d="M40 8 L52 16 L42 24" />
        </svg>
      </div>
    </div>
  );
};
