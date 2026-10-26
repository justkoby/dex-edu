import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { CoverVideo } from "../components/Media";
import { C, GRADE, W, clamp, expo, inOut, type, wipeClip } from "./tokens";
import { DrawLine, FitText, MaskLine, PlaneIcon } from "./ui";

const B = 18; // one beat in frames (0.6 s)
const CUT = [0, 2 * B, 4 * B, 6 * B]; // EXPLORE. | APPLY. | GO FURTHER. | campaign line — 2 beats each, finale 3
const FW = W - 128;

/** Left-to-right slanted wipe that brings in each new colour field (same device as the footage wipes). */
const Field: React.FC<{ at: number; color: string; children: React.ReactNode }> = ({ at, color, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = inOut(interpolate(f, [at, at + 14], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ background: color, clipPath: wipeClip(p, 10) }}>{children}</AbsoluteFill>
  );
};

/** Scene 4 — kinetic typography. Four beat-locked treatments: reveal, stamp, drift, rise. */
export const Message: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
    <Explore />
    <Field at={CUT[1]} color={C.orange}><Apply at={CUT[1]} /></Field>
    <Field at={CUT[2]} color={C.offWhite}><GoFurther at={CUT[2]} /></Field>
    <Field at={CUT[3]} color={C.navyDeep}><Finale at={CUT[3]} /></Field>
  </AbsoluteFill>
);

