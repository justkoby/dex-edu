import React from "react";
import { AbsoluteFill } from "remotion";
import { backOut, clamp01, easeIn, easeInOut, easeOut, lerp, prog, spring } from "../anim";
import { Actor } from "../components/Actor";
import { NLMap } from "../components/NLMap";
import { Camera, Studio } from "../components/Stage";
import { BRAND } from "../config/brand";
import { TL, cue } from "../data/tl";
import type { Performance } from "../rig/perform";

/** Scene 2 – The Netherlands reveal. He leans in with the secret, the map pops up on "Netherlands", he stretches it wide. */
const [START, END] = TL.scenes.s2;
const C = { whatif: cue("whatif"), planning: cue("planning"), study: cue("study"), nl: cue("netherlands"), y27: cue("y2027"), voEnd: cue("vo03_end"), yup: cue("yup"), thenl: cue("thenl"), yupEnd: cue("vo04_end") };
const GRAB = C.voEnd + 0.32, PULL = C.voEnd + 0.58, SNAP = C.voEnd + 1.22;

export const perf2: Performance = {
  face: [
    { t: START, face: "sly" },
    { t: C.planning - 0.1, face: "happy", d: 0.25 },
    { t: C.study - 0.1, face: "excited", with: { px: 0.5, py: -0.5 }, d: 0.25 }, // already glancing where it will appear
    { t: C.nl - 0.05, face: "excited", with: { px: 0.9, py: -0.7 }, d: 0.12 },
    { t: C.y27 + 0.12, face: "surprised", with: { px: 0.9, py: -0.6 }, d: 0.1 },
    { t: C.y27 + 0.55, face: "happy", with: { px: 0, py: 0 }, d: 0.25 },
    { t: C.voEnd + 0.12, face: "thinking", with: { px: 0.7, py: -0.8 }, d: 0.2 }, // "hmm… too small"
    { t: PULL, face: "wince", with: { eye: 0.5, smile: 0.2, open: 0.5, wide: 0.6 }, d: 0.2 }, // effort
    { t: SNAP, face: "surprised", with: { py: -0.8 }, d: 0.08 },
    { t: SNAP + 0.4, face: "happy", with: { py: -0.5 }, d: 0.25 },
    { t: C.yup - 0.18, face: "confident", d: 0.2 },
    { t: C.thenl - 0.05, face: "excited", d: 0.15 },
    { t: C.yupEnd + 0.05, face: "happy", d: 0.25 },
  ],
  arms: [
    { t: START, arms: "whisper", d: 0.01 },
    { t: C.planning - 0.12, arms: "explain" },
    { t: C.study - 0.1, arms: "talkLow", d: 0.4, ease: "soft" },
    { t: C.nl - 0.1, arms: "presentUpR", d: 0.25, ease: "snap" },
    { t: C.y27 + 0.05, arms: "pointUpR", d: 0.2 },
    { t: C.voEnd + 0.05, arms: "rest", d: 0.3, ease: "soft" },
    { t: GRAB, arms: "stretchSmall", d: 0.22 }, // takes hold of the map
    { t: PULL, arms: "stretch", d: SNAP - PULL, ease: "soft" }, // pulls it wide
    { t: SNAP + 0.02, arms: "cheer", d: 0.2, ease: "snap" }, // it snaps to size – hands fly up
    { t: SNAP + 0.5, arms: "rest", d: 0.4, ease: "soft" },
    { t: C.thenl - 0.1, arms: ["pointUpL", "pointUpR"], d: 0.22, ease: "snap" },
  ],
  body: [
    { t: START, rot: -6, x: -30, hrot: -7, d: 0.01 },
    { t: C.planning - 0.12, rot: 0, x: 0, hrot: 0, d: 0.35, ease: "soft" },
    { t: C.nl - 0.1, x: -170, turn: 0.8, hrot: 6, rot: -3, d: 0.25 }, // hops aside to make room, looks at the map
    { t: C.y27 + 0.12, y: -18, d: 0.1, ease: "out" },
    { t: C.y27 + 0.25, y: 0, d: 0.25 },
    { t: C.y27 + 0.55, turn: 0, hrot: 0, rot: 0, d: 0.3, ease: "soft" },
    { t: C.voEnd + 0.12, turn: 0.6, hrot: 6, d: 0.25, ease: "soft" },
    { t: GRAB, x: 0, turn: 0, hrot: 0, y: -8, d: 0.22 },
    { t: PULL, sy: 0.93, sx: 1.05, y: 22, d: SNAP - PULL, ease: "soft" }, // strains
    { t: SNAP, sy: 1.05, sx: 0.98, y: -24, d: 0.1, ease: "out" },
    { t: SNAP + 0.14, sy: 1, sx: 1, y: 0, d: 0.3 },
    { t: C.yup, nod: 1.6, hy: 16, d: 0.12, ease: "out" }, // the "Yup." nod
    { t: C.yup + 0.16, nod: 0, hy: 0, d: 0.25 },
    { t: C.thenl - 0.05, y: -20, d: 0.1, ease: "out" },
    { t: C.thenl + 0.1, y: 0, d: 0.25 },
  ],
};

export const Scene2Reveal: React.FC<{ t: number }> = ({ t }) => {
  const zoom = lerp(1.22, 1, easeInOut(prog(t, C.planning - 0.2, 0.6)));
  // map life-cycle: pop (small, beside him) -> grabbed -> rubber stretch -> snap big above him -> rushes the camera at the cut
  const pop = spring(t, C.nl - 0.08, 0.5, 1.2);
  const move = easeInOut(prog(t, GRAB - 0.05, 0.3));
  const pull = prog(t, PULL, SNAP - PULL);
  const snap = t >= SNAP ? spring(t, SNAP, 0.4, 1.3) : 0;
  const x = lerp(790, 540, move), y = lerp(640, 500, move);
  const scale = lerp(0.56, 0.8, snap) * pop;
  const stretchX = 1 + easeIn(pull) * 0.75 * (1 - Math.min(1, snap * 1.2)) + (t >= SNAP ? 0 : 0);
  const stretchY = 1 - easeIn(pull) * 0.22 * (1 - Math.min(1, snap * 1.2));
  const out = prog(t, END - 0.34, 0.34), outE = easeIn(out);
  if (t < START - 0.01) return null;
  return (
    <AbsoluteFill>
      <Camera zoom={zoom} fx={470} fy={1180}>
        <Studio t={t} wall={["#E6F5FF", "#CFEBFF"]} blob="#FFD9B5" accent={BRAND.navy} blobX={40} />
        {t >= C.nl - 0.1 && (
          <NLMap t={t} x={x} y={y - outE * 120} scale={scale * (1 + outE * 2.4)} rot={(1 - Math.min(1, pop)) * -14 + Math.sin(t * 2.2) * 1.2 * (1 - move)}
            stretchX={stretchX} stretchY={stretchY} opacity={1 - clamp01((out - 0.5) * 2)}
            stampAt={C.y27 + 0.1} pinsAt={SNAP + 0.06} labelAt={C.thenl - 0.02} />
        )}
        <Actor perf={perf2} t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
