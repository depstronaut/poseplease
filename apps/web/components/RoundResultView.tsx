'use client';

import React from 'react';
import { PlayerAvatar } from './ui/PlayerAvatar.tsx';

interface RoundResultViewProps {
  syncVersion?: number;
  state: any;
  mySessionId: string;
}

export const RoundResultView: React.FC<RoundResultViewProps> = ({ state, mySessionId }) => {
  const playersList: any[] = [];
  state.players.forEach((p: any) => playersList.push(p));

  // Sort by currentRoundScore descending
  playersList.sort((a, b) => b.currentRoundScore - a.currentRoundScore);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full py-4">
      {/* Tier 1 Hero Object: Round Result Board */}
      <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-7 sm:p-9">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#14110F]">
            RONDE #{state.currentRound} KELAR!
          </span>
          <span className="bg-[#FFD93B] border-2 border-[#14110F] px-2.5 py-0.5 font-mono text-xs font-black uppercase text-[#14110F] rotate-[2deg] shadow-[2px_2px_0_#14110F]">
            SKOR SEMENTARA
          </span>
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#14110F] uppercase tracking-tight">
          HASIL AKURASI
        </h2>
        <p className="font-body text-sm font-medium text-[#14110F] mt-1.5 mb-8">
          Top 3 dapat bonus poin ekstra (+15, +10, +5)!
        </p>

        {/* Round Leaderboard Roster with Staggered Tilts */}
        <div className="flex flex-col gap-3.5">
          {playersList.map((p, idx) => {
            const isMe = p.sessionId === mySessionId;
            const bonusMap = [15, 10, 5];
            const bonus = idx < 3 && p.currentRoundScore > 0 ? bonusMap[idx] : 0;
            const rowRotations = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[-0.5deg]', 'rotate-[0.5deg]'];
            const rotClass = rowRotations[idx % rowRotations.length];

            return (
              <div
                key={p.sessionId}
                className={`p-4 border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] flex items-center justify-between gap-3 ${rotClass} hover:rotate-0 hover:scale-[1.01] transition-transform ${
                  isMe ? 'bg-[#FFD93B]/25' : 'bg-[#FFFDF6]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 bg-[#EFE6D2] border-2 border-[#14110F] shadow-[2px_2px_0_#14110F] flex items-center justify-center font-display font-black text-sm shrink-0">
                    #{idx + 1}
                  </div>

                  <PlayerAvatar
                    size="sm"
                    avatarId={p.avatarId}
                    avatarColor={p.avatarColor}
                    nickname={p.nickname}
                  />

                  <div className="flex flex-col text-left">
                    <span className="font-display font-bold text-base text-[#14110F] flex items-center gap-2">
                      <span>{p.nickname}</span>
                      {isMe && (
                        <span className="bg-[#14110F] text-[#FFD93B] font-mono text-[9px] font-black px-1.5 py-0.2 uppercase rotate-[-2deg] shadow-[1px_1px_0_#FF4A1C]">
                          KAMU
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-[#14110F]/80 font-bold mt-0.5">
                      Akurasi: <span className="font-black text-[#14110F]">{p.currentRoundScore}%</span>
                      {bonus > 0 && (
                        <span className="ml-2 bg-[#7ED9A6] text-[#14110F] px-1.5 py-0.2 border border-[#14110F] font-black shadow-[1px_1px_0_#14110F]">
                          +{bonus}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#14110F]/70 font-black uppercase block">
                    TOTAL POIN
                  </span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-[#14110F]">
                    {p.totalScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next round status */}
        <div className="mt-8 pt-4 border-t border-[#14110F]/30 text-center font-mono text-xs font-black uppercase text-[#14110F]">
          Ronde berikutnya langsung gas...
        </div>
      </div>
    </div>
  );
};
