import React from 'react';
import { Blur } from './Blur';
import { expoIn, expoOut, prog, velBlur } from './motion';

export type Dir = 'up' | 'down' | 'left' | 'right';
/**
 * Masked reveal: content slides out from behind its own edge (no fades). Optional masked exit in the same direction.
 * `t` is the clock in seconds; `at`/`dur` the entrance; `outAt`/`outDur` the exit.
 */
export const Reveal: React.FC<{ t: number; at: number; dur?: number; dir?: Dir; outAt?: number; outDur?: number; fps?: number; blur?: boolean; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ t, at, dur = 0.55, dir = 'up', outAt, outDur = 0.35, fps = 30, blur = true, style, children }) => {
    const pin = prog(t, at, at + dur); const pout = outAt === undefined ? 0 : prog(t, outAt, outAt + outDur);
    if (pin <= 0) return null;
    const ein = expoOut(pin); const eout = expoIn(pout);
    const sign = dir === 'up' || dir === 'left' ? 1 : -1; const horiz = dir === 'left' || dir === 'right';
    const off = (1 - ein) * 105 * sign - eout * 105 * sign;                         // percent of own size
    const b = blur ? (pin < 1 ? velBlur(expoOut, pin, 120, dur * fps) : pout > 0 ? velBlur(expoIn, pout, 120, outDur * fps) : 0) : 0;
    return (
      <div style={{ overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em', ...style }}>
        <Blur x={horiz ? b : 0} y={horiz ? 0 : b}>
          <div style={{ transform: horiz ? `translateX(${off}%)` : `translateY(${off}%)` }}>{children}</div>
        </Blur>
      </div>
    );
  };

/** Words revealed one after another (staggered masked reveals), all on one baseline. */
export const WordReveal: React.FC<{ t: number; at: number; words: string[]; stagger?: number; dur?: number; outAt?: number; gap?: string; dir?: Dir; style?: React.CSSProperties; wordStyle?: (i: number) => React.CSSProperties }> =
  ({ t, at, words, stagger = 0.08, dur = 0.5, outAt, gap = '0.26em', dir = 'up', style, wordStyle }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: gap, ...style }}>
      {words.map((w, i) => (
        <Reveal key={i} t={t} at={at + i * stagger} dur={dur} dir={dir} outAt={outAt === undefined ? undefined : outAt + i * 0.03}>
          <span style={wordStyle?.(i)}>{w}</span>
        </Reveal>
      ))}
    </div>
  );
