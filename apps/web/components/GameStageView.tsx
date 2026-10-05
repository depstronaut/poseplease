'use client';

import React, { useEffect } from 'react';
import type { Room } from 'colyseus.js';
import type { CompressedLandmark } from '@poseplease/shared';
import { ActivePlayerPose } from './ActivePlayerPose.tsx';
import { SpectatorPose } from './SpectatorPose.tsx';
import { PlayerAvatar } from './ui/PlayerAvatar.tsx';
import { playHoldTick, playSuccessChime } from '../lib/audio.ts';

interface GameStageViewProps {
  syncVersion?: number;
  room: Room;
  state: any;
  mySessionId: string;
  spectatorLandmarks: CompressedLandmark[] | null;
  spectatorLiveScore: number;
}

export const GameStageView: React.FC<GameStageViewProps> = ({
  room,
  state,
  mySessionId,
  spectatorLandmarks,
  spectatorLiveScore,
}) => {
  const isMyTurn = state.activePlayerSessionId === mySessionId;
  const activePlayer = state.players.get(state.activePlayerSessionId);
  const activeNickname = activePlayer?.nickname || 'Pemain';

  const phase = state.phase;
  const remainingSec = state.phaseTimeRemainingSec;

  useEffect(() => {
    if (phase === 'TURN_COUNTDOWN' || phase === 'TURN_ACTIVE') {
      if (remainingSec <= 5 && remainingSec > 0) {
        playHoldTick();
      }
    } else if (phase === 'TURN_RESULT') {
      playSuccessChime();
    }
  }, [remainingSec, phase]);

  const isCountdownOrIntro = phase === 'ROUND_INTRO' || phase === 'TURN_COUNTDOWN';

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-[1120px] mx-auto py-1">
      {/* Top Header Match Bar */}
      <div className="bg-[#FFFDF6] border-2 border-[#14110F] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Frame Counter */}
          <div className="bg-[#14110F] text-[#FFFDF6] px-3 py-1.5 font-mono text-xs font-black tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF4A1C]" />
            <span>FRAME {String(state.currentRound).padStart(2, '0')}/{String(state.totalRounds).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {activePlayer && (
              <PlayerAvatar
                size="sm"
                avatarId={activePlayer.avatarId}
                avatarColor={activePlayer.avatarColor}
                nickname={activePlayer.nickname}
              />
            )}
            <div>
              <span className="font-mono text-xs text-[#14110F]/70 font-bold block uppercase">
                {phase === 'ROUND_INTRO'
                  ? 'LIHAT GAYANYA!'
                  : phase === 'TURN_COUNTDOWN'
                  ? isMyTurn ? 'GILIRANMU! SIAP-SIAP' : `GILIRAN: ${activeNickname}`
                  : isMyTurn ? 'TAHAN GAYAMU SEKARANG!' : `NONTON AKSI: ${activeNickname}`}
              </span>
              <h2 className="font-display font-black text-lg text-[#14110F] uppercase">
                {state.currentTargetPoseName}
              </h2>
            </div>
          </div>
        </div>

        {/* Turn Queue & Timer Box */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Turn Order Queue */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#EFE6D2] border border-[#14110F] p-1">
            {state.turnOrder.map((sessionId: string, idx: number) => {
              const p = state.players.get(sessionId);
              const isActive = sessionId === state.activePlayerSessionId;
              const isPast = idx < state.activeTurnIndex;
              return (
                <div
                  key={sessionId}
                  className={`px-2 py-1 font-mono text-xs font-black uppercase flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#14110F] text-[#FFD93B]'
                      : isPast
                      ? 'text-[#14110F]/30 line-through'
                      : 'text-[#14110F]'
                  }`}
                >
                  <PlayerAvatar
                    size="xs"
                    avatarId={p?.avatarId}
                    avatarColor={p?.avatarColor}
                    nickname={p?.nickname}
                  />
                  <span>{p?.nickname?.slice(0, 8)}</span>
                </div>
              );
            })}
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFD93B] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F]">
            <span className="w-2.5 h-2.5 bg-[#FF4A1C] border border-[#14110F] animate-rec-blink" />
            <span className="font-mono text-base font-black text-[#14110F]">
              {remainingSec}S
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual Arena Stage */}
      {isCountdownOrIntro ? (
        /* Asymmetric layout: Left ~60% meme polaroid, Right ~40% giant countdown */
        /* Switches to side-by-side at md (768px+) instead of lg */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-stretch">
          {/* Left 60%: Large Polaroid */}
          <div className="md:col-span-7 flex flex-col">
            <div className="relative bg-[#FFFDF6] border-2 border-[#14110F] p-4 sm:p-6 pb-6 sm:pb-8 flex flex-col flex-1">
              {/* Photo Area */}
              <div className="relative w-full flex-1 min-h-[260px] sm:min-h-[320px] md:min-h-[380px] max-h-[500px] bg-[#EFE6D2] border-2 border-[#14110F] flex items-center justify-center p-3 overflow-hidden">
                {/* Viewfinder Rule-of-Thirds Grid */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                  <div className="border-r border-b border-[#14110F]" />
                  <div className="border-r border-b border-[#14110F]" />
                  <div className="border-b border-[#14110F]" />
                  <div className="border-r border-b border-[#14110F]" />
                  <div className="border-r border-b border-[#14110F]" />
                  <div className="border-b border-[#14110F]" />
                  <div className="border-r border-b border-[#14110F]" />
                  <div className="border-r border-b border-[#14110F]" />
                  <div />
                </div>

                {/* Target Pose Image — behind waist guide */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.currentTargetPoseImage}
                  alt={state.currentTargetPoseName}
                  className="w-full h-full object-contain relative z-0"
                />

                {/* Waist guide — on top of image */}
                <div className="absolute bottom-5 left-3 right-3 z-20 flex items-center justify-between border-b-2 border-dashed border-[#FF4A1C] pb-0.5 pointer-events-none">
                  <span className="font-mono text-[9px] sm:text-[10px] font-black text-[#FF4A1C] bg-[#FFFDF6] px-1.5 py-0.5 border border-[#FF4A1C] shadow-sm">
                    BATAS PINGGANG
                  </span>
                </div>
              </div>

              {/* Bottom Pose Name */}
              <div className="mt-3 sm:mt-5 text-center">
                <span className="inline-block bg-[#FFD93B] border-2 border-[#14110F] px-3 sm:px-4 py-1 sm:py-1.5 font-display font-black text-base sm:text-lg text-[#14110F] uppercase">
                  {state.currentTargetPoseName}
                </span>
              </div>
            </div>
          </div>

          {/* Right 40%: Giant Countdown Numeral Panel */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[200px] md:min-h-[300px] h-full">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#14110F] mb-2 sm:mb-4">
                HITUNG MUNDUR
              </span>

              {/* Giant Countdown Numeral — scales with clamp */}
              <span className="font-display font-black text-[clamp(5rem,22vw,14rem)] text-[#FF4A1C] leading-none block select-none">
                {remainingSec}
              </span>

              {/* Instruction */}
              <p className="font-body text-sm sm:text-base font-semibold text-[#14110F] mt-3 sm:mt-4 leading-relaxed">
                {isMyTurn
                  ? 'Bersiap di depan kamera! Giliranmu berikutnya.'
                  : `Perhatikan gaya ${activeNickname} di layar.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Webcam Gameplay Arena */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-stretch">
          {/* Left: Target Silhouette Guide (Tier 2: no extra description box, no PANDUAN tag) */}
          <div className="bg-[#FFFDF6] border-2 border-[#14110F] p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black uppercase text-[#14110F]">
                TARGET SILUET
              </span>
              <span className="font-display font-bold text-sm text-[#14110F] uppercase">
                {state.currentTargetPoseName}
              </span>
            </div>

            <div className="relative flex-1 w-full min-h-[240px] sm:min-h-[300px] md:min-h-[380px] bg-[#EFE6D2] border-2 border-[#14110F] flex items-center justify-center p-3 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.currentTargetPoseImage}
                alt={state.currentTargetPoseName}
                className="w-full h-full object-contain relative z-0"
              />

              {/* Waist guide on target */}
              <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between border-b-2 border-dashed border-[#FF4A1C] pb-0.5 pointer-events-none">
                <span className="font-mono text-[9px] font-black text-[#FF4A1C] bg-[#FFFDF6] px-1.5 py-0.5 border border-[#FF4A1C] shadow-sm">
                  BATAS PINGGANG
                </span>
              </div>
            </div>
          </div>

          {/* Right: Active Live Webcam Viewfinder (Tier 1 Hero Object) */}
          <div className="flex flex-col h-full">
            {isMyTurn ? (
              <ActivePlayerPose
                room={room}
                currentLiveScore={state.liveScore || 0}
              />
            ) : (
              <SpectatorPose
                landmarks={spectatorLandmarks}
                liveScore={spectatorLiveScore}
                activeNickname={activeNickname}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
