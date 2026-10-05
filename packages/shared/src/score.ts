import type {
  PoseAngles,
  AngleKey,
  ScoreResult,
  AngleEvaluation,
} from './types.ts';
import {
  MAX_ANGLE_TOLERANCE_DEG,
  ROLLING_WINDOW_MS,
  ROUND_RANK_BONUSES,
} from './constants.ts';

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

export function differenceToScore(
  diff: number,
  maxTolerance: number = MAX_ANGLE_TOLERANCE_DEG
): number {
  if (diff <= 0) return 100;
  if (diff >= maxTolerance) return 0;

  const normalized = diff / maxTolerance;
  const score = 100 * (1 - Math.pow(normalized, 1.5));
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Creates mirrored target angles (swapping left/right limbs and inverting head/shoulder tilt)
 * to support natural human mirroring in webcam / photobooth gameplay.
 */
export function mirrorPoseAngles(angles: Record<string, number>): Record<string, number> {
  const mirrored: Record<string, number> = {};
  for (const [key, val] of Object.entries(angles)) {
    if (key === 'leftElbow') mirrored.rightElbow = val;
    else if (key === 'rightElbow') mirrored.leftElbow = val;
    else if (key === 'leftShoulder') mirrored.rightShoulder = val;
    else if (key === 'rightShoulder') mirrored.leftShoulder = val;
    else if (key === 'shoulderTilt') mirrored.shoulderTilt = -val;
    else if (key === 'headTilt') mirrored.headTilt = -val;
    else mirrored[key] = val;
  }
  return mirrored;
}

function evaluateSinglePoseScore(
  playerAngles: PoseAngles | null | undefined,
  targetAngles: Record<string, number>,
  maxTolerance: number
): ScoreResult {
  const targetKeys = Object.keys(targetAngles) as AngleKey[];
  const breakdown: Record<AngleKey, AngleEvaluation> = {} as any;
  const GESTURE_KEYS = new Set(['handToFace', 'handToChest', 'handCloseness', 'mouthOpen']);

  let totalWeightedScore = 0;
  let totalActiveWeights = 0;
  let visibleCount = 0;

  for (const key of targetKeys) {
    const targetAngle = targetAngles[key] ?? 0;
    const playerAngle = playerAngles ? (playerAngles[key] as number | null | undefined) ?? null : null;
    const weight = GESTURE_KEYS.has(key) ? 3.0 : 1.0;

    const isVisible = playerAngle !== null && playerAngle !== undefined;
    const isLinear =
      key === 'leftElbow' ||
      key === 'rightElbow' ||
      key === 'mouthOpen' ||
      key === 'handCloseness' ||
      key === 'handToFace' ||
      key === 'handToChest';
    const isCircular = !isLinear;

    // EVERY key required by target pose MUST be in the denominator!
    totalActiveWeights += weight;

    if (isVisible) {
      visibleCount++;
      const diff = Math.round(computeAngleDifference(playerAngle, targetAngle, isCircular));
      const score = differenceToScore(diff, maxTolerance);

      totalWeightedScore += score * weight;

      breakdown[key] = {
        playerAngle,
        targetAngle,
        diff,
        score,
        weight,
        isVisible: true,
      };
    } else {
      // Missing required limb/gesture gives 0 points
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

export function calculatePoseScore(
  playerAngles: PoseAngles | null | undefined,
  targetAngles: Record<string, number>,
  maxTolerance: number = MAX_ANGLE_TOLERANCE_DEG
): ScoreResult {
  const normalResult = evaluateSinglePoseScore(playerAngles, targetAngles, maxTolerance);
  const mirroredTarget = mirrorPoseAngles(targetAngles);
  const mirroredResult = evaluateSinglePoseScore(playerAngles, mirroredTarget, maxTolerance);

  return normalResult.totalScore >= mirroredResult.totalScore ? normalResult : mirroredResult;
}

/**
 * 1-Second Rolling Average Tracker to prevent jitter and reward holding the pose
 */
export class RollingScoreTracker {
  private samples: { timestamp: number; score: number }[] = [];
  private windowMs: number;
  private maxRollingAverage: number = 0;

  constructor(windowMs: number = ROLLING_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  public reset(): void {
    this.samples = [];
    this.maxRollingAverage = 0;
  }

  public addSample(timestamp: number, score: number): { currentAverage: number; bestAverage: number } {
    this.samples.push({ timestamp, score });

    // Remove samples older than windowMs
    const cutoff = timestamp - this.windowMs;
    while (this.samples.length > 0 && this.samples[0].timestamp < cutoff) {
      this.samples.shift();
    }

    if (this.samples.length === 0) {
      return { currentAverage: 0, bestAverage: this.maxRollingAverage };
    }

    // Compute moving average of samples currently within the window
    const sum = this.samples.reduce((acc, s) => acc + s.score, 0);
    const currentAverage = Math.round(sum / this.samples.length);

    // Only update best when we have at least 500ms of data in window to prevent instant spike
    const durationInWindow = timestamp - this.samples[0].timestamp;
    if (durationInWindow >= 400 || this.samples.length >= 5) {
      if (currentAverage > this.maxRollingAverage) {
        this.maxRollingAverage = currentAverage;
      }
    }

    return {
      currentAverage,
      bestAverage: this.maxRollingAverage,
    };
  }

  public getBestAverage(): number {
    return this.maxRollingAverage;
  }
}

/**
 * Assigns bonus points to top 3 players in a round
 */
export function calculateRoundBonuses(
  roundScores: { sessionId: string; score: number }[]
): Record<string, number> {
  const bonuses: Record<string, number> = {};
  for (const item of roundScores) {
    bonuses[item.sessionId] = 0;
  }

  const sorted = [...roundScores].sort((a, b) => b.score - a.score);

  for (let i = 0; i < sorted.length && i < ROUND_RANK_BONUSES.length; i++) {
    const item = sorted[i];
    if (item.score > 0) {
      bonuses[item.sessionId] = ROUND_RANK_BONUSES[i];
    }
  }

  return bonuses;
}
