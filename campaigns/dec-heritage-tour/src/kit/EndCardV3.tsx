import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { COLOR, CONTACT, TYPE, formatGhPhone } from './brand';
import { Line, rich } from './Campaign';
import { backOut, clamp, expoOut, prog } from './motion';

/**
 * V3 branded end card (Bricolage). Order of attention: logo -> headline -> one CTA -> primary contact (big) -> secondary.
 * Times are local seconds. `pulseAt` re-energises the contact pill on the spoken "message".
 * Leaves y 1360–1460 free for compact subtitles.
 */
export const EndCardV3: React.FC<{ t: number; kicker?: string; head1?: string; head2?: string; cta?: string; pulseAt?: number }> =
  ({ t, kicker = 'December Heritage & Relaxation Tour', head1 = 'Your December.', head2 = 'Your *story.*', cta = 'Book your heritage experience.', pulseAt = 4.3 }) => {
    const logo = prog(t, 0.3, 0.95); const le = backOut(logo, 1.15);
    const pill = prog(t, 2.0, 2.45); const pe = backOut(pill, 1.5);
    const pulse = Math.max(0, 1 - Math.abs(t - pulseAt - 0.12) / 0.25); const shine = prog(t, pulseAt, pulseAt + 0.7);
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 280, left: 84, opacity: clamp(logo * 3), transform: `translateY(${(1 - le) * 60}px) scale(${0.9 + 0.1 * le})`, transformOrigin: 'left top' }}>
          <div style={{ background: COLOR.white, borderRadius: 26, padding: '22px 30px', boxShadow: '0 22px 60px rgba(0,0,0,0.35)' }}>
            <Img src={staticFile('brand/Logo.svg')} style={{ width: 236, display: 'block' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 545, left: 84, right: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
            <div style={{ width: 54, height: 4, background: COLOR.orange, transform: `scaleX(${expoOut(prog(t, 0.7, 1.2))})`, transformOrigin: 'left' }} />
            <Line t={t} at={0.75} dur={0.45} size={30} weight={600} tracking={-0.005} color="rgba(255,255,255,0.92)">{kicker}</Line>
          </div>
          <Line t={t} at={0.95} dur={0.55} enter="rise" size={116} weight={800} tracking={-0.045}>{head1}</Line>
          <Line t={t} at={1.15} dur={0.55} enter="rise" size={116} weight={800} tracking={-0.045}>{rich(head2)}</Line>
          <div style={{ marginTop: 26 }}><Line t={t} at={1.5} dur={0.5} enter="fromLeft" size={46} weight={600} tracking={-0.01} color="rgba(255,255,255,0.95)">{cta}</Line></div>
        </div>
        {/* primary contact */}
        <div style={{ position: 'absolute', top: 1065, left: 84, opacity: clamp(pill * 4), transform: `scale(${(0.85 + 0.15 * pe) * (1 + 0.04 * pulse)})`, transformOrigin: 'left center' }}>
          <div style={{ fontFamily: TYPE.display, fontWeight: 500, fontSize: 25, color: 'rgba(255,255,255,0.8)', marginBottom: 12, letterSpacing: '0.01em' }}>{CONTACT.primaryLabel}</div>
          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 22, background: COLOR.orange, borderRadius: 999, padding: '20px 40px 20px 30px', boxShadow: '0 18px 50px rgba(243,122,32,0.42)' }}>
            <svg width="50" height="50" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.18)" /><path d="M8.6 10.6a9.5 9.5 0 0 0 4.8 4.8l1.6-1.6c.2-.2.5-.3.8-.2.8.3 1.7.4 2.6.4.4 0 .7.3.7.7V17c0 .4-.3.7-.7.7A12.2 12.2 0 0 1 6.3 5.6c0-.4.3-.7.7-.7h2.4c.4 0 .7.3.7.7 0 .9.1 1.8.4 2.6.1.3 0 .6-.2.8z" fill="#fff" /></svg>
            <span style={{ fontFamily: TYPE.display, fontWeight: 800, fontSize: 64, color: COLOR.white, letterSpacing: '-0.01em' }}>{formatGhPhone(CONTACT.phones[0])}</span>
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 140, left: `${-25 + 150 * shine}%`, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))', opacity: shine > 0 && shine < 1 ? 1 : 0 }} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 1268, left: 84, right: 60 }}>
          <Line t={t} at={2.4} dur={0.45} size={33} weight={600} tracking={-0.005} color="rgba(255,255,255,0.88)">{formatGhPhone(CONTACT.phones[1])}   ·   {CONTACT.website}</Line>
        </div>
      </AbsoluteFill>
    );
  };
