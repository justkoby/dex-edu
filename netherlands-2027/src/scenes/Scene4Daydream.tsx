import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, easeIn, easeInOut, easeOut, lerp, prog, shake, spring } from "../anim";
import { Actor } from "../components/Actor";
import { Camera, Poof, Studio } from "../components/Stage";
import { Breath, Frost, Polaroid, Snow, Suitcase, Thermometer } from "../components/Winter";
import { BRAND, FONT, H, W } from "../config/brand";
import { TL, cue } from "../data/tl";
import type { Performance } from "../rig/perform";

/** Scene 4 – the daydream. The studio melts into Haarlem, a suitcase rolls in, winter clothes pop on… and then the cold lands. */
const [START, END] = TL.scenes.s4;
const C = { imagine: cue("imagine"), europe: cue("europe"), people: cue("people"), exp: cue("experiencing"), env: cue("environment"), voEnd: cue("vo07_end"), although: cue("although"), somebody: cue("somebody"), cold: cue("cold"), toomuch: cue("toomuch"), coldEnd: cue("vo08_end") };
const CASE_IN = C.europe + 0.25, CASE_HIT = C.europe + 0.93;
const BEANIE = C.exp + 0.2, SCARF = C.exp + 0.6, JACKET = C.exp + 1.0;
const FREEZE = C.voEnd + 0.12, SHAKE_OFF = END - 0.42;

export const perf4: Performance = {
  face: [
    { t: START, face: "happy" },
    { t: C.imagine - 0.2, face: "dreamy", d: 0.35, ease: "soft" },
    { t: CASE_HIT, face: "surprised", with: { px: -0.9, py: 0.7 }, d: 0.1 }, // looks down at the suitcase that bumped him
    { t: CASE_HIT + 0.42, face: "happy", with: { px: 0, py: 0 }, d: 0.25 },
    { t: C.people - 0.05, face: "excited", with: { py: -0.5 }, d: 0.2 },
    { t: C.exp - 0.05, face: "happy", d: 0.25 },
    { t: BEANIE, face: "lookUp", d: 0.1 }, // "what just landed on my head?"
    { t: SCARF + 0.05, face: "surprised", with: { py: 0.7 }, d: 0.1 },
    { t: JACKET + 0.15, face: "happy", with: { py: 0.3 }, d: 0.2 },
    { t: FREEZE, face: "worried", with: { px: 0, py: 0 }, d: 0.2 }, // …the realisation
    { t: FREEZE + 0.5, face: "cold", d: 0.2 },
    { t: C.although - 0.05, face: "cold", with: { px: 0.6, open: 0.15 }, d: 0.2 }, // side-eye
    { t: C.somebody - 0.1, face: "worried", with: { browLr: -6, browRr: 16, browRy: 4 }, d: 0.2 }, // accusing
    { t: C.cold - 0.1, face: "cold", d: 0.15 },
    { t: C.toomuch - 0.05, face: "wince", with: { open: 0.4 }, d: 0.2 },
    { t: C.coldEnd, face: "cold", d: 0.2 },
    { t: SHAKE_OFF, face: "wince", d: 0.1 },
  ],
  arms: [
    { t: C.imagine - 0.2, arms: "chin", d: 0.4, ease: "soft" },
    { t: CASE_HIT, arms: "shrug", d: 0.14, ease: "snap" },
    { t: CASE_HIT + 0.45, arms: "talkLow", d: 0.35, ease: "soft" },
    { t: C.people - 0.1, arms: "wave", d: 0.25 },
    { t: C.exp - 0.1, arms: "explain", d: 0.35 },
    { t: BEANIE, arms: "headGrab", d: 0.16, ease: "snap" },
    { t: SCARF + 0.1, arms: "talkLow", d: 0.25 },
    { t: JACKET + 0.12, arms: "shrug", d: 0.25 }, // checks himself out
    { t: FREEZE + 0.1, arms: "hug", d: 0.3, ease: "out" },
    { t: C.somebody - 0.12, arms: ["hug", "oneUpR"], d: 0.25 }, // one hand out: "somebody should've warned me"
    { t: C.cold - 0.2, arms: "hug", d: 0.22 },
    { t: C.toomuch - 0.05, arms: "hug", d: 0.2, L: { el: 262 }, R: { el: 258 } },
    { t: SHAKE_OFF, arms: "cheer", d: 0.2, ease: "snap" },
  ],
  body: [
    { t: C.imagine - 0.2, hrot: -8, nod: -0.8, d: 0.4, ease: "soft" },
    { t: CASE_HIT, x: 60, rot: 6, y: -34, hrot: 4, nod: 0, turn: -0.6, d: 0.09, ease: "out" }, // bumped
    { t: CASE_HIT + 0.12, x: 30, rot: 2, y: 0, d: 0.3 },
    { t: CASE_HIT + 0.45, rot: 0, turn: 0, hrot: 0, d: 0.35, ease: "soft" },
    { t: BEANIE, y: 22, sy: 0.95, d: 0.08, ease: "out" },
    { t: BEANIE + 0.1, y: 0, sy: 1, d: 0.25 },
    { t: JACKET, sx: 1.06, sy: 0.96, d: 0.08, ease: "out" },
    { t: JACKET + 0.1, sx: 1, sy: 1, d: 0.25 },
    { t: FREEZE + 0.1, sy: 0.96, y: 18, hy: 12, d: 0.3, ease: "out" }, // hunches against the cold
    { t: C.somebody - 0.1, turn: 0.4, hrot: 5, d: 0.25, ease: "soft" },
    { t: C.cold - 0.15, turn: 0, hrot: 0, d: 0.25, ease: "soft" },
    { t: SHAKE_OFF, y: -30, sy: 1.05, hy: 0, d: 0.12, ease: "out" },
  ],
};

