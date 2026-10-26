import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../config/brand";

/** Energetic reveal: orange slab slams across the frame and "BUDAPEST!" stamps in letter by letter. */
export const TitleBurst: React.FC<{ dur?: number }> = ({ dur = 46 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inX = interpolate(f, [0, 9], [-1300, 0], { easing: Easing.bezier(0.2, 0.9, 0.2, 1), extrapolateRight: "clamp" });
  const outX = interpolate(f, [dur - 10, dur], [0, 1400], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const letters = "BUDAPEST!".split("");
  const small = spring({ frame: f - 4, fps, config: { damping: 12, stiffness: 200 } });
  if (f > dur) return null;
  return (
    <AbsoluteFill style={{ fontFamily: BRAND.font, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(23,35,90,${interpolate(f, [0, 6, dur - 8, dur], [0, 0.6, 0.6, 0])})` }} />
      <div style={{ position: "absolute", left: -80, right: -80, top: 640, height: 430, background: BRAND.orange, transform: `translateX(${inX + outX}px) rotate(-4deg)`, boxShadow: "0 30px 80px rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: -80, right: -80, top: 600, height: 40, background: BRAND.white, transform: `translateX(${(inX + outX) * 1.4}px) rotate(-4deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, transform: `translateX(${outX * 0.6}px) rotate(-4deg)`, textAlign: "center", color: BRAND.white }}>
        <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: 4, opacity: small, transform: `translateY(${(1 - small) * 30}px)` }}>CHALE, I’M IN</div>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 150, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>
          {letters.map((c, i) => {
            const s = spring({ frame: f - 6 - i * 1.5, fps, config: { damping: 9, stiffness: 260, mass: 0.5 } });
            return (
              <span key={i} style={{ display: "inline-block", color: i === letters.length - 1 ? BRAND.navyDeep : BRAND.white, transform: `translateY(${(1 - s) * -120}px) scale(${0.4 + 0.6 * s})`, opacity: Math.min(1, s * 2) }}>{c}</span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
