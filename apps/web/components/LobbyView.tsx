'use client';

import React, { useState } from 'react';
import type { Room } from 'colyseus.js';
import { playHoldTick, playSuccessChime, playButtonPush } from '../lib/audio.ts';
import { HardButton } from './ui/HardButton.tsx';
import { PlayerAvatar } from './ui/PlayerAvatar.tsx';
import { Copy, Check, Crown, Play } from '@phosphor-icons/react';

interface LobbyViewProps {
  room: Room;
  state: any;
  roomCode?: string;
  mySessionId: string;
  syncVersion?: number;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ room, state, roomCode, mySessionId }) => {
  const displayCode = (state.roomCode || roomCode || 'KCYH').toUpperCase();
  const [selectedRounds, setSelectedRounds] = useState<number>(state.totalRounds || 5);
  const [devSinglePlayer, setDevSinglePlayer] = useState<boolean>(state.devAllowSinglePlayer || false);
  const [copied, setCopied] = useState<boolean>(false);

  const playersList: any[] = [];
  state.players?.forEach((p: any) => playersList.push(p));

  const me = state.players?.get(mySessionId);
  const isHost = me?.isHost || false;

  const minRequired = devSinglePlayer ? 1 : 2;
  const canStart = isHost && playersList.length >= minRequired;

  const handleCopyCode = async () => {
    try {
      playSuccessChime();
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleToggleSoloMode = () => {
    playButtonPush();
    setDevSinglePlayer(!devSinglePlayer);
  };

  const handleSelectRounds = (num: number) => {
    playHoldTick();
    setSelectedRounds(num);
  };

  const handleStartGame = () => {
    playSuccessChime();
    room.send('start_game', {
      rounds: selectedRounds,
      devAllowSinglePlayer: devSinglePlayer,
    });
  };

  const totalSlots = 5;
  const emptySlotsCount = Math.max(0, totalSlots - playersList.length);

  return (
    <div className="w-full max-w-[1120px] mx-auto py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Room Code & Photo Strip */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Room Code Box with Tilted Boxes */}
          <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[6px_6px_0_#14110F] p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                {/* Tilted Tape Tag */}
                <div className="inline-block bg-[#FFD93B] border-2 border-[#14110F] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#14110F] rotate-[-2deg] shadow-[2px_2px_0_#14110F] mb-3">
                  KODE AKSES ROOM
                </div>

                {/* 4-Character Code Cells with Playful Staggered Tilts */}
                <div className="flex items-center gap-3 mb-4">
                  {displayCode.split('').map((char: string, i: number) => {
                    const rotations = [
                      'rotate-[-3deg] -translate-y-1',
                      'rotate-[2.5deg] translate-y-1',
                      'rotate-[-2deg]',
                      'rotate-[3deg] translate-y-0.5',
                    ];
                    const rotClass = rotations[i % rotations.length];

                    return (
                      <div
                        key={i}
                        className={`w-14 h-18 sm:w-16 sm:h-20 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[4px_4px_0_#14110F] flex items-center justify-center ${rotClass} hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-200 cursor-default`}
                      >
                        <span className="font-display font-black text-3xl sm:text-4xl text-[#14110F]">
                          {char}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-[#FFD93B] hover:bg-[#FFE366] text-[#14110F] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#14110F] font-mono text-xs font-black uppercase flex items-center gap-2 cursor-pointer rotate-[-1deg]"
                  >
                    {copied ? (
                      <>
                        <Check size={14} weight="bold" className="text-[#FF4A1C]" />
                        <span>TERSALIN!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" />
                        <span>SALIN KODE</span>
                      </>
                    )}
                  </button>
                  <span className="font-body text-xs text-[#14110F] font-medium">
                    Kasih kode ini ke temen biar bisa nimbrung.
                  </span>
                </div>
              </div>

              {/* Slot Counter with Tactile Tilt */}
              <div className="bg-[#E4D8BE] border-2 border-[#14110F] shadow-[4px_4px_0_#14110F] px-4 py-3 text-center shrink-0 self-start sm:self-auto rotate-[2deg] hover:rotate-0 transition-transform">
                <span className="font-mono text-[10px] font-black uppercase text-[#14110F] block">
                  TERHUBUNG
                </span>
                <span className="font-display font-black text-3xl text-[#14110F]">
                  {playersList.length} <span className="text-sm text-[#14110F]/60">/ 8</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tier 1 Hero Object: Player Photo Strip */}
          <div className="relative bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-7 sm:p-8">
            {/* Top Tape Strip */}
            <div className="w-16 h-3 bg-[#E4D8BE] border-x border-b border-[#14110F]/40 mx-auto -mt-10 mb-4 rotate-[-1deg]" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-black text-xl text-[#14110F] uppercase">
                DAFTAR PEMAIN
              </h2>
              <span className="bg-[#7ED9A6] border-2 border-[#14110F] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#14110F] rotate-[1.5deg] shadow-[2px_2px_0_#14110F]">
                {playersList.length < 2 && !devSinglePlayer ? 'KURANG 1 ORANG' : 'SIAP GAS!'}
              </span>
            </div>

            {/* Stacked Vertical Strip Frames with Staggered Tilts */}
            <div className="flex flex-col gap-3.5">
              {playersList.map((p, idx) => {
                const isMe = p.sessionId === mySessionId;
                const rowRotations = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[-0.5deg]', 'rotate-[0.5deg]'];
                const rotClass = rowRotations[idx % rowRotations.length];

                return (
                  <div
                    key={p.sessionId}
                    className={`p-3.5 border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] flex items-center justify-between gap-3 ${rotClass} hover:rotate-0 hover:scale-[1.01] transition-transform ${
                      isMe ? 'bg-[#FFD93B]/25' : 'bg-[#FFFDF6]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar
                        size="md"
                        avatarId={p.avatarId}
                        avatarColor={p.avatarColor}
                        nickname={p.nickname}
                        animate
                      />

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-[#14110F] truncate max-w-[160px]">
                            {p.nickname}
                          </span>
                          {p.isHost && (
                            <span className="px-1.5 py-0.2 bg-[#2B3FD6] text-[#FFFDF6] border border-[#14110F] font-mono text-[9px] font-black uppercase flex items-center gap-1">
                              <Crown size={11} weight="fill" />
                              <span>HOST</span>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#14110F]/70 font-bold">
                          POSE #{idx + 1}
                        </span>
                      </div>
                    </div>

                    {isMe && (
                      <span className="bg-[#14110F] text-[#FFD93B] font-mono text-[10px] font-black px-2 py-0.5 uppercase tracking-wider rotate-[-2deg] shadow-[2px_2px_0_#FF4A1C]">
                        KAMU (SIAP)
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Empty Photo Strip Frames */}
              {Array.from({ length: emptySlotsCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-3.5 border-2 border-dashed border-[#14110F]/30 bg-[#FFFDF6]/40 flex items-center justify-between text-[#14110F]/50"
                >
                  <span className="font-mono text-xs font-bold uppercase">
                    FRAME #{playersList.length + i + 1}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase">
                    KOSONG
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Host Settings Dial & Start Button */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isHost ? (
            <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[6px_6px_0_#14110F] p-7 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-xl text-[#14110F] uppercase">
                  PENGATURAN
                </h2>
                <div className="bg-[#7ED9A6] border-2 border-[#14110F] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#14110F] rotate-[-1.5deg] shadow-[2px_2px_0_#14110F]">
                  KONTROL HOST
                </div>
              </div>

              {/* Rounds Selector with Tactile Buttons */}
              <div>
                <span className="block font-mono text-xs font-black uppercase text-[#14110F] mb-2.5">
                  JUMLAH RONDE
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[3, 5, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSelectRounds(num)}
                      className={`py-2.5 border-2 border-[#14110F] font-mono text-xs font-black uppercase transition-all cursor-pointer text-center ${
                        selectedRounds === num
                          ? 'bg-[#14110F] text-[#FFD93B] shadow-[3px_3px_0_#FF4A1C] scale-105 rotate-[-1.5deg]'
                          : 'bg-[#FFFDF6] text-[#14110F] hover:bg-[#E4D8BE] hover:rotate-[1deg] shadow-[2px_2px_0_#14110F]'
                      }`}
                    >
                      {num} RONDE
                    </button>
                  ))}
                </div>
              </div>

              {/* Solo Mode Toggle */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div>
                  <span className="block font-mono text-xs font-black uppercase text-[#14110F]">
                    MODE SOLO
                  </span>
                  <p className="font-body text-xs text-[#14110F]/80 font-medium mt-0.5">
                    Latihan sendiri tanpa lawan
                  </p>
                </div>

                <button
                  onClick={handleToggleSoloMode}
                  className={`w-14 h-8 border-2 border-[#14110F] relative p-0.5 cursor-pointer transition-colors ${
                    devSinglePlayer ? 'bg-[#7ED9A6]' : 'bg-[#E4D8BE]'
                  }`}
                  aria-label="Aktifkan Mode Solo"
                >
                  <div
                    className={`w-6 h-6 bg-[#14110F] text-[#FFFDF6] font-mono text-[9px] font-black flex items-center justify-center transition-transform ${
                      devSinglePlayer ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {devSinglePlayer ? 'ON' : 'OFF'}
                  </div>
                </button>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <HardButton
                  variant="flash"
                  size="lg"
                  fullWidth
                  disabled={!canStart}
                  onClick={handleStartGame}
                >
                  <Play size={20} weight="fill" />
                  <span>
                    GAS MAIN! {devSinglePlayer ? '(SOLO)' : ''}
                  </span>
                </HardButton>
                {!canStart && (
                  <span className="font-mono text-[11px] text-[#14110F]/70 text-center block mt-2.5 font-bold">
                    Ajak minimal 1 teman lagi, atau aktifin Mode Solo di atas
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF6] border-2 border-[#14110F] p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-[#FFD93B] border-2 border-[#14110F] flex items-center justify-center">
                <Play size={24} weight="fill" className="text-[#14110F]" />
              </div>
              <h3 className="font-display font-black text-xl text-[#14110F] uppercase">
                Tunggu Host Ya
              </h3>
              <p className="font-body text-sm text-[#14110F] font-medium leading-relaxed max-w-xs">
                Host lagi siapin game. Pasang badan di depan kamera!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
