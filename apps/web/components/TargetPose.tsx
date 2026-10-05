'use client';

import React from 'react';
import type { TargetPose as TargetPoseType } from '../lib/pose/types.ts';
import { Target, ArrowLeft, ArrowRight } from '@phosphor-icons/react';

interface TargetPoseProps {
  pose: TargetPoseType;
  currentIndex: number;
  totalPoses: number;
  onNext: () => void;
  onPrev: () => void;
}

export const TargetPose: React.FC<TargetPoseProps> = ({
  pose,
  currentIndex,
  totalPoses,
  onNext,
  onPrev,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-6 relative">
      {/* Top Header & Pagination */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-[#FFD93B] text-[#14110F] font-mono font-black text-xs border-2 border-[#14110F]">
            #{currentIndex + 1}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#14110F]">
              FRAME {currentIndex + 1} / {totalPoses}
            </span>
          </div>
        </div>

        {/* Pose Progress Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPoses }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 transition-all ${
                i === currentIndex
                  ? 'w-6 bg-[#FFD93B] border-2 border-[#14110F]'
                  : i < currentIndex
                  ? 'w-2.5 bg-[#7ED9A6] border-2 border-[#14110F]'
                  : 'w-2.5 bg-[#E4D8BE] border-2 border-[#14110F]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Target Image Frame: Polaroid Print */}
      <div className="relative flex-1 w-full min-h-[260px] max-h-[340px] flex items-center justify-center bg-[#EFE6D2] border-2 border-[#14110F] p-4 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pose.gambar}
          alt={pose.nama}
          className="w-full h-full object-contain max-h-[300px]"
        />
      </div>

      {/* Title & Description */}
      <div className="mt-6 flex flex-col gap-1.5">
        <div className="inline-block self-start bg-[#14110F] text-[#FFFDF6] px-2.5 py-1 font-mono text-xs font-black uppercase">
          {pose.nama}
        </div>
        <p className="font-body text-sm text-[#14110F] font-semibold leading-relaxed">
          {pose.deskripsi}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 pt-4 border-t-2 border-[#14110F] flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] text-xs font-mono font-black uppercase text-[#14110F] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Sebelumnya</span>
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-[#FFD93B] hover:bg-[#FFE366] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] text-xs font-mono font-black uppercase text-[#14110F] transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>{currentIndex === totalPoses - 1 ? 'Ulangi' : 'Berikutnya'}</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
};
