import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C, DROP, H, W, clamp, expo, inOut, sec, type } from "./tokens";
import { FitText, MaskLine } from "./ui";

/** Geometry of the BUDA / PEST? slam, shared by the visible text and the clip-path that turns it into a window onto the map. */
export const SLAM = { x: 60, w: 960, s1: 470, s2: 395, base1: 960, base2: 960 + 0.74 * 395 + 40, ox: 108, oy: 800 };
const txt: React.CSSProperties = { fontFamily: "Archivo, sans-serif", fontWeight: 900, fontVariationSettings: '"wdth" 62', letterSpacing: -2 };

export const WINDOW_START = DROP + 0.45; // letters begin to open onto the map
export const WINDOW_END = DROP + 1.2;

/** Scale applied to the letter mask (about a point inside the B's stem) during the zoom-through. */
export const maskScale = (frame: number) => {
  const p = inOut(interpolate(frame, [sec(WINDOW_START), sec(WINDOW_END)], [0, 1], clamp));
  return Math.exp(Math.log(34) * p);
};

const lineProps = (which: 1 | 2): React.SVGProps<SVGTextElement> => ({
  x: SLAM.x, y: which === 1 ? SLAM.base1 : SLAM.base2, fontSize: which === 1 ? SLAM.s1 : SLAM.s2, textLength: SLAM.w, lengthAdjust: "spacingAndGlyphs", style: txt,
});

export const SlamLines: React.FC<{ fill1: string; fill2: string }> = ({ fill1, fill2 }) => (
  <>
    <text {...lineProps(1)} fill={fill1}>BUDA</text>
    <text {...lineProps(2)} fill={fill2}>PEST?</text>
  </>
);

const scaleT = (s: number) => `translate(${SLAM.ox} ${SLAM.oy}) scale(${s}) translate(${-SLAM.ox} ${-SLAM.oy})`;

/** Clip path = the slam letters scaled about a point inside the B's stem (<clipPath> may only hold shapes/text, so the transform is on each <text>). */
export const SlamClip: React.FC = () => {
  const s = maskScale(useCurrentFrame());
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <clipPath id="slamClip" clipPathUnits="userSpaceOnUse">
          <text {...lineProps(1)} transform={scaleT(s)}>BUDA</text>
          <text {...lineProps(2)} transform={scaleT(s)}>PEST?</text>
        </clipPath>
      </defs>
    </svg>
  );
};

/** White outline that rides the letter edges while they open (drawn above the map layer). */
export const SlamOutline: React.FC = () => {
  const f = useCurrentFrame();
  const s = maskScale(f);
  const a = interpolate(f, [sec(WINDOW_START), sec(WINDOW_START) + 4, sec(WINDOW_END) - 6, sec(WINDOW_END)], [0, 1, 1, 0], clamp);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: a }}>
      <text {...lineProps(1)} transform={scaleT(s)} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round">BUDA</text>
      <text {...lineProps(2)} transform={scaleT(s)} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round">PEST?</text>
    </svg>
  );
};

const Grid: React.FC<{ shift: number }> = ({ shift }) => (
  <AbsoluteFill style={{ opacity: 0.55 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 120 + i * 220 + shift * (0.4 + i * 0.12), width: 2, background: "rgba(255,255,255,.06)" }} />
    ))}
  </AbsoluteFill>
);

/** Scene 1 — typography only. Impact lands on the music drop (DROP). */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slamF = f - sec(DROP);
  // clean slam: one controlled scale-down with a tiny settle, no distortion or colour split
  const slam = spring({ frame: slamF, fps, config: { damping: 15, stiffness: 240, mass: 0.8 } });
  const shakeA = slamF >= 0 ? Math.exp(-slamF / 4) : 0;
  const open = interpolate(f, [sec(WINDOW_START), sec(WINDOW_START) + 6], [0, 1], clamp);
  const slamVisible = f >= sec(DROP);
  const pre = f < sec(DROP);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 40%, ${C.navy} 0%, ${C.navyDeep} 62%)` }}>
      <Grid shift={-f * 1.4} />
      {/* pre-drop: three beats of justified display type, each rising out of a mask; "WAS…" holds until the drop */}
      {pre && (
        <AbsoluteFill style={{ padding: "0 60px", color: C.white }}>
          <div style={{ position: "absolute", left: 60, top: 560 }}>
            <MaskLine at={sec(0.6)} out={sec(1.1)} dur={16}><FitText text="What if" width={960} size={420} fill={C.white} /></MaskLine>
          </div>
          <div style={{ position: "absolute", left: 60, top: 470 }}>
            <MaskLine at={sec(1.2)} out={sec(2.25)} dur={16}><FitText text="Your next" width={960} size={300} fill={C.white} /></MaskLine>
            <MaskLine at={sec(1.32)} out={sec(2.25)} dur={16} style={{ marginTop: 22 }}><FitText text="Stop" width={960} size={560} fill={C.orange} /></MaskLine>
          </div>
          <div style={{ position: "absolute", left: 60, top: 560 }}>
            <MaskLine at={sec(2.4)} dur={12}><FitText text="Was…" width={960} size={420} fill={C.white} /></MaskLine>
          </div>
        </AbsoluteFill>
      )}
      {/* the slam */}
      {slamVisible && (
        <CameraMotionBlur shutterAngle={120} samples={6}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - open }}>
            <g transform={`translate(${shakeA * 8 * Math.sin(f * 2.1)} ${shakeA * 6 * Math.cos(f * 2.7)})`}>
              <g transform={`translate(${SLAM.ox} ${SLAM.oy}) scale(${1.14 - 0.14 * slam}) translate(${-SLAM.ox} ${-SLAM.oy})`}>
                <SlamLines fill1={C.white} fill2={C.orange} />
              </g>
            </g>
          </svg>
        </CameraMotionBlur>
      )}
      {slamVisible && (
        <div style={{ position: "absolute", left: 60, top: 300, opacity: (1 - open) * interpolate(slamF, [8, 20], [0, 1], clamp), transform: `translateX(${(1 - expo(interpolate(slamF, [8, 24], [0, 1], clamp))) * -30}px)` }}>
          <div style={{ ...type(30, 100, 800), color: C.white, letterSpacing: 6, display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ display: "inline-block", width: 90, height: 6, background: C.orange }} /> STUDY IN HUNGARY
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
