import React from 'react';

interface TapeLabelProps {
  children: React.ReactNode;
  color?: 'flash' | 'signal' | 'paper-2' | 'mint';
  rotation?: string;
  className?: string;
}

export const TapeLabel: React.FC<TapeLabelProps> = ({
  children,
  color = 'flash',
  rotation = 'rotate-[-1.5deg]',
  className = '',
}) => {
  const bgStyles = {
    flash: 'bg-[#FFD93B] text-[#14110F]',
    signal: 'bg-[#FF4A1C] text-[#FFFDF6]',
    'paper-2': 'bg-[#E4D8BE] text-[#14110F]',
    mint: 'bg-[#7ED9A6] text-[#14110F]',
  }[color];

  return (
    <span
      className={`inline-block border-[1.5px] border-[#14110F] px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0_#14110F] ${bgStyles} ${rotation} ${className}`}
    >
      {children}
    </span>
  );
};
