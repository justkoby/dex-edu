import raw from "./timeline.json";

type TL = {
  fps: number; total: number; frames: number;
  scenes: Record<"s1" | "s2" | "s3" | "s4" | "s5", [number, number]>;
  vo: { id: string; file: string; start: number; dur: number }[];
  cues: Record<string, number>;
  captions: { t0: number; t1: number; text: string }[];
  sfx: [number, string, number][];
  env: number[];
  duck?: number[];
};
export const TL = raw as unknown as TL;
/** time (s) of a named narration cue – throws on typos so a renamed cue can never silently desync a gag */
export const cue = (name: string): number => {
  const v = TL.cues[name];
  if (v === undefined) throw new Error(`unknown cue "${name}"`);
  return v;
};
/** narration loudness 0..1 at time t (linear-interpolated between video frames) */
export const envAt = (t: number): number => {
  const f = t * TL.fps;
  if (f <= 0 || f >= TL.env.length - 1) return 0;
  const i = Math.floor(f);
  return TL.env[i] + (TL.env[i + 1] - TL.env[i]) * (f - i);
};
