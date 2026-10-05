import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import colyseus from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { PoseRoom } from '../apps/server/src/rooms/PoseRoom.ts';
import { PoseRoomState, generateRoomCode } from '@poseplease/shared';
import type { CompressedLandmark } from '@poseplease/shared';

const { Server } = colyseus;

describe('Multiplayer Real-Time Game Loop & State Sync Integration', () => {
  let httpServer: http.Server;
  let gameServer: any;
  const TEST_PORT = 2569;
  const SERVER_URL = `ws://localhost:${TEST_PORT}`;

  before(async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    httpServer = http.createServer(app);
    gameServer = new Server({
      transport: new WebSocketTransport({
        server: httpServer,
      }),
    });

    gameServer.define('pose_room', PoseRoom).filterBy(['roomCode']);
    await gameServer.listen(TEST_PORT);
  });

  after(async () => {
    await gameServer.gracefullyShutdown();
  });

  it('runs complete multiplayer turn cycle with live landmark broadcasting to spectators', async () => {
    const testRoomCode = generateRoomCode();

    const client1 = new Client(SERVER_URL);
    const client2 = new Client(SERVER_URL);

    // 1. Host joins
    const room1 = await client1.joinOrCreate<PoseRoomState>(
      'pose_room',
      { roomCode: testRoomCode, nickname: 'HostPlayer' },
      PoseRoomState
    );

    // 2. Guest joins
    const room2 = await client2.joinOrCreate<PoseRoomState>(
      'pose_room',
      { roomCode: testRoomCode, nickname: 'GuestPlayer' },
      PoseRoomState
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    assert.equal(room1.state.players.size, 2);
    assert.equal(room2.state.players.size, 2);

    // Track spectator received landmarks
    let receivedLandmarksCount = 0;
    let lastReceivedScore = -1;

    room1.onMessage('live_landmarks', (msg: { landmarks: CompressedLandmark[]; liveScore: number }) => {
      receivedLandmarksCount++;
      lastReceivedScore = msg.liveScore;
    });

    room2.onMessage('live_landmarks', (msg: { landmarks: CompressedLandmark[]; liveScore: number }) => {
      receivedLandmarksCount++;
      lastReceivedScore = msg.liveScore;
    });

    // 3. Host starts game
    room1.send('start_game', { rounds: 3 });

    // Wait for ROUND_INTRO
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (room1.state.phase === 'ROUND_INTRO') {
          clearInterval(interval);
          resolve(true);
        }
      }, 50);
    });

    assert.equal(room1.state.phase, 'ROUND_INTRO');
    assert.equal(room1.state.currentRound, 1);
    assert.ok(room1.state.currentTargetPoseId.length > 0);

    // Wait for TURN_COUNTDOWN (ROUND_INTRO is 3s)
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (room1.state.phase === 'TURN_COUNTDOWN') {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });

    assert.equal(room1.state.phase, 'TURN_COUNTDOWN');
    const activePlayerId = room1.state.activePlayerSessionId;
    assert.ok(activePlayerId === room1.sessionId || activePlayerId === room2.sessionId);

    // Wait for TURN_ACTIVE (TURN_COUNTDOWN is 3s)
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (room1.state.phase === 'TURN_ACTIVE') {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });

    assert.equal(room1.state.phase, 'TURN_ACTIVE');

    // Active player sends landmarks
    const activeRoom = room1.sessionId === activePlayerId ? room1 : room2;
    const spectatorRoom = activeRoom === room1 ? room2 : room1;

    const mockLandmarks: CompressedLandmark[] = [
      { i: 0, x: 0.5, y: 0.2 },
      { i: 11, x: 0.6, y: 0.4 },
      { i: 12, x: 0.4, y: 0.4 },
      { i: 13, x: 0.7, y: 0.6 },
      { i: 14, x: 0.3, y: 0.6 },
      { i: 15, x: 0.8, y: 0.8 },
      { i: 16, x: 0.2, y: 0.8 },
    ];

    // Stream several frames from active player
    for (let f = 0; f < 5; f++) {
      activeRoom.send('send_landmarks', { landmarks: mockLandmarks });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    // Verify spectator received live skeleton stream and liveScore
    assert.ok(receivedLandmarksCount > 0, 'Spectator should have received live landmarks stream');
    assert.ok(lastReceivedScore >= 0, 'Spectator should have received computed live score');

    // Verify server authoritative live score update in room state
    assert.ok(room1.state.liveScore >= 0);

    // Non-active player trying to send landmarks must be ignored
    const countBeforeSpam = receivedLandmarksCount;
    spectatorRoom.send('send_landmarks', { landmarks: mockLandmarks });
    await new Promise((resolve) => setTimeout(resolve, 80));
    // Spectator spamming landmarks should NOT trigger broadcast to active player
    assert.equal(receivedLandmarksCount, countBeforeSpam);

    // Clean up
    await room1.leave();
    await room2.leave();
  });
});
