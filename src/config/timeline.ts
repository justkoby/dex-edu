import manifest from "./voiceManifest.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const sec = (s: number) => Math.round(s * FPS);

export type ClipId = "s1_call" | "s2_answer" | "s3_reaction" | "s4_schools" | "s5a_intro" | "s5b_help" | "s6_cta";
export type Phrase = { start: number; end: number; text: string };
export type Clip = { file: string; speaker: "kofi" | "ama" | "narrator"; duration: number; phrases: Phrase[]; confidence: string };
export const CLIPS = manifest as unknown as Record<ClipId, Clip>;
export const dur = (id: ClipId) => CLIPS[id].duration;

/** Music: tempo of the licensed-review track (see ASSET_MANIFEST) and the time inside it where the full groove drops. */
export const BEAT = 0.6; // 100 BPM
export const MUSIC_DROP = 12.19; // seconds into the music file

/**
 * All times in seconds on the final timeline. Everything after the call is chained off the real recordings'
 * durations, so swapping a recording and re-running `npm run voices` re-times the whole edit.
 */
const ringAt = 0.15;
const connectAt = 1.75;
const V1 = 2.0; // Kofi speaks
const C2 = V1 + dur("s1_call") + 0.1; // cut to Ama
const V2 = C2 + 0.1;
const E2 = V2 + dur("s2_answer");
const C3 = E2 + 0.2; // cut to Kofi's reaction (after the scratch)
const V3 = C3 + 0.5; // reaction pause before he speaks
const E3 = V3 + dur("s3_reaction");
const C4 = E3 + 0.2; // Budapest reveal == music drop
const V4 = C4 + 0.1;
const E4 = V4 + dur("s4_schools");
const snap = (t: number) => C4 + Math.ceil((t - C4) / BEAT - 0.4) * BEAT; // nearest beat on the drop's grid (may land up to 0.24 s early, inside the clip's silent tail)
const C5 = snap(E4 - 0.1); // montage
const V5a = C5 + 0.3;
const E5a = V5a + dur("s5a_intro");
const V5b = E5a + 0.05;
const E5b = V5b + dur("s5b_help");
const C6 = snap(E5b + 0.1); // end card
const V6 = C6 + 0.55;
const E6 = V6 + dur("s6_cta");
const END = E6 + 1.0;

export const T = { ringAt, connectAt, V1, C2, V2, E2, C3, V3, E3, C4, V4, E4, C5, V5a, E5a, V5b, E5b, C6, V6, E6, END } as const;

export const SCENES = {
  s1: { from: 0, to: C2 },
  s2: { from: C2, to: C3 },
  s3: { from: C3, to: C4 },
  s4: { from: C4, to: C5 },
  s5: { from: C5, to: C6 },
  s6: { from: C6, to: END },
} as const;

export const TOTAL_FRAMES = sec(END);

export const VOICE: Record<ClipId, { start: number }> = {
  s1_call: { start: V1 }, s2_answer: { start: V2 }, s3_reaction: { start: V3 }, s4_schools: { start: V4 },
  s5a_intro: { start: V5a }, s5b_help: { start: V5b }, s6_cta: { start: V6 },
};

export const SFX = {
  ring: { file: "audio/sfx_ring2.mp3", at: ringAt, len: connectAt - ringAt },
  connect: { file: "audio/sfx_connect.mp3", at: connectAt },
  pickup: { file: "audio/sfx_tick.mp3", at: C2 - 0.05 },
  scratch: { file: "audio/sfx_scratch.mp3", at: E2 - 0.15 },
  impactReact: { file: "audio/sfx_impact.mp3", at: C3 },
  impactReveal: { file: "audio/sfx_impact.mp3", at: C4 },
  disconnect: { file: "audio/sfx_disconnect.mp3", at: E4 - 0.75 },
  chime: { file: "audio/sfx_chime.mp3", at: C6 + 0.15 },
  whooshes: [C2 - 0.12, C4 - 0.1, C5 - 0.1, C6 - 0.1] as number[],
};

// ---------- music automation (all gain curves are smooth; no hard edits) ----------
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/** Speech windows (seconds) from every phrase, merged across gaps shorter than 0.4 s. */
export const SPEECH: [number, number][] = (() => {
  const w: [number, number][] = [];
  (Object.keys(CLIPS) as ClipId[]).forEach((id) => CLIPS[id].phrases.forEach((p) => w.push([VOICE[id].start + p.start, VOICE[id].start + p.end])));
  w.sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const x of w) {
    const last = out[out.length - 1];
    if (last && x[0] - last[1] < 0.4) last[1] = Math.max(last[1], x[1]);
    else out.push([x[0], x[1]]);
  }
  return out;
})();

const duckAt = (t: number, depth: number) => {
  let g = 1;
  for (const [a, b] of SPEECH) {
    const s = smooth((t - (a - 0.3)) / 0.3) * (1 - smooth((t - b) / 0.55)); // fast in, slow release
    g = Math.min(g, 1 - (1 - depth) * s);
  }
  return g;
};

/** Where Ama says "Budapest" (set by captions.ts once word timing is known) — the music stops here. */
const bp = CLIPS.s2_answer.phrases[2]; // "Chale, I dey Budapest": "Budapest" is the last ~39% of the phrase by character weight
export const BUDAPEST_CUE = { t: V2 + bp.end - (bp.end - bp.start) * 0.39 };

/** Part A: quiet intro bed (file t≈0). Fades in, ducks under speech, stops dead-smooth at the "Budapest" cue. */
export const MUSIC_A = { from: 0.4, to: BUDAPEST_CUE.t + 0.4 };
export const musicGainA = (t: number) =>
  0.5 * smooth((t - MUSIC_A.from) / 1.5) * duckAt(t, 0.45) * (1 - smooth((t - BUDAPEST_CUE.t) / 0.3));

/** Part B: full groove from the drop at the reveal; louder over the montage, ducked under speech, fades at the end. */
export const MUSIC_B = { from: C4, to: END };
export const musicGainB = (t: number) => {
  const open = t < C4 + 1.4 ? 0.8 : t < C5 ? 0.55 : t < C6 ? 0.7 : 0.62; // drop > explanation > montage > CTA
  const swell = t > E6 ? 1 + 0.15 * smooth((t - E6) / 0.4) : 1;
  return open * swell * duckAt(t, t < C5 ? 0.3 : 0.34) * (1 - smooth((t - (END - 1.4)) / 1.4));
};
