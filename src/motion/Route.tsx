import React, { useMemo } from "react";
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { ACCRA_XY, BUDAPEST_XY, COUNTRIES, GRATICULE_D, GREAT_CIRCLE_KM, REGION_LABELS, ROUTE_D } from "./mapData";
import { C, FPS, GRADE, H, W, clamp, expo, inOut, sec, type } from "./tokens";
import { PinIcon } from "./ui";

const GHANA = Object.keys(COUNTRIES).find((k) => k.startsWith("288:"))!;
const HUNGARY = Object.keys(COUNTRIES).find((k) => k.startsWith("348:"))!;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const flyEase = Easing.bezier(0.5, 0.0, 0.25, 1);

/** Route timeline in seconds relative to the scene's own start (r = 0 is the beat the scene "starts" on). */
export const R = { pingA: 0.1, fly0: 0.45, fly1: 2.3, arrive: 2.3, open0: 2.8, open1: 3.55 };
/** Frames the dome footage has been playing when the route scene hands over to the IBS scene (see Campus.tsx). */
export const DOME = { startFrom: 30, scale0: 1.25, scale1: 1.15 };

/**
 * Accra -> Budapest. Real geography (Natural Earth 50 m via world-atlas, Mercator); the two cities are placed from
 * verified coordinates — Accra 5.6037 N 0.1870 W, Budapest 47.4979 N 19.0402 E. `lead` frames are shown before r = 0
 * (the scene is visible through the BUDAPEST? letters).
 */
export const Route: React.FC<{ lead: number }> = ({ lead }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (frame - lead) / FPS;

  const length = useMemo(() => getLength(ROUTE_D), []);
  const flyP = flyEase(interpolate(r, [R.fly0, R.fly1], [0, 1], clamp));
  const head = getPointAtLength(ROUTE_D, length * flyP);
  const ahead = getPointAtLength(ROUTE_D, Math.min(length, length * flyP + 8));
  const heading = (Math.atan2(ahead.y - head.y, ahead.x - head.x) * 180) / Math.PI + 90;

  // camera: tight on Accra -> pull back so the whole route is the picture -> follow the aircraft in on Budapest
  const mid: [number, number] = [(ACCRA_XY[0] + BUDAPEST_XY[0]) / 2 + 30, (ACCRA_XY[1] + BUDAPEST_XY[1]) / 2];
  const k1 = Easing.bezier(0.45, 0, 0.2, 1)(interpolate(r, [0.4, 1.25], [0, 1], clamp));
  const k2 = Easing.bezier(0.4, 0, 0.2, 1)(interpolate(r, [1.3, 2.4], [0, 1], clamp));
  const scale = r < 1.28 ? lerp(2.5, 0.9, k1) : lerp(0.9, 1.95, k2);
  const cx = r < 1.28 ? lerp(ACCRA_XY[0], mid[0], k1) : lerp(mid[0], BUDAPEST_XY[0], k2);
  const cy = r < 1.28 ? lerp(ACCRA_XY[1], mid[1], k1) : lerp(mid[1], BUDAPEST_XY[1], k2);
  const tx = W / 2 - cx * scale;
  const ty = H * 0.47 - cy * scale;
  const sx = (x: number) => tx + x * scale;
  const sy = (y: number) => ty + y * scale;

  const evo = evolvePath(flyP, ROUTE_D);
  const hungary = spring({ frame: frame - lead - sec(R.arrive), fps, config: { damping: 14, stiffness: 120 } });
  const km = Math.round(GREAT_CIRCLE_KM * flyP);
  const ping = (t0: number) => {
    const p = (r - t0) / 1.1;
    return p > 0 && p < 1 ? p : -1;
  };
  const pA = ping(R.pingA);
  const pB = ping(R.arrive);
  const openP = inOut(interpolate(r, [R.open0, R.open1], [0, 1], clamp));
  const hudIn = expo(interpolate(r, [0.25, 0.85], [0, 1], clamp));
  const cxB = sx(BUDAPEST_XY[0]);
  const cyB = sy(BUDAPEST_XY[1]);
  const dotGap = 26 / scale;

  return (
    <AbsoluteFill style={{ background: C.navyDeep, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, ${C.navyMid} 0%, ${C.navyDeep} 72%)` }} />
      {/* parallax back: graticule drifts slower than the land */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${W / 2 - cx * scale * 0.88} ${H * 0.47 - cy * scale * 0.88}) scale(${scale * 0.88})`}>
          <path d={GRATICULE_D} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={2 / (scale * 0.88)} />
        </g>
      </svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="routeMask">
            <path d={ROUTE_D} fill="none" stroke="#fff" strokeWidth={60 / scale} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
          </mask>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6 / scale} /></filter>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          {Object.entries(COUNTRIES).map(([k, d]) => {
            const isG = k === GHANA, isH = k === HUNGARY;
            return (
              <path
                key={k} d={d}
                fill={isH ? `rgba(243,122,32,${0.2 + 0.8 * hungary})` : isG ? "#3d57c4" : "#243791"}
                stroke={isH ? C.orange : "rgba(255,255,255,.22)"} strokeWidth={(isH ? 3.2 : 1.4) / scale} strokeLinejoin="round"
              />
            );
          })}
          {/* geographic reference labels, letter-spaced, fixed screen size */}
          {REGION_LABELS.map((l) => (
            <text key={l.t} x={l.x} y={l.y} fontSize={30 / scale} fill="rgba(255,255,255,.34)" textAnchor="middle" style={{ fontFamily: "Archivo, sans-serif", fontVariationSettings: '"wdth" 100', fontWeight: 600, letterSpacing: `${8 / scale}px` }}>
              {l.t}
            </text>
          ))}
          {/* the route is the hero: guide line, soft glow, and a bold dotted line that draws with the aircraft */}
          <path d={ROUTE_D} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={2.5 / scale} />
          <g mask="url(#routeMask)">
            <path d={ROUTE_D} fill="none" stroke={C.orange} strokeWidth={18 / scale} opacity=".38" filter="url(#glow)" />
            <path d={ROUTE_D} fill="none" stroke={C.orange} strokeWidth={13 / scale} strokeLinecap="round" strokeDasharray={`0.1 ${dotGap}`} />
          </g>
          {[ACCRA_XY, BUDAPEST_XY].map((p, i) => {
            const pr = i === 0 ? pA : pB;
            return (
              <g key={i}>
                {pr >= 0 && <circle cx={p[0]} cy={p[1]} r={(20 + 120 * pr) / scale} fill="none" stroke={C.orange} strokeWidth={5 / scale} opacity={1 - pr} />}
                <circle cx={p[0]} cy={p[1]} r={(i === 1 ? 15 : 12) / scale} fill={C.white} stroke={C.orange} strokeWidth={6 / scale} />
              </g>
            );
          })}
          {flyP > 0.002 && flyP < 0.998 && (
            <g transform={`translate(${head.x} ${head.y}) rotate(${heading}) scale(${1 / scale})`}>
              <g transform="translate(16 26)" opacity=".3"><g transform="translate(-65 -65) scale(5.4)"><PlaneShape color="#000" /></g></g>
              <g transform="translate(-65 -65) scale(5.4)"><PlaneShape color={C.white} /></g>
            </g>
          )}
        </g>
      </svg>
      {/* parallax front: soft atmosphere drifting faster than the land */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", width: 900 + i * 220, height: 260 + i * 60, borderRadius: "50%", background: "rgba(255,255,255,.05)", filter: "blur(70px)", left: ((i * 520 - frame * (5 + i * 2.2)) % 2000) - 500, top: 380 + i * 520 - (cy - 1400) * scale * 0.06 }} />
        ))}
      </AbsoluteFill>
      {/* labels: Accra is the quiet origin, Budapest the loud destination */}
      <CityLabel x={sx(ACCRA_XY[0]) + 30} y={sy(ACCRA_XY[1]) - 40} at={R.pingA + 0.15} r={r} title="ACCRA" sub="GHANA" coord="5.60° N · 0.19° W" />
      <CityLabel x={cxB - 300} y={cyB - 290} at={R.arrive + 0.05} r={r} title="BUDAPEST" sub="HUNGARY" coord="47.50° N · 19.04° E" big />
      <div style={{ position: "absolute", left: 64, top: 262, opacity: hudIn, transform: `translateY(${(1 - hudIn) * -24}px)`, color: C.white }}>
        <div style={{ ...type(26, 100, 700), letterSpacing: 5, opacity: 0.78 }}>ACCRA → BUDAPEST</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
          <span style={{ ...type(120, 62, 900), color: C.orange, fontVariantNumeric: "tabular-nums" }}>{km.toLocaleString("en-US")}</span>
          <span style={{ ...type(34, 100, 800), letterSpacing: 3 }}>KM</span>
        </div>
      </div>
      {/* arrival: the destination marker expands into the circle that opens onto Budapest */}
      {openP > 0 && (
        <>
          <AbsoluteFill style={{ clipPath: `circle(${openP * 2300}px at ${cxB}px ${cyB}px)` }}>
            <AbsoluteFill style={{ transform: `scale(${DOME.scale0 - (DOME.scale0 - DOME.scale1) * openP})`, transformOrigin: "50% 60%", filter: GRADE.parliament }}>
              <OffthreadVideo src={staticFile("media/budapest_parliament.mp4")} startFrom={DOME.startFrom} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,23,71,.4), rgba(15,23,71,0) 30%, rgba(15,23,71,0) 62%, rgba(15,23,71,.55))" }} />
          </AbsoluteFill>
          {openP < 0.5 && (
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - openP * 2 }}>
              <circle cx={cxB} cy={cyB} r={openP * 2300} fill="none" stroke={C.orange} strokeWidth={9} />
            </svg>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

