import React from 'react';
import { COLOR, TYPE } from './brand';
import { backOut, clamp, expoIn, expoOut, prog } from './motion';
import { Line } from './Campaign';

/**
 * Animated destination graphic: outlined pin drops onto `x,y` (its tip), a ground ripple marks the landing, a short connector
 * draws out, then the title and an orange sub-label reveal through masks. Exit retracts in reverse order.
 */
export const LocationPin: React.FC<{ t: number; at: number; outAt: number; x: number; y: number; title: string; sub?: string; connector?: number; titleSize?: number }> =
  ({ t, at, outAt, x, y, title, sub, connector = 84, titleSize = 58 }) => {
    if (t < at || t > outAt + 0.5) return null;
    const drop = prog(t, at, at + 0.42); const land = at + 0.36;
    const out = expoIn(prog(t, outAt + 0.12, outAt + 0.4));
    const py = -110 * (1 - backOut(drop, 1.7)); const ps = (0.6 + 0.4 * expoOut(drop)) * (1 - out);
    const rip = prog(t, land, land + 0.6);
    const line = expoOut(prog(t, land + 0.05, land + 0.4)) * (1 - expoIn(prog(t, outAt, outAt + 0.2)));
    return (
      <>
        {/* ripple */}
        {rip > 0 && rip < 1 && <div style={{ position: 'absolute', left: x - 70 * rip, top: y - 16 * rip, width: 140 * rip, height: 32 * rip, borderRadius: '50%', border: `3px solid ${COLOR.white}`, opacity: 0.8 * (1 - rip) }} />}
        <div style={{ position: 'absolute', left: x - 9, top: y - 5, width: 18, height: 10, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', opacity: clamp(drop * 2) * (1 - out), filter: 'blur(2px)' }} />
        {/* pin */}
        <svg width={64} height={86} viewBox="0 0 64 86" style={{ position: 'absolute', left: x - 32, top: y - 84, transform: `translateY(${py}px) scale(${ps})`, transformOrigin: '50% 100%', overflow: 'visible', filter: 'drop-shadow(0 6px 14px rgba(4,7,22,0.45))' }}>
          <path d="M32 82 C32 82 6 50 6 31 A26 26 0 1 1 58 31 C58 50 32 82 32 82 Z" fill="rgba(11,16,48,0.35)" stroke={COLOR.white} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={32} cy={31} r={9.5} fill={COLOR.orange} />
        </svg>
        {/* connector + label */}
        <div style={{ position: 'absolute', left: x + 20, top: y - 2, width: connector, height: 3, background: COLOR.white, transform: `scaleX(${line})`, transformOrigin: 'left center', opacity: 0.9 }} />
        <div style={{ position: 'absolute', left: x + 20 + connector + 18, top: y - titleSize * 0.78 }}>
          <Line t={t} at={land + 0.22} dur={0.5} enter="rise" outAt={outAt} size={titleSize} weight={700} tracking={-0.025}>{title}</Line>
          {sub && <div style={{ marginTop: 10 }}><Line t={t} at={land + 0.36} dur={0.45} enter="rise" outAt={outAt + 0.04} size={28} weight={600} tracking={0.1} color={COLOR.orange}>{sub}</Line></div>}
        </div>
      </>
    );
  };

/** Heritage focus ring: a drawn circle with compass ticks that slowly turns, plus a leader line to a small label. */
export const FocusRing: React.FC<{ t: number; at: number; outAt: number; x: number; y: number; r: number; label?: string; labelAt?: number; side?: 'left' | 'right' }> =
  ({ t, at, outAt, x, y, r, label, labelAt, side = 'right' }) => {
    if (t < at || t > outAt + 0.35) return null;
    const draw = expoOut(prog(t, at, at + 0.7)); const out = expoIn(prog(t, outAt, outAt + 0.3));
    const rot = (t - at) * 9; const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
    const lead = expoOut(prog(t, labelAt ?? at + 0.6, (labelAt ?? at + 0.6) + 0.35)) * (1 - out);
    const lx = side === 'right' ? x + r * 0.72 : x - r * 0.72; const ly = y - r * 0.72; const len = 110;
    return (
      <>
        <svg width={r * 2 + 40} height={r * 2 + 40} viewBox={`${-r - 20} ${-r - 20} ${r * 2 + 40} ${r * 2 + 40}`} style={{ position: 'absolute', left: x - r - 20, top: y - r - 20, overflow: 'visible', opacity: 1 - out, transform: `scale(${1 + 0.06 * out})` }}>
          <circle r={r} fill="none" stroke={COLOR.white} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform="rotate(-90)" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
          <g transform={`rotate(${rot})`} opacity={clamp(draw * 1.5 - 0.4)}>
            {ticks.map((a) => <line key={a} x1={0} y1={-r - 8} x2={0} y2={-r - (a % 90 === 0 ? 22 : 14)} stroke={a % 90 === 0 ? COLOR.orange : COLOR.white} strokeWidth={a % 90 === 0 ? 4 : 2} transform={`rotate(${a})`} />)}
          </g>
          <circle r={6} fill={COLOR.orange} opacity={clamp(draw * 2 - 1)} />
        </svg>
        {label && (
          <>
            <div style={{ position: 'absolute', left: side === 'right' ? lx : lx - len * lead, top: ly, width: len * lead, height: 3, background: COLOR.white, transform: `rotate(${side === 'right' ? -0 : 0}deg)` }} />
            <div style={{ position: 'absolute', top: ly - 34, ...(side === 'right' ? { left: lx + len + 14 } : { right: 1080 - (lx - len - 14) }) }}>
              <Line t={t} at={(labelAt ?? at + 0.6) + 0.15} dur={0.45} enter="rise" outAt={outAt} size={50} weight={700} tracking={-0.02}>
                <span style={{ fontFamily: TYPE.display }}>{label}</span>
              </Line>
            </div>
          </>
        )}
      </>
    );
  };
