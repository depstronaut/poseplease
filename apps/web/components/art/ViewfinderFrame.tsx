import React from 'react';

export const ViewfinderFrame: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 p-4 sm:p-8 overflow-hidden"
    >
      <div className="relative w-full h-full">
        {/* 4 Clean L-shaped Corner Marks (5-6px ink) */}
        <div data-ornament="viewfinder-corner" className="absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 border-t-[5px] sm:border-t-[6px] border-l-[5px] sm:border-l-[6px] border-[#14110F]" />
        <div data-ornament="viewfinder-corner" className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 border-t-[5px] sm:border-t-[6px] border-r-[5px] sm:border-r-[6px] border-[#14110F]" />
        <div data-ornament="viewfinder-corner" className="absolute bottom-0 left-0 w-8 h-8 sm:w-10 sm:h-10 border-b-[5px] sm:border-b-[6px] border-l-[5px] sm:border-l-[6px] border-[#14110F]" />
        <div data-ornament="viewfinder-corner" className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 border-b-[5px] sm:border-b-[6px] border-r-[5px] sm:border-r-[6px] border-[#14110F]" />
      </div>
    </div>
  );
};
