import { Schema, MapSchema, ArraySchema, defineTypes } from '@colyseus/schema';

export class PlayerSchema extends Schema {
  declare sessionId: string;
  declare nickname: string;
  declare avatarId: string;
  declare avatarColor: string;
  declare isHost: boolean;
  declare isConnected: boolean;
  declare isCameraDenied: boolean;
  declare totalScore: number;
  declare currentTurnScore: number;
  declare currentRoundScore: number;
  declare joinedAt: number;

  constructor(
    sessionId: string = '',
    nickname: string = '',
    isHost: boolean = false,
    avatarId: string = 'cat',
    avatarColor: string = '#FFD93B'
  ) {
    super();
    this.sessionId = sessionId;
    this.nickname = nickname;
    this.avatarId = avatarId;
    this.avatarColor = avatarColor;
    this.isHost = isHost;
    this.isConnected = true;
    this.isCameraDenied = false;
    this.totalScore = 0;
    this.currentTurnScore = 0;
    this.currentRoundScore = 0;
    this.joinedAt = Date.now();
  }
}

defineTypes(PlayerSchema, {
  sessionId: 'string',
  nickname: 'string',
  avatarId: 'string',
  avatarColor: 'string',
  isHost: 'boolean',
  isConnected: 'boolean',
  isCameraDenied: 'boolean',
  totalScore: 'number',
  currentTurnScore: 'number',
  currentRoundScore: 'number',
  joinedAt: 'number',
});

export class PoseRoomState extends Schema {
  declare roomCode: string;
  declare phase: string;
  declare currentRound: number;
  declare totalRounds: number;

  declare currentTargetPoseId: string;
  declare currentTargetPoseName: string;
  declare currentTargetPoseImage: string;
  declare currentTargetPoseEmoji: string;

  declare activePlayerSessionId: string;
  declare phaseTimeRemainingSec: number;
  declare liveScore: number;

  declare players: MapSchema<PlayerSchema>;
  declare turnOrder: ArraySchema<string>;
  declare activeTurnIndex: number;

  declare devAllowSinglePlayer: boolean;

  constructor() {
    super();
    this.roomCode = '';
    this.phase = 'LOBBY';
    this.currentRound = 0;
    this.totalRounds = 5;
    this.currentTargetPoseId = '';
    this.currentTargetPoseName = '';
    this.currentTargetPoseImage = '';
    this.currentTargetPoseEmoji = '';
    this.activePlayerSessionId = '';
    this.phaseTimeRemainingSec = 0;
    this.liveScore = 0;
    this.players = new MapSchema<PlayerSchema>();
    this.turnOrder = new ArraySchema<string>();
    this.activeTurnIndex = 0;
    this.devAllowSinglePlayer = false;
  }
}

defineTypes(PoseRoomState, {
  roomCode: 'string',
  phase: 'string',
  currentRound: 'number',
  totalRounds: 'number',

  currentTargetPoseId: 'string',
  currentTargetPoseName: 'string',
  currentTargetPoseImage: 'string',
  currentTargetPoseEmoji: 'string',

  activePlayerSessionId: 'string',
  phaseTimeRemainingSec: 'number',
  liveScore: 'number',

  players: { map: PlayerSchema },
  turnOrder: ['string'],
  activeTurnIndex: 'number',

  devAllowSinglePlayer: 'boolean',
});
