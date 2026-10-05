import React from 'react';

export const GrainOverlay: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 select-none overflow-hidden"
      style={{ opacity: 0.07, mixBlendMode: 'multiply' }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="photobooth-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#photobooth-grain)" />
      </svg>
    </div>
  );
};
