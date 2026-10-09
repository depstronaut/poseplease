// Room code safe charset (excludes I, O, 0, 1 to prevent ambiguity)
export const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 4;

// Game timings (in seconds)
export const ROUND_INTRO_DURATION_SEC = 3;
export const TURN_COUNTDOWN_DURATION_SEC = 3;
export const TURN_ACTIVE_DURATION_SEC = 5;
export const TURN_RESULT_DURATION_SEC = 2;
export const ROUND_RESULT_DURATION_SEC = 4;

// Reconnection grace period (in seconds)
export const RECONNECT_TIMEOUT_SEC = 15;

// Room constraints
export const MAX_PLAYERS_PER_ROOM = 8;
export const DEFAULT_ROUND_COUNT = 5;
export const ALLOWED_ROUND_COUNTS = [3, 5, 8] as const;

// Scoring & Rate Limiting
export const ROLLING_WINDOW_MS = 1000;
export const CLIENT_SEND_RATE_HZ = 15;
export const SERVER_MAX_RATE_PER_SEC = 25;

// Bonus points for top 3 in each round
export const ROUND_RANK_BONUSES = [15, 10, 5] as const;

// Landmark indices from MediaPipe Pose (upper body + face mimik + hands)
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

export const UPPER_BODY_INDICES = [0, 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20] as const;

export const MIN_LANDMARK_VISIBILITY = 0.4;
export const MAX_ANGLE_TOLERANCE_DEG = 65;
export const GRACE_ANGLE_TOLERANCE_DEG = 15;
export const SUCCESS_SCORE_THRESHOLD = 70;

import type { AvatarPreset } from './types.ts';

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'cat', name: 'Oyen Melet', emoji: '🐱', defaultBg: '#FFD93B' },
  { id: 'frog', name: 'Katak Chill', emoji: '🐸', defaultBg: '#7ED9A6' },
  { id: 'duck', name: 'Bebek Keren', emoji: '🦆', defaultBg: '#FFD93B' },
  { id: 'camera', name: 'Kamera Chibi', emoji: '📸', defaultBg: '#FFFDF6' },
  { id: 'bear', name: 'Beruang Gemoy', emoji: '🐻', defaultBg: '#E4D8BE' },
  { id: 'ghost', name: 'Hantu Pose', emoji: '👻', defaultBg: '#2B3FD6' },
  { id: 'robot', name: 'Bot Polaroid', emoji: '🤖', defaultBg: '#7ED9A6' },
  { id: 'dog', name: 'Anabul Ceria', emoji: '🐶', defaultBg: '#FF70A6' },
];

export const AVATAR_PALETTE_COLORS = [
  { name: 'Flash Yellow', hex: '#FFD93B', bgClass: 'bg-[#FFD93B]' },
  { name: 'Signal Orange', hex: '#FF4A1C', bgClass: 'bg-[#FF4A1C]' },
  { name: 'Cobalt Blue', hex: '#2B3FD6', bgClass: 'bg-[#2B3FD6]' },
  { name: 'Mint Green', hex: '#7ED9A6', bgClass: 'bg-[#7ED9A6]' },
  { name: 'Bubblegum Pink', hex: '#FF70A6', bgClass: 'bg-[#FF70A6]' },
  { name: 'Vintage Paper', hex: '#EFE6D2', bgClass: 'bg-[#EFE6D2]' },
];


