import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp01, easeInOut, easeOut, lerp, prog, shake, spring } from "../anim";
import { CoinBurst, MoneyWord } from "../components/MoneyWord";
import { loadFonts } from "../components/fonts";
import { BRAND, FONT } from "../config/brand";
import { TL, cue } from "../data/tl";

loadFonts();
/**
 * Scene 1 – "stills" approach (the Stable Plus method): COMPLETE character illustrations, one per emotional beat, cut together
 * with push-ins, punches and shakes; captions, pop-ups and the MONEY gag animate independently. No rig, no separate body parts.
 *
 * This proof uses only the two cut-outs supplied so far (presenting, thinking). Shots marked NEEDS IMAGE reuse one of them as a
 * stand-in – see docs/SCENE1_STILLS_PLAN.md for the images still required.
 */
const C = { chale: cue("chale"), why: cue("why"), abroad: cue("abroad"), first: cue("first"), mind: cue("mind"), money: cue("money"), exactly: cue("exactly"), exEnd: cue("vo02_end") };
export const S1_STILLS_END = TL.scenes.s1[1];

type Shot = { from: number; img: "presenting" | "thinking"; bg: "burst" | "room"; z0: number; z1: number; fx: number; fy: number; x?: number; flip?: boolean; note?: string };
// from = cut time. z0 -> z1 = slow push across the shot. (fx, fy) = point of the image the push aims at, in image fractions.
export const SHOTS: Shot[] = [
  { from: 0, img: "presenting", bg: "burst", z0: 1.0, z1: 1.06, fx: 0.45, fy: 0.3 }, // "Chale," – friendly, open hand
  { from: C.why - 0.12, img: "thinking", bg: "room", z0: 1.0, z1: 1.1, fx: 0.42, fy: 0.25, note: "NEEDS IMAGE: weary / skeptical asking" }, // "why is it that anytime somebody mentions studying abroad,"
  { from: C.first - 0.1, img: "thinking", bg: "room", z0: 1.45, z1: 1.72, fx: 0.42, fy: 0.24 }, // close-up push: "the first thing that comes to mind is…"
  { from: C.money - 0.02, img: "presenting", bg: "burst", z0: 0.98, z1: 1.0, fx: 0.45, fy: 0.3, x: 70, note: "NEEDS IMAGE: shocked recoil" }, // MONEY!
  { from: C.exactly - 0.12, img: "presenting", bg: "room", z0: 1.38, z1: 1.46, fx: 0.45, fy: 0.27, note: "NEEDS IMAGE: deadpan point at viewer" }, // "Exactly!"
];

const IMG_W = 1122, IMG_H = 1402, BASE = 1180 / IMG_W; // base: character fills the frame width, feet of the image on the bottom edge

const Burst: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #FFD45A 0%, ${BRAND.orange} 70%, #C9590C 100%)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: "50%", top: "46%", width: 3200, height: 3200, marginLeft: -1600, marginTop: -1600, transform: `rotate(${t * 5}deg)`, background: "repeating-conic-gradient(rgba(255,255,255,0.13) 0deg 9deg, rgba(255,255,255,0) 9deg 18deg)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,20,0,0.35) 100%)" }} />
  </AbsoluteFill>
);
const Room: React.FC<{ t: number; z: number }> = ({ t, z }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#8A5448" }}>
    <Img src={staticFile("character-stills/room-blur.jpg")} style={{ position: "absolute", left: "50%", top: "50%", width: "112%", height: "112%", objectFit: "cover", transform: `translate(-50%,-50%) scale(${1 + (z - 1) * 0.25})` }} />
    {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: `${(((i * 53) % 100) + t * (3 + (i % 3))) % 100}%`, width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5, borderRadius: "50%", background: "#FFE9C9", opacity: 0.25 }} />)}
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 50%, rgba(40,10,0,0.4) 100%)" }} />
  </AbsoluteFill>
);

