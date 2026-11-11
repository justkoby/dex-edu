import React from "react";
import { clamp01, easeIn, rnd, spring } from "../anim";
import { FONT } from "../config/brand";

/**
 * The MONEY gag: chunky extruded letters whistle down, SLAM onto the character on the word, squash, bounce and
 * settle; cedi coins burst out. `hit` = the moment of impact (narration cue), `swat` = when he shoves it off-screen.
 */
export const MoneyWord: React.FC<{ t: number; hit: number; swat: number }> = ({ t, hit, swat }) => {
  const fallD = 0.3;
  if (t < hit - fallD) return null;
  const falling = easeIn(clamp01((t - (hit - fallD)) / fallD));
  const after = t - hit;
  const settle = after > 0 ? spring(t, hit, 0.55, 1.15) : 0; // 0 -> 1 with bounce
  const restY = 640, y = after <= 0 ? -420 + (restY + 60 + 420) * falling : restY + 60 - 60 * settle;
  const squash = after > 0 ? Math.exp(-after * 9) * Math.cos(after * 22) : 0;
  const sw = clamp01((t - swat) / 0.34), swE = sw * sw;
  const x = 470 - swE * 1250, rot = -7 * (after > 0 ? Math.min(1, after * 6) : 0) - swE * 38;
  const letters = "MONEY".split("");
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1 + squash * 0.16}, ${1 - squash * 0.22})`, transformOrigin: "50% 90%", display: "flex", whiteSpace: "nowrap" }}>
      {letters.map((ch, i) => {
        const lag = after > 0 ? Math.exp(-(after) * 7) * Math.sin(after * 20 + i * 1.3) * 26 : 0;
        const r = after > 0 ? (rnd(i + 3) - 0.5) * 12 * Math.min(1, after * 8) : 0;
        return (
          <span key={i} style={{
            display: "inline-block", fontFamily: FONT.display, fontWeight: 800, fontSize: 290, lineHeight: 0.8, color: "#FFD23F", margin: "0 -4px",
            transform: `translateY(${-lag}px) rotate(${r}deg)`,
            WebkitTextStroke: "10px #7A2E00", paintOrder: "stroke fill",
            textShadow: Array.from({ length: 16 }).map((_, k) => `${k + 1}px ${k + 2}px 0 ${k < 12 ? "#D9480F" : "#7A2E00"}`).join(",") + ", 26px 38px 0 rgba(40,20,0,0.25)",
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

/** Ghana cedi coins + impact dust thrown out by the slam. */
export const CoinBurst: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const a = t - at;
  if (a < 0 || a > 1.5) return null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {a < 0.45 && Array.from({ length: 10 }).map((_, i) => {
        const ang = (i / 10) * Math.PI * 2, r0 = 120 + a * 620, r1 = r0 + 130 * (1 - a / 0.45);
        return <line key={"l" + i} x1={x + Math.cos(ang) * r0} y1={y + Math.sin(ang) * r0 * 0.6} x2={x + Math.cos(ang) * r1} y2={y + Math.sin(ang) * r1 * 0.6} stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={1 - a / 0.45} />;
      })}
      {Array.from({ length: 16 }).map((_, i) => {
        const ang = -Math.PI / 2 + (rnd(i) - 0.5) * 2.6, v = 700 + rnd(i + 20) * 900;
        const cx = x + Math.cos(ang) * v * a, cy = y + Math.sin(ang) * v * a + 1500 * a * a;
        const spin = Math.cos(a * (9 + rnd(i + 40) * 8) + i);
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${spin} 1)`} opacity={a > 1.2 ? (1.5 - a) / 0.3 : 1}>
            <circle r={30} fill="#B26A00" /><circle r={25} cy={-3} fill="#FFC928" /><circle r={18} cy={-3} fill="none" stroke="#B26A00" strokeWidth={3} />
            <text y={7} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={28} fill="#B26A00">₵</text>
          </g>
        );
      })}
    </svg>
  );
};
