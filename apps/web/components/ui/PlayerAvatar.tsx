'use client';

import React from 'react';
import type { AvatarId } from '@poseplease/shared';
import { AVATAR_PRESETS } from '@poseplease/shared';

interface PlayerAvatarProps {
  avatarId?: string;
  avatarColor?: string;
  nickname?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

// Deterministically pick an avatar from nickname if not provided
function getFallbackAvatarId(nickname?: string): AvatarId {
  if (!nickname) return 'cat';
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = (hash << 5) - hash + nickname.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PRESETS.length;
  return AVATAR_PRESETS[index].id;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatarId,
  avatarColor,
  nickname,
  size = 'md',
  className = '',
  animate = false,
}) => {
  const resolvedId = (avatarId || getFallbackAvatarId(nickname)) as AvatarId;
  const preset = AVATAR_PRESETS.find((p) => p.id === resolvedId) || AVATAR_PRESETS[0];
  const bg = avatarColor || preset.defaultBg;

  // Check if bg is a tailwind class or hex
  const isClass = bg.startsWith('bg-');
  const style = isClass ? {} : { backgroundColor: bg };
  const bgClass = isClass ? bg : '';

  return (
    <div
      style={style}
      className={`relative ${SIZE_CLASSES[size]} ${bgClass} border-2 border-[#14110F] shadow-[2px_2px_0_#14110F] flex items-center justify-center shrink-0 overflow-hidden select-none ${
        animate ? 'hover:scale-105 hover:-rotate-1 transition-transform' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-0.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {resolvedId === 'cat' && (
          // 🐱 OYEN MELET (Cat with tongue out & whiskers)
          <g>
            {/* Left Ear */}
            <polygon
              points="20,44 26,16 48,34"
              fill="#F59E0B"
              stroke="#14110F"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <polygon points="26,40 30,22 44,34" fill="#FF70A6" />

            {/* Right Ear */}
            <polygon
              points="52,34 74,16 80,44"
              fill="#F59E0B"
              stroke="#14110F"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <polygon points="56,34 70,22 74,40" fill="#FF70A6" />

            {/* Head */}
            <ellipse
              cx="50"
              cy="56"
              rx="34"
              ry="28"
              fill="#F59E0B"
              stroke="#14110F"
              strokeWidth="3"
            />

            {/* White Muzzle */}
            <ellipse cx="50" cy="62" rx="16" ry="11" fill="#FFFDF6" />

            {/* Eyes */}
            <circle cx="37" cy="50" r="4.5" fill="#14110F" />
            <circle cx="35" cy="48" r="1.5" fill="#FFFDF6" />
            <circle cx="63" cy="50" r="4.5" fill="#14110F" />
            <circle cx="61" cy="48" r="1.5" fill="#FFFDF6" />

            {/* Nose */}
            <polygon points="50,58 47,54 53,54" fill="#FF70A6" />

            {/* Cute Mouth & Tongue */}
            <path
              d="M 45 61 Q 50 64 50 61 Q 50 64 55 61"
              stroke="#14110F"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 47 62 C 47 70 53 70 53 62 Z"
              fill="#FF70A6"
              stroke="#14110F"
              strokeWidth="1.8"
            />

            {/* Blushing Cheeks */}
            <circle cx="28" cy="58" r="4" fill="#FF70A6" opacity="0.8" />
            <circle cx="72" cy="58" r="4" fill="#FF70A6" opacity="0.8" />

            {/* Whiskers */}
            <line x1="16" y1="52" x2="6" y2="49" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="58" x2="6" y2="60" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
            <line x1="84" y1="52" x2="94" y2="49" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
            <line x1="84" y1="58" x2="94" y2="60" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {resolvedId === 'frog' && (
          // 🐸 KATAK CHILL (Wide eyes & giant grin)
          <g>
            {/* Big Round Eyes Top */}
            <circle cx="32" cy="30" r="15" fill="#7ED9A6" stroke="#14110F" strokeWidth="3" />
            <circle cx="68" cy="30" r="15" fill="#7ED9A6" stroke="#14110F" strokeWidth="3" />
            <circle cx="32" cy="30" r="6.5" fill="#14110F" />
            <circle cx="30" cy="27" r="2.2" fill="#FFFDF6" />
            <circle cx="68" cy="30" r="6.5" fill="#14110F" />
            <circle cx="66" cy="27" r="2.2" fill="#FFFDF6" />

            {/* Frog Head Body */}
            <ellipse cx="50" cy="60" rx="38" ry="26" fill="#7ED9A6" stroke="#14110F" strokeWidth="3" />

            {/* Nostrils */}
            <circle cx="47" cy="50" r="1.5" fill="#14110F" />
            <circle cx="53" cy="50" r="1.5" fill="#14110F" />

            {/* Giant Cheeky Grin */}
            <path
              d="M 22 58 Q 50 78 78 58"
              fill="none"
              stroke="#14110F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Pink Cheeks */}
            <circle cx="23" cy="62" r="4.5" fill="#FF70A6" opacity="0.9" />
            <circle cx="77" cy="62" r="4.5" fill="#FF70A6" opacity="0.9" />
          </g>
        )}

        {resolvedId === 'duck' && (
          // 🦆 BEBEK KEREN (Yellow duck with cool sunglasses)
          <g>
            {/* Hair Tuft */}
            <path
              d="M 50 18 Q 52 8 46 10 Q 50 14 55 10 Q 52 17 50 18"
              fill="#FFD93B"
              stroke="#14110F"
              strokeWidth="2.5"
            />

            {/* Head */}
            <circle cx="50" cy="52" r="32" fill="#FFD93B" stroke="#14110F" strokeWidth="3" />

            {/* Pixel / 8-Bit Thug Sunglasses */}
            <rect x="22" y="40" width="24" height="14" fill="#14110F" stroke="#14110F" strokeWidth="2" />
            <rect x="54" y="40" width="24" height="14" fill="#14110F" stroke="#14110F" strokeWidth="2" />
            <rect x="44" y="43" width="12" height="4" fill="#14110F" />
            {/* Sunglasses Glare White Slash */}
            <line x1="26" y1="43" x2="23" y2="51" stroke="#FFFDF6" strokeWidth="2.5" />
            <line x1="31" y1="43" x2="28" y2="51" stroke="#FFFDF6" strokeWidth="1.5" />
            <line x1="58" y1="43" x2="55" y2="51" stroke="#FFFDF6" strokeWidth="2.5" />
            <line x1="63" y1="43" x2="60" y2="51" stroke="#FFFDF6" strokeWidth="1.5" />

            {/* Orange Duck Bill */}
            <ellipse
              cx="50"
              cy="66"
              rx="18"
              ry="10"
              fill="#FF4A1C"
              stroke="#14110F"
              strokeWidth="2.8"
            />
            <circle cx="47" cy="63" r="1.5" fill="#14110F" />
            <circle cx="53" cy="63" r="1.5" fill="#14110F" />
          </g>
        )}

        {resolvedId === 'camera' && (
          // 📸 KAMERA CHIBI (Retro camera with cartoon eyes)
          <g>
            {/* Flash & Shutter Button */}
            <rect x="26" y="18" width="16" height="12" rx="2" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5" />
            <rect x="66" y="20" width="12" height="10" rx="2" fill="#FF4A1C" stroke="#14110F" strokeWidth="2.5" />

            {/* Camera Body */}
            <rect x="15" y="28" width="70" height="52" rx="8" fill="#FFFDF6" stroke="#14110F" strokeWidth="3" />
            <line x1="15" y1="40" x2="85" y2="40" stroke="#14110F" strokeWidth="2.5" />

            {/* Big Lens Ring */}
            <circle cx="50" cy="55" r="21" fill="#14110F" />
            <circle cx="50" cy="55" r="18" fill="#2B3FD6" stroke="#14110F" strokeWidth="2" />

            {/* Anime Eyes inside Lens */}
            <circle cx="44" cy="53" r="4.5" fill="#FFFDF6" />
            <circle cx="44" cy="53" r="2.5" fill="#14110F" />
            <circle cx="56" cy="53" r="4.5" fill="#FFFDF6" />
            <circle cx="56" cy="53" r="2.5" fill="#14110F" />

            {/* Little Smile */}
            <path d="M 47 64 Q 50 67 53 64" fill="none" stroke="#FFFDF6" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {resolvedId === 'bear' && (
          // 🐻 BERUANG GEMOY (Cute teddy bear with round ears)
          <g>
            {/* Round Ears */}
            <circle cx="26" cy="28" r="14" fill="#D4A373" stroke="#14110F" strokeWidth="3" />
            <circle cx="26" cy="28" r="8" fill="#BC6C25" />
            <circle cx="74" cy="28" r="14" fill="#D4A373" stroke="#14110F" strokeWidth="3" />
            <circle cx="74" cy="28" r="8" fill="#BC6C25" />

            {/* Bear Head */}
            <circle cx="50" cy="56" r="32" fill="#D4A373" stroke="#14110F" strokeWidth="3" />

            {/* Snout */}
            <ellipse cx="50" cy="62" rx="15" ry="11" fill="#FAEDCD" stroke="#14110F" strokeWidth="2" />
            <polygon points="50,56 46,51 54,51" fill="#14110F" />
            <path
              d="M 50 56 L 50 63 M 45 63 Q 50 68 55 63"
              fill="none"
              stroke="#14110F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Beaded Eyes */}
            <circle cx="37" cy="46" r="4" fill="#14110F" />
            <circle cx="35" cy="44" r="1.5" fill="#FFFDF6" />
            <circle cx="63" cy="46" r="4" fill="#14110F" />
            <circle cx="61" cy="44" r="1.5" fill="#FFFDF6" />

            {/* Rosy Cheeks */}
            <circle cx="27" cy="56" r="4.5" fill="#FF70A6" opacity="0.8" />
            <circle cx="73" cy="56" r="4.5" fill="#FF70A6" opacity="0.8" />
          </g>
        )}

        {resolvedId === 'ghost' && (
          // 👻 HANTU POSE (Playful ghost photobomber)
          <g>
            {/* Wavy Ghost Body */}
            <path
              d="M 26 56 C 26 26 74 26 74 56 C 74 72 68 76 62 72 C 57 68 53 72 50 70 C 47 72 43 68 38 72 C 32 76 26 72 26 56 Z"
              fill="#FFFDF6"
              stroke="#14110F"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Cute Little Ghost Arms */}
            <path
              d="M 27 52 Q 13 46 16 38 Q 23 44 26 49"
              fill="#FFFDF6"
              stroke="#14110F"
              strokeWidth="2.5"
            />
            {/* Right hand peace / wave */}
            <path
              d="M 73 52 Q 87 46 84 38 Q 77 44 74 49"
              fill="#FFFDF6"
              stroke="#14110F"
              strokeWidth="2.5"
            />

            {/* Big Sparkly Eyes */}
            <ellipse cx="40" cy="43" rx="5" ry="7" fill="#14110F" />
            <circle cx="38" cy="40" r="2.2" fill="#FFFDF6" />
            <ellipse cx="60" cy="43" rx="5" ry="7" fill="#14110F" />
            <circle cx="58" cy="40" r="2.2" fill="#FFFDF6" />

            {/* Surprised Cute Mouth */}
            <ellipse cx="50" cy="53" rx="3.5" ry="4.5" fill="#FF4A1C" />

            {/* Pink Cheeks */}
            <circle cx="33" cy="49" r="3.5" fill="#FF70A6" />
            <circle cx="67" cy="49" r="3.5" fill="#FF70A6" />
          </g>
        )}

        {resolvedId === 'robot' && (
          // 🤖 BOT POLAROID (Retro robot with LED face)
          <g>
            {/* Antenna with Blinking Bulb */}
            <line x1="50" y1="20" x2="50" y2="10" stroke="#14110F" strokeWidth="3" />
            <circle cx="50" cy="9" r="4.5" fill="#FF4A1C" stroke="#14110F" strokeWidth="2" />

            {/* Bolt Ears */}
            <rect x="12" y="42" width="8" height="16" rx="2" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5" />
            <rect x="80" y="42" width="8" height="16" rx="2" fill="#FFD93B" stroke="#14110F" strokeWidth="2.5" />

            {/* Boxy Robot Head */}
            <rect x="18" y="20" width="64" height="58" rx="10" fill="#93C5FD" stroke="#14110F" strokeWidth="3" />

            {/* Screen Visor */}
            <rect x="26" y="30" width="48" height="32" rx="6" fill="#14110F" stroke="#14110F" strokeWidth="2" />

            {/* Glowing Smiling Eyes */}
            <path
              d="M 33 44 Q 38 38 43 44"
              fill="none"
              stroke="#7ED9A6"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 57 44 Q 62 38 67 44"
              fill="none"
              stroke="#7ED9A6"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Pixel Mouth */}
            <path d="M 44 54 H 56" stroke="#7ED9A6" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )}

        {resolvedId === 'dog' && (
          // 🐶 ANABUL CERIA (Winking puppy)
          <g>
            {/* Floppy Left Ear */}
            <ellipse
              cx="24"
              cy="38"
              rx="9"
              ry="17"
              fill="#B45309"
              stroke="#14110F"
              strokeWidth="2.8"
              transform="rotate(-20 24 38)"
            />

            {/* Perky Right Ear */}
            <polygon
              points="66,32 80,12 86,36"
              fill="#B45309"
              stroke="#14110F"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {/* Dog Head */}
            <circle cx="50" cy="54" r="32" fill="#FDE68A" stroke="#14110F" strokeWidth="3" />

            {/* Brown Patch over Winking Eye */}
            <circle cx="38" cy="48" r="9" fill="#D97706" opacity="0.5" />

            {/* Winking Eye Left */}
            <path
              d="M 33 48 Q 38 42 43 48"
              fill="none"
              stroke="#14110F"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Wide Open Eye Right */}
            <circle cx="62" cy="48" r="4.5" fill="#14110F" />
            <circle cx="60" cy="46" r="1.8" fill="#FFFDF6" />

            {/* Button Nose */}
            <ellipse cx="50" cy="57" rx="5" ry="3.8" fill="#14110F" />

            {/* Happy Smile & Tongue */}
            <path
              d="M 44 62 Q 50 66 50 62 Q 50 66 56 62"
              fill="none"
              stroke="#14110F"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 48 63 C 48 71 54 71 54 63 Z"
              fill="#FF70A6"
              stroke="#14110F"
              strokeWidth="1.6"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
