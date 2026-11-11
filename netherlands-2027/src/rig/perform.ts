import { ARMS, ArmsName, Arm, BODY0, Body, FACES, Face, FaceName, mix } from "./poses";
import { backOut, clamp01, easeInOut, easeOut, noise } from "../anim";

/**
 * Performance tracks: a scene describes the acting as three small keyframe lists (face / arms / body).
 * Each key is the moment the character STARTS moving into that pose; `d` is how long the move takes.
 * Overshoot ("back") gives the snappy cartoon settle, "soft" gives calm moves.
 */
type Ease = "back" | "out" | "soft" | "snap";
export type FaceKey = { t: number; face: FaceName; d?: number; ease?: Ease; with?: Partial<Face> };
export type ArmsKey = { t: number; arms: ArmsName | [ArmsName, ArmsName]; d?: number; ease?: Ease; L?: Partial<Arm>; R?: Partial<Arm> };
export type BodyKey = { t: number; d?: number; ease?: Ease } & Partial<Body>;
export type Performance = { face: FaceKey[]; arms: ArmsKey[]; body: BodyKey[] };

const E: Record<Ease, (x: number) => number> = { back: (x) => backOut(x, 1.6), out: easeOut, soft: easeInOut, snap: (x) => backOut(x, 2.6) };

function track<K extends { t: number; d?: number; ease?: Ease }, V extends Record<string, number>>(
  keys: K[], t: number, resolve: (k: K, prev: V) => V, initial: V, defD: number, defEase: Ease,
): V {
  let v = initial;
  for (const k of keys) {
    if (t < k.t) break;
    const p = clamp01((t - k.t) / (k.d ?? defD));
    const target = resolve(k, v);
    v = p >= 1 ? target : mix(v, target, E[k.ease ?? defEase](p));
  }
  return v;
}

const armsOf = (a: ArmsKey["arms"]): [Arm, Arm] => (typeof a === "string" ? ARMS[a] : [ARMS[a[0]][0], ARMS[a[1]][1]]);

export type Resolved = { body: Body; face: Face; arms: [Arm, Arm]; talk: number; viseme: number; blink: number };

/**
 * Evaluate the performance at time t and layer the "alive" behaviour on top:
 * breathing, speech-driven mouth + head/brow accents (from the real narration envelope), hand beats and blinks.
 */
export function perform(perf: Performance, t: number, env: (t: number) => number, opts: { still?: number } = {}): Resolved {
  const face = track<FaceKey, Face>(perf.face, t, (k) => ({ ...FACES[k.face], ...k.with }), FACES.neutral, 0.2, "out");
  const L = track<ArmsKey, Arm>(perf.arms, t, (k) => ({ ...armsOf(k.arms)[0], ...k.L }), ARMS.rest[0], 0.34, "back");
  const R = track<ArmsKey, Arm>(perf.arms, t, (k) => ({ ...armsOf(k.arms)[1], ...k.R }), ARMS.rest[1], 0.34, "back");
  // hand SHAPES switch (they are drawings, not blendable): change a third of the way into each move
  let hl = ARMS.rest[0].hand, hr = ARMS.rest[1].hand;
  for (const k of perf.arms) { if (t < k.t + (k.d ?? 0.34) * 0.33) break; const a = armsOf(k.arms); hl = k.L?.hand ?? a[0].hand; hr = k.R?.hand ?? a[1].hand; }
  const body = track<BodyKey, Body>(perf.body, t, (k, prev) => {
    const { t: _t, d: _d, ease: _e, ...rest } = k; return { ...prev, ...rest } as Body;
  }, BODY0, 0.3, "back");

  const calm = 1 - (opts.still ?? 0);
  const e = env(t), eSlow = (env(t - 0.07) + env(t - 0.14) + e) / 3; // slightly smoothed loudness
  const speaking = clamp01(eSlow * 1.6);
  // breathing + a slow weight shift; damped while the voice drives the motion
  const breathe = Math.sin(t * 1.9) * 0.006;
  const b: Body = {
    ...body,
    sy: body.sy * (1 + breathe),
    x: body.x + noise(t * 0.45) * 5 * calm,
    rot: body.rot + noise(t * 0.5 + 9) * 0.9 * calm,
    // speech accents: the head dips/tilts with loud syllables instead of bobbing on a fixed cycle
    hy: body.hy + (e - 0.35) * speaking * 7 * calm,
    hrot: body.hrot + noise(t * 1.3 + 3) * 2.2 * calm + noise(t * 3.1) * 1.6 * speaking * calm,
    nod: body.nod + (e - 0.3) * speaking * 0.5,
  };
  const beat = (eSlow - 0.3) * speaking * calm;
  const arms: [Arm, Arm] = [
    { ...L, hand: hl, el: L.el + (L.el > 60 ? beat * 13 + noise(t * 1.7 + 20) * 3 : 0), sh: L.sh + (L.el > 60 ? beat * 4 : 0) },
    { ...R, hand: hr, el: R.el + (R.el > 60 ? beat * 11 + noise(t * 1.9 + 40) * 3 : 0), sh: R.sh + (R.el > 60 ? beat * 4 : 0) },
  ];
  const f: Face = { ...face, browLy: face.browLy + e * speaking * 5, browRy: face.browRy + e * speaking * 5 };
  // blinks: irregular, ~every 2.5–4.5 s, 0.13 s long
  let blink = 0;
  const slot = Math.floor(t / 1.7), bt = slot * 1.7 + 0.2 + ((Math.sin(slot * 91.7) + 1) / 2) * 1.2;
  if (Math.sin(slot * 12.9898) > -0.35) { const x = (t - bt) / 0.13; if (x > 0 && x < 1) blink = Math.sin(Math.PI * x); }
  return { body: b, face: f, arms, talk: clamp01((e - 0.12) * 1.25), viseme: 0.5 + 0.5 * noise(t * 7.3), blink };
}
