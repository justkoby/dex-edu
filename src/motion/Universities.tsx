import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CoverVideo } from "../components/Media";
import { C, SAFE, clamp, expo, type } from "./tokens";
import { DrawLine, FitText, MaskLine, PinIcon, Sweep } from "./ui";

export type Uni = {
  video: string; videoFrom: number; videoScale?: number; videoOrigin?: string; still: string; stillCaption: string;
  lines: { text: string; size: number }[]; short?: string; drift: number;
};

const SW = 20; // frames of the orange sweep that cuts into each spotlight; content is revealed at the midpoint

/**
 * One university spotlight (8 beats = 144 frames). Layers: full-bleed footage (slow push + drift), a framed
 * photograph that drifts the opposite way (parallax), justified display name rising out of masks, location label,
 * drawn lines. Names only appear next to footage/photos whose signage was checked (see ASSET_MANIFEST).
 */
export const UniSpotlight: React.FC<{ uni: Uni; duration: number }> = ({ uni, duration }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = f >= SW / 2;
  const t = Math.max(0, f - SW / 2);
  const p = interpolate(t, [0, duration], [0, 1], clamp);
  const card = spring({ frame: t - 26, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const cardX = interpolate(p, [0, 1], [18, -26]);
  const W0 = 940;
  return (
    <AbsoluteFill>
      {show && (
        <AbsoluteFill style={{ overflow: "hidden", background: C.navyDeep }}>
          <AbsoluteFill style={{ filter: "saturate(1.08) contrast(1.05)" }}>
            <CoverVideo src={uni.video} startFrom={uni.videoFrom} scale={(uni.videoScale ?? 1.12) * (1 + 0.1 * p)} x={uni.drift * (p - 0.5)} origin={uni.videoOrigin} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(15,23,71,.55) 0%, rgba(15,23,71,0) 24%, rgba(15,23,71,.15) 45%, rgba(15,23,71,.88) 100%)` }} />
          {/* framed photograph — parallax against the footage */}
          <div
            style={{
              position: "absolute", left: W0 - 290 + 64 + cardX * 1.6, top: SAFE.top + 40, width: 330, transform: `rotate(${-3 + 3 * card}deg) translateY(${(1 - card) * -80}px)`,
              opacity: Math.min(1, card * 1.5), boxShadow: "0 24px 60px rgba(0,0,0,.45)", border: `9px solid ${C.offWhite}`, background: C.offWhite,
            }}
          >
            <Img src={staticFile(uni.still)} style={{ width: "100%", height: 236, objectFit: "cover", display: "block", transform: `scale(${1.08 + 0.05 * p})` }} />
            <div style={{ ...type(17, 100, 700), color: C.charcoal, letterSpacing: 2.5, padding: "9px 4px 2px" }}>{uni.stillCaption}</div>
          </div>
          {/* lines + name block */}
          <DrawLine at={SW / 2 + 6} vertical length={1100} thickness={7} style={{ left: 44, top: 330 }} />
          <div style={{ position: "absolute", left: SAFE.side, top: 700, transform: `translate(${-14 * p}px, ${-12 * p}px)` }}>
            {uni.lines.map((l, i) => (
              <MaskLine key={i} at={SW / 2 + 10 + i * 5} dur={16} style={{ marginBottom: 14 }}>
                <FitText text={l.text} width={W0} size={l.size} fill={C.white} />
              </MaskLine>
            ))}
            <MaskLine at={SW / 2 + 32} dur={14} style={{ marginTop: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, color: C.white, ...type(38, 100, 700), letterSpacing: 5 }}>
                <PinIcon size={44} />
                {uni.short && <span style={{ color: C.orange }}>{uni.short}</span>}
                <span>BUDAPEST, HUNGARY</span>
              </div>
            </MaskLine>
            <DrawLine at={SW / 2 + 38} length={W0} thickness={5} style={{ left: 0, top: 22, position: "relative", display: "block" }} />
          </div>
        </AbsoluteFill>
      )}
      <Sweep start={0} dur={SW} />
    </AbsoluteFill>
  );
};

export const IBS: Uni = {
  video: "media/ibs_students_a.mp4", videoFrom: 40, videoOrigin: "45% 60%", videoScale: 1.2, still: "media/ibs_building.jpg", stillCaption: "IBS · BUDAPEST", drift: -60,
  lines: [{ text: "International", size: 175 }, { text: "Business", size: 285 }, { text: "School", size: 370 }], short: "IBS",
};
export const BMU: Uni = {
  video: "media/bmu_campus.mp4", videoFrom: 30, videoOrigin: "50% 55%", videoScale: 1.28, still: "media/bmu_facade.jpg", stillCaption: "BUDAPEST METROPOLITAN", drift: 60,
  lines: [{ text: "Budapest", size: 285 }, { text: "Metropolitan", size: 190 }, { text: "University", size: 225 }], 
};
export { Easing, expo };
