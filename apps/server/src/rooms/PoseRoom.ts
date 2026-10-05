import colyseus from 'colyseus';
import type { Client, Delayed } from 'colyseus';
const { Room } = colyseus;
import {
  PoseRoomState,
  PlayerSchema,
  generateRoomCode,
  isValidRoomCode,
  MAX_PLAYERS_PER_ROOM,
  DEFAULT_ROUND_COUNT,
  ROUND_INTRO_DURATION_SEC,
  TURN_COUNTDOWN_DURATION_SEC,
  TURN_ACTIVE_DURATION_SEC,
  TURN_RESULT_DURATION_SEC,
  ROUND_RESULT_DURATION_SEC,
  RECONNECT_TIMEOUT_SEC,
  SERVER_MAX_RATE_PER_SEC,
  POSES,
  calculateUpperBodyAngles,
  calculatePoseScore,
  RollingScoreTracker,
  calculateRoundBonuses,
  compressedToLandmarks,
} from '@poseplease/shared';
import type { CompressedLandmark, TargetPose } from '@poseplease/shared';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

export class PoseRoom extends Room<PoseRoomState> {
  maxClients = MAX_PLAYERS_PER_ROOM;
  autoDispose = false;

  private phaseTimer: Delayed | null = null;
  private tickInterval: Delayed | null = null;
  private disposeTimer: Delayed | null = null;
  private rollingTracker = new RollingScoreTracker();
  private gamePoses: TargetPose[] = [];
  private rateLimits = new Map<string, RateLimitTracker>();

  onCreate(options: { roomCode?: string; devAllowSinglePlayer?: boolean }) {
    this.setState(new PoseRoomState());

    const code = (options.roomCode || generateRoomCode()).toUpperCase();
    this.state.roomCode = code;
    this.state.devAllowSinglePlayer = !!options.devAllowSinglePlayer;

    this.setMetadata({ roomCode: code });

    // Register Message Handlers
    this.onMessage('start_game', (client, message?: { rounds?: number; devAllowSinglePlayer?: boolean }) => {
      this.handleStartGame(client, message);
    });

    this.onMessage('send_landmarks', (client, message: { landmarks: CompressedLandmark[] }) => {
      this.handleLandmarks(client, message);
    });

    this.onMessage('camera_denied', (client) => {
      this.handleCameraDenied(client);
    });

    this.onMessage('restart_game', (client) => {
      this.handleRestartGame(client);
    });

    // 1-second interval to decrement remaining countdown timer for UI
    this.tickInterval = this.clock.setInterval(() => {
      if (this.state.phaseTimeRemainingSec > 0) {
        this.state.phaseTimeRemainingSec--;
      }
    }, 1000);
  }

  onJoin(
    client: Client,
    options: { nickname?: string; devAllowSinglePlayer?: boolean; avatarId?: string; avatarColor?: string }
  ) {
    if (this.disposeTimer) {
      this.disposeTimer.clear();
      this.disposeTimer = null;
    }

    const isFirst = this.state.players.size === 0;
    const nickname = (options.nickname || `Pemain ${this.state.players.size + 1}`).slice(0, 16).trim();
    const avatarId = options.avatarId || 'cat';
    const avatarColor = options.avatarColor || '#FFD93B';

    if (options.devAllowSinglePlayer) {
      this.state.devAllowSinglePlayer = true;
    }

    const player = new PlayerSchema(client.sessionId, nickname, isFirst, avatarId, avatarColor);
    this.state.players.set(client.sessionId, player);

    this.rateLimits.set(client.sessionId, { count: 0, resetAt: Date.now() + 1000 });
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    this.rateLimits.delete(client.sessionId);

    // If active player leaves during their turn, finish their turn with 0 score
    if (
      this.state.activePlayerSessionId === client.sessionId &&
      (this.state.phase === 'TURN_ACTIVE' || this.state.phase === 'TURN_COUNTDOWN')
    ) {
      this.finishActiveTurn(0);
    }

    if (consented) {
      this.state.players.delete(client.sessionId);
      if (player.isHost) {
        this.migrateHost();
      }
      this.checkEmptyRoomDisposal();
      return;
    }

    player.isConnected = false;

    try {
      await this.allowReconnection(client, RECONNECT_TIMEOUT_SEC);
      player.isConnected = true;
    } catch {
      this.state.players.delete(client.sessionId);
      if (player.isHost) {
        this.migrateHost();
      }
      this.checkEmptyRoomDisposal();
    }
  }

  private checkEmptyRoomDisposal() {
    let connectedCount = 0;
    this.state.players.forEach((p) => {
      if (p.isConnected) connectedCount++;
    });

    if (connectedCount === 0 && !this.disposeTimer) {
      this.disposeTimer = this.clock.setTimeout(() => {
        let stillConnected = 0;
        this.state.players.forEach((p) => {
          if (p.isConnected) stillConnected++;
        });
        if (stillConnected === 0) {
          this.disconnect();
        }
      }, RECONNECT_TIMEOUT_SEC * 1000);
    }
  }

