'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ScoreResult } from '../lib/pose/types.ts';
import { SUCCESS_SCORE_THRESHOLD, HOLD_SUCCESS_DURATION_MS } from '../lib/pose/types.ts';
import { playHoldTick, playSuccessChime } from '../lib/audio.ts';
import { Target, Sparkle } from '@phosphor-icons/react';

interface ScoreDisplayProps {
  scoreResult: ScoreResult;
  onPoseSuccess: () => void;
  isPoseChanging: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  scoreResult,
  onPoseSuccess,
  isPoseChanging,
}) => {
  const { totalScore, visibleCount } = scoreResult;

  const [holdProgress, setHoldProgress] = useState(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);
  const lastTickSecondRef = useRef<number>(0);

  useEffect(() => {
    if (isPoseChanging) {
      setHoldProgress(0);
      holdStartRef.current = null;
      hasTriggeredRef.current = false;
      return;
    }

    let animationFrameId: number;

    const checkHold = (timestamp: number) => {
      if (totalScore >= SUCCESS_SCORE_THRESHOLD && !hasTriggeredRef.current) {
        if (!holdStartRef.current) {
          holdStartRef.current = timestamp;
          lastTickSecondRef.current = 0;
          playHoldTick();
        }

        const elapsed = timestamp - holdStartRef.current;
        const progress = Math.min(100, (elapsed / HOLD_SUCCESS_DURATION_MS) * 100);
        setHoldProgress(progress);

        if (progress >= 50 && lastTickSecondRef.current === 0) {
          lastTickSecondRef.current = 1;
          playHoldTick();
        }

        if (elapsed >= HOLD_SUCCESS_DURATION_MS) {
          hasTriggeredRef.current = true;
          setShowSuccessBanner(true);
          playSuccessChime();

          setTimeout(() => {
            setShowSuccessBanner(false);
            setHoldProgress(0);
            holdStartRef.current = null;
            hasTriggeredRef.current = false;
            onPoseSuccess();
          }, 800);
          return;
        }
      } else {
        if (!hasTriggeredRef.current) {
          holdStartRef.current = null;
          setHoldProgress(0);
        }
      }

      animationFrameId = requestAnimationFrame(checkHold);
    };

    animationFrameId = requestAnimationFrame(checkHold);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [totalScore, isPoseChanging, onPoseSuccess]);

  let scoreTheme = {
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    label: 'Tiru Pose!',
  };

  if (totalScore >= SUCCESS_SCORE_THRESHOLD) {
    scoreTheme = {
      textColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/50',
      label: 'SEMPURNA! TAHAN 1 DETIK!',
    };
  } else if (totalScore >= 50) {
    scoreTheme = {
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      label: 'Makin Dekat! Sesuaikan Sendi...',
    };
  } else if (visibleCount === 0) {
    scoreTheme = {
      textColor: 'text-zinc-500',
      borderColor: 'border-white/10',
      label: 'Berdiri di depan kamera...',
    };
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-between p-4 rounded-2xl game-card border ${scoreTheme.borderColor} transition-all`}
    >
      {/* Left: Numeric Score */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#131926"
              strokeWidth="5"
              fill="transparent"
            />
            {holdProgress > 0 && (
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#D4FF00"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none font-mono">
            <span
              className={`text-3xl font-black tracking-tighter ${scoreTheme.textColor} transition-colors`}
            >
              {totalScore}
            </span>
            <span className="text-[9px] font-bold text-zinc-500">/100</span>
          </div>
        </div>

        {/* Status description */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                totalScore >= 80
                  ? 'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40'
                  : totalScore >= 50
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {totalScore >= 80 ? 'Target Match' : totalScore >= 50 ? 'Good' : 'Menunggu'}
            </span>

            {holdProgress > 0 && (
              <span className="text-xs font-mono font-bold text-[#D4FF00] animate-bounce">
                Tahan! {Math.round(holdProgress)}%
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-zinc-200">
            {scoreTheme.label}
          </p>

          <span className="text-[10px] font-mono text-zinc-500">
            {visibleCount > 0
              ? `${visibleCount} dari 6 sendi terdeteksi jelas`
              : 'Pastikan badan atas terlihat penuh'}
          </span>
        </div>
      </div>

      {/* Right: Hold Progress Bar */}
      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[130px] font-mono">
        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
          <span>Syarat:</span>
          <span className="text-[#D4FF00] font-bold">≥ 80 (1s)</span>
        </div>

        <div className="w-32 h-2.5 bg-[#07090E] rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              totalScore >= 80
                ? 'bg-[#D4FF00]'
                : totalScore >= 50
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, totalScore))}%` }}
          />
        </div>

        {holdProgress > 0 && (
          <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-[#D4FF00]/40">
            <div
              className="h-full bg-[#D4FF00] transition-all duration-75"
              style={{ width: `${holdProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Success Celebration Flash Overlay */}
      {showSuccessBanner && (
        <div className="absolute inset-0 bg-emerald-600/95 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md z-30 border border-emerald-300 shadow-xl">
          <Sparkle size={24} weight="fill" className="text-white animate-spin" />
          <div className="flex flex-col items-center font-mono">
            <span className="text-lg font-black text-white tracking-wider">
              BERHASIL MATCH!
            </span>
            <span className="text-[10px] font-bold text-emerald-100">
              Lanjut ke pose berikutnya...
            </span>
          </div>
          <Sparkle size={24} weight="fill" className="text-white animate-spin" />
        </div>
      )}
    </div>
  );
};
