import React from 'react';
import { COLOR, TYPE } from './brand';
// Typographic primitives. Headline = bold grotesk (tight), accent = editorial serif italic, label = small spaced caps.
const shadow = '0 2px 24px rgba(5,8,25,0.35)';
export const Headline: React.FC<{ size: number; color?: string; tracking?: number; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ size, color = COLOR.white, tracking = -0.035, style, children }) => (
    <div style={{ fontFamily: TYPE.sans, fontWeight: 800, fontSize: size, lineHeight: 0.92, letterSpacing: `${tracking}em`, color, textTransform: 'uppercase', textShadow: shadow, whiteSpace: 'nowrap', ...style }}>{children}</div>
  );
export const Accent: React.FC<{ size: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ size, color = COLOR.cream, style, children }) => (
    <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.01em', color, textShadow: shadow, whiteSpace: 'nowrap', ...style }}>{children}</div>
  );
export const Label: React.FC<{ size?: number; color?: string; tracking?: number; weight?: number; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ size = 28, color = COLOR.white, tracking = 0.32, weight = 700, style, children }) => (
    <div style={{ fontFamily: TYPE.sans, fontWeight: weight, fontSize: size, letterSpacing: `${tracking}em`, color, textTransform: 'uppercase', textShadow: '0 1px 12px rgba(5,8,25,0.45)', whiteSpace: 'nowrap', ...style }}>{children}</div>
  );
/** Hairline that draws itself (scaleX from the left). */
export const Rule: React.FC<{ p: number; width: number; color?: string; thickness?: number; style?: React.CSSProperties }> =
  ({ p, width, color = COLOR.orange, thickness = 3, style }) => (
    <div style={{ width, height: thickness, background: color, transform: `scaleX(${p})`, transformOrigin: 'left center', ...style }} />
  );
