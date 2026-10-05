'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode, isValidRoomCode, AVATAR_PRESETS, AVATAR_PALETTE_COLORS } from '@poseplease/shared';
import type { AvatarId } from '@poseplease/shared';
import { playHoldTick, playSuccessChime, playButtonPush, setSoundMuted, getSoundMuted } from '../lib/audio.ts';
import { Ticket } from '../components/ui/Ticket.tsx';
import { HardButton } from '../components/ui/HardButton.tsx';
import { CameraBodyArt } from '../components/art/CameraBodyArt.tsx';
import { PlayerAvatar } from '../components/ui/PlayerAvatar.tsx';
import { BrandLogo } from '../components/ui/BrandLogo.tsx';
import { ArrowRight, SignIn, WarningCircle, SpeakerHigh, SpeakerSimpleSlash } from '@phosphor-icons/react';

const CONTACT_POSES = [
  {
    name: 'Cinema',
    label: 'ABSOLUTE CINEMA',
    img: '/memes/1.jpg',
  },
  {
    name: 'Mewing',
    label: 'SHHH / HENING',
    img: '/memes/5.jpg',
  },
  {
    name: 'Roll Safe',
    label: 'MIKIR KERAS',
    img: '/memes/6.jpg',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarId>('cat');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState<string>('#FFD93B');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNick = sessionStorage.getItem('pose_nickname');
      if (savedNick) setNickname(savedNick);

      const savedAvatarId = sessionStorage.getItem('pose_avatar_id') as AvatarId | null;
      if (savedAvatarId && AVATAR_PRESETS.some((p) => p.id === savedAvatarId)) {
        setSelectedAvatarId(savedAvatarId);
      }

      const savedAvatarColor = sessionStorage.getItem('pose_avatar_color');
      if (savedAvatarColor) {
        setSelectedAvatarColor(savedAvatarColor);
      }

      setIsMuted(getSoundMuted());
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    if (!next) playHoldTick();
  };

  const handleRandomizeAvatar = () => {
    playHoldTick();
    const randomPreset = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
    const randomColor = AVATAR_PALETTE_COLORS[Math.floor(Math.random() * AVATAR_PALETTE_COLORS.length)];
    setSelectedAvatarId(randomPreset.id);
    setSelectedAvatarColor(randomColor.hex);
  };

  const handleCreateRoom = () => {
    playSuccessChime();
    setErrorMsg(null);
    const trimmedNick = nickname.trim() || `Player_${Math.floor(Math.random() * 900 + 100)}`;
    sessionStorage.setItem('pose_nickname', trimmedNick);
    sessionStorage.setItem('pose_avatar_id', selectedAvatarId);
    sessionStorage.setItem('pose_avatar_color', selectedAvatarColor);

    const newCode = generateRoomCode();
    router.push(`/room/${newCode}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPush();
    setErrorMsg(null);

    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode || !isValidRoomCode(trimmedCode)) {
      setErrorMsg('Ketik 4 huruf kode room yang bener ya');
      return;
    }

    const trimmedNick = nickname.trim() || `Player_${Math.floor(Math.random() * 900 + 100)}`;
    sessionStorage.setItem('pose_nickname', trimmedNick);
    sessionStorage.setItem('pose_avatar_id', selectedAvatarId);
    sessionStorage.setItem('pose_avatar_color', selectedAvatarColor);

    playSuccessChime();
    router.push(`/room/${trimmedCode}`);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between overflow-x-hidden">
      {/* Hero Background Ornament on Landing Only (Cropped bottom-right gutter, strictly clear of all content) */}
      <div className="fixed right-[-24px] bottom-[-40px] w-[260px] sm:w-[320px] pointer-events-none select-none z-0 opacity-70">
        <CameraBodyArt />
      </div>

      {/* Main Content Column: Max-width 1120px with safe gutters */}
      <main className="relative z-10 w-full max-w-[1120px] mx-auto min-h-[100dvh] flex flex-col justify-between px-6 sm:px-12 py-4 sm:py-6">
        {/* Top Header: Clean space, nothing behind */}
        <header className="w-full flex items-center justify-between pb-3 sm:pb-4">
          <BrandLogo size="md" />

          {/* Square Sound Toggle */}
          <button
            onClick={toggleSound}
            className="px-3.5 py-1.5 bg-[#FFFDF6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#14110F] font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-2 cursor-pointer"
            aria-label="Pengaturan suara"
          >
            {isMuted ? (
              <>
                <SpeakerSimpleSlash size={16} weight="bold" className="text-[#14110F]/60" />
                <span>SUARA MATI</span>
              </>
            ) : (
              <>
                <SpeakerHigh size={16} weight="bold" className="text-[#FF4A1C]" />
                <span>SUARA HIDUP</span>
              </>
            )}
          </button>
        </header>

        {/* Main Grid: Asymmetrical Breathing Space */}
        <div className="flex-1 flex items-center py-2 sm:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* Left 7 Columns: Hero Wordmark & 3 Example Poses */}
            <div className="lg:col-span-7 flex flex-col text-left">
              {/* Tilted Sticker Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#FF4A1C] text-[#FFFDF6] px-3 py-1 border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] font-mono text-xs font-black uppercase rotate-[-2deg] mb-3 self-start">
                <span>★</span>
                <span>PHOTOBOOTH PARTY WEBCAM</span>
              </div>

              {/* Giant POSE / PLEASE with Yellow Highlighter Band */}
              <div className="relative inline-block mb-3">
                <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[84px] leading-[0.88] tracking-[-0.03em] text-[#14110F] uppercase select-none">
                  <span className="block">POSE</span>
                  <span className="relative inline-block mt-1">
                    <span className="absolute -inset-1 sm:-inset-2 bg-[#FFD93B] border-[3px] border-[#14110F] shadow-[5px_5px_0_#14110F] rotate-[-2deg] -z-10" />
                    <span className="relative z-10 px-1">PLEASE</span>
                  </span>
                </h1>
              </div>

              <p className="font-body text-base text-[#14110F] font-medium leading-relaxed max-w-lg mt-2 mb-6">
                Game seru-seruan adu gaya bareng teman di webcam. Tahan posemu dan rebut posisi juara!
              </p>

              {/* Tilted Tape Tag for Pose Strip */}
              <div className="inline-block bg-[#FFD93B] border-2 border-[#14110F] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#14110F] rotate-[-1.5deg] shadow-[2px_2px_0_#14110F] mb-3 self-start">
                CONTOH POSE
              </div>

              {/* 3 Example Poses (Tilted Neo-Brutalist Cards with Hard Shadow & Hover Pop) */}
              <div className="grid grid-cols-3 gap-3.5 max-w-md">
                {CONTACT_POSES.map((pose, idx) => {
                  const rotations = ['rotate-[-3deg]', 'rotate-[2deg] -translate-y-1', 'rotate-[-2deg]'];
                  const rotClass = rotations[idx % rotations.length];

                  return (
                    <div
                      key={pose.name}
                      className={`relative bg-[#FFFDF6] border-2 border-[#14110F] shadow-[4px_4px_0_#14110F] p-2.5 flex flex-col items-center justify-between ${rotClass} hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-200 cursor-default`}
                    >
                      {/* Top Tape Strip */}
                      <div className="w-8 h-2.5 bg-[#E4D8BE] border-x border-b border-[#14110F]/40 mx-auto -mt-4 mb-1.5 rotate-[1deg]" />

                      <div className="w-full h-20 bg-[#EFE6D2] border border-[#14110F] overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pose.img} alt={pose.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-2 text-center w-full">
                        <span className="block font-display font-black text-xs text-[#14110F] truncate">
                          {pose.name}
                        </span>
                        <span className="block font-mono text-[9px] font-bold text-[#14110F]/70 truncate mt-0.5">
                          {pose.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Columns: Tier 1 Hero Object - Ticket Join Panel */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Ticket className="w-full !p-5 sm:!p-6 rotate-[0.5deg]">
                {/* Cute Neo-Brutalist Avatar Selector */}
                <div className="mb-4 flex items-center gap-3.5">
                  <div className="relative group shrink-0">
                    <PlayerAvatar
                      size="lg"
                      avatarId={selectedAvatarId}
                      avatarColor={selectedAvatarColor}
                      nickname={nickname}
                      animate
                    />
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      title="Acak avatar & warna (Randomize)"
                      className="absolute -bottom-1.5 -right-1.5 p-1 bg-[#14110F] text-[#FFD93B] text-[11px] border border-[#14110F] shadow-[1px_1px_0_#14110F] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      aria-label="Acak avatar"
                    >
                      🎲
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="block font-mono text-[10px] font-black uppercase text-[#14110F] truncate">
                        AVATAR:{' '}
                        <span className="text-[#2B3FD6]">
                          {AVATAR_PRESETS.find((p) => p.id === selectedAvatarId)?.name}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="font-mono text-[9px] font-black text-[#14110F] hover:text-[#2B3FD6] uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <span>🎲</span>
                        <span className="underline">ACAK</span>
                      </button>
                    </div>

                    {/* Character Preset Buttons (SVG Vectors) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {AVATAR_PRESETS.map((p) => {
                        const isSelected = selectedAvatarId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              playHoldTick();
                              setSelectedAvatarId(p.id);
                            }}
                            title={p.name}
                            className={`relative p-0 border-0 bg-transparent cursor-pointer transition-all shrink-0 ${
                              isSelected
                                ? 'scale-110 z-10'
                                : 'opacity-65 hover:opacity-100 hover:scale-105'
                            }`}
                            aria-label={`Pilih avatar ${p.name}`}
                          >
                            <PlayerAvatar
                              size="xs"
                              avatarId={p.id}
                              avatarColor={isSelected ? selectedAvatarColor : p.defaultBg}
                              className={isSelected ? '!border-[#14110F] !shadow-[2px_2px_0_#FF4A1C]' : '!border-[#14110F]'}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Palette Buttons */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-mono text-[9px] font-black uppercase text-[#14110F]/60 mr-0.5">
                        WARNA:
                      </span>
                      {AVATAR_PALETTE_COLORS.map((col) => {
                        const isSelected = selectedAvatarColor === col.hex;
                        return (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => {
                              playHoldTick();
                              setSelectedAvatarColor(col.hex);
                            }}
                            title={col.name}
                            style={{ backgroundColor: col.hex }}
                            className={`w-4 h-4 border-2 border-[#14110F] cursor-pointer transition-transform ${
                              isSelected
                                ? 'scale-125 shadow-[1.5px_1.5px_0_#14110F] z-10 ring-1 ring-[#14110F]'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                            aria-label={`Pilih warna ${col.name}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Player Name Input (Tier 3: straight, clean spacing) */}
                <div className="mb-4">
                  <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1">
                    NAMA KAMU
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={16}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="SiPalingPose"
                      className="w-full bg-transparent border-b-2 border-[#14110F] py-1.5 font-mono font-bold text-sm text-[#14110F] placeholder:text-[#14110F]/30 focus:outline-none focus:border-[#2B3FD6] rounded-none"
                    />
                    <span className="absolute right-0 bottom-1.5 font-mono text-[9px] text-[#14110F]/50">
                      MAKS 16
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-2.5 bg-[#FF4A1C] text-[#FFFDF6] border-2 border-[#14110F] font-mono text-xs font-bold flex items-center gap-2">
                    <WarningCircle size={15} weight="bold" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Big Flash CTA Button */}
                <HardButton
                  variant="flash"
                  size="md"
                  fullWidth
                  onClick={handleCreateRoom}
                  className="mb-4"
                >
                  <span>Bikin Room Baru</span>
                  <ArrowRight size={18} weight="bold" />
                </HardButton>

                {/* Clean 24px Spacing with subtle label, no nested boxes */}
                <div className="pt-1 mb-1">
                  <span className="block font-mono text-[11px] font-black text-[#14110F] uppercase mb-1.5">
                    GABUNG DENGAN KODE
                  </span>
                  <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="KODE"
                      className="flex-1 px-3 py-2 bg-[#EFE6D2] border-2 border-[#14110F] text-center font-mono font-black text-base tracking-[0.25em] text-[#14110F] placeholder:text-[#14110F]/40 placeholder:text-xs placeholder:tracking-normal focus:outline-none focus:bg-[#FFFDF6] uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FFD93B] hover:bg-[#FFE366] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#14110F] font-display font-extrabold text-xs uppercase text-[#14110F] flex items-center gap-1.5 cursor-pointer"
                    >
                      <SignIn size={16} weight="bold" />
                      <span>Gabung</span>
                    </button>
                  </form>
                </div>
              </Ticket>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
