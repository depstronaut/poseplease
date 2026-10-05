'use client';

import React, { useState } from 'react';
import type { PoseAngles, ScoreResult } from '../lib/pose/types.ts';
import { Wrench, Camera, Copy, Check } from '@phosphor-icons/react';

interface DevModePanelProps {
  playerAngles: PoseAngles;
  scoreResult: ScoreResult;
  isOpen: boolean;
  onToggle: () => void;
}

export const DevModePanel: React.FC<DevModePanelProps> = ({
  playerAngles,
  scoreResult,
  isOpen,
  onToggle,
}) => {
  const [recordedJson, setRecordedJson] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRecordPose = () => {
    const cleanAngles = {
      leftElbow: playerAngles.leftElbow ?? 180,
      rightElbow: playerAngles.rightElbow ?? 180,
      leftShoulder: playerAngles.leftShoulder ?? 90,
      rightShoulder: playerAngles.rightShoulder ?? 90,
      shoulderTilt: playerAngles.shoulderTilt ?? 0,
      headTilt: playerAngles.headTilt ?? 0,
    };

    const targetPoseObject = {
      id: `pose-custom-${Date.now().toString().slice(-4)}`,
      nama: 'Pose Custom Baru',
      deskripsi: 'Pose meme kustom baru yang direkam dari kamera.',
      gambar: '/poses/neutral.svg',
      angles: cleanAngles,
    };

    const jsonString = JSON.stringify(targetPoseObject, null, 2);

    console.log('%c[PosePlease Dev Mode] REKAM TARGET POSE BARU:', 'color: #D4FF00; font-weight: bold; font-size: 14px;');
    console.log(jsonString);

    setRecordedJson(jsonString);
    setCopied(false);
  };

  const handleCopyJson = async () => {
    if (!recordedJson) return;
    try {
      await navigator.clipboard.writeText(recordedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="w-full">
      {/* Dev Mode Toggle Pill Button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
            isOpen
              ? 'bg-[#D4FF00]/15 text-[#D4FF00] border-[#D4FF00]/40 shadow-sm'
              : 'bg-[#0D111A] text-zinc-400 border-white/10 hover:text-zinc-200'
          }`}
        >
          <Wrench size={14} weight="bold" />
          <span>Mode Dev</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOpen ? 'bg-[#D4FF00] animate-pulse' : 'bg-zinc-600'
            }`}
          />
        </button>
      </div>

      {/* Dev Panel Content Drawer */}
      {isOpen && (
        <div className="game-card p-5 rounded-2xl border border-white/12 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>INSPECTOR SUDUT SENDI REAL-TIME</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                  DEV TOOL
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Pantau sudut asli pemain vs sudut target untuk kalibrasi atau membuat pose baru.
              </p>
            </div>

            {/* Record Button */}
            <button
              onClick={handleRecordPose}
              className="px-3 py-1.5 btn-arcade-primary text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera size={14} weight="bold" />
              <span>Rekam Pose</span>
            </button>
          </div>

          {/* Joint Angle Inspector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(scoreResult.breakdown).map(([key, data]) => {
              const labelMap: Record<string, string> = {
                leftElbow: 'Siku Kiri',
                rightElbow: 'Siku Kanan',
                leftShoulder: 'Bahu Kiri',
                rightShoulder: 'Bahu Kanan',
                shoulderTilt: 'Kemiringan Bahu',
                headTilt: 'Kemiringan Kepala',
              };

              return (
                <div
                  key={key}
                  className={`p-2.5 rounded-xl border transition-all ${
                    !data.isVisible
                      ? 'bg-[#07090E]/40 border-white/5 opacity-50'
                      : data.score >= 80
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : data.score >= 50
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-[#07090E] border-white/10'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block truncate">
                    {labelMap[key] || key}
                  </span>

                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-base font-mono font-black text-white">
                      {data.isVisible ? `${data.playerAngle}°` : '--'}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      T: {data.targetAngle}°
                    </span>
                  </div>

                  {data.isVisible ? (
                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                      <span className="text-zinc-400">Δ: {data.diff}°</span>
                      <span
                        className={`font-bold ${
                          data.score >= 80
                            ? 'text-emerald-400'
                            : data.score >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {data.score}pt
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-1 font-mono">
                      Tidak terlihat
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recorded Pose JSON Preview Box */}
          {recordedJson && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#07090E] border border-[#D4FF00]/30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#D4FF00] flex items-center gap-1.5">
                  <Check size={14} weight="bold" />
                  <span>Pose Berhasil Direkam</span>
                </span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 btn-arcade-secondary text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} weight="bold" className="text-emerald-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} weight="bold" />
                      <span>Salin JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-[10px] font-mono bg-black/60 p-2.5 rounded-lg border border-white/10 text-emerald-300 overflow-x-auto max-h-40">
                {recordedJson}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
