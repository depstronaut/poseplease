import React from 'react';

export const ApertureRing: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute top-[-100px] left-[-120px] w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] pointer-events-none select-none z-0"
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Ring */}
        <circle
          cx="200"
          cy="200"
          r="185"
          stroke="#14110F"
          strokeWidth="2.5"
          fill="#FFFDF6"
          strokeDasharray="4 4"
        />
        <circle
          cx="200"
          cy="200"
          r="165"
          stroke="#14110F"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Engraved Tick Marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const isMajor = i % 4 === 0;
          return (
            <line
              key={i}
              x1="200"
              y1={isMajor ? "16" : "24"}
              x2="200"
              y2="34"
              stroke="#14110F"
              strokeWidth={isMajor ? "3" : "1.5"}
              transform={`rotate(${angle} 200 200)`}
            />
          );
        })}

        {/* Circular Engraved Text */}
        <text
          x="200"
          y="62"
          fill="#14110F"
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="4"
          textAnchor="middle"
        >
          F/1.8 · 1/125 · ISO 400
        </text>
        <text
          x="200"
          y="355"
          fill="#14110F"
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="3"
          textAnchor="middle"
        >
          OPTICAL VIEWFINDER 35MM
        </text>

        {/* Inner Rotating Aperture Blades */}
        <g className="animate-aperture-spin" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="110" stroke="#14110F" strokeWidth="2.5" fill="#E4D8BE" />
          {/* 6 Geometric Aperture Blades */}
          <polygon points="200,105 285,150 250,230 160,210" fill="#14110F" opacity="0.9" />
          <polygon points="285,150 295,245 220,285 185,200" fill="#14110F" opacity="0.8" />
          <polygon points="295,245 220,300 135,260 170,180" fill="#14110F" opacity="0.9" />
          <polygon points="220,300 135,265 110,180 180,150" fill="#14110F" opacity="0.8" />
          <polygon points="135,265 105,170 180,105 215,190" fill="#14110F" opacity="0.9" />
          <polygon points="105,170 180,105 265,145 230,225" fill="#14110F" opacity="0.8" />
          {/* Central Iris Opening */}
          <circle cx="200" cy="200" r="32" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5" />
          <circle cx="200" cy="200" r="14" fill="#2B3FD6" />
        </g>
      </svg>
    </div>
  );
};
