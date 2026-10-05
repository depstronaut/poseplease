import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAngleDifference,
  differenceToScore,
  calculatePoseScore,
} from '@poseplease/shared';
import type { PoseAngles } from '@poseplease/shared';

describe('score.ts - Pure score calculations', () => {
  it('computes angular difference correctly with circular wrap-around', () => {
    // 170° and -170° are separated by only 20°
    const diff = computeAngleDifference(170, -170, true);
    assert.equal(diff, 20);

    // 0° and 10°
    assert.equal(computeAngleDifference(0, 10, true), 10);

    // Non circular (e.g. elbow)
    assert.equal(computeAngleDifference(160, 90, false), 70);
  });

  it('converts difference to score correctly', () => {
    assert.equal(differenceToScore(0, 60), 100);
    assert.equal(differenceToScore(60, 60), 0);
    assert.equal(differenceToScore(70, 60), 0);
    const midScore = differenceToScore(20, 60);
    assert.ok(midScore > 50 && midScore < 100);
  });

  it('calculates 100 total score for identical angles', () => {
    const target = {
      leftElbow: 180,
      rightElbow: 180,
      leftShoulder: 90,
      rightShoulder: 90,
      shoulderTilt: 0,
      headTilt: 0,
    };

    const player: PoseAngles = { ...target };
    const result = calculatePoseScore(player, target);
    assert.equal(result.totalScore, 100);
    assert.equal(result.visibleCount, 6);
  });

  it('handles partial visibility gracefully without breaking total score', () => {
    const target = {
      leftElbow: 180,
      rightElbow: 180,
      leftShoulder: 90,
      rightShoulder: 90,
      shoulderTilt: 0,
      headTilt: 0,
    };

    // Right arm is obscured/null, but left arm + shoulders are matching target
    const player: PoseAngles = {
      leftElbow: 180,
      rightElbow: null,
      leftShoulder: 90,
      rightShoulder: null,
      shoulderTilt: 0,
      headTilt: 0,
    };

    const result = calculatePoseScore(player, target);
    assert.equal(result.totalScore, 67);
    assert.equal(result.visibleCount, 4);
    assert.equal(result.breakdown.rightElbow.isVisible, false);
  });

  it('returns 0 when no angles are visible or player is missing', () => {
    const target = {
      leftElbow: 180,
      rightElbow: 180,
      leftShoulder: 90,
      rightShoulder: 90,
      shoulderTilt: 0,
      headTilt: 0,
    };

    const resultEmpty = calculatePoseScore(null, target);
    assert.equal(resultEmpty.totalScore, 0);
    assert.equal(resultEmpty.visibleCount, 0);
  });
});
