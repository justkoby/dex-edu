import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeInOut, easeOut, lerp, prog, shake, spring } from "../anim";
import { Actor } from "../components/Actor";
import { CoinBurst, MoneyWord } from "../components/MoneyWord";
import { Camera, Studio } from "../components/Stage";
import { BRAND } from "../config/brand";
import { TL, cue } from "../data/tl";
import type { Performance } from "../rig/perform";

/** Scene 1 – The Hook. "Chale, why is it that anytime somebody mentions studying abroad… MONEY?" → "Exactly!" */
const END = TL.scenes.s1[1];
const C = { chale: cue("chale"), why: cue("why"), abroad: cue("abroad"), first: cue("first"), mind: cue("mind"), money: cue("money"), exactly: cue("exactly"), exEnd: cue("vo02_end") };
const SWAT = END - 0.4;

export const perf1: Performance = {
  face: [
    { t: 0, face: "happy" },
    { t: C.chale - 0.05, face: "excited" },
    { t: C.chale + 0.75, face: "happy", d: 0.3 }, // the pause after "Chale," – holds the smile, a beat of stillness
    { t: C.why - 0.12, face: "confused", d: 0.25 },
    { t: C.abroad - 0.25, face: "thinking", with: { px: 0.75, py: -0.8 }, d: 0.22 }, // eyes follow the plane
    { t: C.first - 0.1, face: "skeptical", with: { px: 0 }, d: 0.25 },
    { t: C.mind - 0.05, face: "thinking", with: { px: -0.4, py: -0.6 }, d: 0.25 },
    { t: C.money - 0.2, face: "lookUp", d: 0.12 }, // anticipation: something is coming…
    { t: C.money, face: "wince", d: 0.07 },
    { t: C.money + 0.42, face: "shocked", with: { px: -0.9, py: -0.75 }, d: 0.14 }, // stares at the word
    { t: C.exactly - 0.52, face: "skeptical", with: { px: 0, py: 0, browRy: 20 }, d: 0.28 }, // slow deadpan turn to camera
    { t: C.exactly - 0.03, face: "confident", with: { open: 0.2 }, d: 0.12 },
    { t: SWAT - 0.05, face: "excited", with: { px: -0.6 }, d: 0.15 },
  ],
  arms: [
    { t: 0.28, arms: "wave", d: 0.3 },
    { t: C.chale + 0.8, arms: "talkLow", d: 0.4, ease: "soft" },
    { t: C.why - 0.1, arms: "explain" },
    { t: C.abroad - 0.25, arms: "pointUpR", d: 0.3 },
    { t: C.first - 0.12, arms: "talk" },
    { t: C.mind - 0.1, arms: "temple", d: 0.3 },
    { t: C.money - 0.14, arms: "shield", d: 0.13, ease: "snap" },
    { t: C.money + 0.5, arms: "headGrab", d: 0.3 },
    { t: C.exactly - 0.55, arms: "rest", d: 0.4, ease: "soft" },
    { t: C.exactly - 0.1, arms: "pointViewer", d: 0.2, ease: "snap" },
    { t: SWAT - 0.12, arms: "pushL", d: 0.2, ease: "snap" },
  ],
  body: [
    { t: 0, y: 1000, d: 0.01 },
    { t: 0.1, y: 0, d: 0.5 },
    { t: C.why - 0.1, rot: -3, hrot: -5, d: 0.35, ease: "soft" },
    { t: C.abroad - 0.25, rot: 2, hrot: 6, turn: 0.5, d: 0.3 },
    { t: C.first - 0.1, rot: 0, hrot: 0, turn: 0, d: 0.3, ease: "soft" },
    { t: C.mind - 0.05, hrot: -7, d: 0.3, ease: "soft" },
    { t: C.money - 0.18, y: 26, sy: 0.96, hrot: 0, nod: -1, d: 0.14, ease: "out" }, // flinch
    { t: C.money, x: 150, y: 90, rot: 15, sy: 0.84, sx: 1.08, d: 0.08, ease: "out" }, // knocked sideways
    { t: C.money + 0.14, x: 120, y: 20, rot: 9, sy: 1.04, sx: 0.98, nod: 0, d: 0.3 },
    { t: C.money + 0.42, x: 80, y: 0, rot: 4, sy: 1, sx: 1, turn: -0.9, hrot: -9, d: 0.3 },
    { t: C.exactly - 0.52, x: 0, rot: 0, turn: 0, hrot: 0, d: 0.42, ease: "soft" },
    { t: C.exactly - 0.05, y: -22, hrot: 4, d: 0.1, ease: "out" },
    { t: C.exactly + 0.1, y: 0, d: 0.25 },
    { t: SWAT - 0.12, rot: -7, x: -40, turn: -0.6, d: 0.2, ease: "snap" },
  ],
};

const Plane: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = prog(t, at, 1.5);
  if (p <= 0 || p >= 1) return null;
  const e = easeInOut(p), x = -140 + e * 1380, y = 620 - Math.sin(e * Math.PI) * 250, ang = -24 + e * 40;
  const trail = Array.from({ length: 14 }).map((_, i) => { const q = Math.max(0, e - i * 0.03); return [-140 + q * 1380, 620 - Math.sin(q * Math.PI) * 250]; });
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {trail.slice(2).map(([tx, ty], i) => <circle key={i} cx={tx} cy={ty} r={7 - i * 0.4} fill="#fff" opacity={0.85 - i * 0.065} />)}
      <g transform={`translate(${x} ${y}) rotate(${ang}) scale(1.5)`}>
        <path d="M-52,6 L18,-8 Q54,-14 60,-2 Q58,10 22,12 Z" fill="#fff" stroke={BRAND.navy} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-6,-4 L-30,-42 L-12,-44 L22,-8 Z" fill={BRAND.orange} stroke={BRAND.navy} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-4,8 L-26,40 L-10,42 L24,10 Z" fill={BRAND.orange} stroke={BRAND.navy} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-50,4 L-66,-22 L-52,-22 L-34,2 Z" fill={BRAND.orange} stroke={BRAND.navy} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={36} cy={-2} r={5} fill={BRAND.navy} />
      </g>
    </svg>
  );
};

export const Scene1Hook: React.FC<{ t: number }> = ({ t }) => {
  // camera: open tight on the face, creep in while he thinks, snap wide + shake on the slam, punch in for "Exactly!"
  const creep = lerp(1.2, 1.3, easeInOut(prog(t, C.first, C.money - C.first)));
  const wide = easeOut(prog(t, C.money - 0.06, 0.16));
  const punch = spring(t, C.exactly - 0.08, 0.3) * 0.1 * (1 - easeInOut(prog(t, SWAT - 0.2, 0.3)));
  const zoom = lerp(creep, 1.0, wide) + punch;
  const sh = shake(t, C.money, 0.6);
  return (
    <AbsoluteFill>
      <Camera zoom={zoom} fx={540} fy={1150} shakeX={sh * 26} shakeY={shake(t, C.money, 0.6, 51) * 34}>
        <Studio t={t} wall={["#FFF6DD", "#FFE9B0"]} blob={BRAND.yellow} accent={BRAND.orange} />
        <Plane t={t} at={C.abroad - 0.3} />
        <Actor perf={perf1} t={t} />
        <MoneyWord t={t} hit={C.money} swat={SWAT} />
        <CoinBurst t={t} at={C.money} x={470} y={760} />
        {/* impact flash */}
        <AbsoluteFill style={{ background: "#fff", opacity: clamp01(1 - (t - C.money) / 0.12) * (t >= C.money ? 0.75 : 0) }} />
      </Camera>
    </AbsoluteFill>
  );
};
