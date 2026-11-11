/**
 * Pose + expression libraries for the character rig. Everything is numeric so any two poses can be blended.
 * The names mirror the supplied reference sheet ("Ghanaian Character Expressions and Poses").
 *
 * Arm angles (degrees), per screen side: sh = upper arm (0 = hanging down, 90 = straight out sideways, 180 = up),
 * el = forearm direction in the same convention. hand: 0 open palm, 1 pointing, 2 fist, 3 flat/relaxed.
 */
export type Face = {
  browLy: number; browLr: number; browRy: number; browRr: number; // raise (px, + = up), rotation (deg, + = inner end down / angry)
  eye: number; // openness 0..1.3
  happyEye: number; // 0..1 – closed eyes become smiling arcs
  px: number; py: number; // pupil offset -1..1
  pupil: number; // pupil scale
  smile: number; // -1..1
  open: number; // 0..1 base mouth openness
  wide: number; // -1..1
  o: number; // 0..1 rounded "oh"
};
export type Arm = { sh: number; el: number; hand: number; wrist: number };
export type Body = { x: number; y: number; rot: number; sx: number; sy: number; hx: number; hy: number; hrot: number; turn: number; nod: number };

const F = (p: Partial<Face>): Face => ({ browLy: 0, browLr: 0, browRy: 0, browRr: 0, eye: 1, happyEye: 0, px: 0, py: 0, pupil: 1, smile: 0.25, open: 0, wide: 0, o: 0, ...p });

export const FACES = {
  neutral: F({ smile: 0.3 }),
  happy: F({ browLy: 6, browRy: 6, smile: 0.9, open: 0.28, wide: 0.3, eye: 0.95 }),
  excited: F({ browLy: 16, browRy: 16, smile: 1, open: 0.55, wide: 0.35, eye: 1.2, pupil: 1.08 }),
  surprised: F({ browLy: 24, browRy: 24, browLr: -6, browRr: -6, eye: 1.3, pupil: 0.8, smile: 0, open: 0.6, o: 1 }),
  shocked: F({ browLy: 28, browRy: 28, browLr: -10, browRr: -10, eye: 1.32, pupil: 0.62, smile: -0.2, open: 0.95, o: 0.6 }),
  confused: F({ browLy: 14, browLr: -8, browRy: -6, browRr: 14, eye: 0.92, smile: -0.25, wide: -0.2, px: 0.3 }),
  thinking: F({ browLy: 12, browRy: 2, browLr: -4, px: 0.55, py: -0.7, smile: 0.1, wide: -0.3 }),
  dreamy: F({ browLy: 12, browRy: 12, browLr: -6, browRr: -6, px: 0.25, py: -0.75, smile: 0.7, eye: 0.9 }),
  skeptical: F({ browLy: -6, browLr: 10, browRy: 18, browRr: -6, eye: 0.72, px: 0.5, smile: 0.15, wide: -0.1 }),
  sly: F({ browLy: 16, browRy: -4, browRr: 8, eye: 0.8, smile: 0.6, px: 0, wide: 0.1 }),
  worried: F({ browLy: 16, browRy: 16, browLr: -18, browRr: -18, eye: 1.1, pupil: 0.9, smile: -0.6, open: 0.12 }),
  cold: F({ browLy: 14, browRy: 14, browLr: -20, browRr: -20, eye: 1.05, pupil: 0.85, smile: -0.35, open: 0.3, wide: 0.5 }),
  laughing: F({ browLy: 12, browRy: 12, eye: 0.05, happyEye: 1, smile: 1, open: 0.8, wide: 0.4 }),
  confident: F({ browLy: 12, browRy: -2, browRr: 6, eye: 0.85, smile: 0.75, wide: 0.15 }),
  lookUp: F({ browLy: 18, browRy: 18, eye: 1.15, py: -0.9, smile: 0, open: 0.2, o: 0.5 }),
  wince: F({ browLy: -8, browRy: -8, browLr: 16, browRr: 16, eye: 0.08, smile: -0.5, open: 0.35, wide: 0.6 }),
} satisfies Record<string, Face>;
export type FaceName = keyof typeof FACES;