export const Scene4Daydream: React.FC<{ t: number }> = ({ t }) => {
  if (t < START - 0.01) return null;
  const iris = easeInOut(prog(t, C.imagine + 0.05, 0.85)); // dream reveal
  const coldAmt = easeInOut(prog(t, FREEZE, 0.8));
  const snow = easeOut(prog(t, C.exp, 1.2));
  const caseP = easeOut(prog(t, CASE_IN, CASE_HIT - CASE_IN));
  const caseX = lerp(-260, 215, caseP) - spring(t, CASE_HIT, 0.4) * 55 * (t >= CASE_HIT ? 1 : 0);
  const blow = easeIn(prog(t, FREEZE, 0.6)); // wind takes the polaroids
  const p1 = spring(t, C.people, 0.45), p2 = spring(t, C.people + 0.32, 0.45);
  const off = prog(t, SHAKE_OFF, 0.3);
  const w = { beanie: spring(t, BEANIE, 0.4, 1.2) * (1 - off), scarf: spring(t, SCARF, 0.4, 1.2) * (1 - off), jacket: (t >= JACKET ? 0.5 + 0.5 * spring(t, JACKET, 0.4, 1.2) : 0) * (off > 0.5 ? 0 : 1) };
  const shiverCam = coldAmt * Math.sin(t * 47) * 2.2;
  const zoom = 1 + 0.1 * easeInOut(prog(t, FREEZE, 0.7)) - 0.1 * easeInOut(prog(t, SHAKE_OFF, 0.3));
  return (
    <AbsoluteFill>
      <Camera zoom={zoom} fx={540} fy={1150} shakeX={shiverCam + shake(t, CASE_HIT, 0.3) * 10}>
        <Studio t={t} wall={["#FFF8EC", "#FBE9CF"]} blob={BRAND.navy} accent={BRAND.orange} blobY={60} />
        {/* the daydream: Haarlem, revealed through a growing thought bubble */}
        <AbsoluteFill style={{ clipPath: `circle(${iris * 1500}px at 540px 780px)` }}>
          <Img src={staticFile("img/haarlem-square-students.jpg")} style={{ position: "absolute", height: "100%", left: "50%", transform: `translateX(${-50 - 4 * easeInOut(prog(t, C.imagine, 12))}%) scale(${1.08 + 0.06 * prog(t, C.imagine, 12)})`, filter: `blur(${5}px) saturate(${1.15 - coldAmt * 0.6}) brightness(${1.08 - coldAmt * 0.12})` }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,236,200,0.35), rgba(255,214,170,0.25))", opacity: 1 - coldAmt }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,170,255,0.5), rgba(200,225,255,0.55))", opacity: coldAmt }} />
          {/* snowy ground */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: snow }}>
            <path d="M0,1700 Q270,1610 540,1680 T1080,1650 L1080,1920 L0,1920 Z" fill="#fff" />
            <path d="M0,1760 Q300,1700 600,1760 T1080,1740 L1080,1920 L0,1920 Z" fill="#E8F3FF" />
          </svg>
        </AbsoluteFill>
        {/* dream bubbles rising from his head just before the reveal */}
        {iris < 1 && [0, 1, 2].map((k) => { const s = spring(t, C.imagine - 0.25 + k * 0.12, 0.3) * (1 - iris); return <div key={k} style={{ position: "absolute", left: 610 + k * 46, top: 800 - k * 78, width: 34 + k * 26, height: 34 + k * 26, borderRadius: "50%", background: "#fff", transform: `scale(${s})`, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }} />; })}
        <Snow t={t} amount={snow} wind={coldAmt} />
        {p1 > 0 && <Polaroid x={270 - blow * 900} y={470 - blow * 260} rot={-8 + (1 - Math.min(1, p1)) * -30 - blow * 120} scale={Math.max(0, p1)} src={staticFile("img/wittenborg-students.jpg")} label="new friends!" />}
        {p2 > 0 && <Polaroid x={800 - blow * 1500} y={540 - blow * 120} rot={7 + (1 - Math.min(1, p2)) * 30 - blow * 160} scale={Math.max(0, p2)} src={staticFile("img/haarlem-canal.jpg")} label="Haarlem" />}
        {t >= CASE_IN && <Suitcase x={caseX} y={1930} rot={t < CASE_HIT ? -5 : shake(t, CASE_HIT, 0.5, 26) * 7} roll={caseP * 900} />}
        <Actor perf={perf4} t={t} winter={w} cold={coldAmt * (1 - off)} />
        <Poof t={t} at={BEANIE - 0.04} x={540} y={900} size={150} />
        <Poof t={t} at={SCARF - 0.04} x={540} y={1330} size={140} />
        <Poof t={t} at={JACKET - 0.04} x={540} y={1560} size={230} />
        <Poof t={t} at={SHAKE_OFF + 0.08} x={540} y={1300} size={330} />
        <Breath t={t} from={FREEZE + 0.5} x={560} y={1300} />
        <Thermometer t={t} at={FREEZE + 0.3} x={800} y={520} />
        {t >= C.cold && t < SHAKE_OFF && (
          <div style={{ position: "absolute", left: 90, top: 420, transform: `rotate(${-10 + Math.sin(t * 40) * 2.5}deg) scale(${spring(t, C.cold, 0.35)})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 150, color: "#fff", WebkitTextStroke: "12px #1F5FD0", paintOrder: "stroke fill", textShadow: "8px 10px 0 #1F5FD0", letterSpacing: 4 }}>
            {"BRRR!".split("").map((ch, i) => <span key={i} style={{ display: "inline-block", transform: `translateY(${Math.sin(t * 38 + i * 1.9) * 7}px)` }}>{ch}</span>)}
          </div>
        )}
        <Frost amount={coldAmt * (1 - off)} />
      </Camera>
    </AbsoluteFill>
  );
};
