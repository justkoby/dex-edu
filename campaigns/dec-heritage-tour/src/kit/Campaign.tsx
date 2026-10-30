import React from 'react';
import { Blur } from './Blur';
import { COLOR, TYPE } from './brand';
import { clamp, expoIn, expoOut, prog, quintOut, velBlur } from './motion';

/**
 * Campaign typography (Bricolage Grotesque). `*word*` marks a highlighted word (orange); weights map to the hierarchy:
 * 800 campaign headline · 700 scene headline · 600 captions/supporting · 500 labels.
 */
export const rich = (text: string, hl: string = COLOR.orange) =>
  text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('*') ? <span key={i} style={{ color: hl }}>{part.slice(1, -1)}</span> : <React.Fragment key={i}>{part}</React.Fragment>);

export type Enter = 'rise' | 'drop' | 'fromLeft' | 'fromRight' | 'track';
/**
 * One headline line with a purposeful entrance. Each mode is a masked move (the line slides out from behind its own edge);
 * 'track' additionally closes the letter-spacing as it lands. Optional masked exit.
 */
export const Line: React.FC<{ t: number; at: number; dur?: number; enter?: Enter; outAt?: number; outDur?: number; size: number; weight?: 500 | 600 | 700 | 800; color?: string; tracking?: number; align?: 'left' | 'right' | 'center'; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ t, at, dur = 0.5, enter = 'rise', outAt, outDur = 0.3, size, weight = 800, color = COLOR.white, tracking = -0.035, align = 'left', style, children }) => {
    const pin = prog(t, at, at + dur); if (pin <= 0) return null;
    const pout = outAt === undefined ? 0 : prog(t, outAt, outAt + outDur); if (pout >= 1) return null;
    const e = enter === 'track' ? quintOut(pin) : expoOut(pin); const x = expoIn(pout);
    const horiz = enter === 'fromLeft' || enter === 'fromRight';
    const dir = enter === 'drop' ? -1 : enter === 'fromLeft' ? -1 : 1;
    const off = (1 - e) * 108 * dir - x * 108 * (horiz ? dir : 1);
    const tr = enter === 'track' ? tracking + 0.16 * (1 - e) : tracking;
    const b = pin < 1 ? velBlur(expoOut, pin, size * 1.2, dur * 30, 0.5) : pout > 0 ? velBlur(expoIn, pout, size * 1.2, outDur * 30, 0.5) : 0;
    return (
      <div style={{ overflow: 'hidden', padding: `${size * 0.06}px 0.04em ${size * 0.1}px`, margin: `${-size * 0.06}px -0.04em ${-size * 0.1}px`, textAlign: align, ...style }}>
        <Blur x={horiz ? b : 0} y={horiz ? 0 : b}>
          <div style={{ transform: horiz ? `translateX(${off}%)` : `translateY(${off}%)`, fontFamily: TYPE.display, fontWeight: weight, fontSize: size, lineHeight: 0.98, letterSpacing: `${tr}em`, color, whiteSpace: 'nowrap', textShadow: '0 3px 22px rgba(4,7,22,0.38)', opacity: enter === 'track' ? clamp(pin * 3) : 1 }}>{children}</div>
        </Blur>
      </div>
    );
  };

/** Hand-drawn-feeling emphasis stroke under a word (draws left->right). */
export const Underline: React.FC<{ t: number; at: number; dur?: number; width: number; color?: string; thickness?: number; style?: React.CSSProperties }> =
  ({ t, at, dur = 0.45, width, color = COLOR.orange, thickness = 9, style }) => {
    const p = expoOut(prog(t, at, at + dur)); if (p <= 0) return null;
    return (
      <svg width={width} height={thickness * 2.4} viewBox={`0 0 ${width} ${thickness * 2.4}`} style={{ display: 'block', overflow: 'visible', ...style }}>
        <path d={`M ${thickness / 2} ${thickness * 1.5} Q ${width * 0.5} ${thickness * 0.4} ${width - thickness / 2} ${thickness * 1.1}`} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    );
  };