/** 1 — EXPLORE.: revealed left to right over layered outline rows drifting in opposite directions; a compass turns behind. */
const Explore: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = expo(interpolate(f, [2, 22], [0, 1], clamp));
  const ring = expo(interpolate(f, [4, 30], [0, 1], clamp));
  const rows = [
    { y: 330, dir: 1, o: 0.14 }, { y: 1010, dir: -1, o: 0.14 }, { y: 1230, dir: 1, o: 0.1 },
  ];
  return (
    <AbsoluteFill>
      {rows.map((r, i) => (
        <div key={i} style={{ position: "absolute", top: r.y, left: 0, whiteSpace: "nowrap", transform: `translateX(${-400 + r.dir * f * 6}px)`, ...type(260, 62), color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,.9)", opacity: r.o }}>
          EXPLORE EXPLORE EXPLORE EXPLORE
        </div>
      ))}
      <svg width={640} height={640} viewBox="-100 -100 200 200" style={{ position: "absolute", right: -150, top: 250, opacity: 0.9 * ring, transform: `rotate(${f * 0.9}deg) scale(${0.7 + 0.3 * ring})` }}>
        <circle r="92" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" />
        <circle r="62" fill="none" stroke={C.orange} strokeWidth="1.8" strokeDasharray="1 5" strokeLinecap="round" />
        {Array.from({ length: 36 }).map((_, i) => <line key={i} x1="0" y1="-92" x2="0" y2={i % 9 === 0 ? -80 : -86} stroke="rgba(255,255,255,.45)" strokeWidth={i % 9 === 0 ? 1.6 : 0.8} transform={`rotate(${i * 10})`} />)}
        <path d="M0 -52 L10 0 L0 52 L-10 0 Z" fill={C.orange} />
      </svg>
      <div style={{ position: "absolute", left: 64, top: 740, clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>
        <FitText text="Explore." width={FW} size={390} fill={C.white} />
      </div>
      <DrawLine at={14} length={FW} thickness={8} style={{ left: 64, top: 1130 }} />
    </AbsoluteFill>
  );
};

/** 2 — APPLY.: each letter is stamped on a beat subdivision; a tick draws itself; a giant outline echo sits behind. */
const Apply: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tick = expo(interpolate(f, [at + 24, at + 36], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, top: 560, ...type(520, 62), color: "transparent", WebkitTextStroke: `3px ${C.navyDeep}`, opacity: 0.18, whiteSpace: "nowrap" }}>APPLY</div>
      <div style={{ position: "absolute", left: 64, top: 760, display: "flex", width: FW, justifyContent: "space-between" }}>
        {"APPLY.".split("").map((ch, i) => {
          const s = spring({ frame: f - at - 3 - i * 3, fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
          return (
            <div key={i} style={{ ...type(330, 62), color: C.navyDeep, transform: `translateY(${(1 - s) * -90}px) scale(${1.35 - 0.35 * s})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 3) }}>{ch}</div>
          );
        })}
      </div>
      <svg width={240} height={240} viewBox="0 0 100 100" style={{ position: "absolute", left: 64, top: 1130 }}>
        <path d="M12 54 L38 78 L88 22" fill="none" stroke={C.navyDeep} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="130" strokeDashoffset={130 * (1 - tick)} />
      </svg>
    </AbsoluteFill>
  );
};

/** 3 — GO FURTHER.: slides in along the direction of travel over speed lines; horizontal outline trail; aircraft streaks through. */
const GoFurther: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const e = expo(interpolate(f, [at + 2, at + 22], [0, 1], clamp));
  const plane = interpolate(f, [at + 16, at + 40], [-180, W + 220], { easing: Easing.bezier(0.5, 0, 0.2, 1), ...clamp });
  const lines = [{ y: 520, w: 380, s: 9 }, { y: 600, w: 220, s: 14 }, { y: 1190, w: 300, s: 11 }, { y: 1290, w: 460, s: 8 }];
  return (
    <AbsoluteFill>
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", top: l.y, left: 0, width: l.w, height: 5, background: C.navy, opacity: 0.3, transform: `translateX(${((f * l.s + i * 300) % (W + l.w)) - l.w}px)` }} />
      ))}
      <div style={{ position: "absolute", left: 64, top: 600, transform: `translateX(${(1 - e) * -420}px)`, opacity: Math.min(1, e * 2) }}>
        <FitText text="Go" width={380} size={420} fill={C.charcoal} />
      </div>
      {[3, 2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 64, top: 1000, transform: `translateX(${-k * 34 * e}px)`, opacity: (0.28 - k * 0.06) * e }}>
          <FitText text="Further." width={FW} size={300} fill="none" stroke={C.orange} strokeWidth={3} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 64, top: 1000, transform: `translateX(${(1 - e) * -520}px)`, opacity: Math.min(1, e * 2) }}>
        <FitText text="Further." width={FW} size={300} fill={C.orange} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 1360, width: W }}>
        <div style={{ position: "absolute", left: 0, width: Math.max(0, plane), borderTop: `6px dotted ${C.navy}`, opacity: 0.75 }} />
        <div style={{ position: "absolute", left: plane - 55, top: -52, transform: "rotate(90deg)" }}><PlaneIcon size={110} color={C.navy} /></div>
      </div>
    </AbsoluteFill>
  );
};

/** 4 — campaign line: three lines rise out of masks over a dimmed Budapest frame; the route line crosses "BORDERS.". */
const Finale: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const line = expo(interpolate(f, [at + 26, at + 50], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.42, filter: GRADE.statue }}>
        <CoverVideo src="media/budapest_statue.mp4" startFrom={120} scale={1.1 + (f - at) * 0.0007} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,23,71,.9), rgba(15,23,71,.55) 50%, rgba(15,23,71,.92))" }} />
      <div style={{ position: "absolute", left: 64, top: 520, display: "flex", flexDirection: "column", gap: 20 }}>
        <MaskLine at={at + 4} dur={14}><FitText text="Your future" width={FW} size={250} fill={C.white} /></MaskLine>
        <MaskLine at={at + 10} dur={14}><FitText text="has no" width={560} size={250} fill={C.white} /></MaskLine>
        <MaskLine at={at + 16} dur={14}><FitText text="Borders." width={FW} size={330} fill={C.orange} /></MaskLine>
      </div>
      <div style={{ position: "absolute", left: 64, top: 1195, width: FW * line, borderTop: `7px dotted ${C.orange}` }} />
      <div style={{ position: "absolute", left: 64 + FW * line - 40, top: 1150, transform: "rotate(90deg)", opacity: line > 0.02 && line < 0.985 ? 1 : 0 }}>
        <PlaneIcon size={80} color={C.white} />
      </div>
    </AbsoluteFill>
  );
};
export { CameraMotionBlur };
