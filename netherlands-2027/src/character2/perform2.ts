import { backOut, clamp01, easeInOut, easeOut, noise } from "../anim";
import { ArmMode, POSE0, Pose2 } from "./Character2";

/**
 * Acting for Character2: one keyframe list per scene. A key is the moment he STARTS moving; unspecified fields keep
 * their value, so a key can change only the brows, or only the lean. Arm drawings switch on a key (`armL` / `armR`).
 * On top of the keys the narration itself drives the mouth, small head accents and brow lifts; blinks are added
 * automatically (and can be forced with `blink: true` on a key, e.g. on a head turn).
 */
type Ease = "back" | "out" | "soft" | "snap";
export type Key2 = { t: number; d?: number; ease?: Ease; armL?: ArmMode; armR?: ArmMode; blink?: boolean } & Partial<Pose2>;
const E: Record<Ease, (x: number) => number> = { back: (x) => backOut(x, 1.5), out: easeOut, soft: easeInOut, snap: (x) => backOut(x, 2.4) };
const NUM = Object.keys(POSE0) as (keyof Pose2)[];

export function perform2(keys: Key2[], t: number, env: (t: number) => number, start: { armL: ArmMode; armR: ArmMode }) {
  let v: Pose2 = { ...POSE0 }, armL = start.armL, armR = start.armR, lT = -9, rT = -9;
  let blink = 0;
  for (const k of keys) {
    if (t < k.t) break;
    const p = clamp01((t - k.t) / (k.d ?? 0.3)), e = E[k.ease ?? "back"](p);
    const next = { ...v };
    for (const f of NUM) if (k[f] !== undefined) next[f] = v[f] + ((k[f] as number) - v[f]) * e;
    v = next;
    if (k.armL && k.armL !== armL) { armL = k.armL; lT = k.t; }
    if (k.armR && k.armR !== armR) { armR = k.armR; rT = k.t; }
    if (k.blink) { const x = (t - k.t) / 0.16; if (x > 0 && x < 1) blink = Math.max(blink, Math.sin(Math.PI * x)); }
  }
  // voice-driven life
  const e = env(t), sm = (env(t - 0.066) + env(t - 0.033) + e) / 3, speaking = clamp01(sm * 1.7);
  const breathe = Math.sin(t * 1.8) * 0.004;
  const pose: Pose2 = {
    ...v,
    squash: v.squash * (1 + breathe),
    lean: v.lean + noise(t * 0.4) * 0.5,
    headRot: v.headRot + noise(t * 0.9 + 4) * 1.4 + noise(t * 2.6) * 1.3 * speaking,
    headY: v.headY + (e - 0.35) * speaking * 9,
    browLy: v.browLy + e * speaking * 6, browRy: v.browRy + e * speaking * 6,
    mouthOpen: clamp01(v.mouthOpen * (speaking > 0.15 ? 0.35 : 1) + clamp01((e - 0.1) * 1.3) * (0.55 + 0.3 * noise(t * 6.1))),
    mouthW: v.mouthW * (1 + 0.07 * noise(t * 5.3) * speaking),
    armLRot: v.armLRot + (sm - 0.3) * speaking * 5, armRRot: v.armRRot - (sm - 0.3) * speaking * 5,
  };
  // natural blinks every ~2.5–4.5 s
  const slot = Math.floor(t / 1.9), bt = slot * 1.9 + 0.3 + ((Math.sin(slot * 91.7) + 1) / 2) * 1.2;
  if (Math.sin(slot * 12.9898) > -0.4) { const x = (t - bt) / 0.14; if (x > 0 && x < 1) blink = Math.max(blink, Math.sin(Math.PI * x)); }
  return { pose, armL, armR, armLSwap: clamp01((t - lT) / 0.22), armRSwap: clamp01((t - rT) / 0.22), blink };
}
