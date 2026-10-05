import React from 'react';

interface StampProps {
  children: React.ReactNode;
  color?: 'signal' | 'ink' | 'lens';
  rotation?: string;
  className?: string;
}

export const Stamp: React.FC<StampProps> = ({
  children,
  color = 'signal',
  rotation = 'rotate-[-6deg]',
  className = '',
}) => {
  const colorStyles = {
    signal: 'border-[#FF4A1C] text-[#FF4A1C]',
    ink: 'border-[#14110F] text-[#14110F]',
    lens: 'border-[#2B3FD6] text-[#2B3FD6]',
  }[color];

  return (
    <span
      className={`inline-block border-[3px] border-double px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-widest select-none ${colorStyles} ${rotation} ${className}`}
    >
      {children}
    </span>
  );
};
