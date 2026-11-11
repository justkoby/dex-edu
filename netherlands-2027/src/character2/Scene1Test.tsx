import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { clamp01, easeInOut, easeOut, lerp, prog, shake, spring } from "../anim";
import { Captions } from "../components/Captions";
import { CoinBurst, MoneyWord } from "../components/MoneyWord";
import { Camera, Studio } from "../components/Stage";
import { loadFonts } from "../components/fonts";
import { BRAND } from "../config/brand";
import { TL, cue, envAt } from "../data/tl";
import { Character2 } from "./Character2";
import { Key2, perform2 } from "./perform2";

loadFonts();
/**
 * Scene 1 animation test with the supplied character (v2). Same narration, cues, MONEY graphic and audio as draft v1;
 * new character, new acting (frustrated / skeptical instead of smiling), and a camera that changes shot size.
 */
const C = { chale: cue("chale"), why: cue("why"), abroad: cue("abroad"), first: cue("first"), mind: cue("mind"), money: cue("money"), exactly: cue("exactly"), exEnd: cue("vo02_end") };
export const S1_TEST_END = TL.scenes.s1[1];

export const keys1: Key2[] = [
  { t: 0, d: 0.01, by: 1500, armL: "point", armR: "back", mouthOpen: 0.5 },
  { t: 0.12, d: 0.5, by: 0, headRot: -5, browLy: 10, browRy: 10 }, // pops up, friendly point: "Chale,"
  { t: C.chale + 0.55, d: 0.3, ease: "soft", headRot: -2, browLy: 0, browRy: 0, mouthOpen: 0.2, armLRot: 4 }, // holds through his pause – a beat of stillness
  // "why is it that anytime somebody mentions…" – the smile goes, weary / skeptical
  { t: C.why - 0.2, d: 0.3, armL: "back", armR: "palm", headRot: 6, lean: 1.5, browLy: -6, browLr: 10, browRy: 14, browRr: -4, eye: 0.85, frown: 1, mouthOpen: 0.3, mouthW: 0.9, blink: true },
  { t: C.why + 1.2, d: 0.4, ease: "soft", headRot: 3, armRRot: -6, lookX: 0.3 },
  // "…studying abroad," – eye-roll up to the plane going past
  { t: C.abroad - 0.25, d: 0.25, lookX: 0.7, lookY: -0.9, headRot: -5, browLy: 12, browLr: 0, browRy: 12, browRr: 0, eye: 1 },
  // "the first thing that comes to mind is…" – arms away, quiet; he leans in and narrows his eyes
  { t: C.first - 0.15, d: 0.4, ease: "soft", armR: "back", lookX: 0, lookY: 0, headRot: 4, lean: 0, browLy: -8, browLr: 12, browRy: -8, browRr: 12, eye: 0.78, mouthOpen: 0.25, blink: true },
  { t: C.mind - 0.05, d: 0.5, ease: "soft", headRot: 7, headX: 8, lookX: 0.5, lookY: -0.6, browRy: 8, browRr: 0 },
  // anticipation: something is falling
  { t: C.money - 0.22, d: 0.14, ease: "out", lookX: 0, lookY: -1, headRot: -3, headX: 0, browLy: 22, browRy: 22, browLr: -4, browRr: -4, eye: 1.1, frown: 0, oh: 0.6, mouthOpen: 0.5 },
  // MONEY lands: recoil – thrown back, both palms up
  { t: C.money, d: 0.1, ease: "out", armL: "palm", armR: "palm", armLRot: -44, armRRot: 44, armLLift: 30, armRLift: 30, bx: 110, by: 70, lean: 11, squash: 0.93, headRot: 10, browLy: 30, browRy: 30, browLr: -10, browRr: -10, eye: 0.15, oh: 1, mouthOpen: 1 },
  { t: C.money + 0.16, d: 0.35, bx: 80, by: 10, lean: 7, squash: 1, eye: 1.15, lookX: -0.8, lookY: -0.9, headRot: -6 }, // eyes snap open, staring up at the word
  { t: C.money + 0.75, d: 0.4, ease: "soft", armLRot: -30, armRRot: 30, armLLift: 10, armRLift: 10, oh: 0.5, mouthOpen: 0.4 }, // hands sink slowly
  // slow deadpan turn back to camera
  { t: C.exactly - 0.6, d: 0.45, ease: "soft", armL: "back", armR: "back", armLRot: 0, armRRot: 0, armLLift: 0, armRLift: 0, bx: 0, by: 0, lean: 0, headRot: 3, lookX: 0, lookY: 0, browLy: -10, browRy: -10, browLr: 4, browRr: 4, eye: 0.62, oh: 0, frown: 0.5, mouthOpen: 0, mouthW: 0.7, blink: true },
  // "Exactly!" – jabs a finger at the viewer, one brow up
  { t: C.exactly - 0.1, d: 0.16, ease: "snap", armL: "point", armLRot: -6, headRot: -6, by: -24, browLy: 4, browRy: 20, browRr: -6, eye: 0.9, frown: 0, mouthOpen: 0.6, mouthW: 1 },
  { t: C.exactly + 0.12, d: 0.3, by: 0, armLRot: 0 },
  { t: C.exEnd + 0.1, d: 0.3, ease: "soft", mouthOpen: 0.15, mouthW: 0.85, headRot: -3, browRy: 12 }, // holds the look
];

