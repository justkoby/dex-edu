import React from 'react';
import { Blur } from './Blur';
import { COLOR, TYPE } from './brand';
import { backOut, clamp, expoOut, prog } from './motion';
/** Single word that lands on a beat: tracked-out & oversized -> settles tight; horizontal smear while moving. */
export const BeatWord: React.FC<{ t: number; at: number; until: number; word: string; color?: string; align?: 'left' | 'right'; y?: number; maxSize?: number }> =
  ({ t, at, until, word, color = COLOR.white, align = 'left', y = 1270, maxSize = 168 }) => {
    if (t < at || t >= until) return null;
    const p = prog(t, at, at + 0.22);
    const size = Math.min(maxSize, 900 / (word.length * 0.66));
    const s = 1 + 0.22 * (1 - backOut(p));
    const track = 0.18 * (1 - expoOut(p)) - 0.03;
    const blur = clamp(1 - p) * 14;
    return (
      <div style={{ position: 'absolute', top: y, left: 84, right: 84, display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'flex-end' }}>
        <Blur x={blur}>
          <div style={{ fontFamily: TYPE.sans, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: `${track}em`, color, transform: `scale(${s})`, transformOrigin: align === 'left' ? 'left center' : 'right center', textShadow: '0 4px 30px rgba(5,8,25,0.45)' }}>{word}</div>
        </Blur>
      </div>
    );
  };
