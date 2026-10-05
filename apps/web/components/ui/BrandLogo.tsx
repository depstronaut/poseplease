'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkToHome?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  linkToHome = false,
  className = '',
}) => {
  const iconSizeClass = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size];

  const textSizeClass = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  const badgeSizeClass = {
    sm: 'text-[10px] sm:text-xs px-1 py-0.2',
    md: 'text-xs sm:text-sm px-1.5 py-0.5',
    lg: 'text-sm sm:text-base px-2 py-0.5',
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Neo-Brutalist Retro Camera Icon Mark */}
      <div className={`relative ${iconSizeClass} shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3`}>
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full drop-shadow-[2px_2px_0_#14110F]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shutter Button (Signal Orange) */}
          <rect x="29" y="7" width="8" height="6" rx="1.5" fill="#FF4A1C" stroke="#14110F" strokeWidth="2.5" />

          {/* Flash & Viewfinder Top Box (Flash Yellow) */}
          <rect x="9" y="7" width="14" height="8" rx="2" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5" />
          <rect x="12" y="10" width="4" height="3" fill="#14110F" />

          {/* Camera Body (Paper White) */}
          <rect
            x="4"
            y="12"
            width="40"
            height="28"
            rx="5"
            fill="#FFFDF6"
            stroke="#14110F"
            strokeWidth="2.8"
          />

          {/* Vintage Racing Stripe (Flash Yellow with thin black borders) */}
          <rect x="4" y="21" width="40" height="5" fill="#FFD93B" stroke="#14110F" strokeWidth="1.8" />

          {/* Big Lens Outer Ring */}
          <circle cx="21" cy="27" r="10.5" fill="#14110F" />
          <circle cx="21" cy="27" r="8" fill="#2B3FD6" stroke="#14110F" strokeWidth="1.8" />

          {/* Lens Pupil & Sparkle Reflection */}
          <circle cx="18.5" cy="24.5" r="2.8" fill="#FFFDF6" />
          <circle cx="23.5" cy="29" r="1.5" fill="#7ED9A6" />

          {/* Mini Cute Wink & Blush on Camera Body */}
          <circle cx="34" cy="25" r="2.2" fill="#14110F" />
          <circle cx="36" cy="31" r="2.5" fill="#FF70A6" opacity="0.8" />
          <path
            d="M 31 30 Q 33.5 33 36 30"
            stroke="#14110F"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Flash Pop 4-Point Star (Signal Orange Spark) */}
          <path
            d="M 6 7 Q 8.5 2 11 7 Q 16 9.5 11 12 Q 8.5 17 6 12 Q 1 9.5 6 7 Z"
            fill="#FF4A1C"
            stroke="#14110F"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-black ${textSizeClass} text-[#14110F] tracking-tight uppercase`}
          >
            POSE
          </span>
          <span
            className={`bg-[#FFD93B] text-[#14110F] border-2 border-[#14110F] shadow-[2px_2px_0_#14110F] ${badgeSizeClass} font-display font-black uppercase rotate-[-2.5deg] tracking-wider transition-transform group-hover:rotate-0`}
          >
            PLEASE!
          </span>
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block" aria-label="Pose Please Home">
        {content}
      </Link>
    );
  }

  return content;
};