const K = 0.62, X0 = 540 - 317 * K, Y0 = 1920 - 1760 * K;

export const Scene1Test: React.FC = () => {
  const t = useCurrentFrame() / TL.fps;
  const a = perform2(keys1, t, envAt, { armL: "point", armR: "back" });
  // camera: close-up greeting -> medium for the question -> slow push into a close-up -> snap WIDE on the slam -> tight deadpan close-up
  const z1 = lerp(1.6, 1.12, easeInOut(prog(t, C.why - 0.45, 0.5)));
  const z2 = lerp(0, 0.45, easeInOut(prog(t, C.first, C.money - C.first - 0.1)));
  const wide = easeOut(prog(t, C.money - 0.05, 0.14));
  const z3 = lerp(z1 + z2, 1.0, wide);
  const close = easeInOut(prog(t, C.exactly - 0.6, 0.5));
  const zoom = lerp(z3, 1.6, close) + spring(t, C.exactly - 0.08, 0.3) * 0.08 * (t >= C.exactly - 0.08 ? 1 : 0);
  const fy = lerp(1080, 1000, wide) + close * 60;
  const tiltCam = lerp(0, -2.5, easeInOut(prog(t, C.first, 1.6))) * (1 - wide) + wide * (1 - close) * 2;
  return (
    <AbsoluteFill style={{ background: BRAND.cream }}>
      {/* backdrop on its own slower camera (parallax) and over-scaled, so tilts and shakes never show an edge */}
      <Camera zoom={1.25 + (zoom - 1) * 0.35} fx={540} fy={fy} rot={tiltCam * 0.6} shakeX={shake(t, C.money, 0.6) * 10}>
        <Studio t={t} wall={["#FFF6DD", "#FFE9B0"]} blob={BRAND.yellow} accent={BRAND.orange} />
      </Camera>
      <Camera zoom={zoom} fx={540} fy={fy} rot={tiltCam} shakeX={shake(t, C.money, 0.6) * 28} shakeY={shake(t, C.money, 0.6, 51) * 36}>
        <div style={{ position: "absolute", left: X0, top: Y0, transform: `scale(${K})`, transformOrigin: "0 0", filter: "drop-shadow(0 22px 26px rgba(40,20,0,0.25))" }}>
          <Character2 {...a} />
        </div>
        <MoneyWord t={t} hit={C.money} swat={1e9} />
        <CoinBurst t={t} at={C.money} x={470} y={760} />
        <AbsoluteFill style={{ background: "#fff", opacity: t >= C.money ? clamp01(1 - (t - C.money) / 0.12) * 0.75 : 0 }} />
      </Camera>
      <Captions t={t} />
      <Audio src={staticFile("audio/stems/narration.wav")} />
      <Audio src={staticFile("audio/stems/music.wav")} volume={(f) => TL.duck?.[f] ?? 0.5} />
      <Audio src={staticFile("audio/stems/sfx.wav")} />
    </AbsoluteFill>
  );
};
