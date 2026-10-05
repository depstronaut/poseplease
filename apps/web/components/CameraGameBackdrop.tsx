'use client';

import React from 'react';

export const CameraGameBackdrop: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* 35mm Film Sprocket Strips (Top & Bottom Edge) - Crisp Slate Borders */}
      <div className="absolute top-0 left-0 right-0 h-4 border-b border-slate-200/80 bg-white/40 flex items-center justify-between px-4 sm:px-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={`sprocket-top-${i}`}
            className="w-3.5 h-2 rounded-[2px] border border-slate-300/80 bg-slate-100/60"
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-4 border-t border-slate-200/80 bg-white/40 flex items-center justify-between px-4 sm:px-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={`sprocket-bot-${i}`}
            className="w-3.5 h-2 rounded-[2px] border border-slate-300/80 bg-slate-100/60"
          />
        ))}
      </div>

      {/* 4 Precision Viewfinder Corner Frame Brackets (Cleanly Framed, No Overlap) */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-slate-300">
        <span className="absolute -top-1 left-2.5 w-2 h-1 border-t-2 border-slate-400" />
        <span className="absolute top-2.5 -left-1 w-1 h-2 border-l-2 border-slate-400" />
      </div>

      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-slate-300">
        <span className="absolute -top-1 right-2.5 w-2 h-1 border-t-2 border-slate-400" />
        <span className="absolute top-2.5 -right-1 w-1 h-2 border-r-2 border-slate-400" />
      </div>

      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-slate-300">
        <span className="absolute -bottom-1 left-2.5 w-2 h-1 border-b-2 border-slate-400" />
        <span className="absolute bottom-2.5 -left-1 w-1 h-2 border-l-2 border-slate-400" />
      </div>

      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-slate-300">
        <span className="absolute -bottom-1 right-2.5 w-2 h-1 border-b-2 border-slate-400" />
        <span className="absolute bottom-2.5 -right-1 w-1 h-2 border-r-2 border-slate-400" />
      </div>

      {/* Discrete Corner Crosshair Ticks (Crisp Slate-300) */}
      <svg className="absolute w-full h-full inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="50%" y1="20" x2="50%" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="50%" y1="calc(100% - 30px)" x2="50%" y2="calc(100% - 20px)" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="20" y1="50%" x2="30" y2="50%" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="calc(100% - 30px)" y1="50%" x2="calc(100% - 20px)" stroke="#CBD5E1" strokeWidth="1.5" />

        {[
          { x: '18%', y: '16%' },
          { x: '82%', y: '16%' },
          { x: '18%', y: '84%' },
          { x: '82%', y: '84%' },
        ].map((pt, i) => (
          <g key={`cross-${i}`}>
            <line
              x1={`calc(${pt.x} - 6px)`}
              y1={pt.y}
              x2={`calc(${pt.x} + 6px)`}
              y2={pt.y}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <line
              x1={pt.x}
              y1={`calc(${pt.y} - 6px)`}
              x2={pt.x}
              y2={`calc(${pt.y} + 6px)`}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>

      {/* Left Margin Studio Badge: Pose Skeleton Wireframe & Telemetry */}
      <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 left-5 flex-col items-center gap-2.5 font-mono text-slate-400 bg-white/80 p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span>CAM_01</span>
        </div>
        <svg width="32" height="60" viewBox="0 0 40 80" fill="none" stroke="#94A3B8" strokeWidth="1.5">
          <circle cx="20" cy="14" r="6" />
          <line x1="20" y1="20" x2="20" y2="46" />
          <line x1="8" y1="26" x2="32" y2="26" />
          <line x1="8" y1="26" x2="4" y2="12" />
          <line x1="32" y1="26" x2="36" y2="12" />
          <line x1="12" y1="46" x2="28" y2="46" />
          <line x1="12" y1="46" x2="10" y2="72" />
          <line x1="28" y1="46" x2="30" y2="72" />
        </svg>
        <span className="text-[8px] font-bold text-slate-500 [writing-mode:vertical-lr] rotate-180 tracking-widest">
          MEDIAPIPE_AI
        </span>
      </div>

      {/* Right Margin Studio Badge: Arcade Controller Wireframe & Telemetry */}
      <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 right-5 flex-col items-center gap-2.5 font-mono text-slate-400 bg-white/80 p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="text-[9px] font-bold text-slate-600">60 FPS</div>
        <svg width="32" height="52" viewBox="0 0 44 70" fill="none" stroke="#94A3B8" strokeWidth="1.5">
          <rect x="4" y="10" width="36" height="50" rx="12" />
          <circle cx="22" cy="28" r="7" />
          <circle cx="22" cy="28" r="2" fill="#94A3B8" />
          <circle cx="16" cy="48" r="2.5" />
          <circle cx="28" cy="48" r="2.5" />
        </svg>
        <span className="text-[8px] font-bold text-slate-500 [writing-mode:vertical-lr] rotate-180 tracking-widest">
          ARCADE_ARENA
        </span>
      </div>

      {/* Clean Studio Framing */}
    </div>
  );
};