const Bubble: React.FC<{ t: number; at: number; out: number; x: number; y: number; text: string; rot: number }> = ({ t, at, out, x, y, text, rot }) => {
  if (t < at || t > out) return null;
  const s = spring(t, at, 0.4, 1.2) * (1 - easeOut(prog(t, out - 0.15, 0.15)));
  return (
    <div style={{ position: "absolute", left: x, top: y + Math.sin(t * 2.4 + x) * 6, transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: "50% 100%", background: "#fff", color: "#1D1730", fontFamily: FONT.display, fontWeight: 800, fontSize: 52, padding: "12px 34px 6px", borderRadius: 40, boxShadow: "0 12px 26px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
      {text}
      <div style={{ position: "absolute", left: "50%", bottom: -14, width: 30, height: 30, marginLeft: -15, background: "#fff", borderRadius: 8, transform: "rotate(45deg)" }} />
    </div>
  );
};

/** Bold caption in the reference style: white caps, dark edge, key words in yellow. */
const HOT = new Set(["CHALE,", "STUDYING", "ABROAD,", "MIND", "EXACTLY!"]);
const BoldCaption: React.FC<{ t: number }> = ({ t }) => {
  const c = TL.captions.find((k) => t >= k.t0 - 0.03 && t < k.t1 - 0.02);
  if (!c) return null;
  const s = 0.9 + 0.1 * spring(t, c.t0 - 0.03, 0.25);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, textAlign: "center", transform: `scale(${s})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 86, lineHeight: 1.0, letterSpacing: 1, color: "#fff", WebkitTextStroke: "14px #2A1408", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(42,20,8,0.55)" }}>
      {c.text.toUpperCase().split(" ").map((w, i) => <span key={i} style={{ color: HOT.has(w) ? "#FFD23F" : "#fff" }}>{w} </span>)}
    </div>
  );
};

export const Scene1Stills: React.FC<{ notes?: boolean }> = ({ notes = false }) => {
  const t = useCurrentFrame() / TL.fps;
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].from) i++;
  const sh = SHOTS[i], end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : S1_STILLS_END, since = t - sh.from;
  // every cut lands with a small scale punch; the shot then creeps in; the image "breathes" so a still never looks frozen
  const punch = 1 + 0.07 * Math.exp(-since * 9) * Math.cos(since * 16) * (i > 0 ? 1 : 0);
  const z = lerp(sh.z0, sh.z1, easeInOut(prog(t, sh.from, end - sh.from))) * punch;
  const enter = i === 0 ? spring(t, 0.08, 0.5) : 1;
  const hit = i === 3; // MONEY shot: knocked sideways, then settles
  const knock = hit ? Math.exp(-since * 3.2) : 0;
  const breathe = 1 + Math.sin(t * 1.9) * 0.004, sway = Math.sin(t * 0.9) * 0.5;
  const talk = (TL.env[Math.round(t * TL.fps)] ?? 0); // tiny voice-driven nod so he reacts to his own delivery
  const w = IMG_W * BASE, h = IMG_H * BASE;
  const sx = shake(t, C.money, 0.6) * 30, sy = shake(t, C.money, 0.6, 51) * 38;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${sx * 0.4}px, ${sy * 0.4}px)` }}>{sh.bg === "burst" ? <Burst t={t} /> : <Room t={t} z={z} />}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: "absolute", left: 540 - w / 2 + (sh.x ?? 0) + knock * 120, top: 1920 - h + (1 - enter) * 1500 + knock * 60 - talk * 5, width: w, height: h, transformOrigin: `${sh.fx * 100}% ${sh.fy * 100}%`, transform: `scale(${z}) rotate(${sway + knock * 9}deg)` }}>
          <Img src={staticFile(`character-stills/${sh.img}.webp`)} style={{ width: "100%", height: "100%", transformOrigin: "50% 100%", transform: `scaleY(${breathe * (1 - knock * 0.05)})`, filter: "drop-shadow(0 0 10px rgba(255,236,200,0.55)) drop-shadow(0 26px 30px rgba(30,10,0,0.35))" }} />
        </div>
        {/* thought bubbles: what "studying abroad" makes people think of… the last one is replaced by the MONEY slam */}
        <Bubble t={t} at={C.abroad - 0.1} out={C.first - 0.1} x={90} y={300} text="Visa?" rot={-5} />
        <Bubble t={t} at={C.abroad + 0.3} out={C.first - 0.1} x={640} y={240} text="Flights?" rot={4} />
        <Bubble t={t} at={C.abroad + 0.7} out={C.first - 0.1} x={520} y={470} text="School fees?!" rot={-2} />
        <MoneyWord t={t} hit={C.money} swat={C.exactly - 0.15} />
        <CoinBurst t={t} at={C.money} x={470} y={760} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: t >= C.money ? clamp01(1 - (t - C.money) / 0.12) * 0.8 : 0 }} />
      <BoldCaption t={t} />
      {notes && sh.note && <div style={{ position: "absolute", left: 40, top: 60, background: "#E5484D", color: "#fff", fontFamily: FONT.body, fontWeight: 800, fontSize: 30, padding: "10px 20px", borderRadius: 12 }}>{sh.note}</div>}
      <Audio src={staticFile("audio/stems/narration.wav")} />
      <Audio src={staticFile("audio/stems/music.wav")} volume={(f) => TL.duck?.[f] ?? 0.5} />
      <Audio src={staticFile("audio/stems/sfx.wav")} />
    </AbsoluteFill>
  );
};
