'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import type { Room } from 'colyseus.js';
import type { CompressedLandmark } from '@poseplease/shared';
import { getColyseusClient, saveSessionToken, getSessionToken, clearSessionToken } from '../../../lib/colyseus.ts';
import { PoseRoomState } from '@poseplease/shared';
import { LobbyView } from '../../../components/LobbyView.tsx';
import { GameStageView } from '../../../components/GameStageView.tsx';
import { RoundResultView } from '../../../components/RoundResultView.tsx';
import { FinalResultView } from '../../../components/FinalResultView.tsx';
import { BrandLogo } from '../../../components/ui/BrandLogo.tsx';
import { playHoldTick, playSuccessChime, setSoundMuted, getSoundMuted } from '../../../lib/audio.ts';
import {
  Camera,
  Copy,
  Check,
  SpeakerHigh,
  SpeakerSimpleSlash,
  Crown,
  WarningCircle,
  ArrowCounterClockwise,
  House,
  CircleNotch,
} from '@phosphor-icons/react';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [syncVersion, setSyncVersion] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [mySessionId, setMySessionId] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Live spectator stream state
  const [spectatorLandmarks, setSpectatorLandmarks] = useState<CompressedLandmark[] | null>(null);
  const [spectatorLiveScore, setSpectatorLiveScore] = useState<number>(0);

  const roomRef = useRef<Room<PoseRoomState> | null>(null);
  const activeRoomCodeRef = useRef<string | null>(null);
  const connectingPromiseRef = useRef<Promise<Room<PoseRoomState>> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMuted(getSoundMuted());
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    if (!next) playHoldTick();
  };

  const copyRoomCode = async () => {
    try {
      playSuccessChime();
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  // Clean disconnect on browser tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomRef.current) {
        roomRef.current.leave(true);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function connectToRoom() {
      setIsConnecting(true);
      setErrorMsg(null);

      if (roomRef.current && activeRoomCodeRef.current === roomCode) {
        setRoom(roomRef.current);
        setMySessionId(roomRef.current.sessionId);
        setIsConnecting(false);
        return;
      }

      if (roomRef.current && activeRoomCodeRef.current !== roomCode) {
        roomRef.current.leave(true);
        roomRef.current = null;
      }

      const client = getColyseusClient();

      let nickname = 'Pemain';
      let avatarId = 'cat';
      let avatarColor = '#FFD93B';
      if (typeof window !== 'undefined') {
        nickname = sessionStorage.getItem('pose_nickname') || `Player_${Math.floor(Math.random() * 900 + 100)}`;
        avatarId = sessionStorage.getItem('pose_avatar_id') || 'cat';
        avatarColor = sessionStorage.getItem('pose_avatar_color') || '#FFD93B';
      }

      try {
        let activeRoom: Room<PoseRoomState> | null = null;
        const savedToken = getSessionToken(roomCode);

        if (savedToken) {
          try {
            activeRoom = await client.reconnect<PoseRoomState>(savedToken, PoseRoomState);
          } catch {
            clearSessionToken(roomCode);
          }
        }

        if (!activeRoom) {
          if (!connectingPromiseRef.current) {
            connectingPromiseRef.current = client.joinOrCreate<PoseRoomState>(
              'pose_room',
              { roomCode, nickname, avatarId, avatarColor },
              PoseRoomState
            );
          }
          activeRoom = await connectingPromiseRef.current;
        }

        connectingPromiseRef.current = null;

        if (!isMounted) return;

        roomRef.current = activeRoom;
        activeRoomCodeRef.current = roomCode;
        setRoom(activeRoom);
        setMySessionId(activeRoom.sessionId);
        saveSessionToken(roomCode, activeRoom.reconnectionToken);

        activeRoom.onStateChange(() => {
          if (isMounted) {
            setSyncVersion((v) => v + 1);
          }
        });

        activeRoom.onMessage('live_landmarks', (message: { landmarks: CompressedLandmark[]; liveScore: number }) => {
          if (isMounted) {
            setSpectatorLandmarks(message.landmarks);
            setSpectatorLiveScore(message.liveScore);
          }
        });

        activeRoom.onError((code, message) => {
          console.error('[Colyseus Error]', code, message);
          if (isMounted) setErrorMsg(`Koneksi terputus: ${message}`);
        });

        activeRoom.onLeave((code) => {
          console.log('[Colyseus Left Room]', code);
          if (isMounted && code > 1000) {
            setErrorMsg('Koneksi room terputus.');
          }
        });

        setIsConnecting(false);
      } catch (err: any) {
        console.error('Failed to join room:', err);
        connectingPromiseRef.current = null;
        if (isMounted) {
          setErrorMsg(err.message || 'Gagal bergabung ke room. Pastikan server aktif.');
          setIsConnecting(false);
        }
      }
    }

    connectToRoom();

    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  // Loading Screen
  if (isConnecting) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-8 max-w-sm w-full rotate-[-1deg]">
          <div className="w-12 h-12 bg-[#FFD93B] border-2 border-[#14110F] mx-auto mb-4 flex items-center justify-center font-mono font-black animate-spin">
            +
          </div>
          <h2 className="font-display font-black text-xl text-[#14110F] uppercase">
            MENGHUBUNGKAN...
          </h2>
          <p className="font-mono text-xs text-[#14110F]/70 mt-2 font-bold">
            ROOM [{roomCode}] · STANDBY
          </p>
        </div>
      </main>
    );
  }

  // Error Screen
  if (errorMsg || !room || !room.state) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-7 max-w-sm w-full rotate-[1deg]">
          <div className="w-12 h-12 bg-[#FF4A1C] text-[#FFFDF6] border-2 border-[#14110F] mx-auto mb-3 flex items-center justify-center font-black text-xl">
            !
          </div>
          <h2 className="font-display font-black text-xl text-[#14110F] uppercase">
            TIDAK BISA MASUK ROOM
          </h2>
          <p className="font-body text-xs text-[#14110F] font-semibold mt-2 leading-relaxed">
            {errorMsg}
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#FFD93B] hover:bg-[#FFE366] text-[#14110F] border-[2.5px] border-[#14110F] shadow-[4px_4px_0_#14110F] font-display font-extrabold text-xs uppercase cursor-pointer"
            >
              COBA LAGI
            </button>
            <Link
              href="/"
              className="w-full py-3 bg-[#FFFDF6] hover:bg-[#EFE6D2] text-[#14110F] border-[2.5px] border-[#14110F] shadow-[3px_3px_0_#14110F] font-display font-bold text-xs uppercase text-center"
            >
              KEMBALI KE MENU
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const state = room.state;
  const phase = state.phase;
  const me = state.players?.get(mySessionId);
  return (
    <main className="min-h-[100dvh] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-3 sm:py-5 w-full max-w-[1120px] mx-auto">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between py-1 mb-2 sm:mb-4">
        <BrandLogo size="sm" linkToHome />

        {/* Room Info & Player Badge */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={copyRoomCode}
            className="px-3.5 py-1.5 bg-[#FFD93B] border-[2px] border-[#14110F] shadow-[3px_3px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#14110F] font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-2 cursor-pointer"
            aria-label="Salin kode room"
          >
            <span>ROOM: {roomCode}</span>
            {copiedCode ? (
              <Check size={14} weight="bold" className="text-[#FF4A1C]" />
            ) : (
              <Copy size={14} weight="bold" />
            )}
          </button>

          <div className="px-3 py-1.5 bg-[#FFFDF6] border-[2px] border-[#14110F] shadow-[3px_3px_0_#14110F] font-mono text-xs font-bold text-[#14110F] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7ED9A6] border border-[#14110F]" />
            <span className="truncate max-w-[100px]">{me?.nickname || 'Kamu'}</span>
            {me?.isHost && (
              <span className="text-[#2B3FD6]" aria-label="Host">
                <Crown size={14} weight="fill" />
              </span>
            )}
          </div>

          <button
            onClick={toggleSound}
            className="p-2 bg-[#FFFDF6] border-[2px] border-[#14110F] shadow-[3px_3px_0_#14110F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#14110F] cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <SpeakerSimpleSlash size={16} weight="bold" className="text-[#14110F]/60" />
            ) : (
              <SpeakerHigh size={16} weight="bold" className="text-[#FF4A1C]" />
            )}
          </button>
        </div>
      </header>

      {/* Dynamic Match Phase Stage */}
      <div className="flex-1 flex flex-col justify-center py-1 sm:py-2">
        {phase === 'LOBBY' && (
          <LobbyView
            room={room}
            state={state}
            roomCode={roomCode}
            mySessionId={mySessionId}
            syncVersion={syncVersion}
          />
        )}

        {(phase === 'ROUND_INTRO' ||
          phase === 'TURN_COUNTDOWN' ||
          phase === 'TURN_ACTIVE' ||
          phase === 'TURN_RESULT') && (
          <GameStageView
            room={room}
            state={state}
            mySessionId={mySessionId}
            spectatorLandmarks={spectatorLandmarks}
            spectatorLiveScore={spectatorLiveScore}
            syncVersion={syncVersion}
          />
        )}

        {phase === 'ROUND_RESULT' && (
          <RoundResultView
            state={state}
            mySessionId={mySessionId}
            syncVersion={syncVersion}
          />
        )}

        {phase === 'FINAL_RESULT' && (
          <FinalResultView
            room={room}
            state={state}
            mySessionId={mySessionId}
            syncVersion={syncVersion}
          />
        )}
      </div>

      {/* Subtle status indicator */}
      <footer className="mt-2 pt-2 border-t border-[#14110F]/10 flex items-center justify-between text-[10px] font-mono font-bold text-[#14110F]/40">
        <span>STATUS: {phase}</span>
        <span>ROOM: {roomCode}</span>
      </footer>
    </main>
  );
}
