import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, SAFE } from "../config/brand";

const GREEN = "#35d07f";

/**
 * Generic video-call card (no third-party branding). Starts as a big "calling" card, then morphs to a
 * compact status pill after `connectAt` (local frames). Set connectAt very negative for pill-only.
 */
export const CallCard: React.FC<{ name: string; avatar: string; connectAt: number; top?: number }> = ({
  name, avatar, connectAt, top = SAFE.top + 70,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - 4, fps, config: { damping: 13, stiffness: 150 } });
  const m = interpolate(f, [connectAt + 16, connectAt + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = m * m * (3 - 2 * m);
  const connected = f >= connectAt;
  const w = 880 - 380 * e;
  const h = 290 - 170 * e;
  const av = 160 - 90 * e;
  const secs = Math.max(0, Math.floor((f - connectAt) / fps));
  const dots = ".".repeat(1 + (Math.floor(f / 8) % 3));
  const rings = connected ? [] : [0, 1, 2];
  return (
    <div
      style={{
        position: "absolute", left: (1080 - w) / 2, top, width: w, height: h, borderRadius: 40 - 14 * e,
        background: "rgba(23,35,90,.9)", border: "2px solid rgba(255,255,255,.14)", boxShadow: "0 24px 60px rgba(0,0,0,.35)",
        display: "flex", alignItems: "center", gap: 28, padding: `0 ${40 - 14 * e}px`, fontFamily: BRAND.font, color: BRAND.white,
        opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-60, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
      }}
    >
      <div style={{ position: "relative", width: av, height: av, flex: "none" }}>
        {rings.map((r) => {
          const t = ((f + r * 14) % 42) / 42;
          return (
            <div key={r} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${BRAND.orange}`, opacity: 0.6 * (1 - t), transform: `scale(${1 + t * 0.9})` }} />
          );
        })}
        <Img src={staticFile(avatar)} style={{ width: av, height: av, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 25%", border: `4px solid ${connected ? GREEN : BRAND.orange}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 30 - 8 * e, fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>
          {connected ? (
            <span style={{ color: GREEN }}>● {e > 0.6 ? `CONNECTED · 00:${String(secs).padStart(2, "0")}` : "CONNECTED"}</span>
          ) : (
            <>VIDEO CALLING{dots}</>
          )}
        </div>
        <div style={{ fontSize: 76 - 34 * e, fontWeight: 900, lineHeight: 1.05 }}>{name}</div>
      </div>
    </div>
  );
};
