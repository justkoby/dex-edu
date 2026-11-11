import React from "react";
import { Img, staticFile } from "remotion";
import layout from "./layout.json";
import parts from "./parts.json";

/**
 * Character v2 – assembled from the SUPPLIED illustration parts (NETHERLANDS/SCENE-01-MONEY/*.svg).
 * The artwork is used as drawn: each part is an untouched SVG, placed with a uniform scale (src/character2/layout.json),
 * so colours, line quality and proportions are the illustrator's. Animation only moves / rotates / squashes whole parts:
 *   head (tilt, nod, shift) · each eyebrow · eyes (blink, squint) · pupils (eye direction) · mouth (open, width, frown, "oh")
 *   each arm (three drawings: pointing, open palm, tucked behind the back) · body lean / bounce.
 * Units are the head artwork's units; the component draws into a box whose origin is the top-left of the head.
 */
export type ArmMode = "point" | "palm" | "back";
export type Pose2 = {
  bx: number; by: number; lean: number; squash: number; // body offset (units), rotation (deg) about the waist, vertical squash (1 = none)
  headRot: number; headX: number; headY: number;
  browLy: number; browLr: number; browRy: number; browRr: number; // + y = raised; + r = inner end down (angry)
  eye: number; lookX: number; lookY: number; // openness 0..1.15, pupil direction -1..1
  mouthOpen: number; mouthW: number; frown: number; oh: number; // 0..1, width scale, 0..1 flip to a frown, 0..1 rounded "oh"
  armLRot: number; armRRot: number; armLLift: number; armRLift: number; // rotation about the shoulder (deg), lift (units up)
};
export const POSE0: Pose2 = {
  bx: 0, by: 0, lean: 0, squash: 1, headRot: 0, headX: 0, headY: 0, browLy: 0, browLr: 0, browRy: 0, browRr: 0,
  eye: 1, lookX: 0, lookY: 0, mouthOpen: 0.35, mouthW: 1, frown: 0, oh: 0, armLRot: 0, armRRot: 0, armLLift: 0, armRLift: 0,
};

type PartName = keyof typeof parts;
const L = layout as unknown as Record<string, { x: number; y: number; s: number }> & { pivots: Record<string, [number, number]> };
const P = parts as Record<PartName, { w: number; h: number }>;
const src = (n: PartName) => staticFile(`character2/${n}.svg`);

const Part: React.FC<{ name: PartName; at?: string; style?: React.CSSProperties; origin?: [number, number] }> = ({ name, at, style, origin }) => {
  const l = L[at ?? name], w = P[name].w * l.s, h = P[name].h * l.s;
  return <Img src={src(name)} style={{ position: "absolute", left: l.x, top: l.y, width: w, height: h, transformOrigin: origin ? `${origin[0] - l.x}px ${origin[1] - l.y}px` : "50% 50%", ...style }} />;
};

