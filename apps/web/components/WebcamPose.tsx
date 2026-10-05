'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getPoseLandmarker, drawUpperBodySkeleton } from '../lib/pose/detector.ts';
import { calculateUpperBodyAngles } from '../lib/pose/angles.ts';
import type { LandmarkPoint, PoseAngles } from '../lib/pose/types.ts';
import type { PoseLandmarker as PoseLandmarkerType } from '@mediapipe/tasks-vision';
import {
  VideoCamera,
  CircleNotch,
  CameraSlash,
  WarningCircle,
  CheckCircle,
  Crosshair,
} from '@phosphor-icons/react';

interface WebcamPoseProps {
  currentScore: number;
  onAnglesUpdate: (angles: PoseAngles, rawLandmarks: LandmarkPoint[] | null) => void;
}

export const WebcamPose: React.FC<WebcamPoseProps> = ({
  currentScore,
  onAnglesUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isBodyDetected, setIsBodyDetected] = useState<boolean>(false);

  const landmarkerRef = useRef<PoseLandmarkerType | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera.');
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
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Izin kamera ditolak. Izinkan akses webcam di browser Anda untuk bermain.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan. Pastikan webcam terhubung.');
      } else {
        setCameraError(error.message || 'Gagal menyalakan webcam. Periksa izin kamera.');
      }
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initDetector() {
      try {
        setIsLoadingModel(true);
        setModelError(null);
        const landmarker = await getPoseLandmarker();
        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsLoadingModel(false);
        }
      } catch (err: unknown) {
        console.error('Failed to load MediaPipe PoseLandmarker:', err);
        if (isMounted) {
          setModelError('Gagal memuat model deteksi pose. Periksa koneksi internet Anda.');
          setIsLoadingModel(false);
        }
      }
    }

    initDetector();
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

              const angles = calculateUpperBodyAngles(poseLandmarks);
              onAnglesUpdate(angles, poseLandmarks);

              if (ctx) {
                drawUpperBodySkeleton(
                  ctx,
                  poseLandmarks,
                  canvas.width,
                  canvas.height,
                  currentScore
                );
              }
            } else {
              setIsBodyDetected(false);
              onAnglesUpdate(
                {
                  leftElbow: null,
                  rightElbow: null,
                  leftShoulder: null,
                  rightShoulder: null,
                  shoulderTilt: null,
                  headTilt: null,
                },
                null
              );
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
  }, [currentScore, onAnglesUpdate]);

  return (
    <div className="relative flex flex-col h-full game-card rounded-2xl p-5 overflow-hidden transition-all">
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Top Header Status */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCameraActive && isBodyDetected
                  ? 'bg-[#D4FF00]'
                  : isCameraActive
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCameraActive && isBodyDetected
                  ? 'bg-[#D4FF00]'
                  : isCameraActive
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <VideoCamera size={14} weight="bold" />
            <span>Webcam (Mirror)</span>
          </span>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-2">
          {isLoadingModel && (
            <span className="text-[10px] font-mono text-[#D4FF00] animate-pulse bg-[#D4FF00]/10 border border-[#D4FF00]/30 px-2 py-0.5 rounded-md">
              Memuat AI...
            </span>
          )}
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              isBodyDetected
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            {isBodyDetected ? (
              <>
                <CheckCircle size={12} weight="fill" />
                <span>Badan Terdeteksi</span>
              </>
            ) : (
              <>
                <Crosshair size={12} weight="bold" />
                <span>Arahkan Badan</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Video & Skeleton Canvas Container */}
      <div className="relative flex-1 w-full min-h-[260px] max-h-[340px] flex items-center justify-center rounded-xl bg-[#07090E] border border-white/10 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center scale-x-[-1]">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover rounded-xl"
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Loading Overlay */}
        {isLoadingModel && (
          <div className="absolute inset-0 bg-[#07090E]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <CircleNotch size={36} weight="bold" className="animate-spin text-[#D4FF00] mb-2" />
            <p className="text-xs font-mono font-bold text-white">Memuat MediaPipe PoseLandmarker...</p>
            <p className="text-[10px] text-zinc-400 mt-1 max-w-xs font-mono">
              Model dijalankan 100% di browser tanpa mengirim data video ke server.
            </p>
          </div>
        )}

        {/* Camera Permission / Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#07090E]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <CameraSlash size={36} weight="bold" className="text-rose-400 mb-2" />
            <p className="text-xs font-bold text-rose-300 max-w-xs">{cameraError}</p>
            <button
              onClick={startCamera}
              className="mt-3 px-3 py-1.5 btn-arcade-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Coba Nyalakan Lagi
            </button>
          </div>
        )}

        {/* Model Loading Error Overlay */}
        {modelError && (
          <div className="absolute inset-0 bg-[#07090E]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <WarningCircle size={36} weight="bold" className="text-amber-400 mb-2" />
            <p className="text-xs font-bold text-amber-300 max-w-xs">{modelError}</p>
          </div>
        )}
      </div>

      {/* Instructions footer note */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>MediaPipe Lite (Upper Body)</span>
        <span>60 FPS</span>
      </div>
    </div>
  );
};
