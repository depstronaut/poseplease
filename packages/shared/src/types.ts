export type GamePhase =
  | 'LOBBY'
  | 'ROUND_INTRO'
  | 'TURN_COUNTDOWN'
  | 'TURN_ACTIVE'
  | 'TURN_RESULT'
  | 'ROUND_RESULT'
  | 'FINAL_RESULT';

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Compact representation sent over WebSocket (rounded to 2 decimals)
 */
export interface CompressedLandmark {
  i: number; // landmark index (0, 11-16)
  x: number; // 2 decimal precision
  y: number; // 2 decimal precision
  v?: number; // visibility (optional, 2 decimal precision)
}

export interface PoseAngles {
  leftElbow: number | null;
  rightElbow: number | null;
  leftShoulder: number | null;
  rightShoulder: number | null;
  shoulderTilt: number | null;
  headTilt: number | null;
  mouthOpen?: number | null;
  handCloseness?: number | null;
  handToFace?: number | null;
  handToChest?: number | null;
}

export type AngleKey = keyof PoseAngles;

export interface TargetPose {
  id: string;
  nama: string;
  deskripsi: string;
  emoji: string;
  gambar: string;
  angles: Record<string, number>;
}

export interface AngleEvaluation {
  playerAngle: number | null;
  targetAngle: number;
  diff: number | null;
  score: number;
  weight: number;
  isVisible: boolean;
}

export interface ScoreResult {
  totalScore: number;
  breakdown: Record<AngleKey, AngleEvaluation>;
  visibleCount: number;
}

export interface PlayerPublicInfo {
  sessionId: string;
  nickname: string;
  isHost: boolean;
  isConnected: boolean;
  isCameraDenied: boolean;
  totalScore: number;
  currentTurnScore: number;
  currentRoundScore: number;
  joinedAt: number;
}

export interface RoundRankingEntry {
  sessionId: string;
  nickname: string;
  roundScore: number;
  bonus: number;
  totalScore: number;
}

export interface LiveSkeletonBroadcast {
  sessionId: string;
  landmarks: CompressedLandmark[];
  liveScore: number;
}

export type AvatarId =
  | 'cat'
  | 'frog'
  | 'duck'
  | 'camera'
  | 'bear'
  | 'ghost'
  | 'robot'
  | 'dog';

export interface AvatarPreset {
  id: AvatarId;
  name: string;
  emoji: string;
  defaultBg: string;
}

