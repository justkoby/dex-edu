import React from "react";
import { spring } from "../anim";
import { BRAND, FONT } from "../config/brand";
import { TL } from "../data/tl";

/** Phrase captions timed from the narration (src/data/timeline.json → captions). Toggle with the `captions` prop on the film. */
export const Captions: React.FC<{ t: number; y?: number }> = ({ t, y = 1508 }) => {
  const c = TL.captions.find((k) => t >= k.t0 - 0.03 && t < k.t1 - 0.02);
  if (!c) return null;
  const s = 0.86 + 0.14 * spring(t, c.t0 - 0.03, 0.28);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{
        transform: `scale(${s})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 66, lineHeight: 1.05, color: "#fff", padding: "12px 34px 8px",
        background: BRAND.navyDeep, borderRadius: 26, border: `5px solid #fff`, boxShadow: "0 10px 0 rgba(13,19,48,0.35)", whiteSpace: "nowrap", letterSpacing: 0.5,
      }}>{c.text}</div>
    </div>
  );
};
