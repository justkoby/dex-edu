import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, SAFE } from "../config/brand";
import { T, sec } from "../config/timeline";

const GREEN = "#35d07f";
const RED = "#ff5a5f";

const Icon: React.FC<{ kind: "mic" | "cam" | "end"; size: number }> = ({ kind, size }) => {
  const bg = kind === "end" ? RED : "rgba(255,255,255,.16)";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {kind === "mic" && (<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>)}
        {kind === "cam" && (<><rect x="3" y="7" width="12" height="10" rx="2.5" /><path d="M15 11l6-3v8l-6-3z" /></>)}
        {kind === "end" && <path d="M4 15c5-4 11-4 16 0l-2 3-3-1.5v-2.5c-2-.7-4-.7-6 0V16.5L6 18z" fill="#fff" stroke="none" />}
      </svg>
    </div>
  );
};

/**
 * Generic video-call card (no third-party branding): big "calling" card -> compact status pill with timer and
 * controls. Timer runs on the ABSOLUTE timeline (`base` = frame at which the parent Sequence starts) so it keeps
 * counting across scenes. `endAt` (absolute seconds) flips it to "CALL ENDED".
 */
export const CallCard: React.FC<{
  name: string; avatar: string; base: number; compact?: boolean; endAt?: number; top?: number;
}> = ({ name, avatar, base, compact = false, endAt, top = SAFE.top + 70 }) => {
  const local = useCurrentFrame();
  const abs = local + base;
  const { fps } = useVideoConfig();
  const connectF = sec(T.connectAt);
  const enter = spring({ frame: local - (compact ? 0 : 4), fps, config: { damping: 13, stiffness: 150 } });
  const m = compact ? 1 : interpolate(abs, [connectF + 14, connectF + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = m * m * (3 - 2 * m);
  const connected = abs >= connectF;
  const ended = endAt !== undefined && abs >= sec(endAt);
  const w = 880 - 220 * e;
  const h = 290 - 170 * e;
  const av = 160 - 90 * e;
  const secs = Math.max(0, Math.floor((abs - connectF) / fps));
  const timer = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const dots = ".".repeat(1 + (Math.floor(abs / 8) % 3));
  const rings = connected ? [] : [0, 1, 2];
  const ctrl = interpolate(e, [0.7, 1], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: (1080 - w) / 2, top, width: w, height: h, borderRadius: 40 - 14 * e,
        background: "rgba(23,35,90,.9)", border: "2px solid rgba(255,255,255,.14)", boxShadow: "0 24px 60px rgba(0,0,0,.35)",
        display: "flex", alignItems: "center", gap: 20 + 8 * (1 - e), padding: `0 ${34 - 12 * e}px`, fontFamily: BRAND.font, color: BRAND.white,
        opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-50, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <div style={{ position: "relative", width: av, height: av, flex: "none" }}>
        {rings.map((r) => {
          const t = ((abs + r * 14) % 42) / 42;
          return <div key={r} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${BRAND.orange}`, opacity: 0.6 * (1 - t), transform: `scale(${1 + t * 0.9})` }} />;
        })}
        <Img src={staticFile(avatar)} style={{ width: av, height: av, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 25%", border: `4px solid ${ended ? RED : connected ? GREEN : BRAND.orange}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 30 - 9 * e, fontWeight: 700, opacity: 0.85, letterSpacing: 1 }}>
          {ended ? (
            <span style={{ color: RED }}>● CALL ENDED · {timer}</span>
          ) : connected ? (
            <span style={{ color: GREEN }}>● {e > 0.6 ? `${timer}` : "CONNECTED"}</span>
          ) : (
            <>VIDEO CALLING{dots}</>
          )}
        </div>
        <div style={{ fontSize: 76 - 36 * e, fontWeight: 900, lineHeight: 1.05 }}>{name}</div>
      </div>
      <div style={{ display: "flex", gap: 10, opacity: ctrl * (ended ? 0.45 : 1), width: ctrl > 0 ? "auto" : 0, overflow: "hidden" }}>
        <Icon kind="mic" size={46} />
        <Icon kind="cam" size={46} />
        <Icon kind="end" size={46} />
      </div>
    </div>
  );
};

/** Small self-view / remote-view window. `pop` springs it in; `fromFrame` is the local frame it appears. */
export const Pip: React.FC<{ children: React.ReactNode; left?: number; top?: number; w?: number; h?: number; fromFrame?: number }> = ({
  children, left = 60, top = 490, w = 230, h = 310, fromFrame = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - fromFrame, fps, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: 28, overflow: "hidden", border: "4px solid #fff", boxShadow: "0 16px 40px rgba(0,0,0,.4)", opacity: Math.min(1, p * 2), transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`, transformOrigin: "0% 0%" }}>
      {children}
    </div>
  );
};
