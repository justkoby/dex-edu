import React from "react";
import { AbsoluteFill } from "remotion";
import { noise } from "../anim";
import { BRAND, H, W } from "../config/brand";

/** Virtual camera: zoom about a focus point + shake. Everything inside moves together (character AND graphics). */
export const Camera: React.FC<{ zoom?: number; fx?: number; fy?: number; shakeX?: number; shakeY?: number; rot?: number; children: React.ReactNode }> = ({ zoom = 1, fx = 540, fy = 1100, shakeX = 0, shakeY = 0, rot = 0, children }) => (
  <AbsoluteFill style={{ transformOrigin: `${fx}px ${fy}px`, transform: `translate(${shakeX}px, ${shakeY}px) scale(${zoom}) rotate(${rot}deg)` }}>{children}</AbsoluteFill>
);

/** Warm "studio" backdrop from the character sheet: soft gradient wall, a big colour blob, drifting shapes, key-light glow. */
export const Studio: React.FC<{ t: number; wall: [string, string]; blob: string; accent: string; blobX?: number; blobY?: number; dark?: boolean }> = ({ t, wall, blob, accent, blobX = 0, blobY = 0, dark }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${wall[0]} 0%, ${wall[1]} 100%)`, overflow: "hidden" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="keyLight" cx="30%" cy="22%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.16 : 0.55} /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={dark ? 0.45 : 0.22} /></radialGradient>
      </defs>
      <g transform={`translate(${blobX + noise(t * 0.25) * 16} ${blobY + noise(t * 0.2 + 5) * 12})`}>
        <path d="M-80,1960 C-120,1300 60,760 420,700 C820,640 1120,900 1180,1380 C1210,1640 1160,1960 1160,1960 Z" fill={blob} />
        <path d="M-80,1960 C-120,1300 60,760 420,700 C600,672 760,712 890,800 C640,760 420,820 260,1000 C80,1200 0,1560 20,1960 Z" fill="#fff" opacity={0.14} />
      </g>
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 90 + ((i * 263) % 940), y0 = 260 + ((i * 419) % 1100), r = 10 + (i % 4) * 7;
        const y = y0 + Math.sin(t * 0.5 + i * 1.7) * 26, o = 0.16 + (i % 3) * 0.06;
        return i % 3 === 0 ? <rect key={i} x={x} y={y} width={r * 1.6} height={r * 1.6} rx={6} fill={accent} opacity={o} transform={`rotate(${t * 14 + i * 40} ${x + r * 0.8} ${y + r * 0.8})`} />
          : i % 3 === 1 ? <circle key={i} cx={x} cy={y} r={r} fill={accent} opacity={o} />
          : <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={accent} strokeWidth={5} opacity={o + 0.08} />;
      })}
      <rect width={W} height={H} fill="url(#keyLight)" />
      <rect width={W} height={H} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>
);

/** Cartoon wipe: two slanted colour bands sweep across the cut at time `at`. */
export const Wipe: React.FC<{ t: number; at: number; colors?: [string, string]; dir?: 1 | -1; d?: number }> = ({ t, at, colors = [BRAND.orange, BRAND.navy], dir = 1, d = 0.56 }) => {
  const p = (t - (at - d / 2)) / d;
  if (p <= 0 || p >= 1) return null;
  const band = (delay: number, color: string) => {
    const q = Math.max(0, Math.min(1, (p - delay) / (1 - 0.18)));
    const e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
    const x = dir === 1 ? -170 + e * 340 : 170 - e * 340;
    return <div style={{ position: "absolute", top: "-10%", left: "-35%", width: "170%", height: "120%", background: color, transform: `translateX(${x}%) skewX(${-12 * dir}deg)` }} />;
  };
  return <AbsoluteFill style={{ overflow: "hidden" }}>{band(0, colors[0])}{band(0.18, colors[1])}</AbsoluteFill>;
};

/** Soft "poof" cloud burst (clothes appearing, impacts). */
export const Poof: React.FC<{ t: number; at: number; x: number; y: number; size?: number; color?: string }> = ({ t, at, x, y, size = 150, color = "#fff" }) => {
  const p = (t - at) / 0.5;
  if (p <= 0 || p >= 1) return null;
  const e = 1 - Math.pow(1 - p, 3);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.4, r = size * (0.25 + e * 0.85);
        return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * 0.8} r={size * 0.42 * (1 - p * 0.7)} fill={color} opacity={(1 - p) * 0.95} />;
      })}
      <circle cx={x} cy={y} r={size * 0.6 * (1 - p)} fill={color} opacity={1 - p} />
    </svg>
  );
};
