import React from 'react';
import geo from '../geo/ghana_geo.json';
import { COLOR, TYPE } from '../brand';
import { CHAT_THEME } from './Chat';

type LL = [number, number];
const G = geo as unknown as { countries: Record<string, LL[][]>; cities: Record<string, LL> };
const BOX = { lon0: -3.5, lon1: 1.5, lat0: 4.4, lat1: 11.4 };
/** Shared-location message card: mini map of Ghana with a pin + title. Also used as the shared element that expands. */
export const LocationCard: React.FC<{ w: number; h: number; title: string; sub: string; pin?: string; mapH?: number; pinPulse?: number }> =
  ({ w, h, title, sub, pin = 'Accra', mapH = 300, pinPulse = 0 }) => {
    const sx = (lon: number) => ((lon - BOX.lon0) / (BOX.lon1 - BOX.lon0)) * 1000; const sy = (lat: number) => ((BOX.lat1 - lat) / (BOX.lat1 - BOX.lat0)) * 1400;
    const [plon, plat] = G.cities[pin];
    return (
      <div style={{ width: w, height: h, borderRadius: 34, borderBottomLeftRadius: 12, overflow: 'hidden', background: CHAT_THEME.bubbleIn, fontFamily: TYPE.display, boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}>
        <div style={{ position: 'relative', height: mapH, background: 'linear-gradient(160deg, #1A2A66, #0E1638)', overflow: 'hidden' }}>
          <svg viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {Object.entries(G.countries).map(([k, rings]) => rings.map((r, i) => (
              <path key={k + i} d={r.map(([x, y], j) => `${j ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join('') + 'Z'} fill={k === 'GHA' ? '#2E43A0' : '#18245A'} stroke={k === 'GHA' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.1)'} strokeWidth={k === 'GHA' ? 5 : 3} />
            )))}
            <circle cx={sx(plon)} cy={sy(plat)} r={60 + 90 * pinPulse} fill="none" stroke={COLOR.orange} strokeWidth={6} opacity={1 - pinPulse} />
            <g transform={`translate(${sx(plon)} ${sy(plat)})`}>
              <path d="M0 0 C0 0 -60 -74 -60 -116 A60 60 0 1 1 60 -116 C60 -74 0 0 0 0 Z" fill={COLOR.orange} stroke="#fff" strokeWidth={10} />
              <circle cx={0} cy={-116} r={23} fill="#fff" />
            </g>
          </svg>
        </div>
        <div style={{ padding: '26px 32px', color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', lineHeight: 1 }}>{title}</div>
          <div style={{ fontWeight: 500, fontSize: 32, color: CHAT_THEME.meta, marginTop: 10 }}>{sub}</div>
        </div>
      </div>
    );
  };
