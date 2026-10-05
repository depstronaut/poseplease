import React from 'react';

interface TicketProps {
  children: React.ReactNode;
  className?: string;
}

export const Ticket: React.FC<TicketProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-7 sm:p-8 ${className}`}
    >
      {/* Top Left & Right Ticket Notches */}
      <div className="absolute -top-[12px] -left-[12px] w-6 h-6 rounded-full bg-[#EFE6D2] border-[2.5px] border-[#14110F]" />
      <div className="absolute -top-[12px] -right-[12px] w-6 h-6 rounded-full bg-[#EFE6D2] border-[2.5px] border-[#14110F]" />
      {/* Bottom Left & Right Ticket Notches */}
      <div className="absolute -bottom-[12px] -left-[12px] w-6 h-6 rounded-full bg-[#EFE6D2] border-[2.5px] border-[#14110F]" />
      <div className="absolute -bottom-[12px] -right-[12px] w-6 h-6 rounded-full bg-[#EFE6D2] border-[2.5px] border-[#14110F]" />

      {/* Ticket Header with Tilted Serial Tag */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FF4A1C] border border-[#14110F]" />
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#14110F]">
            TIKET PHOTOBOOTH
          </span>
        </div>
        <div className="bg-[#FFD93B] border-2 border-[#14110F] px-2 py-0.5 font-mono text-[10px] font-black text-[#14110F] rotate-[2deg] shadow-[2px_2px_0_#14110F]">
          NO. #0824
        </div>
      </div>

      {children}
    </div>
  );
};
