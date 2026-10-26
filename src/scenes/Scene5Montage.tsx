import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { LowerThird } from "../components/LowerThird";
import { Reveal, RevealKind } from "../components/Reveal";
import { BRAND } from "../config/brand";
import { BEAT, SCENES, sec } from "../config/timeline";

/**
 * Shots are cut on the music's beat grid (BEAT s). `beats` = length in beats (last shot absorbs the remainder).
 * Labels are only used where the footage is verified (see ASSET_MANIFEST): IBS clip shows the IBS signage; the round
 * building matches the Budapest Metropolitan University facade photo. Generic city shots only say "Budapest".
 */
type Shot = {
  src: string; beats: number; kind: RevealKind; origin?: [number, number]; from: number; scale?: number; drift: number;
  grade?: string; title?: [string, string]; step?: [string, string];
};
const OVERLAP = 14;

const SHOTS: Shot[] = [
  { src: "media/budapest_statue.mp4", beats: 3, kind: "none", from: 0, drift: 30, grade: "brightness(1.1) saturate(1.2) contrast(1.05)", title: ["City · Budapest", "Budapest, Hungary"] },
  { src: "media/ibs_students_a.mp4", beats: 3, kind: "wipe", from: 60, drift: -36, title: ["Study option", "International Business School (IBS), Budapest"] },
  { src: "media/bmu_campus.mp4", beats: 4, kind: "bars", from: 90, drift: 34, title: ["Study option", "Budapest Metropolitan University"] },
  { src: "media/ibs_group.mp4", beats: 3, kind: "circle", origin: [78, 30], from: 210, drift: -30, step: ["01", "Explore your options"] },
  { src: "media/budapest_parliament.mp4", beats: 99, kind: "wipe", from: 70, drift: 28, scale: 1.05, step: ["02", "Application guidance"] },
];

const Step: React.FC<{ n: string; text: string }> = ({ n, text }) => {
  const f = useCurrentFrame();
  const p = Easing.bezier(0.16, 1, 0.3, 1)(interpolate(f, [6, 22], [0, 1], { extrapolateRight: "clamp" }));
  return (
    <div style={{ position: "absolute", left: 60, top: 1030, display: "flex", alignItems: "center", gap: 20, fontFamily: BRAND.font, opacity: p, transform: `translateX(${(1 - p) * -80}px)` }}>
      <div style={{ background: BRAND.orange, color: "#fff", fontWeight: 900, fontSize: 44, width: 84, height: 84, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div style={{ background: "rgba(23,35,90,.94)", color: "#fff", fontWeight: 800, fontSize: 44, padding: "18px 32px", borderRadius: 22 }}>{text}</div>
    </div>
  );
};

const ShotBody: React.FC<{ shot: Shot; dur: number }> = ({ shot, dur }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1]);
  const z = (1.0 + 0.14 * p) * (shot.scale ?? 1);
  return (
    <AbsoluteFill>
      {/* background layer: slow push + drift; foreground titles drift the other way (subtle parallax) */}
      <AbsoluteFill style={{ filter: shot.grade ?? "saturate(1.06) contrast(1.04)" }}>
        <CoverVideo src={shot.src} startFrom={shot.from} scale={z} x={shot.drift * (p - 0.5)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,60,141,.20), rgba(23,35,90,.12))", mixBlendMode: "multiply" }} />
      <Scrim top={0.3} bottom={0.55} />
      <AbsoluteFill style={{ transform: `translateX(${-shot.drift * 0.3 * (p - 0.5)}px)` }}>
        {shot.title && <LowerThird label={shot.title[0]} title={shot.title[1]} top={1000} dur={dur} />}
        {shot.step && <Step n={shot.step[0]} text={shot.step[1]} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Real footage montage: Budapest city + IBS + BMU, masked reveals, beat-locked cuts, slow zoom + parallax per shot. */
export const Scene5Montage: React.FC = () => {
  const total = sec(SCENES.s5.to - SCENES.s5.from);
  let start = 0;
  const placed = SHOTS.map((s, i) => {
    const len = i === SHOTS.length - 1 ? total - start + 24 : Math.round(s.beats * BEAT * 30); // last shot runs on under the end-card wipe
    const o = { s, start, len };
    start += len;
    return o;
  });
  return (
    <AbsoluteFill style={{ background: BRAND.navyDeep }}>
      {placed.map(({ s, start: st, len }, i) => {
        const dur = len + (i < placed.length - 1 ? OVERLAP : 0);
        return (
          <Sequence key={i} from={st} durationInFrames={dur}>
            <Reveal kind={s.kind} origin={s.origin} dur={OVERLAP}>
              <ShotBody shot={s} dur={dur} />
            </Reveal>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
