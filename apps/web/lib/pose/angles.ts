import type { LandmarkPoint, PoseAngles } from './types.ts';
import {
  LANDMARK_INDEX,
  MIN_LANDMARK_VISIBILITY,
} from './types.ts';

/**
 * Checks if a landmark is adequately visible.
 */
export function isLandmarkVisible(
  p: LandmarkPoint | undefined,
  minVisibility: number = MIN_LANDMARK_VISIBILITY
): boolean {
  if (!p) return false;
  if (p.visibility === undefined) return true;
  return p.visibility >= minVisibility;
}

/**
 * Computes unsigned angle at vertex B formed by rays BA and BC in degrees [0, 180].
 */
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

/**
 * Computes upper arm angle relative to the shoulder axis in degrees [-180, 180].
 * Symmetrically defined for left and right arm:
 * - Hanging down along torso: ~ +90°
 * - Extended horizontally outwards: ~ 0°
 * - Raised upward at 45° (Y-pose): ~ -45°
 * - Raised straight up: ~ -90°
 * - Folded inward across chest: ~ +140° to +180°
 */
export function computeRelativeArmAngle(
  shoulder: LandmarkPoint,
  oppositeShoulder: LandmarkPoint,
  elbow: LandmarkPoint,
  side: 'left' | 'right'
): number {
  // Base shoulder vector pointing outwards away from center
  const vsX = shoulder.x - oppositeShoulder.x;
  const vsY = shoulder.y - oppositeShoulder.y;

  // Upper arm vector from shoulder to elbow
  const vaX = elbow.x - shoulder.x;
  const vaY = elbow.y - shoulder.y;

  const magS = Math.hypot(vsX, vsY);
  const magA = Math.hypot(vaX, vaY);

  if (magS < 1e-6 || magA < 1e-6) {
    return 0;
  }

  // 2D dot product and cross product (vs x va)
  const dot = vsX * vaX + vsY * vaY;
  const cross = vsX * vaY - vsY * vaX;

  const angleRad = Math.atan2(cross, dot);
  const angleDeg = (angleRad * 180) / Math.PI;

  // For the right arm, negate the cross direction so conventions match for both arms
  return side === 'left' ? angleDeg : -angleDeg;
}

/**
 * Computes shoulder line tilt relative to horizontal in degrees [-90, 90].
 * Vector from right shoulder (12) to left shoulder (11).
 * Level shoulders ≈ 0°.
 */
export function computeShoulderTilt(
  leftShoulder: LandmarkPoint,
  rightShoulder: LandmarkPoint
): number {
  const dx = leftShoulder.x - rightShoulder.x;
  const dy = leftShoulder.y - rightShoulder.y;

  if (Math.hypot(dx, dy) < 1e-6) {
    return 0;
  }

  // dy > 0 means left shoulder is lower than right shoulder (tilted left)
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Computes head tilt relative to vertical in degrees [-90, 90].
 * Line from shoulder midpoint to nose.
 * 0° is straight upright.
 */
export function computeHeadTilt(
  nose: LandmarkPoint,
  leftShoulder: LandmarkPoint,
  rightShoulder: LandmarkPoint
): number {
  const midX = (leftShoulder.x + rightShoulder.x) / 2;
  const midY = (leftShoulder.y + rightShoulder.y) / 2;

  const dx = nose.x - midX;
  const dy = nose.y - midY; // dy is negative when nose is above shoulders

  if (Math.hypot(dx, dy) < 1e-6) {
    return 0;
  }

  // Angle relative to vertical up (0, -1)
  // atan2(dx, -dy) gives 0 when dx=0 and dy<0 (nose above shoulders)
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

/**
 * Pure function to calculate all upper-body angles from MediaPipe pose landmarks.
 * Landmarks below minVisibility threshold result in null for the corresponding angle.
 */
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
    };
  }

  const nose = landmarks[LANDMARK_INDEX.NOSE];
  const lShoulder = landmarks[LANDMARK_INDEX.LEFT_SHOULDER];
  const rShoulder = landmarks[LANDMARK_INDEX.RIGHT_SHOULDER];
  const lElbow = landmarks[LANDMARK_INDEX.LEFT_ELBOW];
  const rElbow = landmarks[LANDMARK_INDEX.RIGHT_ELBOW];
  const lWrist = landmarks[LANDMARK_INDEX.LEFT_WRIST];
  const rWrist = landmarks[LANDMARK_INDEX.RIGHT_WRIST];

  // Visibility checks
  const isLShoulderVis = isLandmarkVisible(lShoulder, minVisibility);
  const isRShoulderVis = isLandmarkVisible(rShoulder, minVisibility);
  const isLElbowVis = isLandmarkVisible(lElbow, minVisibility);
  const isRElbowVis = isLandmarkVisible(rElbow, minVisibility);
  const isLWristVis = isLandmarkVisible(lWrist, minVisibility);
  const isRWristVis = isLandmarkVisible(rWrist, minVisibility);
  const isNoseVis = isLandmarkVisible(nose, minVisibility);

  // Left Elbow: lShoulder -> lElbow -> lWrist
  const leftElbow =
    isLShoulderVis && isLElbowVis && isLWristVis
      ? Math.round(computeAngle3Points(lShoulder, lElbow, lWrist))
      : null;

  // Right Elbow: rShoulder -> rElbow -> rWrist
  const rightElbow =
    isRShoulderVis && isRElbowVis && isRWristVis
      ? Math.round(computeAngle3Points(rShoulder, rElbow, rWrist))
      : null;

  // Left Shoulder: arm relative to shoulder line
  const leftShoulder =
    isLShoulderVis && isRShoulderVis && isLElbowVis
      ? Math.round(computeRelativeArmAngle(lShoulder, rShoulder, lElbow, 'left'))
      : null;

  // Right Shoulder: arm relative to shoulder line
  const rightShoulder =
    isRShoulderVis && isLShoulderVis && isRElbowVis
      ? Math.round(computeRelativeArmAngle(rShoulder, lShoulder, rElbow, 'right'))
      : null;

  // Shoulder Tilt: between rShoulder and lShoulder
  const shoulderTilt =
    isLShoulderVis && isRShoulderVis
      ? Math.round(computeShoulderTilt(lShoulder, rShoulder))
      : null;

  // Head Tilt: nose relative to shoulder midpoint
  const headTilt =
    isNoseVis && isLShoulderVis && isRShoulderVis
      ? Math.round(computeHeadTilt(nose, lShoulder, rShoulder))
      : null;

  return {
    leftElbow,
    rightElbow,
    leftShoulder,
    rightShoulder,
    shoulderTilt,
    headTilt,
  };
}
