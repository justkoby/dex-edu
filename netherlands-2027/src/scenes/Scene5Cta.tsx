import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeIn, easeInOut, easeOut, lerp, prog, spring } from "../anim";
import { Actor } from "../components/Actor";
import { Checklist, ConsultCard, EndCard } from "../components/Cta";
import { Camera, Studio } from "../components/Stage";
import { BRAND } from "../config/brand";
import { TL, cue } from "../data/tl";
import type { Performance } from "../rig/perform";

/** Scene 5 – Dexterity CTA. He ticks the Netherlands on his 2027 list, the list flips into the consultation card, and he pulls that card open into the closing brand screen. */
const [START] = TL.scenes.s5;
const C = { anyway: cue("anyway"), ifnl: cue("ifnl"), list: cue("list"), dex: cue("dexterity"), help: cue("help"), voEnd: cue("vo09_end"), so: cue("so"), waiting: cue("waiting"), chapter: cue("chapter"), here: cue("here"), chale: cue("chale2"), sharp: cue("looksharp"), end: cue("vo10_end") };
const TICK = C.list + 0.12, FLIP = C.dex - 0.14, GRAB = C.chapter - 0.12, OPEN = C.chapter + 0.12, UP = C.chale - 0.12;

export const perf5: Performance = {
  face: [
    { t: START, face: "happy" },
    { t: C.anyway - 0.08, face: "skeptical", with: { px: 0, browRy: 10 }, d: 0.2 }, // brushing the cold off: "anyway…"
    { t: C.ifnl - 0.1, face: "happy", with: { py: -0.6 }, d: 0.2 },
    { t: C.list - 0.2, face: "confident", with: { py: -0.8, px: 0.3 }, d: 0.2 },
    { t: TICK + 0.1, face: "excited", with: { py: -0.6 }, d: 0.12 },
    { t: TICK + 0.6, face: "happy", d: 0.25 },
    { t: C.dex - 0.05, face: "excited", d: 0.15 },
    { t: C.help - 0.1, face: "happy", d: 0.25 },
    { t: C.voEnd + 0.05, face: "neutral", with: { smile: 0.6 }, d: 0.25 },
    { t: C.so - 0.05, face: "sly", d: 0.2 },
    { t: C.waiting - 0.05, face: "confident", with: { open: 0.1 }, d: 0.15 },
    { t: GRAB, face: "excited", with: { py: -0.8 }, d: 0.12 },
    { t: UP, face: "happy", d: 0.1 },
    { t: C.sharp - 0.2, face: "confident", with: { py: 0.5, px: 0.2 }, d: 0.2 }, // glances at the watch
    { t: C.sharp + 0.75, face: "confident", with: { browLy: 20, browRy: 20 }, d: 0.15 }, // back to camera: "look sharp!"
    { t: C.end + 0.1, face: "laughing", d: 0.2 },
    { t: C.end + 1.0, face: "happy", d: 0.3 },
  ],
  arms: [
    { t: START, arms: "rest", d: 0.01 },
    { t: C.anyway - 0.08, arms: "oneUpR", d: 0.22, R: { wrist: 60 } }, // dismissive flick
    { t: C.ifnl - 0.12, arms: "explain", d: 0.3 },
    { t: C.list - 0.25, arms: "tick", d: 0.25 },
    { t: TICK - 0.06, arms: "tick", d: 0.1, ease: "out", R: { sh: 82, el: 172 } }, // the tick stroke
    { t: TICK + 0.2, arms: "fistPump", d: 0.25 },
    { t: C.dex - 0.2, arms: ["presentUpL", "presentUpR"], d: 0.25, ease: "snap" },
    { t: C.help - 0.1, arms: "talk", d: 0.35, ease: "soft" },
    { t: C.voEnd, arms: "rest", d: 0.35, ease: "soft" },
    { t: C.so - 0.05, arms: "shrug", d: 0.3 },
    { t: C.waiting + 0.25, arms: "pointViewer", d: 0.2, ease: "snap" },
    { t: GRAB, arms: "cheer", d: 0.16, ease: "snap" }, // grabs the card overhead…
    { t: OPEN, arms: "stretch", d: 0.22, ease: "out" }, // …and rips it open
    { t: UP + 0.1, arms: "wave", d: 0.25 },
    { t: C.sharp - 0.25, arms: "watch", d: 0.25 },
    { t: C.sharp + 0.12, arms: "watch", d: 0.06, ease: "out", L: { el: 252 } }, // tap
    { t: C.sharp + 0.24, arms: "watch", d: 0.1 },
    { t: C.sharp + 0.42, arms: "watch", d: 0.06, ease: "out", L: { el: 252 } }, // tap
    { t: C.sharp + 0.54, arms: "watch", d: 0.1 },
    { t: C.sharp + 0.95, arms: "watch", d: 0.06, ease: "out", L: { el: 252 } },
    { t: C.sharp + 1.07, arms: "watch", d: 0.1 },
    { t: C.sharp + 1.25, arms: "watch", d: 0.06, ease: "out", L: { el: 252 } },
    { t: C.sharp + 1.37, arms: "watch", d: 0.1 },
    { t: C.end + 0.1, arms: "pointViewer", d: 0.22, ease: "snap" },
  ],
  body: [
    { t: C.anyway - 0.08, hrot: 7, d: 0.25, ease: "soft" },
    { t: C.ifnl - 0.1, hrot: 0, d: 0.3, ease: "soft" },
    { t: TICK - 0.06, y: -22, d: 0.1, ease: "out" },
    { t: TICK + 0.12, y: 0, d: 0.3 },
    { t: C.dex - 0.14, y: 14, sy: 0.97, d: 0.1, ease: "out" },
    { t: C.dex, y: 0, sy: 1, d: 0.3 },
    { t: C.so - 0.05, hrot: -8, rot: -2, d: 0.3, ease: "soft" },
    { t: C.waiting + 0.2, hrot: 0, rot: 0, y: -12, d: 0.15, ease: "out" },
    { t: C.waiting + 0.4, y: 0, d: 0.3 },
    { t: GRAB, y: -46, sy: 1.05, d: 0.14, ease: "out" },
    { t: OPEN, y: 30, sy: 0.94, d: 0.14, ease: "out" },
    { t: OPEN + 0.16, y: 1100, sy: 1, d: 0.3, ease: "soft" }, // ducks out of frame as the brand screen takes over
    { t: UP, y: 200, d: 0.3 }, // pops back up, a little lower so the contact details stay clear
    { t: C.sharp - 0.2, hrot: 6, nod: 0.6, d: 0.25, ease: "soft" },
    { t: C.sharp + 0.75, hrot: 0, nod: 0, d: 0.2 },
    { t: C.end + 0.1, y: 176, d: 0.12, ease: "out" },
    { t: C.end + 0.25, y: 200, d: 0.3 },
  ],
};

