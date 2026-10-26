import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { CoverVideo } from "../components/Media";
import { C, H, W, clamp, expo, inOut, type } from "./tokens";
import { DrawLine, FitText, MaskLine, PlaneIcon } from "./ui";

const B = 18; // one beat in frames (0.6 s)
const CUT = [0, 2 * B, 4 * B, 6 * B]; // EXPLORE. | APPLY. | GO FURTHER. | finale — each lasts two beats, finale three
const FW = 940;

/** Background block that wipes up from the bottom — the same device carries every cut in this scene. */
const Block: React.FC<{ at: number; color: string; children: React.ReactNode }> = ({ at, color, children }) => {
  const f = useCurrentFrame();
  const p = inOut(interpolate(f, [at, at + 10], [0, 1], clamp));
  if (f < at) return null;
  return (
    <AbsoluteFill style={{ background: color, clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>
      <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 8}%)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Compass: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = expo(interpolate(f, [at, at + 26], [0, 1], clamp));
  return (
    <svg width={760} height={760} viewBox="-100 -100 200 200" style={{ position: "absolute", right: -190, top: 240, opacity: 0.9 * p, transform: `rotate(${f * 0.6}deg) scale(${0.7 + 0.3 * p})` }}>
      <circle r="92" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" />
      <circle r="62" fill="none" stroke={C.orange} strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" />
      {Array.from({ length: 36 }).map((_, i) => (
        <line key={i} x1="0" y1="-92" x2="0" y2={i % 9 === 0 ? -80 : -86} stroke="rgba(255,255,255,.4)" strokeWidth={i % 9 === 0 ? 1.6 : 0.8} transform={`rotate(${i * 10})`} />
      ))}
      <path d="M0 -50 L10 0 L0 50 L-10 0 Z" fill={C.orange} opacity=".9" />
    </svg>
  );
};

/** Scene 4 — kinetic typography. Four beat-locked treatments sharing one wipe device and one type system. */
export const Message: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.navyDeep, overflow: "hidden" }}>
      {/* 1 — EXPLORE.: letters rise one by one, compass turns behind */}
      <AbsoluteFill style={{ background: C.navy }}>
        <Compass at={4} />
        <div style={{ position: "absolute", left: 64, top: 740 }}>
          <MaskLine at={2} dur={16}><FitText text="Explore." width={FW} size={400} fill={C.white} /></MaskLine>
          <div style={{ position: "relative", marginTop: 34, height: 8 }}><DrawLine at={14} length={FW} thickness={8} style={{ left: 0, top: 0 }} /></div>
        </div>
      </AbsoluteFill>

      {/* 2 — APPLY.: slams in from the right with motion blur, then a tick draws itself */}
      <Block at={CUT[1]} color={C.orange}>
        <APPLY at={CUT[1]} />
      </Block>

      {/* 3 — GO FURTHER.: scales out of the screen leaving echoes; aircraft streaks through */}
      <Block at={CUT[2]} color={C.offWhite}>
        <GoFurther at={CUT[2]} fps={fps} />
      </Block>

      {/* 4 — campaign line */}
      <Block at={CUT[3]} color={C.navyDeep}>
        <Finale at={CUT[3]} />
      </Block>
      {void f}
    </AbsoluteFill>
  );
};

const APPLY: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sl = spring({ frame: f - at - 5, fps, config: { damping: 13, stiffness: 150, mass: 0.8 } });
  const x = (1 - sl) * 1100;
  const tick = expo(interpolate(f, [at + 22, at + 36], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <CameraMotionBlur shutterAngle={200} samples={8}>
        <div style={{ position: "absolute", left: 64, top: 690, transform: `translateX(${x}px)` }}>
          <FitText text="APPLY." width={FW} size={470} fill={C.navyDeep} />
        </div>
      </CameraMotionBlur>
      <svg width={300} height={300} viewBox="0 0 100 100" style={{ position: "absolute", left: 64, top: 1150 }}>
        <path d="M12 54 L38 78 L88 22" fill="none" stroke={C.navyDeep} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="130" strokeDashoffset={130 * (1 - tick)} />
      </svg>
    </AbsoluteFill>
  );
};

const GoFurther: React.FC<{ at: number; fps: number }> = ({ at, fps }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - at - 4, fps, config: { damping: 15, stiffness: 140, mass: 0.9 } });
  const scale = 1.7 - 0.7 * s;
  const plane = interpolate(f, [at + 14, at + 34], [-200, W + 250], { easing: Easing.bezier(0.5, 0, 0.2, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {[3, 2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 64, top: 640 - k * 74 * s, opacity: (0.2 + 0.1 * (3 - k)) * s, transformOrigin: "left top" }}>
          <FitText text="GO" width={330} size={420} fill="none" stroke={C.charcoal} strokeWidth={3} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 64, top: 640, transform: `scale(${scale})`, transformOrigin: "20% 60%", opacity: Math.min(1, s * 2) }}>
        <FitText text="GO" width={330} size={420} fill={C.charcoal} />
        <div style={{ marginTop: 22 }}>
          <FitText text="FURTHER." width={FW} size={300} fill={C.orange} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 1210, width: W, height: 4 }}>
        <div style={{ position: "absolute", left: 0, width: Math.max(0, plane), height: 0, borderTop: `6px dotted ${C.navy}`, opacity: 0.7 }} />
        <div style={{ position: "absolute", left: plane - 50, top: -50, transform: "rotate(90deg)" }}>
          <PlaneIcon size={110} color={C.navy} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const line = expo(interpolate(f, [at + 26, at + 52], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.4 }}>
        <CoverVideo src="media/budapest_statue.mp4" startFrom={120} scale={1.1 + (f - at) * 0.0007} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(15,23,71,.9), rgba(15,23,71,.55) 50%, rgba(15,23,71,.92))` }} />
      <div style={{ position: "absolute", left: 64, top: 520, display: "flex", flexDirection: "column", gap: 20 }}>
        <MaskLine at={at + 6} style={{}}><FitText text="Your future" width={FW} size={250} fill={C.white} /></MaskLine>
        <MaskLine at={at + 12} style={{}}><FitText text="has no" width={560} size={250} fill={C.white} /></MaskLine>
        <MaskLine at={at + 18} style={{}}><FitText text="Borders." width={FW} size={330} fill={C.orange} /></MaskLine>
      </div>
      {/* the route line crossing the word: a border that is not there */}
      <div style={{ position: "absolute", left: 64, top: 1195, width: FW * line, borderTop: `7px dotted ${C.orange}` }} />
      <div style={{ position: "absolute", left: 64 + FW * line - 40, top: 1150, transform: "rotate(90deg)", opacity: line > 0.02 && line < 0.99 ? 1 : line >= 0.99 ? 0 : 0 }}>
        <PlaneIcon size={80} color={C.white} />
      </div>
      {void H}
    </AbsoluteFill>
  );
};
