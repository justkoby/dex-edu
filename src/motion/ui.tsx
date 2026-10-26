import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, clamp, expo, inOut } from "./tokens";

/** Text line that rises out of an overflow mask (the studio's signature reveal). `at`/`out` in local frames. */
export const MaskLine: React.FC<{
  children: React.ReactNode; at: number; out?: number; dur?: number; style?: React.CSSProperties; from?: "below" | "above"; blur?: number;
}> = ({ children, at, out, dur = 14, style, from = "below", blur = 8 }) => {
  const f = useCurrentFrame();
  const inP = expo(interpolate(f, [at, at + dur], [0, 1], clamp));
  const outP = out === undefined ? 0 : inOut(interpolate(f, [out, out + 10], [0, 1], clamp));
  const dir = from === "below" ? 1 : -1;
  const y = (1 - inP) * 112 * dir - outP * 112 * dir;
  const vel = Math.abs(1 - inP) + outP;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em", ...style }}>
      <div style={{ transform: `translateY(${y}%)`, filter: vel > 0.02 ? `blur(${vel * blur}px)` : undefined, willChange: "transform" }}>{children}</div>
    </div>
  );
};

/** Orange sweep bar: the recurring cut device. Covers the frame left->right, then exits right (progress 0..2). */
export const Sweep: React.FC<{ start: number; color?: string; dur?: number; angle?: number }> = ({ start, color = C.orange, dur = 16, angle = -8 }) => {
  const f = useCurrentFrame();
  const u = interpolate(f, [start, start + dur], [0, 1], clamp);
  const p = u < 0.5 ? inOut(u * 2) : 1 + inOut(u * 2 - 1); // 0 -> 1 covers the frame, 1 -> 2 exits
  if (u <= 0 || u >= 1) return null;
  const x = (p - 1) * 130;
  return (
    <div style={{ position: "absolute", inset: "-20% -20%", background: color, transform: `translateX(${x}%) skewX(${angle}deg)`, zIndex: 50 }} />
  );
};

/** Thin line that draws itself. */
export const DrawLine: React.FC<{ at: number; dur?: number; vertical?: boolean; length: number; color?: string; thickness?: number; style?: React.CSSProperties }> = ({
  at, dur = 18, vertical, length, color = C.orange, thickness = 6, style,
}) => {
  const f = useCurrentFrame();
  const p = expo(interpolate(f, [at, at + dur], [0, 1], clamp));
  return (
    <div style={{ position: "absolute", background: color, width: vertical ? thickness : length * p, height: vertical ? length * p : thickness, ...style }} />
  );
};

export const PinIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.orange }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill={color} />
    <circle cx="12" cy="10" r="2.6" fill={C.navyDeep} />
  </svg>
);

/** Top-down aircraft silhouette pointing up (-y). Rotate by heading. */
export const PlaneIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 1.5c.9 0 1.5 1 1.5 2.3v5.6l8.2 5v2.2l-8.2-2.3v4.6l2.6 2v1.6L12 21.4l-4.1 1.1v-1.6l2.6-2v-4.6l-8.2 2.3v-2.2l8.2-5V3.8c0-1.3.6-2.3 1.5-2.3z" fill={color} />
  </svg>
);

/** Corner brackets that draw in around the frame. */
export const Brackets: React.FC<{ at: number; inset?: number; size?: number; color?: string; thickness?: number }> = ({ at, inset = 56, size = 90, color = C.white, thickness = 5 }) => {
  const f = useCurrentFrame();
  const p = expo(interpolate(f, [at, at + 20], [0, 1], clamp));
  const s = size * p;
  const base: React.CSSProperties = { position: "absolute", width: s, height: s, borderColor: color, borderStyle: "solid", borderWidth: 0, opacity: p };
  return (
    <>
      <div style={{ ...base, left: inset, top: inset + 200, borderTopWidth: thickness, borderLeftWidth: thickness }} />
      <div style={{ ...base, right: inset, top: inset + 200, borderTopWidth: thickness, borderRightWidth: thickness }} />
      <div style={{ ...base, left: inset, bottom: inset + 440, borderBottomWidth: thickness, borderLeftWidth: thickness }} />
      <div style={{ ...base, right: inset, bottom: inset + 440, borderBottomWidth: thickness, borderRightWidth: thickness }} />
    </>
  );
};

/** Display line fitted to an exact width using SVG textLength (justified, oversized headline typography). */
export const FitText: React.FC<{ text: string; width: number; size: number; fill: string; wdth?: number; stroke?: string; strokeWidth?: number; opacity?: number }> = ({
  text, width, size, fill, wdth = 62, stroke, strokeWidth, opacity,
}) => (
  <svg width={width} height={size * 0.8} viewBox={`0 0 ${width} ${size * 0.8}`} style={{ display: "block", overflow: "visible" }} opacity={opacity}>
    <text
      x={0} y={size * 0.76} fontSize={size} textLength={width} lengthAdjust="spacingAndGlyphs" fill={fill}
      stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
      style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontVariationSettings: `"wdth" ${wdth}`, textTransform: "uppercase" }}
    >
      {text}
    </text>
  </svg>
);