const PlaneShape: React.FC<{ color: string }> = ({ color }) => (
  <path d="M12 1.5c.9 0 1.5 1 1.5 2.3v5.6l8.2 5v2.2l-8.2-2.3v4.6l2.6 2v1.6L12 21.4l-4.1 1.1v-1.6l2.6-2v-4.6l-8.2 2.3v-2.2l8.2-5V3.8c0-1.3.6-2.3 1.5-2.3z" fill={color} />
);

const CityLabel: React.FC<{ x: number; y: number; at: number; r: number; title: string; sub: string; coord: string; big?: boolean }> = ({ x, y, at, r, title, sub, coord, big }) => {
  const p = expo(interpolate(r, [at, at + 0.5], [0, 1], clamp));
  if (p <= 0) return null;
  const out = interpolate(r, [R.open0 - 0.05, R.open0 + 0.3], [1, 0], clamp);
  const left = Math.max(64, Math.min(x, W - 64 - (big ? 620 : 330)));
  return (
    <div style={{ position: "absolute", left, top: y - 60, opacity: out, color: C.white }}>
      <div style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        <div style={{ ...type(big ? 140 : 70, 62, 900), color: big ? C.orange : C.white, textShadow: "0 4px 26px rgba(15,23,71,.8)" }}>{title}</div>
        <div style={{ ...type(big ? 34 : 24, 100, 800), letterSpacing: 5, marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <PinIcon size={big ? 36 : 24} />{sub}
        </div>
        <div style={{ ...type(big ? 24 : 20, 100, 600), letterSpacing: 3, marginTop: 8, opacity: 0.8 }}>{coord}</div>
      </div>
    </div>
  );
};
