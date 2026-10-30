import React from 'react';
import geo from '../geo/ghana_geo.json';
import { COLOR, TYPE } from '../brand';
import { backOut, clamp, expoInOut, expoOut, lerp, prog, quintInOut } from '../motion';

/**
 * Animated Ghana route map (Natural Earth 10m outlines + the Accra→Cape Coast N1 road geometry, public domain).
 * Equirectangular projection; `cam` = { lon, lat, zoom }. Everything is a pure function of time.
 * Exports `project` so other layers (shared-element transitions) can lock onto map positions.
 */
type LL = [number, number];
const G = geo as unknown as { countries: Record<string, LL[][]>; route: LL[]; cities: Record<string, LL> };
const K = 200; const LAT0 = 7.6; const COS = Math.cos((LAT0 * Math.PI) / 180);
const toMap = ([lon, lat]: LL) => [lon * K * COS, -lat * K] as [number, number];
export type MapCam = { lon: number; lat: number; zoom: number };
export const project = (ll: LL, cam: MapCam, W = 1080, H = 1920) => {
  const [x, y] = toMap(ll); const [cx, cy] = toMap([cam.lon, cam.lat]);
  return [W / 2 + (x - cx) * cam.zoom, H / 2 + (y - cy) * cam.zoom] as [number, number];
};
// route in map units + cumulative length (for constant-speed travel and dash drawing)
const RP = G.route.map(toMap); const CUM = RP.reduce<number[]>((a, p, i) => (i ? [...a, a[i - 1] + Math.hypot(p[0] - RP[i - 1][0], p[1] - RP[i - 1][1])] : [0]), []);
const LEN = CUM[CUM.length - 1];
export const routeAt = (f: number) => {          // position + heading at fraction f of the route
  const d = clamp(f) * LEN; let i = CUM.findIndex((c) => c >= d); if (i <= 0) i = 1;
  const a = RP[i - 1], b = RP[i]; const u = (d - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]);
  const xy: [number, number] = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  return { xy, ll: [xy[0] / (K * COS), -xy[1] / K] as LL, heading: Math.atan2(b[1] - a[1], b[0] - a[0]) };
};
/** Explicit polyline from the start to the exact point at fraction f (no dash tricks – they break with non-scaling strokes). */
const travelledD = (f: number) => {
  const d = clamp(f) * LEN; const pts = RP.filter((_, i) => CUM[i] <= d); const end = routeAt(f).xy;
  return [...pts, end].map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
};
const pathD = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + 'Z';

