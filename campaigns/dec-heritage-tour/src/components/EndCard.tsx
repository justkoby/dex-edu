import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, FONT, SAFE, clamp01, easeOut } from '../theme';
import { BRAND_NAME, CAMPAIGN_TITLE, CONTACT, TAGLINE } from '../contact';

/** Branded end card. Edit contact lines in src/contact.ts – unconfirmed lines render with a TO BE CONFIRMED marker. */
export const EndCard: React.FC<{ showPlaceholderMarkers?: boolean }> = ({ showPlaceholderMarkers = true }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const a = (d: number, len = 0.7) => easeOut(clamp01((t - d) / len));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(13,19,48,0.55) 0%, rgba(13,19,48,0.78) 55%, rgba(13,19,48,0.9) 100%)`, opacity: a(0, 1.0), backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', borderRadius: 34, padding: '34px 48px', opacity: a(0.3), transform: `translateY(${(1 - a(0.3)) * 30}px)`, boxShadow: '0 18px 60px rgba(0,0,0,0.35)' }}>
          <Img src={staticFile('brand/Logo.svg')} style={{ width: 330, display: 'block' }} />
        </div>
        <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 20, opacity: a(0.7) }}>
          <div style={{ height: 4, width: 80 * a(0.7, 0.8), background: BRAND.orange }} />
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 31, letterSpacing: '0.26em', color: BRAND.orange }}>{CAMPAIGN_TITLE}</div>
        </div>
        <div style={{ marginTop: 40, fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 74, lineHeight: 1.1, whiteSpace: 'nowrap', color: BRAND.cream, opacity: a(1.0, 0.9), transform: `translateY(${(1 - a(1.0, 0.9)) * 30}px)`, textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
          {TAGLINE.split('. ').map((s, i, arr) => (<div key={i}>{i < arr.length - 1 ? s + '.' : s}</div>))}
        </div>
        <div style={{ marginTop: 54, width: '100%' }}>
          {CONTACT.map((c, i) => (
            <div key={i} style={{ marginBottom: 22, padding: '20px 26px', borderRadius: 18, border: c.confirmed ? '2px solid rgba(255,255,255,0.35)' : '2px dashed rgba(255,190,90,0.75)', background: 'rgba(255,255,255,0.07)', opacity: a(1.7 + i * 0.18, 0.6), transform: `translateX(${(1 - a(1.7 + i * 0.18, 0.6)) * -24}px)` }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 21, letterSpacing: '0.28em', color: BRAND.orange }}>{c.label}{!c.confirmed && showPlaceholderMarkers ? '  ·  TO BE CONFIRMED' : ''}</div>
              <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, color: c.confirmed ? '#fff' : 'rgba(255,255,255,0.62)' }}>{c.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, fontFamily: FONT.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.7)', opacity: a(2.4) }}>{BRAND_NAME}</div>
      </div>
    </AbsoluteFill>
  );
};
