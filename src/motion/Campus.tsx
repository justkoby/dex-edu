import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { CoverVideo } from "../components/Media";
import { DOME } from "./Route";
import { C, GRADE, H, W, clamp, expo, inOut, type, wipeClip } from "./tokens";
import { DrawLine, FitText, MaskLine, PinIcon } from "./ui";

/** IBS hero window (the dominant panel of the editorial grid). */
const HERO = { x: 64, y: 300, w: 952, h: 640 };
const IBS_FROM = 20; // IBS clip frame at the scene's first frame; it plays on into the BMU scene so the match cut is exact
const IBS_POS = "28% 50%"; // object-position: keeps the IBS signage + door in the full-bleed crop

const insetFor = (p: number) => {
  const top = HERO.y * p, left = HERO.x * p, right = HERO.x * p, bottom = (H - HERO.y - HERO.h) * p; // p = 1 -> hero window, 0 -> full-bleed
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
};

/**
 * International Business School — editorial photo grid. The Parliament footage that ended the map scene contracts into
 * the dominant panel; a wipe swaps its content to IBS; a second verified IBS photograph and the justified name enter
 * with staggered masks; the panel finally expands to full screen and hands over to the BMU scene (match cut).
 * Only two distinct verified IBS views exist (student-bench clip, wide facade photo), so the grid has exactly two images.
 */
export const IbsGrid: React.FC<{ duration: number; domeElapsed: number }> = ({ duration, domeElapsed }) => {
  const f = useCurrentFrame();
  const contract = inOut(interpolate(f, [4, 24], [0, 1], clamp));
  const wipe = inOut(interpolate(f, [20, 40], [0, 1], clamp));
  const expand = inOut(interpolate(f, [duration - 26, duration], [0, 1], clamp));
  const win = contract * (1 - expand); // 1 = hero window, 0 = full-bleed
  const exit = interpolate(f, [duration - 26, duration - 8], [0, 1], clamp);
  const p = interpolate(f, [0, duration], [0, 1]);
  const stillIn = inOut(interpolate(f, [46, 68], [0, 1], clamp));
  const blockIn = expo(interpolate(f, [40, 60], [0, 1], clamp));
  const slideOut = exit * 70;

  return (
    <AbsoluteFill style={{ background: C.navyDeep }}>
      <AbsoluteFill style={{ opacity: 0.5 }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 120 + i * 220 - f * 0.5, width: 2, background: "rgba(255,255,255,.05)" }} />)}
      </AbsoluteFill>

      {/* hero window: Parliament (continuing from the map scene) -> IBS via a left-to-right wipe */}
      <AbsoluteFill style={{ clipPath: insetFor(win), overflow: "hidden" }}>
        <AbsoluteFill style={{ opacity: 1 - wipe, filter: GRADE.parliament }}>
          <AbsoluteFill style={{ transform: `scale(${DOME.scale1})`, transformOrigin: "50% 60%" }}>
            <CoverVideo src="media/budapest_parliament.mp4" startFrom={DOME.startFrom + domeElapsed} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,23,71,.4), rgba(15,23,71,0) 30%, rgba(15,23,71,0) 62%, rgba(15,23,71,.55))" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: wipeClip(wipe, 12), filter: GRADE.ibs }}>
          <div style={{ position: "absolute", left: HERO.x * win, right: HERO.x * win, top: HERO.y * win, bottom: (H - HERO.y - HERO.h) * win, overflow: "hidden" }}>
            <CoverVideo src="media/ibs_students_a.mp4" startFrom={IBS_FROM} position={IBS_POS} scale={1.02 + 0.07 * p} />
          </div>
        </AbsoluteFill>
        {/* bottom shade so the name stays legible where it overlaps the panel */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,23,71,0) 52%, rgba(15,23,71,.82) 100%)", opacity: win }} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 && <div style={{ position: "absolute", left: HERO.x + wipe * HERO.w - 4, top: HERO.y, width: 8, height: HERO.h, background: C.orange }} />}

      {/* grid furniture — fades/slides away to the right as the panel expands */}
      <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateX(${slideOut}px)` }}>
        <div style={{ position: "absolute", left: HERO.x - 14, top: HERO.y - 14, width: 52, height: 52, background: C.orange, opacity: wipe }} />
        <div style={{ position: "absolute", left: HERO.x, top: 774, width: HERO.w }}>
          <MaskLine at={34} dur={16}><FitText text="International" width={HERO.w} size={150} fill={C.white} /></MaskLine>
          <MaskLine at={40} dur={16} style={{ marginTop: 12 }}><FitText text="Business School" width={HERO.w} size={136} fill={C.white} /></MaskLine>
        </div>
        <DrawLine at={50} length={360} thickness={6} style={{ left: HERO.x, top: 1060 }} />
        <div style={{ position: "absolute", left: HERO.x, top: 1092, width: 360 }}>
          <MaskLine at={52} dur={14}><FitText text="IBS" width={360} size={230} fill={C.orange} /></MaskLine>
          <MaskLine at={60} dur={14} style={{ marginTop: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, ...type(26, 100, 800), color: C.white, letterSpacing: 4 }}><PinIcon size={30} />BUDAPEST, HUNGARY</div>
          </MaskLine>
        </div>
        {/* second verified view: wide facade photograph, masked in from the bottom, drifting against the hero */}
        <div style={{ position: "absolute", left: 456, top: 1056, width: 560, height: 340 }}>
          <div style={{ position: "absolute", left: -18, top: 18, width: 560, height: 340, background: C.orange, transform: `translateY(${(1 - blockIn) * 40}px)`, opacity: blockIn }} />
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: `inset(${(1 - stillIn) * 100}% 0 0 0)`, filter: GRADE.ibs }}>
            <Img src={staticFile("media/ibs_building.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.14 + 0.04 * p}) translateX(${22 * (p - 0.5)}px)` }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Budapest Metropolitan University — cinematic full-bleed. Begins on the still-expanding IBS frame, a slanted wipe
 * reveals BMU, slow push, type arrives from the right edge with motion blur, thin lines draw, a location marker pulses,
 * and navy bars close the frame into the next scene.
 */
