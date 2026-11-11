import React from "react";
import { clamp01, spring } from "../anim";
import { BRAND, FONT } from "../config/brand";
import { CITY, NEIGHBOURS_D, NL_D, NL_H, NL_W } from "../data/nlMap";

/** Netherlands map "sticker" (real outline, Natural Earth). stretchX/Y let the character pull it like rubber. */
export const NLMap: React.FC<{
  t: number; x: number; y: number; scale: number; rot?: number; stretchX?: number; stretchY?: number; opacity?: number;
  stampAt?: number; pinsAt?: number; labelAt?: number;
}> = ({ t, x, y, scale, rot = 0, stretchX = 1, stretchY = 1, opacity = 1, stampAt = 1e9, pinsAt = 1e9, labelAt = 1e9 }) => {
  const stamp = t >= stampAt ? spring(t, stampAt, 0.35) : 0;
  const pin = (key: "haarlem" | "apeldoorn", label: string, delay: number, side: 1 | -1) => {
    const s = t >= pinsAt + delay ? spring(t, pinsAt + delay, 0.45) : 0;
    if (s <= 0) return null;
    const [px, py] = CITY[key];
    return (
      <g transform={`translate(${px} ${py})`}>
        <circle r={16 + 10 * Math.sin(t * 5 + delay * 9) ** 2} fill={BRAND.orange} opacity={0.25} />
        <g transform={`scale(${s})`}>
          <path d="M0,0 C-26,-34 -30,-52 -30,-64 A30,30 0 1 1 30,-64 C30,-52 26,-34 0,0 Z" fill={BRAND.orange} stroke="#fff" strokeWidth={6} />
          <circle cy={-64} r={11} fill="#fff" />
          <g transform={`translate(${side * 44} -70)`}>
            <rect x={side === 1 ? 0 : -label.length * 19 - 28} y={-25} width={label.length * 19 + 28} height={50} rx={25} fill="#fff" stroke={BRAND.navy} strokeWidth={4} />
            <text x={side === 1 ? 14 : -label.length * 19 - 14} y={11} fontFamily={FONT.display} fontWeight={800} fontSize={32} fill={BRAND.navy}>{label}</text>
          </g>
        </g>
      </g>
    );
  };
  const lab = t >= labelAt ? spring(t, labelAt, 0.4) : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
      <defs>
        <clipPath id="nlCard"><rect x={0} y={0} width={NL_W} height={NL_H} rx={54} /></clipPath>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE6FF" /><stop offset="1" stopColor="#8FCBF4" /></linearGradient>
        <filter id="nlShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0D1330" floodOpacity="0.3" /></filter>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale * stretchX} ${scale * stretchY}) translate(${-NL_W / 2} ${-NL_H / 2})`}>
        <g filter="url(#nlShadow)">
          <rect x={-14} y={-14} width={NL_W + 28} height={NL_H + 28} rx={66} fill="#fff" />
          <rect width={NL_W} height={NL_H} rx={54} fill="url(#sea)" />
        </g>
        <g clipPath="url(#nlCard)">
          {NEIGHBOURS_D.map((d, i) => <path key={i} d={d} fill="#E9F3E4" stroke="#fff" strokeWidth={3} />)}
          <path d={NL_D} fill="#C9590C" transform="translate(6 10)" opacity={0.55} />
          <path d={NL_D} fill={BRAND.orange} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
          {/* flag chip */}
          <g transform="translate(34 34)">
            <rect width={96} height={64} rx={10} fill="#fff" />
            <rect width={96} height={21.3} rx={0} fill="#AE1C28" /><rect y={42.7} width={96} height={21.3} fill="#21468B" />
            <rect width={96} height={64} rx={10} fill="none" stroke="#fff" strokeWidth={6} />
          </g>
        </g>
        {pin("haarlem", "Haarlem", 0, -1)}
        {pin("apeldoorn", "Apeldoorn", 0.16, 1)}
        {stamp > 0 && (
          <g transform={`translate(${NL_W - 110} ${NL_H - 96}) rotate(-12) scale(${2.2 - 1.2 * Math.min(1, stamp)})`} opacity={clamp01(stamp * 2)}>
            <rect x={-128} y={-62} width={256} height={124} rx={26} fill={BRAND.navy} stroke="#fff" strokeWidth={8} />
            <text y={34} textAnchor="middle" fontFamily={FONT.display} fontWeight={800} fontSize={104} fill="#fff">2027</text>
          </g>
        )}
        {lab > 0 && (
          <g transform={`translate(${NL_W / 2} ${NL_H + 8}) scale(${lab})`}>
            <rect x={-250} y={-44} width={500} height={88} rx={44} fill={BRAND.navyDeep} stroke="#fff" strokeWidth={7} />
            <text y={19} textAnchor="middle" fontFamily={FONT.display} fontWeight={800} fontSize={54} fill="#fff" letterSpacing={2}>THE NETHERLANDS</text>
          </g>
        )}
      </g>
    </svg>
  );
};
