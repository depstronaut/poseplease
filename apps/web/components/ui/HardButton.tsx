import React from 'react';

interface HardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'flash' | 'signal' | 'white' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const HardButton: React.FC<HardButtonProps> = ({
  children,
  variant = 'flash',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    flash: disabled
      ? 'bg-[#E4D8BE] text-[#14110F]/50 hatched-pattern cursor-not-allowed border-[#14110F]/50 shadow-none'
      : 'bg-[#FFD93B] hover:bg-[#FFE366] text-[#14110F] border-[#14110F] shadow-[6px_6px_0_#14110F] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#14110F]',
    signal: disabled
      ? 'bg-[#E4D8BE] text-[#14110F]/50 cursor-not-allowed shadow-none'
      : 'bg-[#FF4A1C] hover:bg-[#FF633B] text-[#FFFDF6] border-[#14110F] shadow-[6px_6px_0_#14110F] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#14110F]',
    white: disabled
      ? 'bg-[#E4D8BE] text-[#14110F]/50 cursor-not-allowed shadow-none'
      : 'bg-[#FFFDF6] hover:bg-[#EFE6D2] text-[#14110F] border-[#14110F] shadow-[4px_4px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#14110F]',
    paper: disabled
      ? 'bg-[#E4D8BE] text-[#14110F]/50 cursor-not-allowed shadow-none'
      : 'bg-[#E4D8BE] hover:bg-[#DBCFB3] text-[#14110F] border-[#14110F] shadow-[4px_4px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#14110F]',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-3 text-sm sm:text-base',
    lg: 'px-7 py-4 text-base sm:text-lg',
  }[size];

  return (
    <button
      disabled={disabled}
      className={`border-[2.5px] font-display font-extrabold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 select-none ${variantStyles} ${sizeStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
