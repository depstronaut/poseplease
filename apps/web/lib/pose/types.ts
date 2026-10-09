export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface UpperBodyLandmarks {
  nose: LandmarkPoint;
  leftShoulder: LandmarkPoint;
  rightShoulder: LandmarkPoint;
  leftElbow: LandmarkPoint;
  rightElbow: LandmarkPoint;
  leftWrist: LandmarkPoint;
  rightWrist: LandmarkPoint;
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
  breakdown: Record<string, AngleEvaluation>;
  visibleCount: number;
}

// Landmark indices from MediaPipe Pose (upper body + face + hands)
export const LANDMARK_INDEX = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
} as const;

export const DEFAULT_ANGLE_WEIGHTS: Partial<Record<AngleKey, number>> = {
  leftElbow: 1.0,
  rightElbow: 1.0,
  leftShoulder: 1.0,
  rightShoulder: 1.0,
  shoulderTilt: 1.0,
  headTilt: 1.0,
  mouthOpen: 1.0,
  handCloseness: 1.0,
  handToFace: 1.0,
  handToChest: 1.0,
};

export const MIN_LANDMARK_VISIBILITY = 0.4;
export const MAX_ANGLE_TOLERANCE_DEG = 65;
export const SUCCESS_SCORE_THRESHOLD = 70;
export const HOLD_SUCCESS_DURATION_MS = 1000;
