import type { PoseLandmarker as PoseLandmarkerType } from '@mediapipe/tasks-vision';
import type { LandmarkPoint } from './types.ts';
import { LANDMARK_INDEX, MIN_LANDMARK_VISIBILITY } from './types.ts';

let landmarkerInstance: PoseLandmarkerType | null = null;
let initPromise: Promise<PoseLandmarkerType> | null = null;

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Initializes and returns the singleton PoseLandmarker instance.
 * Runs 100% in the browser using WebAssembly.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarkerType> {
  if (landmarkerInstance) return landmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');

    const vision = await FilesetResolver.forVisionTasks(WASM_URL);

    try {
      landmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      console.warn('MediaPipe GPU acceleration failed, falling back to CPU:', err);
      landmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    }

    return landmarkerInstance;
  })();

  return initPromise;
}

/**
 * Upper body bone connections (only shoulders, elbows, wrists, and head/nose)
 */
export const UPPER_BODY_CONNECTIONS: [number, number][] = [
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.RIGHT_SHOULDER],
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.LEFT_ELBOW],
  [LANDMARK_INDEX.LEFT_ELBOW, LANDMARK_INDEX.LEFT_WRIST],
  [LANDMARK_INDEX.RIGHT_SHOULDER, LANDMARK_INDEX.RIGHT_ELBOW],
  [LANDMARK_INDEX.RIGHT_ELBOW, LANDMARK_INDEX.RIGHT_WRIST],
];

/**
 * Renders smooth Apple-style motion capture skeleton overlay onto a 2D canvas.
 * Mirrored by default to match mirrored webcam video.
 */
export function drawUpperBodySkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[] | undefined,
  width: number,
  height: number,
  score: number = 0
): void {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks || landmarks.length === 0) return;

  ctx.save();
  ctx.shadowBlur = 0;

  // Crisp Flat Ink Bones (No Glow)
  // Thin ink outline: #14110F, or mint #7ED9A6 when pose matched (score >= 80)
  const boneColor = score >= 80 ? '#7ED9A6' : '#14110F';
  const boneWidth = score >= 80 ? 4.5 : 3.5;

  // 1. Draw Upper Body Bones
  for (const [startIdx, endIdx] of UPPER_BODY_CONNECTIONS) {
    const p1 = landmarks[startIdx];
    const p2 = landmarks[endIdx];

    if (!p1 || !p2) continue;
    if (
      (p1.visibility ?? 1) < MIN_LANDMARK_VISIBILITY ||
      (p2.visibility ?? 1) < MIN_LANDMARK_VISIBILITY
    ) {
      continue;
    }

    const x1 = p1.x * width;
    const y1 = p1.y * height;
    const x2 = p2.x * width;
    const y2 = p2.y * height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = boneWidth;
    ctx.strokeStyle = boneColor;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 2. Draw Head/Neck Connector & Mouth Line
  const nose = landmarks[LANDMARK_INDEX.NOSE];
  const lShoulder = landmarks[LANDMARK_INDEX.LEFT_SHOULDER];
  const rShoulder = landmarks[LANDMARK_INDEX.RIGHT_SHOULDER];

  if (
    nose &&
    lShoulder &&
    rShoulder &&
    (nose.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY &&
    (lShoulder.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY &&
    (rShoulder.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY
  ) {
    const midX = ((lShoulder.x + rShoulder.x) / 2) * width;
    const midY = ((lShoulder.y + rShoulder.y) / 2) * height;
    const nx = nose.x * width;
    const ny = nose.y * height;

    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = 3;
    ctx.strokeStyle = boneColor;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Draw Mouth Indicator Line
  const lMouth = landmarks[LANDMARK_INDEX.MOUTH_LEFT];
  const rMouth = landmarks[LANDMARK_INDEX.MOUTH_RIGHT];
  if (
    lMouth &&
    rMouth &&
    (lMouth.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY &&
    (rMouth.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY
  ) {
    ctx.beginPath();
    ctx.moveTo(lMouth.x * width, lMouth.y * height);
    ctx.lineTo(rMouth.x * width, rMouth.y * height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FF4A1C';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 3. Draw Flat Joint Dots (Upper body + Eyes + Fingers, no glow)
  const jointConfigs = [
    { idx: LANDMARK_INDEX.NOSE, color: '#FF4A1C', r: 4.5 },
    { idx: LANDMARK_INDEX.LEFT_EYE, color: '#14110F', r: 3 },
    { idx: LANDMARK_INDEX.RIGHT_EYE, color: '#14110F', r: 3 },
    { idx: LANDMARK_INDEX.LEFT_SHOULDER, color: '#FF4A1C', r: 6.5 },
    { idx: LANDMARK_INDEX.RIGHT_SHOULDER, color: '#FF4A1C', r: 6.5 },
    { idx: LANDMARK_INDEX.LEFT_ELBOW, color: '#FFD93B', r: 6 },
    { idx: LANDMARK_INDEX.RIGHT_ELBOW, color: '#FFD93B', r: 6 },
    { idx: LANDMARK_INDEX.LEFT_WRIST, color: '#7ED9A6', r: 5.5 },
    { idx: LANDMARK_INDEX.RIGHT_WRIST, color: '#7ED9A6', r: 5.5 },
    { idx: LANDMARK_INDEX.LEFT_INDEX, color: '#FFD93B', r: 4 },
    { idx: LANDMARK_INDEX.RIGHT_INDEX, color: '#FFD93B', r: 4 },
  ];

  for (const { idx, color, r } of jointConfigs) {
    const p = landmarks[idx];
    if (!p || (p.visibility ?? 1) < MIN_LANDMARK_VISIBILITY) continue;

    const jx = p.x * width;
    const jy = p.y * height;

    ctx.beginPath();
    ctx.arc(jx, jy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#14110F';
    ctx.stroke();
  }

  ctx.restore();
}
