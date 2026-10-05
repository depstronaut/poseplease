import { ROOM_CODE_CHARSET, ROOM_CODE_LENGTH } from './constants.ts';

/**
 * Generates a 4-letter uppercase room code using ambiguous-free characters
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARSET.length);
    code += ROOM_CODE_CHARSET[randomIndex];
  }
  return code;
}

/**
 * Validates a room code format
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || code.length !== ROOM_CODE_LENGTH) return false;
  const upper = code.toUpperCase();
  for (const ch of upper) {
    if (!ROOM_CODE_CHARSET.includes(ch)) return false;
  }
  return true;
}
