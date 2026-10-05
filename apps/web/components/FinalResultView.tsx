'use client';

import React, { useEffect } from 'react';
import type { Room } from 'colyseus.js';
import { playVictoryFanfare } from '../lib/audio.ts';
import { ConfettiCanvas } from './ConfettiCanvas.tsx';
import { HardButton } from './ui/HardButton.tsx';
import { PlayerAvatar } from './ui/PlayerAvatar.tsx';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

interface FinalResultViewProps {
  syncVersion?: number;
  room: Room;
  state: any;
  mySessionId: string;
}

export const FinalResultView: React.FC<FinalResultViewProps> = ({ room, state, mySessionId }) => {
  const playersList: any[] = [];
  state.players.forEach((p: any) => playersList.push(p));

  // Sort by totalScore descending
  playersList.sort((a, b) => b.totalScore - a.totalScore);

  const winner = playersList[0];
  const second = playersList[1];
  const third = playersList[2];

  const me = state.players.get(mySessionId);
  const isHost = me?.isHost || false;

  useEffect(() => {
    playVictoryFanfare();
  }, []);

  const handlePlayAgain = () => {
    room.send('restart_game');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full py-4 relative">
      <ConfettiCanvas active={true} />

      {/* Tier 1 Hero Object: Final Podium Card */}
      <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-8 sm:p-10 text-center relative">
        <span className="font-mono text-xs font-black uppercase tracking-wider text-[#14110F] block mb-3">
          GAME KELAR!
        </span>

        <h2 className="font-display font-black text-4xl sm:text-5xl text-[#14110F] uppercase tracking-tight">
          PARA JUARA
        </h2>
        <p className="font-body text-base font-semibold text-[#14110F] mt-2 mb-8">
          Mantap, <span className="bg-[#FFD93B] px-1.5 border border-[#14110F]">{winner?.nickname}</span> juara 1!
        </p>

        {/* 3-Step Physical Flat Block Podium */}
        <div className="mb-10 flex items-end justify-center gap-3 sm:gap-4 max-w-lg mx-auto pt-4">
          {/* 2nd Place Block (Paper-2) */}
          {second && (
            <div className="flex-1 flex flex-col items-center">
              <PlayerAvatar
                size="md"
                avatarId={second.avatarId}
                avatarColor={second.avatarColor}
                nickname={second.nickname}
                className="mb-1.5 rotate-[-3deg]"
              />
              <div className="w-20 sm:w-24 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] p-2 text-center mb-2 rotate-[-2deg] hover:rotate-0 transition-transform">
                <span className="font-display font-bold text-xs text-[#14110F] block truncate">
                  {second.nickname}
                </span>
                <span className="font-mono text-xs font-black text-[#14110F]">
                  {second.totalScore} PTS
                </span>
              </div>
              <div className="w-full h-24 sm:h-28 bg-[#E4D8BE] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] flex flex-col items-center justify-center">
                <span className="font-display font-black text-sm text-[#14110F]">
                  JUARA 2
                </span>
              </div>
            </div>
          )}

          {/* 1st Place Block (Flash Yellow, Tallest) */}
          {winner && (
            <div className="flex-1 flex flex-col items-center">
              <PlayerAvatar
                size="lg"
                avatarId={winner.avatarId}
                avatarColor={winner.avatarColor}
                nickname={winner.nickname}
                className="mb-2 rotate-[2deg] scale-110"
              />
              <div className="w-24 sm:w-28 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[5px_5px_0_#14110F] p-2.5 text-center mb-2 z-10 rotate-[1.5deg] hover:rotate-0 transition-transform">
                <span className="font-display font-black text-sm text-[#14110F] block truncate">
                  {winner.nickname}
                </span>
                <span className="font-mono text-sm font-black text-[#14110F]">
                  {winner.totalScore} PTS
                </span>
              </div>
              <div className="w-full h-36 sm:h-44 bg-[#FFD93B] border-2 border-[#14110F] flex flex-col items-center justify-center shadow-[5px_5px_0_#14110F]">
                <span className="font-display font-black text-lg text-[#14110F]">
                  JUARA 1
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place Block (Signal Red) */}
          {third && (
            <div className="flex-1 flex flex-col items-center">
              <PlayerAvatar
                size="md"
                avatarId={third.avatarId}
                avatarColor={third.avatarColor}
                nickname={third.nickname}
                className="mb-1.5 rotate-[3deg]"
              />
              <div className="w-20 sm:w-24 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] p-2 text-center mb-2 rotate-[2deg] hover:rotate-0 transition-transform">
                <span className="font-display font-bold text-xs text-[#14110F] block truncate">
                  {third.nickname}
                </span>
                <span className="font-mono text-xs font-black text-[#14110F]">
                  {third.totalScore} PTS
                </span>
              </div>
              <div className="w-full h-18 sm:h-20 bg-[#FF4A1C] text-[#FFFDF6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] flex flex-col items-center justify-center">
                <span className="font-display font-black text-xs uppercase">
                  JUARA 3
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="max-w-xs mx-auto">
          {isHost ? (
            <HardButton
              variant="flash"
              size="lg"
              fullWidth
              onClick={handlePlayAgain}
            >
              <ArrowCounterClockwise size={20} weight="bold" />
              <span>MAIN LAGI!</span>
            </HardButton>
          ) : (
            <span className="font-mono text-xs font-bold text-[#14110F]">
              Tunggu host buat mulai game baru ya...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
