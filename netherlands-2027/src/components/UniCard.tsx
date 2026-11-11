import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND, FONT } from "../config/brand";

export const CARD_W = 470, CARD_H = 600;
/** University info card (photo, logo, tuition). Positioned by its centre so the character can shove it around. */
export const UniCard: React.FC<{
  x: number; y: number; scale?: number; rot?: number; photo: string; logo: string; logoH?: number; name: string; sub: string; city: string;
  bachelor: string; master: string; color: string; glow?: number;
}> = ({ x, y, scale = 1, rot = 0, photo, logo, logoH = 62, name, sub, city, bachelor, master, color, glow = 0 }) => {
  const row = (label: string, value: string, hi: boolean) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "13px 18px 7px", borderRadius: 18, background: hi ? "#FFF1E4" : "#F3F5FB", marginTop: 10 }}>
      <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 29, color: BRAND.ink }}>{label}</span>
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 54, color: hi ? "#C9480A" : BRAND.navy, lineHeight: 1 }}>{value}<span style={{ fontSize: 22, fontWeight: 700 }}>/yr</span></span>
    </div>
  );
  return (
    <div style={{
      position: "absolute", left: x - CARD_W / 2, top: y - CARD_H / 2, width: CARD_W, height: CARD_H, transform: `rotate(${rot}deg) scale(${scale})`,
      background: "#fff", borderRadius: 36, overflow: "hidden", boxShadow: `0 ${18 + glow * 10}px ${34 + glow * 20}px rgba(13,19,48,${0.28 + glow * 0.1}), 0 0 0 ${6 + glow * 4}px ${glow > 0.05 ? BRAND.yellow : "#fff"}`,
    }}>
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position: "absolute", left: 16, bottom: 12, fontFamily: FONT.body, fontWeight: 800, fontSize: 22, color: "#fff", background: color, borderRadius: 14, padding: "5px 14px", letterSpacing: 1 }}>{city.toUpperCase()}</div>
      </div>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, height: 76 }}>
          <Img src={staticFile(logo)} style={{ height: logoH, maxWidth: 150, objectFit: "contain" }} />
          <div>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: BRAND.ink, lineHeight: 0.95 }}>{name}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 17, color: "#5A6078", marginTop: 2 }}>{sub}</div>
          </div>
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 17, letterSpacing: 2.5, color: "#8990A8", marginTop: 12 }}>TUITION · INDICATIVE</div>
        {row("Bachelor's", bachelor, false)}
        {row("Master's", master, true)}
      </div>
    </div>
  );
};
