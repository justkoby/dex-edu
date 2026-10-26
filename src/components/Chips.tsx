import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, SAFE } from "../config/brand";

/** Name chip + "illustrative skit" tag, kept inside the top safe area. */
export const NameChip: React.FC<{ name: string; place: string; delay?: number }> = ({ name, place, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div
      style={{
        position: "absolute", top: SAFE.top - 20, left: SAFE.left, display: "flex", gap: 12, alignItems: "center",
        fontFamily: BRAND.font, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-24, 0])}px)`,
      }}
    >
      <div style={{ background: BRAND.orange, color: BRAND.white, fontWeight: 900, fontSize: 30, padding: "12px 22px", borderRadius: 14, letterSpacing: 1 }}>
        {name.toUpperCase()}
        <span style={{ fontWeight: 700, opacity: 0.9 }}> · {place.toUpperCase()}</span>
      </div>
      <div style={{ background: "rgba(23,35,90,.82)", color: BRAND.white, fontWeight: 700, fontSize: 22, padding: "12px 18px", borderRadius: 14, letterSpacing: 1.5 }}>
        ILLUSTRATIVE SKIT
      </div>
    </div>
  );
};
