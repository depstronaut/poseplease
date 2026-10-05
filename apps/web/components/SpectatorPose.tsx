'use client';

import React, { useRef, useEffect } from 'react';
import type { CompressedLandmark } from '@poseplease/shared';
import { compressedToLandmarks } from '@poseplease/shared';
import { drawUpperBodySkeleton } from '../lib/pose/detector.ts';
import { ExposureMeter } from './ui/ExposureMeter.tsx';
import { Broadcast, User } from '@phosphor-icons/react';

interface SpectatorPoseProps {
  activeNickname: string;
  landmarks: CompressedLandmark[] | null;
  liveScore: number;
}

export const SpectatorPose: React.FC<SpectatorPoseProps> = ({
  activeNickname,
  landmarks,
  liveScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMatched = liveScore >= 75;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!landmarks || landmarks.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const fullLandmarks = compressedToLandmarks(landmarks);
    drawUpperBodySkeleton(ctx, fullLandmarks, canvas.width, canvas.height, liveScore);
  }, [landmarks, liveScore]);

  return (
    <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-4 sm:p-5 flex flex-col justify-between h-full relative">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4A1C] animate-rec-blink border border-[#14110F]" />
          <span className="font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-1.5">
            <Broadcast size={16} weight="bold" />
            <span>TRANSMISI LANGSUNG</span>
          </span>
        </div>

        <div className="px-2.5 py-0.5 bg-[#FFD93B] border border-[#14110F] font-mono text-xs font-bold text-[#14110F] flex items-center gap-1.5">
          <User size={13} weight="bold" />
          <span>MENONTON: {activeNickname}</span>
        </div>
      </div>

      {/* Mirrored Stage Canvas with Square Viewfinder */}
      <div className="relative flex-1 w-full min-h-[240px] sm:min-h-[300px] md:min-h-[380px] bg-[#14110F] border-2 border-[#14110F] overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center scale-x-[-1]">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Viewfinder Overlay: 4 Corner Brackets Inside */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#FFFDF6] pointer-events-none" />

        {/* Empty state overlay */}
        {(!landmarks || landmarks.length === 0) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none bg-[#14110F]/80">
            <div className="w-10 h-10 border-2 border-white flex items-center justify-center mb-2 font-mono text-white animate-spin">
              +
            </div>
            <p className="font-mono text-xs font-black uppercase text-white">
              MENUNGGU GERAKAN {activeNickname}...
            </p>
            <p className="font-body text-xs text-white/70 mt-1 max-w-xs font-medium">
              Pemain sedang bersiap di depan kamera
            </p>
          </div>
        )}
      </div>

      {/* Analog Horizontal Exposure Meter */}
      <div className="mt-4">
        <ExposureMeter score={liveScore} isMatched={isMatched} />
      </div>
    </div>
  );
};
