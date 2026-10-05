import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoomCode,
  isValidRoomCode,
  calculatePoseScore,
  RollingScoreTracker,
  calculateRoundBonuses,
  POSES,
} from '../src/index.ts';

describe('@poseplease/shared tests', () => {
  it('generates valid 4-character room codes without ambiguous characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      assert.equal(code.length, 4);
      assert.equal(isValidRoomCode(code), true);
      assert.ok(!code.includes('I'));
      assert.ok(!code.includes('O'));
      assert.ok(!code.includes('0'));
    }
  });

  it('loads target poses properly with 11 memes', () => {
    assert.equal(POSES.length, 11);
    assert.ok(POSES[0].angles.leftElbow !== undefined);
    // Verify all 11 have meme images
    for (const pose of POSES) {
      assert.ok(pose.gambar.startsWith('/memes/'));
      assert.ok(pose.id.startsWith('meme-'));
      assert.ok(pose.nama.length > 0);
    }
  });

  it('accurately scores facial mimik and hand gestures (e.g. FlightReacts shocked mouth)', () => {
    const shockedPose = POSES.find((p) => p.id === 'meme-shocked');
    assert.ok(shockedPose);

    // Player perfectly matching the shocked expression and hands on head
    const matchingPlayer = {
      leftElbow: 45,
      rightElbow: 45,
      leftShoulder: -20,
      rightShoulder: -20,
      shoulderTilt: 0,
      headTilt: 0,
      mouthOpen: 85,
      handToFace: 95,
    };

    const res = calculatePoseScore(matchingPlayer, shockedPose.angles);
    assert.equal(res.totalScore, 100);
    assert.equal(res.visibleCount, 8);
  });

  it('accurately scores heart hands gesture closeness', () => {
    const heartPose = POSES.find((p) => p.id === 'meme-heart-hands');
    assert.ok(heartPose);

    const matchingPlayer = {
      leftElbow: 65,
      rightElbow: 65,
      leftShoulder: 45,
      rightShoulder: 45,
      shoulderTilt: 0,
      headTilt: 8,
      handCloseness: 95,
    };

    const res = calculatePoseScore(matchingPlayer, heartPose.angles);
    assert.equal(res.totalScore, 100);
  });

  it('RollingScoreTracker correctly computes moving window and ignores single instant spike', () => {
    const tracker = new RollingScoreTracker(1000); // 1-second window

    // Initial steady low score
    tracker.addSample(1000, 30);
    tracker.addSample(1200, 30);
    tracker.addSample(1400, 30);
    assert.equal(tracker.getBestAverage(), 30);

    // Instant spike to 100 on 1 frame
    tracker.addSample(1500, 100);
    // Average in window (30+30+30+100)/4 = 47.5 -> 48, not 100!
    assert.ok(tracker.getBestAverage() < 60);

    // Sustained high score for >1 second
    tracker.addSample(1700, 95);
    tracker.addSample(2000, 95);
    tracker.addSample(2200, 95);
    tracker.addSample(2500, 95);
    // Now window only contains 95s
    assert.ok(tracker.getBestAverage() >= 90);
  });

  it('calculates round bonuses correctly for top 3', () => {
    const scores = [
      { sessionId: 'p1', score: 92 },
      { sessionId: 'p2', score: 85 },
      { sessionId: 'p3', score: 78 },
      { sessionId: 'p4', score: 40 },
    ];
    const bonuses = calculateRoundBonuses(scores);
    assert.equal(bonuses['p1'], 15);
    assert.equal(bonuses['p2'], 10);
    assert.equal(bonuses['p3'], 5);
    assert.equal(bonuses['p4'], 0);
  });

  it('rejects passive standing still (diam saja) on gesture memes, giving < 25%', () => {
    const peacePose = POSES.find((p) => p.id === 'meme-peace-baby');
    assert.ok(peacePose);

    // Passive player standing/sitting still: arms down (elbow ~170, shoulder ~85), head upright (0), mouth closed (0), hands not at face (0)
    const passivePlayer = {
      leftElbow: 170,
      rightElbow: 170,
      leftShoulder: 85,
      rightShoulder: 85,
      shoulderTilt: 0,
      headTilt: 0,
      mouthOpen: 0,
      handToFace: 0,
    };

    const resPassive = calculatePoseScore(passivePlayer, peacePose.angles);
    assert.ok(resPassive.totalScore <= 25, `Expected score <= 25 for diam saja, got ${resPassive.totalScore}`);

    // Active matching player: hands at cheeks (handToFace 85), melet/open mouth (mouthOpen 50), elbows bent (50), head tilted (18)
    const activePlayer = {
      leftElbow: 50,
      rightElbow: 50,
      leftShoulder: 20,
      rightShoulder: 20,
      shoulderTilt: 0,
      headTilt: 18,
      handToFace: 85,
      mouthOpen: 50,
    };

    const resActive = calculatePoseScore(activePlayer, peacePose.angles);
    assert.ok(resActive.totalScore >= 85, `Expected score >= 85 for correct pose, got ${resActive.totalScore}`);
  });
});