export const BmuCinematic: React.FC<{ duration: number; ibsElapsed: number }> = ({ duration, ibsElapsed }) => {
  const f = useCurrentFrame();
  const wipe = inOut(interpolate(f, [6, 26], [0, 1], clamp));
  const p = interpolate(f, [0, duration], [0, 1]);
  const bars = inOut(interpolate(f, [duration - 18, duration], [0, 1], clamp));
  const fr = interpolate(f, [28, 70], [0, 1], clamp);
  const lines = [
    { t: "Budapest", s: 250, at: 28 },
    { t: "Metropolitan", s: 176, at: 33 },
    { t: "University", s: 212, at: 38 },
  ];
  return (
    <AbsoluteFill style={{ background: C.navyDeep }}>
      {/* match cut: the IBS frame carries on from the previous scene */}
      <AbsoluteFill style={{ filter: GRADE.ibs }}>
        <CoverVideo src="media/ibs_students_a.mp4" startFrom={IBS_FROM + ibsElapsed} position={IBS_POS} scale={1.09} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: wipeClip(wipe, 14), filter: GRADE.bmu }}>
        <CoverVideo src="media/bmu_campus.mp4" startFrom={20} scale={1.1 + 0.12 * p} x={-34 * p} origin="50% 55%" />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,23,71,.5) 0%, rgba(15,23,71,0) 26%, rgba(15,23,71,.1) 44%, rgba(15,23,71,.86) 100%)" }} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 114 - 14}%`, width: 10, background: C.orange, transform: "skewX(-9deg)" }} />}

      {/* thin frame + rules that draw themselves */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x="40" y="250" width={W - 80} height={H - 250 - 480} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray={2 * (W - 80 + H - 730)} strokeDashoffset={2 * (W - 80 + H - 730) * (1 - expo(fr))} />
      </svg>
      <DrawLine at={44} length={W - 128} thickness={4} style={{ left: 64, top: 1218 }} />

      {/* name arrives from the right edge */}
      <CameraMotionBlur shutterAngle={150} samples={6}>
        <div style={{ position: "absolute", left: 64, top: 700 }}>
          {lines.map((l, i) => {
            const e = expo(interpolate(f, [l.at, l.at + 18], [0, 1], clamp));
            return (
              <div key={l.t} style={{ transform: `translateX(${(1 - e) * 1250}px)`, marginBottom: i < 2 ? 12 : 0 }}>
                <FitText text={l.t} width={W - 128} size={l.s} fill={C.white} />
              </div>
            );
          })}
        </div>
      </CameraMotionBlur>

      {/* location marker */}
      <div style={{ position: "absolute", left: 64, top: 1250, display: "flex", alignItems: "center", gap: 20, opacity: expo(interpolate(f, [52, 70], [0, 1], clamp)) }}>
        <div style={{ position: "relative", width: 34, height: 34 }}>
          {[0, 1].map((k) => {
            const t = ((f + k * 20) % 40) / 40;
            return <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${C.orange}`, opacity: 1 - t, transform: `scale(${1 + t * 1.8})` }} />;
          })}
          <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: C.orange }} />
        </div>
        <div style={{ ...type(34, 100, 800), color: C.white, letterSpacing: 5 }}>BUDAPEST, HUNGARY</div>
      </div>

      {/* frame closes: navy bars meet in the middle (the next scene is navy) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${bars * 50}%`, background: C.navy }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${bars * 50}%`, background: C.navy }} />
    </AbsoluteFill>
  );
};
