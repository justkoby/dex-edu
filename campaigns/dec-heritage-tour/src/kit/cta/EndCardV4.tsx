import React from 'react';
import { Img, staticFile } from 'remotion';
import { COLOR, CONTACT, TYPE, formatGhPhone } from '../brand';
import { Line, rich } from '../Campaign';
import { backOut, clamp, prog } from '../motion';

/**
 * Card-style CTA (white card, navy type) designed to be the end state of a shared-element morph (e.g. a chat bubble).
 * Local time `t` starts when the card has finished expanding. Primary action = WhatsApp line; secondary = call + web.
 */
export const EndCardV4: React.FC<{ t: number; w: number; title?: string; headline?: string; pulseAt?: number }> =
  ({ t, w, title = 'December Heritage & Relaxation Tour', headline = 'Book your *December* in Ghana.', pulseAt = 1.6 }) => {
    const logo = backOut(prog(t, 0.0, 0.5), 1.2); const pill = backOut(prog(t, 0.55, 0.95), 1.5);
    const pulse = Math.max(0, 1 - Math.abs(t - pulseAt) / 0.22);
    return (
      <div style={{ position: 'absolute', inset: 0, padding: '64px 60px', fontFamily: TYPE.display, color: COLOR.navy, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Img src={staticFile('brand/Logo.svg')} style={{ width: 380, opacity: clamp(logo * 2), transform: `translateY(${(1 - logo) * 30}px) scale(${0.9 + 0.1 * logo})`, transformOrigin: 'left top' }} />
        <div style={{ marginTop: 50 }}><Line t={t} at={0.15} dur={0.45} size={38} weight={600} tracking={-0.01} color={COLOR.navy}>{title}</Line></div>
        <div style={{ marginTop: 18 }}>
          {headline.split('|').map((l, i) => <Line key={i} t={t} at={0.25 + i * 0.12} dur={0.5} size={118} weight={800} tracking={-0.045} color={COLOR.ink} style={{ textShadow: 'none' }}>{rich(l)}</Line>)}
        </div>
        <div style={{ marginTop: 'auto', width: '100%' }}>
          <div style={{ fontWeight: 600, fontSize: 32, color: 'rgba(40,60,141,0.8)', marginBottom: 14, opacity: clamp(pill * 2) }}>Message us on WhatsApp</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: COLOR.orange, borderRadius: 999, padding: '22px 40px 22px 26px', boxShadow: '0 16px 40px rgba(243,122,32,0.4)', transform: `scale(${(0.8 + 0.2 * pill) * (1 + 0.05 * pulse)})`, transformOrigin: 'left center', opacity: clamp(pill * 3) }}>
            <svg width="52" height="52" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.2)" /><path d="M6.5 17.6l.8-2.6A6 6 0 1 1 9.6 17l-3.1.6z" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 9.6c.2.9 1.2 2.4 2.6 3.1.4.2.8 0 1-.3l.3-.4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>
            <span style={{ fontWeight: 800, fontSize: 66, color: '#fff', letterSpacing: '-0.01em' }}>{formatGhPhone(CONTACT.phones[0])}</span>
          </div>
          <div style={{ marginTop: 26 }}><Line t={t} at={0.9} dur={0.45} size={34} weight={600} tracking={-0.005} color="rgba(11,16,48,0.75)" style={{ textShadow: 'none' }}>Call {formatGhPhone(CONTACT.phones[1])}  ·  {CONTACT.website}</Line></div>
        </div>
      </div>
    );
  };

/** Small editorial location/info chip (glass pill with an orange dot). */
export const Chip: React.FC<{ t: number; at: number; outAt: number; text: string; x?: number; y?: number }> = ({ t, at, outAt, text, x = 60, y = 250 }) => {
  const a = backOut(prog(t, at, at + 0.4), 1.4); const o = prog(t, outAt, outAt + 0.25);
  if (t < at || o >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px 16px 22px', borderRadius: 999, background: 'rgba(10,13,28,0.62)', border: '1px solid rgba(255,255,255,0.18)', fontFamily: TYPE.display, fontWeight: 600, fontSize: 32, color: '#fff', transform: `scale(${0.7 + 0.3 * a}) translateY(${-o * 20}px)`, transformOrigin: 'left center', opacity: clamp(a * 2) * (1 - o) }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: COLOR.orange }} />{text}
    </div>
  );
};