export const Scene5Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < START - 0.01) return null;
  const listIn = spring(t, C.ifnl - 0.12, 0.5, 1.1);
  // flip: list -> consult card
  const flip = prog(t, FLIP, 0.36), flipS = Math.abs(Math.cos(flip * Math.PI)), showConsult = flip > 0.5;
  const settle = t >= FLIP + 0.36 ? 1 + 0.06 * Math.exp(-(t - FLIP - 0.36) * 7) * Math.sin((t - FLIP - 0.36) * 20) : 1;
  // the pull-open: card scales up into the full white brand screen
  const open = easeIn(prog(t, OPEN - 0.04, 0.3));
  const grabDip = (t >= GRAB ? spring(t, GRAB, 0.3) : 0) * (1 - Math.min(1, open * 3));
  const zoom = 1 + 0.12 * easeInOut(prog(t, C.waiting, 0.5)) * (1 - easeOut(prog(t, GRAB, 0.2)));
  return (
    <AbsoluteFill>
      <Camera zoom={zoom} fx={540} fy={1200}>
        <Studio t={t} wall={[BRAND.navy, BRAND.navyDeep]} blob={BRAND.orange} accent="#fff" dark blobY={40} />
        {/* expanding white screen */}
        {open > 0 && <div style={{ position: "absolute", left: 540, top: 560, width: 720, height: 560, marginLeft: -360, marginTop: -280, background: BRAND.cream, borderRadius: lerp(44, 0, open), transform: `scale(${lerp(1, 4.2, open)})` }} />}
        {open >= 1 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #fff 0%, ${BRAND.cream} 60%, #F3E3C8 100%)` }}>
          <div style={{ position: "absolute", left: -120, right: -120, bottom: -260, height: 900, borderRadius: "50%", background: BRAND.yellow, opacity: 0.9 }} />
        </AbsoluteFill>}
        {t >= C.ifnl - 0.14 && open < 1 && (
          <div style={{ position: "absolute", left: 540 - 360, top: 268 + grabDip * 46, width: 720, opacity: 1 - clamp01(open * 2.5), transform: `translateY(${(1 - Math.min(1, listIn)) * -700}px) rotate(${(1 - Math.min(1, listIn)) * 8}deg) scaleX(${flip > 0 && flip < 1 ? Math.max(0.03, flipS) : 1}) scale(${settle * (1 + open * 0.6)})`, transformOrigin: "50% 50%" }}>
            {showConsult ? <ConsultCard t={t} pulseAt={C.help + 0.3} /> : <Checklist t={t} tickAt={TICK} />}
          </div>
        )}
        {open >= 1 && <EndCard t={t} at={C.here - 0.05} />}
        <Actor perf={perf5} t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