/** Top-down tour bus marker (brand orange), pointing along +x before rotation. */
export const BusMarker: React.FC<{ x: number; y: number; heading: number; scale?: number }> = ({ x, y, heading, scale = 1 }) => (
  <svg width={120} height={120} viewBox="-60 -60 120 120" style={{ position: 'absolute', left: x - 60, top: y - 60, overflow: 'visible', transform: `rotate(${(heading * 180) / Math.PI}deg) scale(${scale})`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}>
    <rect x={-40} y={-17} width={80} height={34} rx={10} fill={COLOR.orange} stroke="#fff" strokeWidth={3} />
    <rect x={22} y={-13} width={12} height={26} rx={4} fill={COLOR.navy} />
    {[-28, -14, 0, 14].map((xx) => <rect key={xx} x={xx - 5} y={-13} width={10} height={6} rx={2} fill="rgba(255,255,255,0.85)" />)}
    {[-28, -14, 0, 14].map((xx) => <rect key={xx} x={xx - 5} y={7} width={10} height={6} rx={2} fill="rgba(255,255,255,0.85)" />)}
    <rect x={-32} y={-3} width={50} height={6} rx={3} fill="rgba(255,255,255,0.95)" />
  </svg>
);

/** Map pin that drops onto (x,y) with a ripple; `label` sits beside it. */
export const MapPin: React.FC<{ t: number; at: number; x: number; y: number; label: string; sub?: string }> = ({ t, at, x, y, label, sub }) => {
  if (t < at) return null;
  const d = prog(t, at, at + 0.4); const py = -120 * (1 - backOut(d, 1.6)); const rip = prog(t, at + 0.32, at + 0.95);
  const lab = expoOut(prog(t, at + 0.3, at + 0.75));
  return (
    <>
      {rip > 0 && rip < 1 && <div style={{ position: 'absolute', left: x - 80 * rip, top: y - 22 * rip, width: 160 * rip, height: 44 * rip, borderRadius: '50%', border: `3px solid ${COLOR.orange}`, opacity: 1 - rip }} />}
      <svg width={76} height={100} viewBox="0 0 64 86" style={{ position: 'absolute', left: x - 38, top: y - 98, transform: `translateY(${py}px)`, overflow: 'visible', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))' }}>
        <path d="M32 82 C32 82 6 50 6 31 A26 26 0 1 1 58 31 C58 50 32 82 32 82 Z" fill={COLOR.orange} stroke="#fff" strokeWidth={4} />
        <circle cx={32} cy={31} r={10} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: x + 60, top: y - 118, overflow: 'hidden', paddingRight: 10 }}>
        <div style={{ transform: `translateY(${(1 - lab) * 105}%)`, fontFamily: TYPE.display }}>
          <div style={{ fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{label}</div>
          {sub && <div style={{ fontWeight: 600, fontSize: 28, color: COLOR.orange, marginTop: 8 }}>{sub}</div>}
        </div>
      </div>
    </>
  );
};

/** Static styled map (outlines + cities + route) rendered for a camera. `drawn` = fraction of the route already travelled. */
export const GhanaMap: React.FC<{ cam: MapCam; drawn: number; showCities?: boolean; routeOpacity?: number }> = ({ cam, drawn, showCities = true, routeOpacity = 1 }) => {
  const [cx, cy] = toMap([cam.lon, cam.lat]);
  const tf = `translate(${540 - cx * cam.zoom} ${960 - cy * cam.zoom}) scale(${cam.zoom})`;
  const routeD = RP.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(90% 60% at 50% 55%, #121C47 0%, #080D26 75%)' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} /></pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#grid)" />
        <g transform={tf}>
          {Object.entries(G.countries).filter(([k]) => k !== 'GHA').map(([k, rings]) => rings.map((r, i) => <path key={k + i} d={pathD(r.map(toMap))} fill="#1D2A63" stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />))}
          {G.countries.GHA.map((r, i) => <path key={i} d={pathD(r.map(toMap))} fill="#3A51A8" stroke="rgba(255,255,255,0.85)" strokeWidth={3} vectorEffect="non-scaling-stroke" />)}
          <path d={routeD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={routeOpacity} />
          {drawn > 0.001 && <path d={travelledD(drawn)} fill="none" stroke={COLOR.orange} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={routeOpacity} />}
        </g>
      </svg>
      {showCities && Object.entries(G.cities).filter(([n]) => n !== 'Cape Coast' && n !== 'Tema').map(([n, ll]) => {
        const [x, y] = project(ll, cam); if (x < -100 || x > 1180 || y < -100 || y > 2020) return null;
        return (
          <div key={n} style={{ position: 'absolute', left: x - 9, top: y - 9, display: 'flex', alignItems: 'center', gap: n === 'Accra' ? 46 : 12 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', opacity: 0.9 }} />
            <span style={{ fontFamily: TYPE.display, fontWeight: 600, fontSize: n === 'Accra' ? 44 : 34, color: n === 'Accra' ? '#fff' : 'rgba(255,255,255,0.7)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Camera/bus choreography helper: country view -> follow bus -> settle on the destination -> fly into the pin. */
export const routeCamera = (t: number, k: { show: number; depart: number; arrive: number; dive: number; diveEnd: number }) => {
  const country: MapCam = { lon: -1.05, lat: 7.55, zoom: 1.0 };
  const f = quintInOut(prog(t, k.depart, k.arrive)); const bus = routeAt(f);
  const follow: MapCam = { lon: bus.ll[0] - 0.08, lat: bus.ll[1] + 0.32, zoom: 3.4 };
  const to = (a: MapCam, b: MapCam, u: number): MapCam => ({ lon: lerp(a.lon, b.lon, u), lat: lerp(a.lat, b.lat, u), zoom: a.zoom * Math.pow(b.zoom / a.zoom, u) });
  let cam = to(country, follow, expoInOut(prog(t, k.show + 0.5, k.depart + 0.6)));
  const end = routeAt(1); const settle: MapCam = { lon: end.ll[0], lat: end.ll[1] + 0.22, zoom: 4.2 };
  cam = to(cam, settle, expoInOut(prog(t, k.arrive - 0.3, k.dive)));
  const dive: MapCam = { lon: end.ll[0], lat: end.ll[1] + 0.0016, zoom: 60 };   // centre on the pin head so the reveal opens mid-frame
  cam = to(cam, dive, Math.pow(prog(t, k.dive, k.diveEnd), 2.2));
  return { cam, f, bus };
};
