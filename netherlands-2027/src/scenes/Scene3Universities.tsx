import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeIn, easeInOut, lerp, prog, pulse, spring } from "../anim";
import { Actor } from "../components/Actor";
import { Camera, Studio } from "../components/Stage";
import { UniCard } from "../components/UniCard";
import { BRAND, SCHOOLS } from "../config/brand";
import { TL, cue } from "../data/tl";
import type { Performance } from "../rig/perform";

/** Scene 3 – the two universities. SRH's card drops in; on "and" he shoves it aside so Wittenborg can slide in. "See? Options!" */
const [START, END] = TL.scenes.s3;
const C = { schools: cue("schools"), srh: cue("srh"), and: cue("and_"), witt: cue("witt"), voEnd: cue("vo05_end"), see: cue("see"), options: cue("options"), optEnd: cue("vo06_end") };
const PUSH = C.and - 0.06, DROP = END - 0.4;

export const perf3: Performance = {
  face: [
    { t: START, face: "happy" },
    { t: C.srh - 0.3, face: "happy", with: { px: 0, py: -0.7 }, d: 0.2 }, // looks up before it lands
    { t: C.srh, face: "excited", with: { py: -0.8 }, d: 0.12 },
    { t: C.srh + 0.75, face: "happy", d: 0.25 }, // back to camera while naming it
    { t: PUSH - 0.1, face: "confident", with: { px: -0.7, py: -0.6 }, d: 0.15 },
    { t: C.witt - 0.05, face: "excited", with: { px: 0.8, py: -0.7 }, d: 0.15 },
    { t: C.witt + 1.0, face: "happy", d: 0.3 },
    { t: C.voEnd + 0.05, face: "neutral", with: { smile: 0.6 }, d: 0.3 }, // a beat of stillness
    { t: C.see - 0.12, face: "sly", d: 0.2 },
    { t: C.options - 0.08, face: "excited", d: 0.12 },
    { t: DROP, face: "surprised", with: { py: 0.6 }, d: 0.15 },
  ],
  arms: [
    { t: C.schools - 0.05, arms: "explain" },
    { t: C.srh - 0.2, arms: ["presentUpL", "presentUpR"], d: 0.25, ease: "snap" },
    { t: C.srh + 0.8, arms: "talk", d: 0.35, ease: "soft" },
    { t: PUSH - 0.16, arms: "pushR", d: 0.14, ease: "out" }, // wind-up (hands to his right)…
    { t: PUSH, arms: "pushL", d: 0.2, ease: "snap" }, // …and shove left
    { t: C.witt - 0.08, arms: "presentUpR", d: 0.25, ease: "snap" },
    { t: C.witt + 1.1, arms: "talk", d: 0.4, ease: "soft" },
    { t: C.voEnd, arms: "rest", d: 0.4, ease: "soft" },
    { t: C.see - 0.1, arms: "shrug", d: 0.25 },
    { t: C.options - 0.1, arms: ["pointUpL", "pointUpR"], d: 0.18, ease: "snap" },
    { t: DROP + 0.05, arms: "rest", d: 0.3 },
  ],
  body: [
    { t: C.srh - 0.25, y: 16, sy: 0.97, d: 0.2, ease: "soft" },
    { t: C.srh, y: 0, sy: 1, d: 0.25 },
    { t: PUSH - 0.16, x: 40, rot: 5, turn: -0.3, d: 0.14, ease: "out" },
    { t: PUSH, x: -50, rot: -6, turn: -0.7, hrot: -5, d: 0.2, ease: "snap" },
    { t: C.witt - 0.08, x: 0, rot: 2, turn: 0.7, hrot: 5, d: 0.3 },
    { t: C.witt + 1.0, rot: 0, turn: 0, hrot: 0, d: 0.35, ease: "soft" },
    { t: C.see - 0.1, hrot: 8, d: 0.25, ease: "soft" }, // head tilt on "See?"
    { t: C.options - 0.08, hrot: 0, y: -26, d: 0.1, ease: "out" },
    { t: C.options + 0.08, y: 0, d: 0.3 },
  ],
};

export const Scene3Universities: React.FC<{ t: number }> = ({ t }) => {
  if (t < START - 0.01) return null;
  // SRH: drops in big and centred -> shoved to the left slot
  const inS = spring(t, C.srh - 0.14, 0.5, 1.1), push = spring(t, PUSH + 0.05, 0.42, 0.9);
  const sx = lerp(540, 290, push), sScale = lerp(1.14, 1, Math.min(1, push)) * (0.2 + 0.8 * Math.min(1.1, inS));
  const sy = lerp(-420, 560, inS) + (push > 0 ? 0 : 0);
  // Wittenborg: slides in from the right, bumps SRH
  const inW = spring(t, C.witt - 0.12, 0.5, 1.0), wx = lerp(1420, 790, inW);
  const bump = Math.exp(-Math.max(0, t - (C.witt + 0.08)) * 6) * Math.sin(Math.max(0, t - (C.witt + 0.08)) * 22) * (t > C.witt + 0.08 ? 1 : 0);
  const hop = pulse(t, C.options - 0.02, 0.36) * 46;
  const drop = easeIn(prog(t, DROP, 0.4)) * 1500;
  const glow = pulse(t, C.see, 0.8) * 0.6 + pulse(t, C.options, 0.7);
  const zoom = 1 + 0.05 * easeInOut(prog(t, C.see - 0.2, 0.5)) - 0.05 * easeInOut(prog(t, DROP, 0.3));
  return (
    <AbsoluteFill>
      <Camera zoom={zoom} fx={540} fy={1000}>
        <Studio t={t} wall={["#FFF8EC", "#FBE9CF"]} blob={BRAND.navy} accent={BRAND.orange} blobY={60} />
        <UniCard x={sx - bump * 16} y={sy - hop + drop} scale={sScale} rot={(1 - Math.min(1, inS)) * -10 - bump * 3 + (push > 0 && push < 1 ? -5 * (1 - push) : 0)} photo="img/srh-haarlem-campus.jpg" logo="brand/srh-logo.png" logoH={70}
          {...SCHOOLS.srh} glow={glow} />
        {t >= C.witt - 0.14 && (
          <UniCard x={wx} y={560 - hop * 0.9 + drop * 1.15} rot={(1 - Math.min(1, inW)) * 8 + bump * 2} photo="img/wittenborg-building.jpg" logo="brand/wittenborg-logo.svg" logoH={38}
            {...SCHOOLS.witt} glow={glow} />
        )}
        <Actor perf={perf3} t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
