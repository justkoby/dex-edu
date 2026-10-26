import { Easing } from "remotion";

/** Concept 2 design tokens. Brand navy/orange come from the Dexterity logo; the rest supports them. */
export const C = {
  navy: "#283C8D",
  navyDeep: "#0f1747",
  navyMid: "#1a2a6e",
  orange: "#F37A20",
  offWhite: "#F5F0E6",
  charcoal: "#181a22",
  white: "#FFFFFF",
} as const;

export const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif";
/** Archivo is a variable font: wdth 62 = extra-condensed (oversized headlines), 100 = normal (labels). */
export const type = (size: number, wdth = 62, weight = 900): React.CSSProperties => ({
  fontFamily: FONT, fontSize: size, fontWeight: weight, fontVariationSettings: `"wdth" ${wdth}`,
  textTransform: "uppercase", lineHeight: 0.86, letterSpacing: wdth < 80 ? -1 : 0.5,
});

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const SAFE = { top: 250, bottom: 480, side: 64 } as const;
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Music: the existing 100 BPM review track. Its groove drops 13.19 s into the file; we start the file 3.0 s before the
 * drop so the "BUDAPEST?" slam lands on it, and every cut below sits on the same 0.6 s beat grid.
 */
export const BEAT = 0.6;
export const DROP = 3.0;
export const MUSIC_FILE_DROP = 13.19; // measured: loudness jumps -12 -> -4 dB RMS at 13.2 s in the file
export const beat = (n: number) => DROP + n * BEAT; // n=0 -> drop (3.0 s); n=-5 -> 0.0 s

export const SC = {
  hook: { from: 0, to: beat(2) }, // 0 – 4.2
  route: { from: beat(2), to: beat(10) }, // 4.2 – 9.0
  uni1: { from: beat(10), to: beat(18) }, // 9.0 – 13.8
  uni2: { from: beat(18), to: beat(26) }, // 13.8 – 18.6
  msg: { from: beat(26), to: beat(35) }, // 18.6 – 24.0
  cta: { from: beat(35), to: beat(45) }, // 24.0 – 30.0
} as const;
export const TOTAL = sec(30);

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.77, 0, 0.18, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
