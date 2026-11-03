import React from 'react';
import { Img, staticFile } from 'remotion';

/**
 * Official DEX-EDU-TOUR logo (public/brand/DEX-EDU-TOUR-logo.svg, byte-identical to the client file).
 * The SVG sits in a 1080×1080 canvas with empty margins; this component frames only the artwork
 * (measured bbox x 103–1003, y 254–747) with a CSS crop – the file, its proportions and colours are untouched.
 */
const ART = { x: 103, y: 254, w: 900, h: 493 };
export const LOGO_ASPECT = ART.w / ART.h;
export const BrandLogo: React.FC<{ width: number; pad?: number; style?: React.CSSProperties }> = ({ width, pad = 0.02, style }) => {
  const s = width / (ART.w * (1 + 2 * pad));             // px per SVG unit
  return (
    <div style={{ width, height: ART.h * s * (1 + 2 * pad * LOGO_ASPECT), overflow: 'hidden', position: 'relative', ...style }}>
      <Img src={staticFile('brand/DEX-EDU-TOUR-logo.svg')} style={{ position: 'absolute', width: 1080 * s, height: 1080 * s, left: -(ART.x - ART.w * pad) * s, top: -(ART.y - ART.w * pad) * s, maxWidth: 'none' }} />
    </div>
  );
};
