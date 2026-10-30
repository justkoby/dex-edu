import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp, expoOut, prog } from './motion';
/** Photographic flash on a cut (the "memories" motif): 1 frame near-white, ~6 frames decay. */
export const Flash: React.FC<{ t: number; at: number; strength?: number }> = ({ t, at, strength = 0.85 }) => {
  const p = (t - at) / 0.22; if (p < 0 || p > 1) return null;
  return <AbsoluteFill style={{ background: '#fff8ee', opacity: strength * Math.pow(1 - p, 2.2), mixBlendMode: 'screen' }} />;
};
/** Anamorphic warm light sweep centred on `at` (used once: heritage -> relaxation). */
export const LightSweep: React.FC<{ t: number; at: number; dur?: number }> = ({ t, at, dur = 0.9 }) => {
  const p = prog(t, at - dur / 2, at + dur / 2); if (p <= 0 || p >= 1) return null;
  const x = -30 + 160 * expoOut(p); const a = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
      <AbsoluteFill style={{ opacity: 0.55 * a, background: `radial-gradient(70% 34% at ${x}% 24%, rgba(255,214,150,0.95), rgba(255,150,60,0.35) 45%, rgba(0,0,0,0) 75%)` }} />
      <AbsoluteFill style={{ opacity: 0.9 * a, background: `linear-gradient(180deg, rgba(0,0,0,0) 10%, rgba(255,226,180,0.55) 19%, rgba(255,246,230,0.85) 21%, rgba(255,226,180,0.55) 23%, rgba(0,0,0,0) 32%)`, transform: `translateX(${x - 50}%) scaleX(2)` }} />
    </AbsoluteFill>
  );
};
/** Subtle lens vignette for a filmic frame edge. */
export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.32 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(120% 85% at 50% 48%, rgba(0,0,0,0) 58%, rgba(4,6,20,${amount}) 100%)` }} />
);
/** Legibility scrim behind text, only where text sits. */
export const Scrim: React.FC<{ side: 'top' | 'bottom'; p: number; strength?: number; reach?: number }> = ({ side, p, strength = 0.5, reach = 42 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity: clamp(p), background: `linear-gradient(${side === 'top' ? '180deg' : '0deg'}, rgba(6,9,28,${strength}) 0%, rgba(6,9,28,0) ${reach}%)` }} />
);