const Arm: React.FC<{ side: "L" | "R"; mode: ArmMode; rot: number; lift: number; swap: number; back?: boolean }> = ({ side, mode, rot, lift, swap, back }) => {
  const pivot = L.pivots[side === "L" ? "shoulderL" : "shoulderR"];
  // a freshly switched arm swings up into place from the shoulder instead of popping
  const settle = (1 - swap) * (side === "L" ? -16 : 16), sc = 0.9 + 0.1 * swap;
  const tuck = back ? (side === "L" ? 24 : -24) : 0; // behind-the-back arm: elbow swings out so the upper arm fills the sleeve
  const mirror = (side === "L") !== (mode === "point"); // pointing arm is drawn for the screen-left shoulder, palm arm for the screen-right
  const name: PartName = mode === "point" ? "armPoint" : "armPalm";
  const at = mirror ? (mode === "point" ? "armPointMirror" : "armPalmMirror") : name;
  const l = L[at], w = P[name].w * l.s, h = P[name].h * l.s;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${pivot[0]}px ${pivot[1]}px`, transform: `translateY(${-lift + (back ? 30 : 0)}px) rotate(${rot + settle + tuck}deg) scale(${sc})`, opacity: Math.min(1, swap * 3) }}>
      <Img src={src(name)} style={{ position: "absolute", left: l.x, top: l.y, width: w, height: h, transform: mirror ? "scaleX(-1)" : undefined }} />
    </div>
  );
};

export type Character2Props = {
  pose: Pose2; armL: ArmMode; armR: ArmMode; armLSwap?: number; armRSwap?: number; blink?: number;
};

export const Character2: React.FC<Character2Props> = ({ pose: p, armL, armR, armLSwap = 1, armRSwap = 1, blink = 0 }) => {
  const neck = L.pivots.neck, open = Math.max(0.06, p.eye * (1 - blink));
  const eyeStyle = (side: "eyeL" | "eyeR"): React.CSSProperties => ({ transform: `scaleY(${open})` });
  const closed = open < 0.25;
  const mouthSy = (0.3 + 0.7 * p.mouthOpen) * (1 + p.oh * 0.25) * (1 - 2 * p.frown), mouthSx = p.mouthW * (1 - p.oh * 0.5);
  const arm = (side: "L" | "R", mode: ArmMode, layer: "back" | "front") =>
    (mode === "back") === (layer === "back") ? <Arm side={side} mode={mode === "back" ? "palm" : mode} rot={side === "L" ? p.armLRot : p.armRRot} lift={side === "L" ? p.armLLift : p.armRLift} swap={side === "L" ? armLSwap : armRSwap} back={mode === "back"} /> : null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "317px 1750px", transform: `translate(${p.bx}px, ${p.by}px) rotate(${p.lean}deg) scaleY(${p.squash})` }}>
      {arm("L", armL, "back")}{arm("R", armR, "back")}
      <Part name="torso" />
      {/* head group: tilts about the neck; the collar is drawn over the neck */}
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${neck[0]}px ${neck[1]}px`, transform: `translate(${p.headX}px, ${p.headY}px) rotate(${p.headRot}deg)` }}>
        <Part name="head" />
        <Part name="eyeL" origin={[L.pivots.eyeL[0], L.pivots.eyeL[1] + 30]} style={{ ...eyeStyle("eyeL"), opacity: closed ? 0 : 1 }} />
        <Part name="eyeR" origin={[L.pivots.eyeR[0], L.pivots.eyeR[1] + 30]} style={{ ...eyeStyle("eyeR"), opacity: closed ? 0 : 1 }} />
        {!closed && <Part name="irisL" origin={[L.pivots.eyeL[0], L.pivots.eyeL[1] + 30]} style={{ transform: `translate(${p.lookX * 15}px, ${p.lookY * 11}px) scaleY(${Math.min(1, open * 1.08)})` }} />}
        {!closed && <Part name="irisR" origin={[L.pivots.eyeR[0], L.pivots.eyeR[1] + 30]} style={{ transform: `translate(${p.lookX * 15}px, ${p.lookY * 11}px) scaleY(${Math.min(1, open * 1.08)})` }} />}
        {closed && [L.pivots.eyeL, L.pivots.eyeR].map(([ex, ey], i) => (
          <svg key={i} style={{ position: "absolute", left: ex - 80, top: ey - 10, overflow: "visible" }} width={160} height={70} viewBox="0 0 160 70">
            <path d="M12,34 Q80,62 148,34" fill="none" stroke="#0E0808" strokeWidth={9} strokeLinecap="round" />
          </svg>
        ))}
        <Part name="mouth" origin={[L.pivots.mouth[0], L.pivots.mouth[1] + (p.frown > 0.5 ? 40 : 0)]} style={{ transform: `translateY(${p.oh * 14}px) scale(${mouthSx}, ${mouthSy})` }} />
        <Part name="hair" />
        <Part name="browL" origin={[240, 222]} style={{ transform: `translateY(${-p.browLy}px) rotate(${-p.browLr}deg)` }} />
        <Part name="browR" origin={[410, 222]} style={{ transform: `translateY(${-p.browRy}px) rotate(${p.browRr}deg)` }} />
      </div>
      <Part name="polo" />
      {arm("R", armR, "front")}{arm("L", armL, "front")}
    </div>
  );
};
