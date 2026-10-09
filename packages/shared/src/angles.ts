import type {
  LandmarkPoint,
  PoseAngles,
  CompressedLandmark,
} from './types.ts';
import { LANDMARK_INDEX, MIN_LANDMARK_VISIBILITY } from './constants.ts';

export function isLandmarkVisible(
  p: LandmarkPoint | undefined,
  minVisibility: number = MIN_LANDMARK_VISIBILITY
): boolean {
  if (!p) return false;
  if (p.visibility === undefined) return true;
  return p.visibility >= minVisibility;
}

export function computeAngle3Points(
  a: LandmarkPoint,
  b: LandmarkPoint,
  c: LandmarkPoint
): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);

  if (mag1 < 1e-6 || mag2 < 1e-6) {
    return 0;
  }

  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

export function computeRelativeArmAngle(
  shoulder: LandmarkPoint,
  oppositeShoulder: LandmarkPoint,
  elbow: LandmarkPoint,
  side: 'left' | 'right'
): number {
  const vsX = shoulder.x - oppositeShoulder.x;
  const vsY = shoulder.y - oppositeShoulder.y;

  const vaX = elbow.x - shoulder.x;
  const vaY = elbow.y - shoulder.y;

  const magS = Math.hypot(vsX, vsY);
  const magA = Math.hypot(vaX, vaY);

  if (magS < 1e-6 || magA < 1e-6) {
    return 0;
  }

  const dot = vsX * vaX + vsY * vaY;
  const cross = vsX * vaY - vsY * vaX;

  const angleRad = Math.atan2(cross, dot);
  const angleDeg = (angleRad * 180) / Math.PI;

  return side === 'left' ? angleDeg : -angleDeg;
}

