import React from 'react';

interface ExposureMeterProps {
  score: number; // 0 to 100
  isMatched?: boolean;
}

export const ExposureMeter: React.FC<ExposureMeterProps> = ({ score, isMatched = false }) => {
  // Score 0 to 100 maps needle position 0% to 100%
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="w-full bg-[#FFFDF6] border-[2.5px] border-[#14110F] p-3 shadow-[4px_4px_0_#14110F]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] font-black uppercase text-[#14110F] tracking-wider">
          METER AKURASI POSE
        </span>
        <span
          className={`font-mono text-xs font-black px-2 py-0.5 border border-[#14110F] ${
            isMatched
              ? 'bg-[#7ED9A6] text-[#14110F] animate-pulse'
              : clampedScore >= 50
              ? 'bg-[#FFD93B] text-[#14110F]'
              : 'bg-[#E4D8BE] text-[#14110F]'
          }`}
        >
          {clampedScore}% {isMatched ? 'PAS! TAHAN' : ''}
        </span>
      </div>

      {/* Meter Scale */}
      <div className="relative h-6 border-b-2 border-t-2 border-[#14110F] bg-[#EFE6D2] overflow-hidden my-1 flex items-center">
        {/* Hatch marks */}
        <div className="w-full h-full flex justify-between items-center px-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={`w-0.5 ${
                i >= 15 ? 'h-full bg-[#7ED9A6]' : i % 5 === 0 ? 'h-3.5 bg-[#14110F]' : 'h-2 bg-[#14110F]/40'
              }`}
            />
          ))}
        </div>

        {/* Green Target Zone: 75% to 100% */}
        <div className="absolute right-0 top-0 bottom-0 w-[25%] bg-[#7ED9A6]/50 border-l-2 border-[#14110F] pointer-events-none flex items-center justify-center">
          <span className="font-mono text-[8px] font-black text-[#14110F] tracking-tight">
            TARGET
          </span>
        </div>

        {/* Dynamic Needle */}
        <div
          className="absolute top-0 bottom-0 w-2 bg-[#FF4A1C] border border-[#14110F] shadow-[1px_0_0_#14110F] transition-all duration-75 ease-out z-10"
          style={{ left: `calc(${clampedScore}% - 4px)` }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#14110F]/70 px-1 mt-0.5">
        <span>0% BELUM PAS</span>
        <span>50% MENDEKATI</span>
        <span className="text-[#14110F] font-black bg-[#7ED9A6] px-1 border border-[#14110F]">
          75%-100% ZONA TARGET
        </span>
      </div>
    </div>
  );
};

