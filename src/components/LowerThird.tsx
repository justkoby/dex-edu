import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../config/brand";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Clean university title: orange bar wipes in, then the name unmasks. `dur` = frames on screen. */
export const LowerThird: React.FC<{ label: string; title: string; top: number; dur: number }> = ({ label, title, top, dur }) => {
  const f = useCurrentFrame();
  const inP = ease(interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp" }));
  const txt = ease(interpolate(f, [6, 22], [0, 1], { extrapolateRight: "clamp" }));
  const out = interpolate(f, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, top, width: 880, opacity: out, transform: `translateX(${(1 - out) * -40}px)`, fontFamily: BRAND.font }}>
      <div style={{ display: "flex", clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)` }}>
        <div style={{ width: 14, background: BRAND.orange }} />
        <div style={{ background: "rgba(23,35,90,.94)", padding: "20px 30px 22px", color: BRAND.white, flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: BRAND.orange, transform: `translateY(${(1 - txt) * 20}px)`, opacity: txt }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.12, marginTop: 6, transform: `translateY(${(1 - txt) * 28}px)`, opacity: txt }}>{title}</div>
        </div>
      </div>
    </div>
  );
};
