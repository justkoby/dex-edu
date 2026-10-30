import { useCurrentFrame, useVideoConfig } from 'remotion';
// Easing vocabulary: expo for decisive arrivals, quint for camera-like moves, back only for small "settle" moments.
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const expoIn = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const expoInOut = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
export const quintOut = (t: number) => 1 - Math.pow(1 - t, 5);
export const quintInOut = (t: number) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2);
export const backOut = (t: number, s = 1.25) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** derivative-based motion blur amount for an eased move: px of blur per px/frame of travel */
export const velBlur = (ease: (t: number) => number, t: number, distancePx: number, durFrames: number, k = 0.55) => {
  if (t <= 0 || t >= 1) return 0;                         // no blur before/after the move
  const d = 0.5 / Math.max(1, durFrames * 4);
  const v = Math.abs(ease(clamp(t + d)) - ease(clamp(t - d))) / (2 * d) * distancePx / durFrames; // px per frame
  return Math.min(40, v * k);
};
export const useTime = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { t: f / fps, fps, frame: f }; };
