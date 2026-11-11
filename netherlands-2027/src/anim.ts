/** Small, dependency-free animation helpers. All times are in SECONDS on the master timeline. */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const easeInOut = (x: number) => { const c = clamp01(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
export const backOut = (x: number, s = 1.9) => { const c = clamp01(x) - 1; return 1 + (s + 1) * c * c * c + s * c * c; };
/** 0 -> 1 with a springy overshoot; `d` is roughly the settle time. */
export const spring = (t: number, t0: number, d = 0.5, bounce = 1) => {
  const x = (t - t0) / d;
  if (x <= 0) return 0;
  return 1 - Math.exp(-6.5 * x) * Math.cos(11 * x * bounce);
};
/** progress 0..1 between t0 and t0+d */
export const prog = (t: number, t0: number, d: number) => clamp01((t - t0) / d);
export const ramp = (t: number, t0: number, d: number, ease: (x: number) => number = easeOut) => ease(prog(t, t0, d));
/** a pulse that rises at t0 and falls back by t0+d (0 -> 1 -> 0) */
export const pulse = (t: number, t0: number, d: number) => { const x = (t - t0) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); };
/** decaying shake, returns [-1..1] */
export const shake = (t: number, t0: number, d = 0.5, freq = 38) => { const x = t - t0; return x < 0 || x > d ? 0 : Math.sin(x * freq) * Math.pow(1 - x / d, 2); };
/** deterministic pseudo-random 0..1 */
export const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** smooth value noise -1..1 */
export const noise = (x: number) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(i), rnd(i + 1), u) * 2 - 1; };
