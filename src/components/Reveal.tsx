import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type RevealKind = "circle" | "wipe" | "bars" | "none";
const ease = Easing.bezier(0.77, 0, 0.18, 1);

/** Masked reveal for a whole layer, driven by the local frame. Child also eases from a slight zoom. */
export const Reveal: React.FC<{
  kind: RevealKind; dur?: number; origin?: [number, number]; zoom?: number; children: React.ReactNode;
}> = ({ kind, dur = 16, origin = [50, 50], zoom = 1.12, children }) => {
  const f = useCurrentFrame();
  const p = ease(interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp" }));
  let clip = "none";
  if (kind === "circle") clip = `circle(${p * 160}% at ${origin[0]}% ${origin[1]}%)`;
  if (kind === "wipe") clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
  if (kind === "bars") clip = `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`;
  const s = kind === "none" ? 1 : zoom - (zoom - 1) * p;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${origin[0]}% ${origin[1]}%` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Decaying camera-shake offset (px). */
export const shake = (frame: number, amp: number, decay = 8) => ({
  x: Math.sin(frame * 2.7) * amp * Math.exp(-frame / decay),
  y: Math.cos(frame * 3.3) * amp * Math.exp(-frame / decay),
});
