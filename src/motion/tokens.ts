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
  hook: { from: 0, to: beat(2) }, // 0.0 – 4.2   typography -> letters open onto the map
  route: { from: beat(2), to: beat(9) }, // 4.2 – 8.4   Accra -> Budapest, marker opens onto footage
  ibs: { from: beat(9), to: beat(17) }, // 8.4 – 13.2  editorial photo grid
  bmu: { from: beat(17), to: beat(25) }, // 13.2 – 18.0 cinematic full-bleed
  msg: { from: beat(25), to: beat(34) }, // 18.0 – 23.4 kinetic typography
  cta: { from: beat(34), to: beat(46) }, // 23.4 – 30.6 end card (7.2 s incl. a ~4 s read/hold)
} as const;
export const TOTAL = sec(30.6);

/** Editorial type scale (Archivo, wdth 62 for display / 100 for labels). Everything else derives from these. */
export const T = {
  label: { size: 28, wdth: 100, weight: 800, tracking: 6 },
  caption: { size: 24, wdth: 100, weight: 600, tracking: 4 },
} as const;

/** One directional language: every wipe travels left -> right (the direction of the flight). Slanted leading edge. */
export const wipeClip = (p: number, slant = 9) => {
  const x = p * (100 + slant);
  return `polygon(0 0, ${x}% 0, ${x - slant}% 100%, 0 100%)`;
};

/** Shared, deliberately light grade so Parliament, IBS and BMU footage sit in one world. */
export const GRADE = {
  parliament: "contrast(1.05) saturate(1.02) brightness(0.98)",
  ibs: "contrast(1.05) saturate(1.0) brightness(0.99)",
  bmu: "contrast(1.07) saturate(1.12) brightness(0.96)",
  statue: "contrast(1.05) saturate(1.1) brightness(1.04)",
} as const;

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.77, 0, 0.18, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
