import type {
  PoseAngles,
  AngleKey,
  ScoreResult,
  AngleEvaluation,
} from './types.ts';
import {
  DEFAULT_ANGLE_WEIGHTS,
  MAX_ANGLE_TOLERANCE_DEG,
} from './types.ts';

/**
 * Computes shortest angular difference between two angles in degrees [0, 180].
 */
export function computeAngleDifference(
  angle1: number,
  angle2: number,
  isCircular: boolean = true
): number {
  if (!isCircular) {
    return Math.abs(angle1 - angle2);
  }
  let diff = Math.abs(angle1 - angle2) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Converts angle difference (in degrees) to score (0 to 100).
 * diff = 0° => 100
 * diff >= maxTolerance => 0
 */
export function differenceToScore(
  diff: number,
  maxTolerance: number = MAX_ANGLE_TOLERANCE_DEG
): number {
  if (diff <= 0) return 100;
  if (diff >= maxTolerance) return 0;

  // Smooth quadratic drop-off for satisfying arcade gameplay
  const normalized = diff / maxTolerance; // 0 to 1
  const score = 100 * (1 - Math.pow(normalized, 1.25));
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Pure function to calculate total pose score and detailed breakdown.
 * Compares player angles against target angles.
 * Ignores any angles that are null (due to low visibility or missing landmarks).
 */
export function calculatePoseScore(
  playerAngles: PoseAngles | null | undefined,
  targetAngles: Record<string, number>,
  weights: Partial<Record<AngleKey, number>> = DEFAULT_ANGLE_WEIGHTS,
  maxTolerance: number = MAX_ANGLE_TOLERANCE_DEG
): ScoreResult {
  const targetKeys = Object.keys(targetAngles) as AngleKey[];
  const breakdown: Record<string, AngleEvaluation> = {};

  let totalWeightedScore = 0;
  let totalActiveWeights = 0;
  let visibleCount = 0;

  for (const key of targetKeys) {
    const targetAngle = targetAngles[key] ?? 0;
    const playerAngle = playerAngles ? (playerAngles[key] as number | null | undefined) ?? null : null;
    const weight = weights[key] ?? 1.0;

    const isVisible = playerAngle !== null && playerAngle !== undefined;
    const isLinear =
      key === 'leftElbow' ||
      key === 'rightElbow' ||
      key === 'mouthOpen' ||
      key === 'handCloseness' ||
      key === 'handToFace' ||
      key === 'handToChest';
    const isCircular = !isLinear;

    if (isVisible) {
      visibleCount++;
      const diff = Math.round(computeAngleDifference(playerAngle, targetAngle, isCircular));
      const score = differenceToScore(diff, maxTolerance);

      totalWeightedScore += score * weight;
      totalActiveWeights += weight;

      breakdown[key] = {
        playerAngle,
        targetAngle,
        diff,
        score,
        weight,
        isVisible: true,
      };
    } else {
      breakdown[key] = {
        playerAngle: null,
        targetAngle,
        diff: null,
        score: 0,
        weight,
        isVisible: false,
      };
    }
  }

  // If no landmarks visible or insufficient landmarks detected, score is 0
  const totalScore =
    totalActiveWeights > 0 && visibleCount >= 2
      ? Math.round(totalWeightedScore / totalActiveWeights)
      : 0;

  return {
    totalScore,
    breakdown,
    visibleCount,
  };
}