  onDispose() {
    if (this.phaseTimer) this.phaseTimer.clear();
    if (this.tickInterval) this.tickInterval.clear();
    if (this.disposeTimer) this.disposeTimer.clear();
    this.clock.stop();
    this.clock.clear();
  }

  private migrateHost() {
    let oldest: PlayerSchema | null = null;
    this.state.players.forEach((p) => {
      if (p.isConnected && (!oldest || p.joinedAt < oldest.joinedAt)) {
        oldest = p;
      }
    });

    if (oldest) {
      (oldest as PlayerSchema).isHost = true;
    }
  }

  private handleStartGame(client: Client, message?: { rounds?: number; devAllowSinglePlayer?: boolean }) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isHost) return;
    if (this.state.phase !== 'LOBBY') return;

    const minRequired = this.state.devAllowSinglePlayer || message?.devAllowSinglePlayer ? 1 : 2;
    if (this.state.players.size < minRequired) return;

    const totalRounds = message?.rounds && [3, 5, 8].includes(message.rounds) ? message.rounds : DEFAULT_ROUND_COUNT;
    this.state.totalRounds = totalRounds;
    this.state.currentRound = 1;

    // Pick unique target meme poses with unbiased Fisher-Yates shuffle
    const shuffled = [...POSES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.gamePoses = [];
    while (this.gamePoses.length < totalRounds) {
      for (const p of shuffled) {
        if (this.gamePoses.length < totalRounds) {
          this.gamePoses.push(p);
        }
      }
    }

    // Reset scores
    this.state.players.forEach((p) => {
      p.totalScore = 0;
      p.currentTurnScore = 0;
      p.currentRoundScore = 0;
    });

    this.startRoundIntro();
  }

  private startRoundIntro() {
    this.clearPhaseTimer();
    this.state.phase = 'ROUND_INTRO';
    this.state.phaseTimeRemainingSec = ROUND_INTRO_DURATION_SEC;

    // Select target pose for current round
    const poseIndex = (this.state.currentRound - 1) % this.gamePoses.length;
    const targetPose = this.gamePoses[poseIndex] || POSES[0];

    this.state.currentTargetPoseId = targetPose.id;
    this.state.currentTargetPoseName = targetPose.nama;
    this.state.currentTargetPoseImage = targetPose.gambar;
    this.state.currentTargetPoseEmoji = targetPose.emoji;

    // Reset turn order and randomize for this round
    this.state.turnOrder.clear();
    const candidateSessionIds: string[] = [];
    this.state.players.forEach((p, sId) => {
      if (p.isConnected) candidateSessionIds.push(sId);
      p.currentRoundScore = 0;
      p.currentTurnScore = 0;
    });

    candidateSessionIds.sort(() => Math.random() - 0.5);
    for (const id of candidateSessionIds) {
      this.state.turnOrder.push(id);
    }

    this.state.activeTurnIndex = 0;

    this.phaseTimer = this.clock.setTimeout(() => {
      this.startTurnCountdown();
    }, ROUND_INTRO_DURATION_SEC * 1000);
  }

  private startTurnCountdown() {
    this.clearPhaseTimer();

    // Check if all players finished their turn in this round
    if (this.state.activeTurnIndex >= this.state.turnOrder.length) {
      this.startRoundResult();
      return;
    }

    const activeSessionId = this.state.turnOrder[this.state.activeTurnIndex];
    const player = this.state.players.get(activeSessionId);

    // If player missing, disconnected, or camera denied, skip turn with 0 score
    if (!player || !player.isConnected || player.isCameraDenied) {
      if (player) {
        player.currentTurnScore = 0;
        player.currentRoundScore = 0;
      }
      this.state.activeTurnIndex++;
      this.clock.setTimeout(() => this.startTurnCountdown(), 500);
      return;
    }

    this.state.activePlayerSessionId = activeSessionId;
    this.state.phase = 'TURN_COUNTDOWN';
    this.state.phaseTimeRemainingSec = TURN_COUNTDOWN_DURATION_SEC;
    this.state.liveScore = 0;
    this.rollingTracker.reset();

    this.phaseTimer = this.clock.setTimeout(() => {
      this.startTurnActive();
    }, TURN_COUNTDOWN_DURATION_SEC * 1000);
  }

  private startTurnActive() {
    this.clearPhaseTimer();
    this.state.phase = 'TURN_ACTIVE';
    this.state.phaseTimeRemainingSec = TURN_ACTIVE_DURATION_SEC;
    this.rollingTracker.reset();

    this.phaseTimer = this.clock.setTimeout(() => {
      const bestScore = this.rollingTracker.getBestAverage();
      this.finishActiveTurn(bestScore);
    }, TURN_ACTIVE_DURATION_SEC * 1000);
  }

  private finishActiveTurn(finalScore: number) {
    this.clearPhaseTimer();
    this.state.phase = 'TURN_RESULT';
    this.state.phaseTimeRemainingSec = TURN_RESULT_DURATION_SEC;
    this.state.liveScore = finalScore;

    const player = this.state.players.get(this.state.activePlayerSessionId);
    if (player) {
      player.currentTurnScore = finalScore;
      player.currentRoundScore = finalScore;
    }

    this.phaseTimer = this.clock.setTimeout(() => {
      this.state.activeTurnIndex++;
      this.startTurnCountdown();
    }, TURN_RESULT_DURATION_SEC * 1000);
  }

  private startRoundResult() {
    this.clearPhaseTimer();
    this.state.phase = 'ROUND_RESULT';
    this.state.phaseTimeRemainingSec = ROUND_RESULT_DURATION_SEC;

    // Calculate bonuses for top 3 in this round
    const roundScores: { sessionId: string; score: number }[] = [];
    this.state.players.forEach((p, sId) => {
      roundScores.push({ sessionId: sId, score: p.currentRoundScore });
    });

    const bonuses = calculateRoundBonuses(roundScores);

    // Apply bonuses and accumulate to totalScore
    this.state.players.forEach((p, sId) => {
      const bonus = bonuses[sId] || 0;
      p.totalScore += p.currentRoundScore + bonus;
    });

    this.phaseTimer = this.clock.setTimeout(() => {
      if (this.state.currentRound < this.state.totalRounds) {
        this.state.currentRound++;
        this.startRoundIntro();
      } else {
        this.startFinalResult();
      }
    }, ROUND_RESULT_DURATION_SEC * 1000);
  }

  private startFinalResult() {
    this.clearPhaseTimer();
    this.state.phase = 'FINAL_RESULT';
    this.state.phaseTimeRemainingSec = 0;
    this.state.activePlayerSessionId = '';
  }

  private handleRestartGame(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isHost) return;
    if (this.state.phase !== 'FINAL_RESULT') return;

    this.clearPhaseTimer();
    this.state.phase = 'LOBBY';
    this.state.currentRound = 0;
    this.state.activePlayerSessionId = '';
    this.state.liveScore = 0;
    this.state.turnOrder.clear();

    this.state.players.forEach((p) => {
      p.totalScore = 0;
      p.currentTurnScore = 0;
      p.currentRoundScore = 0;
    });
  }

  private handleLandmarks(client: Client, message: { landmarks: CompressedLandmark[] }) {
    if (this.state.phase !== 'TURN_ACTIVE') return;
    if (client.sessionId !== this.state.activePlayerSessionId) return;

    // Rate Limiting (max 25 msgs/sec)
    const now = Date.now();
    let rl = this.rateLimits.get(client.sessionId);
    if (!rl || now > rl.resetAt) {
      rl = { count: 0, resetAt: now + 1000 };
      this.rateLimits.set(client.sessionId, rl);
    }
    rl.count++;
    if (rl.count > SERVER_MAX_RATE_PER_SEC) {
      return; // Rate limit exceeded, ignore frame
    }

    // Input Validation
    if (!message || !Array.isArray(message.landmarks)) return;

    // Validate coordinates within plausible bounds [-0.5, 1.5]
    for (const lm of message.landmarks) {
      if (typeof lm.x !== 'number' || typeof lm.y !== 'number') return;
      if (lm.x < -0.5 || lm.x > 1.5 || lm.y < -0.5 || lm.y > 1.5) return;
    }

    // Reconstruct full landmarks and compute angles with @poseplease/shared
    const landmarks = compressedToLandmarks(message.landmarks);
    const angles = calculateUpperBodyAngles(landmarks);

    // Get current target pose angles
    const currentPose = POSES.find((p) => p.id === this.state.currentTargetPoseId) || POSES[0];
    const scoreResult = calculatePoseScore(angles, currentPose.angles);

    // Compute rolling average over 1-second window
    const { currentAverage, bestAverage } = this.rollingTracker.addSample(now, scoreResult.totalScore);
    this.state.liveScore = currentAverage;

    // Broadcast live skeleton and score to spectators
    this.broadcast(
      'live_landmarks',
      {
        sessionId: client.sessionId,
        landmarks: message.landmarks,
        liveScore: currentAverage,
      },
      { except: client }
    );
  }

  private handleCameraDenied(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.isCameraDenied = true;

    // If currently active player, skip immediately
    if (this.state.activePlayerSessionId === client.sessionId && this.state.phase === 'TURN_ACTIVE') {
      this.finishActiveTurn(0);
    }
  }

  private clearPhaseTimer() {
    if (this.phaseTimer) {
      this.phaseTimer.clear();
      this.phaseTimer = null;
    }
  }
}
