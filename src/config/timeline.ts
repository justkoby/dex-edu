export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const sec = (s: number) => Math.round(s * FPS);

/** Scene boundaries in seconds — all on 0.5 s beats (music is 120 BPM). */
export const SCENES = {
  s1: { from: 0, to: 7.0 }, // Kofi calls Ama
  s2: { from: 7.0, to: 12.0 }, // Ama answers from Budapest
  s3: { from: 12.0, to: 15.5 }, // Kofi reacts
  s4: { from: 15.5, to: 25.5 }, // Ama reveals the opportunity
  s5: { from: 25.5, to: 34.5 }, // University + city montage
  s6: { from: 34.5, to: 40.5 }, // Branded CTA
} as const;

export const TOTAL_FRAMES = sec(SCENES.s6.to);

/** Voice lines: file in public/audio, start (s, absolute), duration (s, measured from the trimmed mp3). */
export const VOICE = {
  s1: { file: "audio/s1_kofi.mp3", start: 2.9, dur: 3.971, who: "kofi" },
  s2: { file: "audio/s2_ama.mp3", start: 7.4, dur: 4.18, who: "ama" },
  s3: { file: "audio/s3_kofi.mp3", start: 12.5, dur: 1.959, who: "kofi" },
  s4: { file: "audio/s4_ama.mp3", start: 16.1, dur: 8.882, who: "ama" },
  s5: { file: "audio/s5_narr.mp3", start: 25.7, dur: 8.62, who: "narrator" },
  s6: { file: "audio/s6_narr.mp3", start: 34.8, dur: 3.971, who: "narrator" },
} as const;

export const SFX = {
  ring: { file: "audio/sfx_ring.mp3", at: 0.2 },
  connect: { file: "audio/sfx_connect.mp3", at: 2.45 },
  pickup: { file: "audio/sfx_pop.mp3", at: 7.0 },
  scratch: { file: "audio/sfx_scratch.mp3", at: 11.58 },
  impactReact: { file: "audio/sfx_impact.mp3", at: 12.0 },
  impactReveal: { file: "audio/sfx_impact.mp3", at: 15.5 },
  whooshes: [16.0, 22.0, 25.5, 27.5, 29.5, 31.5, 34.5] as const,
  pops: [18.6, 20.3, 36.3, 37.0, 37.6] as const,
} as const;
