import React from 'react';

interface PhotoPrintProps {
  children: React.ReactNode;
  caption?: string;
  tapeText?: string;
  rotation?: string; // e.g. "rotate-[-2deg]", "rotate-[2deg]"
  className?: string;
}

export const PhotoPrint: React.FC<PhotoPrintProps> = ({
  children,
  caption,
  tapeText,
  rotation = 'rotate-0',
  className = '',
}) => {
  return (
    <div
      className={`relative bg-[#FFFDF6] border-[2.5px] border-[#14110F] shadow-[6px_6px_0_#14110F] p-3 pb-6 ${rotation} transition-transform hover:rotate-0 hover:shadow-[8px_8px_0_#14110F] ${className}`}
    >
      {/* Top Masking Tape Tag if provided */}
      {tapeText && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-[#FFD93B] border-[1.5px] border-[#14110F] px-2.5 py-0.5 shadow-[2px_2px_0_#14110F] rotate-[-2deg]">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#14110F]">
            {tapeText}
          </span>
        </div>
      )}

      {/* Photo Content */}
      <div className="w-full bg-[#14110F] overflow-hidden border border-[#14110F]">
        {children}
      </div>

      {/* Bottom Polaroid Caption */}
      {caption && (
        <div className="mt-3 text-center">
          <span className="font-mono text-xs font-bold text-[#14110F] tracking-wide">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};