export function computeShoulderTilt(
  leftShoulder: LandmarkPoint,
  rightShoulder: LandmarkPoint
): number {
  const dx = leftShoulder.x - rightShoulder.x;
  const dy = leftShoulder.y - rightShoulder.y;

  if (Math.hypot(dx, dy) < 1e-6) {
    return 0;
  }

  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function computeHeadTilt(
  nose: LandmarkPoint,
  leftShoulder: LandmarkPoint,
  rightShoulder: LandmarkPoint,
  leftEye?: LandmarkPoint,
  rightEye?: LandmarkPoint
): number {
  if (
    leftEye &&
    rightEye &&
    (leftEye.visibility ?? 1) >= 0.5 &&
    (rightEye.visibility ?? 1) >= 0.5
  ) {
    const dx = leftEye.x - rightEye.x;
    const dy = leftEye.y - rightEye.y;
    if (Math.hypot(dx, dy) >= 1e-4) {
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    }
  }

  const midX = (leftShoulder.x + rightShoulder.x) / 2;
  const midY = (leftShoulder.y + rightShoulder.y) / 2;

  const dx = nose.x - midX;
  const dy = nose.y - midY;

  if (Math.hypot(dx, dy) < 1e-6) {
    return 0;
  }

  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

export function computeMouthOpen(
  nose: LandmarkPoint,
  mouthLeft: LandmarkPoint,
  mouthRight: LandmarkPoint,
  scale: number
): number {
  const mouthMidY = (mouthLeft.y + mouthRight.y) / 2;
  const vertDrop = (mouthMidY - nose.y) / Math.max(1e-4, scale);
  // Normal resting mouth: ~0.19-0.22 scale. Open mouth: >= 0.28
  if (vertDrop <= 0.22) return 0;
  const score = ((vertDrop - 0.22) / 0.12) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeHandCloseness(
  lWrist: LandmarkPoint,
  rWrist: LandmarkPoint,
  scale: number
): number {
  const dist = Math.hypot(lWrist.x - rWrist.x, lWrist.y - rWrist.y) / Math.max(1e-4, scale);
  // In heart hands, palms/fingers meet while wrists remain ~0.25-0.30 scale apart
  if (dist <= 0.28) return 100;
  if (dist >= 0.75) return 0;
  const score = 100 * (1 - (dist - 0.28) / (0.75 - 0.28));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeHandToFace(
  wrists: LandmarkPoint[],
  facePoints: LandmarkPoint[],
  scale: number
): number {
  let minDist = 999;
  for (const w of wrists) {
    for (const f of facePoints) {
      const d = Math.hypot(w.x - f.x, w.y - f.y) / Math.max(1e-4, scale);
      if (d < minDist) minDist = d;
    }
  }
  // When hands or index fingers touch chin/lips/cheek/ears:
  // minDist of nearest wrist/index is naturally within 0.25 scale
  if (minDist <= 0.25) return 100;
  if (minDist >= 0.70) return 0;
  const score = 100 * (1 - (minDist - 0.25) / (0.70 - 0.25));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeHandToChest(
  wrists: LandmarkPoint[],
  lShoulder: LandmarkPoint,
  rShoulder: LandmarkPoint,
  scale: number
): number {
  const chestX = (lShoulder.x + rShoulder.x) / 2;
  const chestY = (lShoulder.y + rShoulder.y) / 2 + 0.12 * scale;
  let minDist = 999;
  for (const w of wrists) {
    const d = Math.hypot(w.x - chestX, w.y - chestY) / Math.max(1e-4, scale);
    if (d < minDist) minDist = d;
  }
  if (minDist <= 0.25) return 100;
  if (minDist >= 0.70) return 0;
  const score = 100 * (1 - (minDist - 0.25) / (0.70 - 0.25));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateUpperBodyAngles(
  landmarks: LandmarkPoint[] | null | undefined,
  minVisibility: number = MIN_LANDMARK_VISIBILITY
): PoseAngles {
  if (!landmarks || landmarks.length <= LANDMARK_INDEX.RIGHT_WRIST) {
    return {
      leftElbow: null,
      rightElbow: null,
      leftShoulder: null,
      rightShoulder: null,
      shoulderTilt: null,
      headTilt: null,
      mouthOpen: null,
      handCloseness: null,
      handToFace: null,
      handToChest: null,
    };
  }

  const nose = landmarks[LANDMARK_INDEX.NOSE];
  const lEye = landmarks[LANDMARK_INDEX.LEFT_EYE];
  const rEye = landmarks[LANDMARK_INDEX.RIGHT_EYE];
  const lEar = landmarks[LANDMARK_INDEX.LEFT_EAR];
  const rEar = landmarks[LANDMARK_INDEX.RIGHT_EAR];
  const lMouth = landmarks[LANDMARK_INDEX.MOUTH_LEFT];
  const rMouth = landmarks[LANDMARK_INDEX.MOUTH_RIGHT];
  const lShoulder = landmarks[LANDMARK_INDEX.LEFT_SHOULDER];
  const rShoulder = landmarks[LANDMARK_INDEX.RIGHT_SHOULDER];
  const lElbow = landmarks[LANDMARK_INDEX.LEFT_ELBOW];
  const rElbow = landmarks[LANDMARK_INDEX.RIGHT_ELBOW];
  const lWrist = landmarks[LANDMARK_INDEX.LEFT_WRIST];
  const rWrist = landmarks[LANDMARK_INDEX.RIGHT_WRIST];
  const lIndex = landmarks[LANDMARK_INDEX.LEFT_INDEX];
  const rIndex = landmarks[LANDMARK_INDEX.RIGHT_INDEX];

  const isLShoulderVis = isLandmarkVisible(lShoulder, minVisibility);
  const isRShoulderVis = isLandmarkVisible(rShoulder, minVisibility);
  const isLElbowVis = isLandmarkVisible(lElbow, minVisibility);
  const isRElbowVis = isLandmarkVisible(rElbow, minVisibility);
  const isLWristVis = isLandmarkVisible(lWrist, minVisibility);
  const isRWristVis = isLandmarkVisible(rWrist, minVisibility);
  const isNoseVis = isLandmarkVisible(nose, minVisibility);

  const leftElbow =
    isLShoulderVis && isLElbowVis && isLWristVis
      ? Math.round(computeAngle3Points(lShoulder, lElbow, lWrist))
      : null;

  const rightElbow =
    isRShoulderVis && isRElbowVis && isRWristVis
      ? Math.round(computeAngle3Points(rShoulder, rElbow, rWrist))
      : null;

  const leftShoulder =
    isLShoulderVis && isRShoulderVis && isLElbowVis
      ? Math.round(computeRelativeArmAngle(lShoulder, rShoulder, lElbow, 'left'))
      : null;

  const rightShoulder =
    isRShoulderVis && isLShoulderVis && isRElbowVis
      ? Math.round(computeRelativeArmAngle(rShoulder, lShoulder, rElbow, 'right'))
      : null;

  const shoulderTilt =
    isLShoulderVis && isRShoulderVis
      ? Math.round(computeShoulderTilt(lShoulder, rShoulder))
      : null;

  const headTilt =
    isNoseVis && isLShoulderVis && isRShoulderVis
      ? Math.round(computeHeadTilt(nose, lShoulder, rShoulder, lEye, rEye))
      : null;

  // Scale reference (shoulder distance)
  const scale =
    isLShoulderVis && isRShoulderVis
      ? Math.hypot(lShoulder.x - rShoulder.x, lShoulder.y - rShoulder.y)
      : 0.3;

  // Mimik: Mouth open
  const isMouthVis = isNoseVis && isLandmarkVisible(lMouth, minVisibility) && isLandmarkVisible(rMouth, minVisibility);
  const mouthOpen = isMouthVis ? computeMouthOpen(nose, lMouth, rMouth, scale) : (isNoseVis ? 0 : null);

  // Gesture: Hand closeness (heart hands)
  const isBothWristsVis = isLWristVis && isRWristVis;
  const handCloseness =
    isLShoulderVis && isRShoulderVis
      ? isBothWristsVis
        ? computeHandCloseness(lWrist, rWrist, scale)
        : 0
      : null;

  // Gesture: Hand to face / head (Mewing, Roll Safe, Shocked, Double Peace)
  const activeHands: LandmarkPoint[] = [];
  if (isLWristVis) activeHands.push(lWrist);
  if (isRWristVis) activeHands.push(rWrist);
  if (isLandmarkVisible(lIndex, minVisibility)) activeHands.push(lIndex);
  if (isLandmarkVisible(rIndex, minVisibility)) activeHands.push(rIndex);

  const faceTargets: LandmarkPoint[] = [];
  if (isNoseVis) faceTargets.push(nose);
  if (isLandmarkVisible(lEar, minVisibility)) faceTargets.push(lEar);
  if (isLandmarkVisible(rEar, minVisibility)) faceTargets.push(rEar);
  if (isLandmarkVisible(lMouth, minVisibility)) faceTargets.push(lMouth);
  if (isLandmarkVisible(rMouth, minVisibility)) faceTargets.push(rMouth);
  if (isLandmarkVisible(lEye, minVisibility)) faceTargets.push(lEye);
  if (isLandmarkVisible(rEye, minVisibility)) faceTargets.push(rEye);

  const handToFace =
    faceTargets.length > 0
      ? activeHands.length > 0
        ? computeHandToFace(activeHands, faceTargets, scale)
        : 0
      : null;

  // Gesture: Hand to chest ("Who, Me?")
  const handToChest =
    isLShoulderVis && isRShoulderVis
      ? activeHands.length > 0
        ? computeHandToChest(activeHands, lShoulder, rShoulder, scale)
        : 0
      : null;

  return {
    leftElbow,
    rightElbow,
    leftShoulder,
    rightShoulder,
    shoulderTilt,
    headTilt,
    mouthOpen,
    handCloseness,
    handToFace,
    handToChest,
  };
}

/**
 * Reconstructs a full landmark array from compressed landmarks received over wire.
 */
export function compressedToLandmarks(compressed: CompressedLandmark[]): LandmarkPoint[] {
  const result: LandmarkPoint[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    visibility: 0,
  }));

  for (const item of compressed) {
    if (item.i >= 0 && item.i < 33) {
      result[item.i] = {
        x: item.x,
        y: item.y,
        visibility: item.v ?? 1,
      };
    }
  }

  return result;
}

/**
 * Compresses upper-body + face landmarks for network transmission (2 decimal rounding)
 */
export function landmarksToCompressed(landmarks: LandmarkPoint[] | undefined | null): CompressedLandmark[] {
  if (!landmarks || landmarks.length === 0) return [];

  const neededIndices = [0, 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20];
  const compressed: CompressedLandmark[] = [];

  for (const idx of neededIndices) {
    const pt = landmarks[idx];
    if (pt) {
      compressed.push({
        i: idx,
        x: Math.round(pt.x * 100) / 100,
        y: Math.round(pt.y * 100) / 100,
        v: pt.visibility !== undefined ? Math.round(pt.visibility * 100) / 100 : 1,
      });
    }
  }

  return compressed;
}
