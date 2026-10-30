import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { BRAND_NAME, COLOR, CONTACT, TYPE, formatGhPhone } from './brand';
import { Reveal } from './Reveal';
import { Accent, Headline, Label, Rule } from './Type';
import { backOut, clamp, expoOut, prog } from './motion';

/**
 * Premium end card: logo plate -> campaign lock-up -> CTA pill (timed to the spoken "message today") -> contacts.
 * Reusable: pass `kicker`, `title`, `titleAccent`, `cta`, and timing anchors (seconds, local to the card).
 */
export const EndCard: React.FC<{ t: number; kicker?: string; title?: string; titleAccent?: string; cta?: string; ctaAt?: number }> =
  ({ t, kicker = 'This December', title = 'Heritage', titleAccent = '& Relaxation Tour', cta = 'Message us today', ctaAt = 3.9 }) => {
    const logoP = prog(t, 0.35, 1.05); const logoE = backOut(logoP, 1.1);
    const ctaP = prog(t, ctaAt, ctaAt + 0.45); const ctaE = backOut(ctaP, 1.6);
    const shine = prog(t, ctaAt + 0.4, ctaAt + 1.2);
    return (
      <AbsoluteFill>
        {/* logo plate */}
        <div style={{ position: 'absolute', top: 290, left: 84, opacity: clamp(logoP * 3), transform: `translateY(${(1 - logoE) * 70}px) scale(${0.92 + 0.08 * logoE})`, transformOrigin: 'left top' }}>
          <div style={{ background: COLOR.white, borderRadius: 28, padding: '26px 36px', boxShadow: '0 24px 70px rgba(0,0,0,0.35)' }}>
            <Img src={staticFile('brand/Logo.svg')} style={{ width: 270, display: 'block' }} />
          </div>
        </div>
        {/* lock-up */}
        <div style={{ position: 'absolute', top: 640, left: 84, right: 84 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            <Rule p={expoOut(prog(t, 0.8, 1.5))} width={70} />
            <Reveal t={t} at={0.85} dur={0.5}><Label size={30} color={COLOR.orange} tracking={0.34}>{kicker}</Label></Reveal>
          </div>
          <Reveal t={t} at={1.0} dur={0.6}><Headline size={176} tracking={-0.045}>{title}</Headline></Reveal>
          <Reveal t={t} at={1.2} dur={0.6} style={{ marginTop: 6 }}><Accent size={104}>{titleAccent}</Accent></Reveal>
        </div>
        {/* CTA pill */}
        <div style={{ position: 'absolute', top: 1065, left: 84, opacity: clamp(ctaP * 4), transform: `scale(${0.8 + 0.2 * ctaE})`, transformOrigin: 'left center' }}>
          <div style={{ position: 'relative', overflow: 'hidden', background: COLOR.orange, borderRadius: 999, padding: '26px 46px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 50px rgba(243,122,32,0.45)' }}>
            <span style={{ fontFamily: TYPE.sans, fontWeight: 800, fontSize: 46, letterSpacing: '0.02em', color: COLOR.white, textTransform: 'uppercase' }}>{cta}</span>
            <svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 120, left: `${-30 + 150 * shine}%`, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))', opacity: shine > 0 && shine < 1 ? 1 : 0 }} />
          </div>
        </div>
        {/* contacts */}
        <div style={{ position: 'absolute', top: 1220, left: 84, right: 84 }}>
          <Reveal t={t} at={2.2} dur={0.5}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontFamily: TYPE.sans, fontWeight: 700, fontSize: 50, color: COLOR.white, letterSpacing: '0.01em' }}>
              <svg width="38" height="38" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill={COLOR.orange} /></svg>
              <span>{CONTACT.phones.map(formatGhPhone).join('   ·   ')}</span>
            </div>
          </Reveal>
          <Reveal t={t} at={2.4} dur={0.5} style={{ marginTop: 18 }}>
            <div style={{ fontFamily: TYPE.sans, fontWeight: 600, fontSize: 38, color: 'rgba(255,255,255,0.86)', letterSpacing: '0.02em' }}>{CONTACT.website}</div>
          </Reveal>
          <Reveal t={t} at={2.6} dur={0.5} style={{ marginTop: 34 }}><Label size={20} weight={600} tracking={0.26} color="rgba(255,255,255,0.6)">{BRAND_NAME}</Label></Reveal>
        </div>
      </AbsoluteFill>
    );
  };
