import React from "react";
import { Character, Winter } from "../rig/Character";
import { CharacterFlat } from "../rig/CharacterFlat";
import { Performance, perform } from "../rig/perform";
import { envAt } from "../data/tl";
import { H, W } from "../config/brand";

/**
 * Which character drawing the whole film uses. "flat" = v3 flat-vector character (current, client-approved style);
 * "v1" = the first pseudo-3D rig (kept for comparison – set this back to re-render the original look).
 */
export const CHARACTER_STYLE = "flat" as "flat" | "v1";

/** The character on stage: evaluates a Performance at time t (voice-driven) and draws the rig. */
export const Actor: React.FC<{
  perf: Performance; t: number; x?: number; y?: number; scale?: number; winter?: Winter; cold?: number; opacity?: number;
}> = ({ perf, t, x = 540, y = 1860, scale = 1.25, winter, cold = 0, opacity = 1 }) => {
  const r = perform(perf, t, envAt, { still: cold * 0.6 });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
      <defs>
        <filter id="actorShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#1B0F08" floodOpacity="0.28" />
        </filter>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${scale})`} filter={CHARACTER_STYLE === "v1" ? "url(#actorShadow)" : undefined}>
        {CHARACTER_STYLE === "flat" ? <CharacterFlat body={r.body} face={r.face} arms={r.arms} talk={r.talk} viseme={r.viseme} blink={r.blink} winter={winter} cold={cold} frame={t * 30} /> : <Character body={r.body} face={r.face} arms={r.arms} talk={r.talk} viseme={r.viseme} blink={r.blink} winter={winter} cold={cold} frame={t * 30} />}
      </g>
    </svg>
  );
};
