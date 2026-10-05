'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Room } from 'colyseus.js';
import { getPoseLandmarker, drawUpperBodySkeleton } from '../lib/pose/detector.ts';
import {
  landmarksToCompressed,
  calculateUpperBodyAngles,
  calculatePoseScore,
  POSES,
} from '@poseplease/shared';
import type { LandmarkPoint } from '@poseplease/shared';
import type { PoseLandmarker as PoseLandmarkerType } from '@mediapipe/tasks-vision';
import { ExposureMeter } from './ui/ExposureMeter.tsx';
import { CircleNotch, CameraSlash } from '@phosphor-icons/react';

interface ActivePlayerPoseProps {
  room: Room;
  currentLiveScore: number;
}

export const ActivePlayerPose: React.FC<ActivePlayerPoseProps> = ({
  room,
  currentLiveScore,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isBodyDetected, setIsBodyDetected] = useState<boolean>(false);
  const [localScore, setLocalScore] = useState<number>(0);

  const landmarkerRef = useRef<PoseLandmarkerType | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastSendTimestampRef = useRef<number>(0);
  const lastScoreUpdateRef = useRef<number>(0);

  // Active display score: local real-time 60fps calculation or room live score
  const displayScore = localScore > 0 ? localScore : (currentLiveScore || 0);
  const isMatched = displayScore >= 75;

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses webcam.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Izin webcam ditolak atau tidak tersedia. Giliran dilewati.');
      setIsCameraActive(false);
      room.send('camera_denied');
    }
  }, [room]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setIsLoadingModel(true);
        const landmarker = await getPoseLandmarker();
        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsLoadingModel(false);
        }
      } catch (err) {
        console.error('Failed to load PoseLandmarker:', err);
        if (isMounted) {
          setIsLoadingModel(false);
        }
      }
    }

    init();
    startCamera();

    return () => {
      isMounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startCamera]);

  useEffect(() => {
    let active = true;

    const detectPose = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (
        video &&
        canvas &&
        landmarker &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0
      ) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        const currentTime = video.currentTime;

        if (currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = currentTime;
          const timestamp = performance.now();

          try {
            const results = landmarker.detectForVideo(video, timestamp);
            const poseLandmarks = results.landmarks?.[0] as LandmarkPoint[] | undefined;

            if (poseLandmarks && poseLandmarks.length > 0) {
              setIsBodyDetected(true);

              // 1. Calculate live score instantaneously on client for smooth 60fps feedback
              const targetPoseId = room.state?.currentTargetPoseId;
              const currentPose = POSES.find((p) => p.id === targetPoseId) || POSES[0];
              const angles = calculateUpperBodyAngles(poseLandmarks);
              const scoreResult = calculatePoseScore(angles, currentPose.angles);
              const realTimeScore = scoreResult.totalScore;

              const now = Date.now();
              // Throttle React state update for meter to ~20fps (every 50ms) to keep UI responsive without re-render spam
              if (now - lastScoreUpdateRef.current >= 50) {
                lastScoreUpdateRef.current = now;
                setLocalScore(realTimeScore);
              }

              // 2. Draw skeleton using real-time score
              if (ctx) {
                drawUpperBodySkeleton(
                  ctx,
                  poseLandmarks,
                  canvas.width,
                  canvas.height,
                  realTimeScore
                );
              }

              // 3. Send landmarks to server at 15Hz for server verification & spectator sync
              if (now - lastSendTimestampRef.current >= 66) {
                lastSendTimestampRef.current = now;
                const compressed = landmarksToCompressed(poseLandmarks);
                room.send('send_landmarks', { landmarks: compressed });
              }
            } else {
              setIsBodyDetected(false);
              setLocalScore(0);
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          } catch (detectionError) {
            console.error('Detection frame error:', detectionError);
          }
        }
      }

      if (active) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
      }
    };

    animationFrameRef.current = requestAnimationFrame(detectPose);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [room]);

  return (
    <div className="bg-[#FFFDF6] border-[3px] border-[#14110F] shadow-[8px_8px_0_#14110F] p-4 sm:p-5 flex flex-col justify-between h-full relative">
      {/* Top Viewfinder Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4A1C] border border-[#14110F] animate-rec-blink" />
          <span className="font-mono text-xs font-black uppercase text-[#14110F]">
            LIVE · GILIRANMU
          </span>
        </div>

        <span
          className={`font-mono text-[10px] font-black px-2 py-0.5 border border-[#14110F] uppercase ${
            isBodyDetected
              ? 'bg-[#7ED9A6] text-[#14110F]'
              : 'bg-[#FFD93B] text-[#14110F]'
          }`}
        >
          {isBodyDetected ? 'BADAN TERDETEKSI' : 'ARAHKAN BADAN'}
        </span>
      </div>

      {/* Video & Skeleton Viewfinder Stage with Square Corners & Grid */}
      <div className="relative flex-1 w-full min-h-[240px] sm:min-h-[300px] md:min-h-[380px] bg-[#14110F] border-2 border-[#14110F] overflow-hidden flex items-center justify-center">
        {/* Mirror Video */}
        <div className="relative w-full h-full flex items-center justify-center scale-x-[-1]">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Viewfinder Overlay: 4 Corner Brackets Inside */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#FFFDF6] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#FFFDF6] pointer-events-none" />

        {/* Waist guide on camera viewfinder */}
        <div className="absolute bottom-4 left-3 right-3 z-10 flex items-center justify-between border-b-2 border-dashed border-[#FF4A1C] pb-0.5 pointer-events-none">
          <span className="font-mono text-[9px] font-black text-[#FF4A1C] bg-[#FFFDF6] px-1.5 py-0.5 border border-[#FF4A1C] shadow-sm">
            BATAS PINGGANG
          </span>
        </div>

        {/* Rule of Thirds Grid Lines (faint) */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-white" />
          <div className="border-r border-white" />
          <div />
        </div>

        {/* Shutter matched flash alert badge */}
        {isMatched && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#7ED9A6] border-2 border-[#14110F] shadow-[3px_3px_0_#14110F] px-4 py-1 rotate-[-2deg]">
            <span className="font-marker text-base font-bold text-[#14110F] tracking-wider">
              TAHAN!
            </span>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoadingModel && (
          <div className="absolute inset-0 bg-[#EFE6D2]/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <CircleNotch size={32} weight="bold" className="animate-spin text-[#14110F] mb-2" />
            <p className="font-mono text-xs font-black uppercase text-[#14110F]">
              MEMBUKA KAMERA...
            </p>
          </div>
        )}

        {/* Camera Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#EFE6D2] flex flex-col items-center justify-center p-6 text-center z-20">
            <CameraSlash size={36} weight="bold" className="text-[#FF4A1C] mb-2" />
            <p className="font-mono text-xs font-bold text-[#FF4A1C] max-w-xs">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Analog Horizontal Exposure Meter for Live Accuracy */}
      <div className="mt-2 sm:mt-4">
        <ExposureMeter score={displayScore} isMatched={isMatched} />
      </div>
    </div>
  );
};
