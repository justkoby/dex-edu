import React from "react";
import { Img } from "remotion";
import { clamp01, rnd, spring } from "../anim";
import { BRAND, FONT, H, W } from "../config/brand";

/** Falling snow. `amount` 0..1 fades it in. */
export const Snow: React.FC<{ t: number; amount: number; wind?: number }> = ({ t, amount, wind = 0 }) => {
  if (amount <= 0) return null;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: amount }}>
      {Array.from({ length: 70 }).map((_, i) => {
        const sp = 140 + rnd(i) * 260, r = 4 + rnd(i + 9) * 9;
        const y = ((rnd(i + 30) * H + t * sp) % (H + 60)) - 30;
        const x = ((rnd(i + 60) * W + Math.sin(t * 1.3 + i) * 30 + t * (60 + wind * 500) * (0.5 + rnd(i + 3))) % (W + 60)) - 30;
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.55 + rnd(i + 5) * 0.45} />;
      })}
    </svg>
  );
};

/** Frost creeping in from the frame edges. */
export const Frost: React.FC<{ amount: number }> = ({ amount }) => amount <= 0 ? null : (
  <div style={{ position: "absolute", inset: 0, opacity: amount, boxShadow: "inset 0 0 190px 70px rgba(214,238,255,0.95), inset 0 0 60px 20px #fff", pointerEvents: "none" }} />
);

/** Thermometer that plunges when the cold hits. */
export const Thermometer: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const s = spring(t, at, 0.45);
  if (t < at) return null;
  const drop = clamp01((t - at - 0.25) / 0.7), level = 150 - 118 * (1 - Math.pow(1 - drop, 3));
  const temp = Math.round(18 - 17 * (1 - Math.pow(1 - drop, 3)));
  const wob = Math.sin(t * 30) * 2 * drop;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x + wob} ${y}) scale(${s}) rotate(8)`}>
        <rect x={-74} y={-150} width={250} height={330} rx={40} fill="#fff" stroke={BRAND.navy} strokeWidth={7} />
        <rect x={-34} y={-110} width={44} height={200} rx={22} fill="#E7EEF8" stroke={BRAND.navy} strokeWidth={6} />
        <circle cx={-12} cy={112} r={40} fill={drop > 0.6 ? "#3D8BFF" : "#E5484D"} stroke={BRAND.navy} strokeWidth={6} />
        <rect x={-24} y={90 - level} width={24} height={level + 10} rx={12} fill={drop > 0.6 ? "#3D8BFF" : "#E5484D"} />
        {[-80, -40, 0, 40].map((yy) => <line key={yy} x1={18} y1={yy} x2={34} y2={yy} stroke={BRAND.navy} strokeWidth={5} strokeLinecap="round" />)}
        <text x={104} y={-20} textAnchor="middle" fontFamily={FONT.display} fontWeight={800} fontSize={84} fill={drop > 0.6 ? "#1F5FD0" : BRAND.ink}>{temp}°</text>
        <text x={104} y={36} textAnchor="middle" fontFamily={FONT.body} fontWeight={800} fontSize={26} fill="#5A6078">CELSIUS</text>
        {drop > 0.6 && <g transform="translate(104 100)">{[0, 60, 120].map((a) => <line key={a} x1={-30} y1={0} x2={30} y2={0} stroke="#3D8BFF" strokeWidth={9} strokeLinecap="round" transform={`rotate(${a})`} />)}</g>}
      </g>
    </svg>
  );
};

/** Breath vapour puffs while he shivers. */
export const Breath: React.FC<{ t: number; from: number; x: number; y: number }> = ({ t, from, x, y }) => {
  if (t < from) return null;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {[0, 1, 2].map((k) => {
        const p = (((t - from) / 1.3 + k / 3) % 1);
        return <g key={k} opacity={(1 - p) * 0.75}>
          <circle cx={x + 90 + p * 130} cy={y + 10 - p * 90} r={10 + p * 40} fill="#fff" />
          <circle cx={x + 120 + p * 150} cy={y - 10 - p * 70} r={6 + p * 28} fill="#fff" />
        </g>;
      })}
    </svg>
  );
};

export const Suitcase: React.FC<{ x: number; y: number; rot?: number; roll?: number }> = ({ x, y, rot = 0, roll = 0 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={8} rx={170} ry={22} fill="#000" opacity={0.18} />
      <path d="M-46,-560 L-46,-470 M46,-560 L46,-470" stroke="#4A5068" strokeWidth={14} strokeLinecap="round" />
      <rect x={-64} y={-590} width={128} height={38} rx={18} fill="#2B2F45" />
      <rect x={-150} y={-480} width={300} height={450} rx={44} fill="#C9590C" />
      <rect x={-150} y={-480} width={300} height={436} rx={44} fill={BRAND.orange} />
      <rect x={-150} y={-480} width={120} height={436} rx={44} fill="#FF9A4A" opacity={0.5} />
      {[-90, -30, 30, 90].map((xx) => <rect key={xx} x={xx - 7} y={-456} width={14} height={388} rx={7} fill="#C9590C" opacity={0.55} />)}
      {/* stickers: Ghana + Netherlands */}
      <g transform="translate(-92 -330) rotate(-9)"><rect width={110} height={72} rx={10} fill="#fff" /><rect x={5} y={5} width={100} height={20.7} fill="#CE1126" /><rect x={5} y={25.7} width={100} height={20.7} fill="#FCD116" /><rect x={5} y={46.4} width={100} height={20.6} fill="#006B3F" /><path d="M55,27 l3.2,9.8 h10.3 l-8.3,6 l3.2,9.8 l-8.4,-6 l-8.4,6 l3.2,-9.8 l-8.3,-6 h10.3 Z" fill="#000" transform="translate(0 -3) scale(1 0.95)" /></g>
      <g transform="translate(6 -210) rotate(7)"><rect width={110} height={72} rx={10} fill="#fff" /><rect x={5} y={5} width={100} height={20.7} fill="#AE1C28" /><rect x={5} y={46.4} width={100} height={20.6} fill="#21468B" /></g>
      {[-96, 96].map((xx) => <g key={xx} transform={`translate(${xx} -14) rotate(${roll})`}><circle r={30} fill="#2B2F45" /><circle r={11} fill="#8990A8" /><rect x={-3} y={-28} width={6} height={18} fill="#8990A8" /></g>)}
    </g>
  </svg>
);

export const Polaroid: React.FC<{ x: number; y: number; rot: number; scale: number; src: string; label: string; w?: number }> = ({ x, y, rot, scale, src, label, w = 400 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - (w * 0.82) / 2, width: w, transform: `rotate(${rot}deg) scale(${scale})`, background: "#fff", padding: "16px 16px 0", borderRadius: 10, boxShadow: "0 18px 34px rgba(13,19,48,0.35)" }}>
    <Img src={src} style={{ width: "100%", height: w * 0.6, objectFit: "cover", display: "block", borderRadius: 4 }} />
    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 36, color: BRAND.ink, textAlign: "center", padding: "6px 0 8px" }}>{label}</div>
  </div>
);
