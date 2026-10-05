import React from 'react';

export const CameraBodyArt: React.FC = () => {
  return (
    <div
      data-ornament="camera-body"
      aria-hidden="true"
      className="w-full h-full pointer-events-none select-none rotate-[-8deg] opacity-80"
    >
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[8px_8px_0_#14110F]"
      >
        {/* Camera Outer Body */}
        <rect
          x="30"
          y="100"
          width="740"
          height="370"
          rx="12"
          fill="#FFFDF6"
          stroke="#14110F"
          strokeWidth="3.5"
        />

        {/* Vintage Textured Grip Band */}
        <rect
          x="30"
          y="210"
          width="740"
          height="230"
          fill="#E4D8BE"
          stroke="#14110F"
          strokeWidth="2.5"
        />

        {/* Top Shutter Button (Signal Red) */}
        <path
          d="M120 100 V70 H180 V100 Z"
          fill="#FF4A1C"
          stroke="#14110F"
          strokeWidth="3.5"
        />
        <rect
          x="135"
          y="50"
          width="30"
          height="20"
          rx="2"
          fill="#14110F"
        />

        {/* Shutter Speed Dial */}
        <path
          d="M220 100 V75 H310 V100 Z"
          fill="#FFFDF6"
          stroke="#14110F"
          strokeWidth="3.5"
        />
        <line x1="240" y1="80" x2="240" y2="95" stroke="#14110F" strokeWidth="2" />
        <line x1="265" y1="80" x2="265" y2="95" stroke="#14110F" strokeWidth="2" />
        <line x1="290" y1="80" x2="290" y2="95" stroke="#14110F" strokeWidth="2" />

        {/* Big Flash Unit (Flash Yellow) */}
        <rect
          x="580"
          y="120"
          width="150"
          height="80"
          rx="4"
          fill="#FFD93B"
          stroke="#14110F"
          strokeWidth="3"
        />
        <line x1="600" y1="120" x2="600" y2="200" stroke="#14110F" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="630" y1="120" x2="630" y2="200" stroke="#14110F" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="660" y1="120" x2="660" y2="200" stroke="#14110F" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="690" y1="120" x2="690" y2="200" stroke="#14110F" strokeWidth="2" strokeDasharray="6 4" />

        {/* Viewfinder Window */}
        <rect
          x="460"
          y="130"
          width="80"
          height="55"
          rx="4"
          fill="#2B3FD6"
          stroke="#14110F"
          strokeWidth="3"
        />
        <rect x="475" y="142" width="50" height="32" rx="2" fill="#FFFDF6" stroke="#14110F" strokeWidth="2" />

        {/* Rangefinder Red Dot / Sensor */}
        <circle cx="390" cy="155" r="16" fill="#FF4A1C" stroke="#14110F" strokeWidth="3" />

        {/* Giant Central Lens Barrel */}
        <circle
          cx="390"
          cy="310"
          r="135"
          fill="#FFFDF6"
          stroke="#14110F"
          strokeWidth="4"
        />
        <circle
          cx="390"
          cy="310"
          r="110"
          fill="#E4D8BE"
          stroke="#14110F"
          strokeWidth="3"
        />
        <circle
          cx="390"
          cy="310"
          r="80"
          fill="#14110F"
        />
        <circle
          cx="390"
          cy="310"
          r="50"
          fill="#2B3FD6"
          stroke="#FFD93B"
          strokeWidth="2.5"
        />
        <circle cx="375" cy="295" r="14" fill="#FFFDF6" opacity="0.8" />



        {/* Camera Strap Lug Left & Right */}
        <rect x="12" y="240" width="18" height="40" rx="3" fill="#14110F" />
        <rect x="770" y="240" width="18" height="40" rx="3" fill="#14110F" />
      </svg>
    </div>
  );
};
