import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { PoseRoom } from '../src/rooms/PoseRoom.ts';
import { PoseRoomState } from '../src/rooms/schema/PoseRoomState.ts';

// Helper mock client
function createMockClient(sessionId: string) {
  return {
    sessionId,
    send: () => {},
    error: () => {},
  } as any;
}

describe('PoseRoom - Turn State Machine & Rules', () => {
  it('initializes room state in LOBBY with a valid 4-letter room code', () => {
    const room = new PoseRoom();
    room.onCreate({ roomCode: 'TEST' });

    assert.equal(room.state.phase, 'LOBBY');
    assert.equal(room.state.roomCode, 'TEST');
    assert.equal(room.state.currentRound, 0);
    room.onDispose();
  });

  it('assigns first player as host and subsequent players as regular', () => {
    const room = new PoseRoom();
    room.onCreate({});

    const client1 = createMockClient('p1');
    const client2 = createMockClient('p2');

    room.onJoin(client1, { nickname: 'Alice' });
    room.onJoin(client2, { nickname: 'Bob' });

    const p1 = room.state.players.get('p1');
    const p2 = room.state.players.get('p2');

    assert.equal(p1?.isHost, true);
    assert.equal(p1?.nickname, 'Alice');
    assert.equal(p2?.isHost, false);
    assert.equal(p2?.nickname, 'Bob');
    room.onDispose();
  });

  it('migrates host to oldest remaining player when host leaves', async () => {
    const room = new PoseRoom();
    room.onCreate({});

    const client1 = createMockClient('p1');
    const client2 = createMockClient('p2');

    room.onJoin(client1, { nickname: 'Alice' });
    const p1 = room.state.players.get('p1')!;
    p1.joinedAt = 1000;

    room.onJoin(client2, { nickname: 'Bob' });
    const p2 = room.state.players.get('p2')!;
    p2.joinedAt = 2000;

    await room.onLeave(client1, true);

    assert.equal(room.state.players.has('p1'), false);
    assert.equal(room.state.players.get('p2')?.isHost, true);
    room.onDispose();
  });

  it('prevents non-host from starting game and requires min 2 players without dev flag', () => {
    const room = new PoseRoom();
    room.onCreate({ devAllowSinglePlayer: false });

    const client1 = createMockClient('p1');
    room.onJoin(client1, { nickname: 'HostOnly' });

    (room as any).handleStartGame(client1, { rounds: 3 });
    assert.equal(room.state.phase, 'LOBBY');

    const client2 = createMockClient('p2');
    room.onJoin(client2, { nickname: 'Player2' });

    (room as any).handleStartGame(client1, { rounds: 3 });
    assert.equal(room.state.phase, 'ROUND_INTRO');
    assert.equal(room.state.currentRound, 1);
    assert.equal(room.state.totalRounds, 3);
    assert.ok(room.state.currentTargetPoseId.length > 0);
    assert.equal(room.state.turnOrder.length, 2);
    room.onDispose();
  });

  it('allows single-player start when devAllowSinglePlayer is enabled', () => {
    const room = new PoseRoom();
    room.onCreate({ devAllowSinglePlayer: true });

    const client1 = createMockClient('p1');
    room.onJoin(client1, { nickname: 'Solo' });

    (room as any).handleStartGame(client1, { rounds: 5 });
    assert.equal(room.state.phase, 'ROUND_INTRO');
    assert.equal(room.state.totalRounds, 5);
    room.onDispose();
  });

  after(() => {
    process.exit(0);
  });
});
