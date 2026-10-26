import React, { useMemo } from "react";
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { ACCRA_XY, BUDAPEST_XY, COUNTRIES, GRATICULE_D, GREAT_CIRCLE_KM, MAP_H, MAP_W, ROUTE_D } from "./mapData";
import { C, FPS, H, W, clamp, expo, inOut, sec, type } from "./tokens";
import { MaskLine, PinIcon, PlaneIcon } from "./ui";

const GHANA = Object.keys(COUNTRIES).find((k) => k.startsWith("288:"))!;
const HUNGARY = Object.keys(COUNTRIES).find((k) => k.startsWith("348:"))!;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Route timeline in seconds, relative to the scene's own start (r = 0 is the beat the scene "starts" on). */
const R = { pingA: 0.1, fly0: 0.5, fly1: 2.7, arrive: 2.7, open0: 3.35, open1: 4.25 };

/**
 * Accra -> Budapest. Map is real geography (Natural Earth via world-atlas, Mercator) with the two cities placed from
 * verified lat/lon. `lead` frames of the scene are visible before r=0 (it is shown through the BUDAPEST? letters).
 */
export const Route: React.FC<{ lead: number }> = ({ lead }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (frame - lead) / FPS; // seconds relative to scene start

  const length = useMemo(() => getLength(ROUTE_D), []);
  const flyP = Easing.bezier(0.45, 0.05, 0.4, 1)(interpolate(r, [R.fly0, R.fly1], [0, 1], clamp));
  const head = getPointAtLength(ROUTE_D, length * flyP);
  const ahead = getPointAtLength(ROUTE_D, Math.min(length, length * flyP + 6));
  const heading = (Math.atan2(ahead.y - head.y, ahead.x - head.x) * 180) / Math.PI + 90;

  // camera: starts tight on Accra, pulls back to frame the whole journey, then pushes in on Budapest
  const mid: [number, number] = [(ACCRA_XY[0] + BUDAPEST_XY[0]) / 2 + 40, (ACCRA_XY[1] + BUDAPEST_XY[1]) / 2];
  const camT = (a: number, b: number) => inOut(interpolate(r, [a, b], [0, 1], clamp));
  const s1 = lerp(2.5, 0.86, camT(0.45, 1.5));
  const scale = r < 1.55 ? s1 : lerp(0.86, 1.95, camT(1.6, 2.8));
  const cx = r < 1.55 ? lerp(ACCRA_XY[0], mid[0], camT(0.45, 1.5)) : lerp(mid[0], BUDAPEST_XY[0], camT(1.6, 2.8));
  const cy = r < 1.55 ? lerp(ACCRA_XY[1], mid[1], camT(0.45, 1.5)) : lerp(mid[1], BUDAPEST_XY[1], camT(1.6, 2.8));
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
  const sw = 3 / scale;
  const openP = inOut(interpolate(r, [R.open0, R.open1], [0, 1], clamp));
  const hudIn = expo(interpolate(r, [0.3, 0.9], [0, 1], clamp));

  return (
    <AbsoluteFill style={{ background: C.navyDeep, overflow: "hidden" }}>
      {/* sea light */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, ${C.navyMid} 0%, ${C.navyDeep} 70%)` }} />
      {/* parallax 1 (back): graticule drifts slower than the land */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${W / 2 - cx * scale * 0.88} ${H * 0.47 - cy * scale * 0.88}) scale(${scale * 0.88})`}>
          <path d={GRATICULE_D} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={2 / (scale * 0.88)} />
        </g>
      </svg>
      {/* land + route */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="routeMask">
            <path d={ROUTE_D} fill="none" stroke="#fff" strokeWidth={40 / scale} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
          </mask>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          {Object.entries(COUNTRIES).map(([k, d]) => {
            const isG = k === GHANA, isH = k === HUNGARY;
            return (
              <path
                key={k} d={d}
                fill={isH ? `rgba(243,122,32,${0.18 + 0.82 * hungary})` : isG ? "#3d57c4" : "#243791"}
                stroke={isH ? C.orange : "rgba(255,255,255,.22)"} strokeWidth={(isH ? 3 : 1.4) / scale} strokeLinejoin="round"
              />
            );
          })}
          {/* faint full route (guide) + dotted drawn route */}
          <path d={ROUTE_D} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={2 / scale} />
          <g mask="url(#routeMask)">
            <path d={ROUTE_D} fill="none" stroke={C.orange} strokeWidth={9 / scale} strokeLinecap="round" strokeDasharray={`0.1 ${24 / scale}`} />
          </g>
          {/* pins */}
          {[ACCRA_XY, BUDAPEST_XY].map((p, i) => {
            const pr = i === 0 ? pA : pB;
            return (
              <g key={i}>
                {pr >= 0 && <circle cx={p[0]} cy={p[1]} r={(18 + 110 * pr) / scale} fill="none" stroke={C.orange} strokeWidth={4 / scale} opacity={1 - pr} />}
                <circle cx={p[0]} cy={p[1]} r={11 / scale} fill={C.white} stroke={C.orange} strokeWidth={5 / scale} />
              </g>
            );
          })}
          {/* aircraft with a soft shadow */}
          {flyP > 0 && flyP < 1 && (
            <g transform={`translate(${head.x} ${head.y}) rotate(${heading}) scale(${1 / scale})`}>
              <g transform="translate(14 22)" opacity=".28"><g transform="translate(-45 -45) scale(3.75)"><PlaneSvg color="#000" /></g></g>
              <g transform="translate(-45 -45) scale(3.75)"><PlaneSvg color={C.white} /></g>
            </g>
          )}
        </g>
      </svg>
      {/* parallax 2 (front): soft atmosphere drifting faster than the land */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute", width: 900 + i * 220, height: 260 + i * 60, borderRadius: "50%", background: "rgba(255,255,255,.055)", filter: "blur(70px)",
              left: ((i * 520 - frame * (5 + i * 2.2)) % 2000) - 500, top: 380 + i * 520 - (cy - 1400) * scale * 0.06,
            }}
          />
        ))}
      </AbsoluteFill>
      {/* city labels, screen-space so type stays crisp */}
      <CityLabel x={sx(ACCRA_XY[0]) + 34} y={sy(ACCRA_XY[1]) - 46} at={R.pingA + 0.15} r={r} title="ACCRA" sub="GHANA" />
      <CityLabel x={sx(BUDAPEST_XY[0]) - 250} y={sy(BUDAPEST_XY[1]) - 260} at={R.arrive + 0.05} r={r} title="BUDAPEST" sub="HUNGARY" big />
      {/* HUD: distance counter */}
      <div style={{ position: "absolute", left: 64, top: 262, opacity: hudIn, transform: `translateY(${(1 - hudIn) * -24}px)`, color: C.white }}>
        <div style={{ ...type(26, 100, 700), letterSpacing: 4, opacity: 0.75 }}>ACCRA → BUDAPEST</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
          <span style={{ ...type(120, 62, 900), color: C.orange, fontVariantNumeric: "tabular-nums" }}>{km.toLocaleString("en-US")}</span>
          <span style={{ ...type(34, 100, 800), letterSpacing: 3 }}>KM</span>
        </div>
      </div>
      {/* arrival: Budapest footage opens from the pin */}
      {openP > 0 && (
        <AbsoluteFill style={{ clipPath: `circle(${openP * 2300}px at ${sx(BUDAPEST_XY[0])}px ${sy(BUDAPEST_XY[1])}px)` }}>
          <AbsoluteFill style={{ transform: `scale(${1.25 - 0.1 * openP})`, transformOrigin: "50% 60%" }}>
            <OffthreadVideo src={staticFile("media/budapest_parliament.mp4")} startFrom={30} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(15,23,71,.45), rgba(15,23,71,0) 30%, rgba(15,23,71,0) 60%, rgba(15,23,71,.6))` }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const PlaneSvg: React.FC<{ color: string }> = ({ color }) => (
  <path d="M12 1.5c.9 0 1.5 1 1.5 2.3v5.6l8.2 5v2.2l-8.2-2.3v4.6l2.6 2v1.6L12 21.4l-4.1 1.1v-1.6l2.6-2v-4.6l-8.2 2.3v-2.2l8.2-5V3.8c0-1.3.6-2.3 1.5-2.3z" fill={color} />
);

const CityLabel: React.FC<{ x: number; y: number; at: number; r: number; title: string; sub: string; big?: boolean }> = ({ x, y, at, r, title, sub, big }) => {
  const p = expo(interpolate(r, [at, at + 0.5], [0, 1], clamp));
  if (p <= 0) return null;
  const out = interpolate(r, [R.open0, R.open0 + 0.35], [1, 0], clamp);
  const left = Math.min(x, W - 64 - (big ? 560 : 330));
  return (
    <div style={{ position: "absolute", left, top: y - 60, opacity: out, color: C.white, display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ overflow: "hidden", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        <div style={{ ...type(big ? 128 : 76, 62, 900), color: C.white, textShadow: "0 4px 24px rgba(15,23,71,.7)" }}>{title}</div>
        <div style={{ ...type(big ? 34 : 26, 100, 700), letterSpacing: 5, marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <PinIcon size={big ? 34 : 26} />{sub}
        </div>
      </div>
    </div>
  );
};
export { MaskLine };
