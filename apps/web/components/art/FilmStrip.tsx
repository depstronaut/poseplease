import React from 'react';

interface FilmStripProps {
  animated?: boolean;
}

export const FilmStrip: React.FC<FilmStripProps> = ({ animated = true }) => {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute right-6 top-0 bottom-0 w-24 pointer-events-none select-none z-0 overflow-hidden"
    >
      <div
        className={`w-full flex flex-col items-center ${
          animated ? 'animate-[film-drift_24s_linear_infinite]' : ''
        }`}
      >
        {/* Render 2 repeated batches for continuous seamless loop */}
        {[0, 1].map((batch) => (
          <div key={batch} className="w-full flex flex-col items-center">
            {[1, 2, 3, 4].map((frameIdx) => (
              <div
                key={frameIdx}
                className="w-20 my-3 bg-[#14110F] p-1.5 flex flex-col items-center shadow-[4px_4px_0_#14110F]"
              >
                {/* Top Sprocket Holes */}
                <div className="w-full flex justify-between px-1 mb-1">
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                </div>

                {/* Frame Canvas */}
                <div className="w-full h-20 bg-[#FFFDF6] border border-[#14110F] flex flex-col items-center justify-center p-1 relative overflow-hidden">
                  <span className="absolute top-1 left-1 text-[8px] font-mono font-bold text-[#14110F]">
                    {String(frameIdx + batch * 4).padStart(2, '0')}A
                  </span>
                  {frameIdx === 2 ? (
                    /* Tiny Victory Pose Silhouette */
                    <svg width="28" height="42" viewBox="0 0 40 60" fill="none" stroke="#14110F" strokeWidth="3">
                      <circle cx="20" cy="12" r="5" fill="#14110F" />
                      <line x1="20" y1="17" x2="20" y2="38" strokeWidth="4" />
                      <line x1="20" y1="22" x2="6" y2="12" strokeWidth="3.5" />
                      <line x1="20" y1="22" x2="34" y2="12" strokeWidth="3.5" />
                      <line x1="20" y1="38" x2="10" y2="55" strokeWidth="3.5" />
                      <line x1="20" y1="38" x2="30" y2="55" strokeWidth="3.5" />
                    </svg>
                  ) : (
                    /* Empty Frame with Reticle */
                    <div className="w-8 h-8 border border-dashed border-[#14110F]/30 flex items-center justify-center">
                      <span className="text-[7px] font-mono text-[#14110F]/50 font-bold">KOSONG</span>
                    </div>
                  )}
                </div>

                {/* Bottom Sprocket Holes */}
                <div className="w-full flex justify-between px-1 mt-1">
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                  <div className="w-2.5 h-3.5 bg-[#EFE6D2] rounded-[1px]" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
