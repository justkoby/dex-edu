import React from "react";
import { Img, staticFile } from "remotion";
import { clamp01, spring } from "../anim";
import { BRAND, FONT } from "../config/brand";

const Tick: React.FC<{ p: number; color?: string }> = ({ p, color = "#fff" }) => (
  <svg width={64} height={64} viewBox="0 0 64 64"><path d="M14,34 L27,47 L51,19" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - clamp01(p))} /></svg>
);

/** "My 2027 list" – he ticks the Netherlands himself. */
export const Checklist: React.FC<{ t: number; tickAt: number }> = ({ t, tickAt }) => {
  const tick = clamp01((t - tickAt) / 0.22), bounce = t >= tickAt ? spring(t, tickAt, 0.4) : 0;
  const row = (label: string, done: number, hi: boolean, extra?: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "12px 20px", borderRadius: 24, background: hi && done > 0 ? "#FFF1E4" : "transparent", transform: hi ? `scale(${1 + 0.05 * Math.sin(Math.min(1, bounce) * Math.PI)})` : undefined }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, border: `6px solid ${done > 0 ? BRAND.orange : "#B9C0D6"}`, background: done > 0 ? BRAND.orange : "#fff", flexShrink: 0 }}><div style={{ margin: -6 }}><Tick p={done} /></div></div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 54, color: BRAND.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{label}</div>
      {extra}
    </div>
  );
  return (
    <div style={{ width: 720, background: "#fff", borderRadius: 44, padding: "30px 34px 34px", boxShadow: "0 26px 60px rgba(0,0,0,0.4)" }}>
      <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: BRAND.navy, marginBottom: 12, display: "flex", justifyContent: "space-between" }}><span>MY 2027 LIST</span><span style={{ color: BRAND.orange }}>● ● ●</span></div>
      {row("Study abroad", 1, false)}
      {row("The Netherlands", tick, true, <div style={{ marginLeft: "auto", width: 78, height: 52, borderRadius: 8, overflow: "hidden", boxShadow: "0 0 0 3px #E3E7F2" }}><div style={{ height: "33.4%", background: "#AE1C28" }} /><div style={{ height: "33.3%", background: "#fff" }} /><div style={{ height: "33.3%", background: "#21468B" }} /></div>)}
      {row("Talk to Dexterity", 0, false)}
    </div>
  );
};

/** Consultation card – grows into the closing brand screen when he pulls it open. */
export const ConsultCard: React.FC<{ t: number; pulseAt: number }> = ({ t, pulseAt }) => {
  const pu = t >= pulseAt ? 1 + 0.07 * Math.exp(-(t - pulseAt) * 4) * Math.sin((t - pulseAt) * 16) : 1;
  return (
    <div style={{ width: 720, background: "#fff", borderRadius: 44, padding: "26px 30px 32px", boxShadow: "0 26px 60px rgba(0,0,0,0.4)", textAlign: "center" }}>
      <Img src={staticFile("brand/dexterity-logo.svg")} style={{ height: 150 }} />
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: BRAND.navy, lineHeight: 1, marginTop: 12, whiteSpace: "nowrap" }}>Dexterity Educational Consult</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 27, color: "#4A5068", marginTop: 8, whiteSpace: "nowrap" }}>Your Netherlands 2027 plan starts with a chat</div>
      <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${pu})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: "#fff", background: BRAND.orange, borderRadius: 60, padding: "14px 46px 8px", boxShadow: "0 8px 0 #C9590C" }}>Book a consultation</div>
    </div>
  );
};

/** Closing brand screen: official logo, verified-from-repo contact details (see config/brand.ts for the open website question). */
export const EndCard: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const s = (d: number, dur = 0.5) => (t >= at + d ? spring(t, at + d, dur) : 0);
  const pill = (delay: number, children: React.ReactNode, bg: string, color: string) => (
    <div style={{ transform: `scale(${s(delay, 0.4)})`, background: bg, color, borderRadius: 70, padding: "14px 44px 8px", fontFamily: FONT.display, fontWeight: 800, fontSize: 64, lineHeight: 1.05, boxShadow: "0 10px 0 rgba(13,19,48,0.14)", whiteSpace: "nowrap" }}>{children}</div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 256 }}>
      <div style={{ transform: `scale(${s(0.25, 0.4)})`, fontFamily: FONT.body, fontWeight: 800, fontSize: 30, letterSpacing: 7, color: BRAND.orange }}>STUDY IN THE NETHERLANDS · 2027</div>
      <Img src={staticFile("brand/dexterity-logo.svg")} style={{ height: 300, marginTop: 20, transform: `scale(${s(0, 0.6)}) rotate(${(1 - Math.min(1, s(0, 0.6))) * -8}deg)` }} />
      <div style={{ transform: `scale(${s(0.18, 0.45)})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 58, color: BRAND.navy, marginTop: 12, lineHeight: 1 }}>Dexterity Educational Consult</div>
      <div style={{ opacity: clamp01(s(0.4)), fontFamily: FONT.body, fontWeight: 600, fontSize: 31, color: "#4A5068", marginTop: 8 }}>SRH Haarlem · Wittenborg · and more</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 30 }}>
        {pill(0.5, <><span style={{ fontSize: 36, fontFamily: FONT.body, letterSpacing: 3, marginRight: 18, opacity: 0.85 }}>CALL</span>{BRAND.phones[0]}</>, BRAND.navy, "#fff")}
        {pill(0.68, <><span style={{ fontSize: 36, fontFamily: FONT.body, letterSpacing: 3, marginRight: 18, opacity: 0.85 }}>OR</span>{BRAND.phones[1]}</>, "#fff", BRAND.navy)}
        {pill(0.86, BRAND.website, BRAND.orange, "#fff")}
      </div>
    </div>
  );
};
