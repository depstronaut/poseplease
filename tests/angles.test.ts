import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAngle3Points,
  computeRelativeArmAngle,
  computeShoulderTilt,
  computeHeadTilt,
  calculateUpperBodyAngles,
  isLandmarkVisible,
} from '@poseplease/shared';
import type { LandmarkPoint } from '@poseplease/shared';

describe('angles.ts - Pure angle calculations', () => {
  it('computes 3-point angle correctly (straight line = 180 deg)', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };
    const angle = computeAngle3Points(a, b, c);
    assert.equal(Math.round(angle), 180);
  });

  it('computes 3-point angle correctly (right angle = 90 deg)', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    const angle = computeAngle3Points(a, b, c);
    assert.equal(Math.round(angle), 90);
  });

  it('computes relative arm angle for left and right arms symmetrically', () => {
    // Shoulders: right shoulder at (0.4, 0.4), left shoulder at (0.6, 0.4)
    const rShoulder: LandmarkPoint = { x: 0.4, y: 0.4 };
    const lShoulder: LandmarkPoint = { x: 0.6, y: 0.4 };

    // Left arm hanging down: elbow at (0.6, 0.6)
    const lElbowDown: LandmarkPoint = { x: 0.6, y: 0.6 };
    const lAngleDown = computeRelativeArmAngle(lShoulder, rShoulder, lElbowDown, 'left');
    assert.equal(Math.round(lAngleDown), 90);

    // Right arm hanging down: elbow at (0.4, 0.6)
    const rElbowDown: LandmarkPoint = { x: 0.4, y: 0.6 };
    const rAngleDown = computeRelativeArmAngle(rShoulder, lShoulder, rElbowDown, 'right');
    assert.equal(Math.round(rAngleDown), 90);

    // Left arm raised up: elbow at (0.6, 0.2)
    const lElbowUp: LandmarkPoint = { x: 0.6, y: 0.2 };
    const lAngleUp = computeRelativeArmAngle(lShoulder, rShoulder, lElbowUp, 'left');
    assert.equal(Math.round(lAngleUp), -90);

    // Right arm raised up: elbow at (0.4, 0.2)
    const rElbowUp: LandmarkPoint = { x: 0.4, y: 0.2 };
    const rAngleUp = computeRelativeArmAngle(rShoulder, lShoulder, rElbowUp, 'right');
    assert.equal(Math.round(rAngleUp), -90);
  });

  it('computes shoulder tilt (level shoulders = 0 deg)', () => {
    const lShoulder: LandmarkPoint = { x: 0.7, y: 0.5 };
    const rShoulder: LandmarkPoint = { x: 0.3, y: 0.5 };
    const tilt = computeShoulderTilt(lShoulder, rShoulder);
    assert.equal(Math.round(tilt), 0);
  });

  it('computes head tilt (centered head = 0 deg)', () => {
    const nose: LandmarkPoint = { x: 0.5, y: 0.3 };
    const lShoulder: LandmarkPoint = { x: 0.7, y: 0.5 };
    const rShoulder: LandmarkPoint = { x: 0.3, y: 0.5 };
    const tilt = computeHeadTilt(nose, lShoulder, rShoulder);
    assert.equal(Math.round(tilt), 0);
  });

  it('filters out landmarks with low visibility (< 0.5)', () => {
    assert.equal(isLandmarkVisible({ x: 0, y: 0, visibility: 0.2 }), false);
    assert.equal(isLandmarkVisible({ x: 0, y: 0, visibility: 0.8 }), true);
    assert.equal(isLandmarkVisible({ x: 0, y: 0 }), true); // undefined treated as visible
  });

  it('returns null angles when landmarks are missing or invisible', () => {
    const dummyLandmarks: LandmarkPoint[] = Array.from({ length: 17 }, () => ({
      x: 0.5,
      y: 0.5,
      visibility: 0.1, // low visibility
    }));

    const angles = calculateUpperBodyAngles(dummyLandmarks, 0.5);
    assert.equal(angles.leftElbow, null);
    assert.equal(angles.rightElbow, null);
    assert.equal(angles.leftShoulder, null);
    assert.equal(angles.rightShoulder, null);
    assert.equal(angles.shoulderTilt, null);
    assert.equal(angles.headTilt, null);
  });
});