const A = (sh: number, el: number, hand = 0, wrist = 0): Arm => ({ sh, el, hand, wrist });
/** [screen-left arm, screen-right arm] */
export const ARMS = {
  rest: [A(8, 4, 3), A(8, 4, 3)],
  talk: [A(14, 150, 0, 10), A(14, 150, 0, 10)], // "Talking to camera": both hands up in front
  talkLow: [A(12, 118, 0, 20), A(12, 118, 0, 20)],
  explain: [A(22, 128, 0, 34), A(22, 128, 0, 34)], // palms out
  shrug: [A(34, 142, 0, 52), A(34, 142, 0, 52)],
  oneUpL: [A(18, 158, 0, 0), A(8, 14, 3)],
  oneUpR: [A(8, 14, 3), A(18, 158, 0, 0)],
  pointUpL: [A(34, 168, 1), A(8, 14, 3)], // pointing to a graphic up-left
  pointUpR: [A(8, 14, 3), A(34, 168, 1)],
  pointSideL: [A(58, 100, 1), A(8, 14, 3)],
  pointSideR: [A(8, 14, 3), A(58, 100, 1)],
  presentL: [A(42, 118, 0, 30), A(10, 40, 3)],
  presentR: [A(10, 40, 3), A(42, 118, 0, 30)],
  presentUpL: [A(50, 150, 0, 20), A(10, 40, 3)],
  presentUpR: [A(10, 40, 3), A(50, 150, 0, 20)],
  headGrab: [A(115, 235, 0, -10), A(115, 235, 0, -10)], // "Reacting (surprised)"
  shield: [A(122, 218, 0, -10), A(126, 226, 0, -10)], // arms up protecting the head
  pointViewer: [A(10, 40, 3), A(30, 165, 4)], // "Call-to-action"
  pointViewerBoth: [A(30, 165, 4), A(30, 165, 4)],
  temple: [A(8, 14, 3), A(112, 236, 1, 0)], // finger to temple
  chin: [A(20, 262, 2), A(40, 228, 2, 0)], // "Thinking"
  whisper: [A(70, 222, 0, -10), A(10, 40, 3)], // hand beside the mouth
  hug: [A(25, 255, 2, 0), A(25, 250, 2, 0)], // hugging himself (cold)
  pushL: [A(84, 92, 0, 60), A(30, 250, 0, 40)], // shoving something off to the left
  pushR: [A(30, 250, 0, 40), A(84, 92, 0, 60)],
  pushUp: [A(120, 178, 0, 0), A(120, 178, 0, 0)],
  stretch: [A(92, 104, 0, 30), A(92, 104, 0, 30)], // arms wide (stretching the map)
  stretchSmall: [A(30, 168, 0, 0), A(30, 168, 0, 0)],
  grabUpR: [A(10, 40, 3), A(110, 176, 2)],
  watch: [A(25, 262, 1, 0), A(30, 265, 2, 0)], // tapping the smartwatch: "look sharp!"
  fistPump: [A(10, 40, 2), A(40, 182, 2)],
  cheer: [A(125, 174, 2), A(125, 174, 2)],
  tick: [A(8, 14, 3), A(70, 160, 1)],
  wave: [A(8, 14, 3), A(60, 172, 0, 0)],
} satisfies Record<string, [Arm, Arm]>;
export type ArmsName = keyof typeof ARMS;

export const BODY0: Body = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, hx: 0, hy: 0, hrot: 0, turn: 0, nod: 0 };

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function mix<T extends Record<string, number>>(a: T, b: T, t: number): T {
  const o: Record<string, number> = {};
  for (const k in a) o[k] = lerp(a[k], b[k], t);
  return o as T;
}
