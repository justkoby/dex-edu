import React from 'react';
import { CONTACT, EDU, TYPE, formatGhPhone } from '../brand';
import { BrandLogo } from '../BrandLogo';
import { Line, rich } from '../Campaign';
import { backOut, clamp, prog } from '../motion';

/** Shared end-card geometry so the V3 and V4 CTAs match exactly (leaves y 1360–1460 free for captions). */
export const CTA_CARD_RECT = { x: 48, y: 300, w: 984, h: 1010 };

/**
 * Branded CTA content for a white card (Dexterity Edu Tour identity). Used by V3K (card rises over the plate) and V4K (chat
 * bubble morphs into it). Local time `t` = 0 when the card is in place. Website is the primary action; WhatsApp is secondary.
 */
export const CTACard: React.FC<{ t: number; pulseAt?: number; kicker?: string; head1?: string; head2?: string; tagline?: string; cta?: string }> =
  ({ t, pulseAt = 1.6, kicker = 'December Heritage & Relaxation Tour', head1 = 'Your December.', head2 = 'Your *story.*', tagline = 'Heritage. Adventure. Relaxation.', cta = 'Book your experience.' }) => {
    const logo = backOut(prog(t, 0.0, 0.5), 1.2); const pill = backOut(prog(t, 0.75, 1.15), 1.5);
    const pulse = Math.max(0, 1 - Math.abs(t - pulseAt) / 0.22); const shine = prog(t, pulseAt - 0.1, pulseAt + 0.6);
    const ink = { textShadow: 'none' };
    return (
      <div style={{ position: 'absolute', inset: 0, padding: '58px 60px 56px', fontFamily: TYPE.display, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ opacity: clamp(logo * 2), transform: `translateY(${(1 - logo) * 26}px) scale(${0.92 + 0.08 * logo})`, transformOrigin: 'left top' }}><BrandLogo width={400} /></div>
        <div style={{ marginTop: 40 }}><Line t={t} at={0.15} dur={0.45} size={34} weight={600} tracking={-0.01} color={EDU.blue} style={ink}>{kicker}</Line></div>
        <div style={{ marginTop: 16 }}>
          <Line t={t} at={0.25} dur={0.5} size={112} weight={800} tracking={-0.045} color={EDU.ink} style={ink}>{head1}</Line>
          <Line t={t} at={0.37} dur={0.5} size={112} weight={800} tracking={-0.045} color={EDU.ink} style={ink}>{rich(head2, EDU.orange)}</Line>
        </div>
        <div style={{ marginTop: 22 }}><Line t={t} at={0.55} dur={0.45} size={46} weight={700} tracking={-0.02} color={EDU.blue} style={ink}>{rich(tagline.replace('Adventure.', '*Adventure.*'), EDU.orange)}</Line></div>
        <div style={{ marginTop: 8 }}><Line t={t} at={0.65} dur={0.45} size={42} weight={600} tracking={-0.015} color="rgba(6,26,74,0.72)" style={ink}>{cta}</Line></div>
        <div style={{ marginTop: 60 }}>
          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 20, background: EDU.orange, borderRadius: 999, padding: '22px 44px 22px 28px', boxShadow: '0 16px 40px rgba(247,124,2,0.38)', transform: `scale(${(0.82 + 0.18 * pill) * (1 + 0.04 * pulse)})`, transformOrigin: 'left center', opacity: clamp(pill * 3) }}>
            <svg width="50" height="50" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.2)" /><circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" strokeWidth="1.5" /><path d="M5.5 12h13M12 5.5c2 2 2 11 0 13M12 5.5c-2 2-2 11 0 13" stroke="#fff" strokeWidth="1.3" fill="none" /></svg>
            <span style={{ fontWeight: 800, fontSize: 56, color: '#fff', letterSpacing: '-0.02em' }}>{CONTACT.website}</span>
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 140, left: `${-25 + 150 * shine}%`, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))', opacity: shine > 0 && shine < 1 ? 1 : 0 }} />
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, opacity: clamp(prog(t, 1.0, 1.35) * 2) }}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 19l1.1-3.4A7.5 7.5 0 1 1 8.8 18z" fill="none" stroke={EDU.blue} strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.6 9.3c.2 1.2 1.6 3.1 3.4 4 .5.2 1-.1 1.3-.4" stroke={EDU.blue} strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
            <span style={{ fontWeight: 700, fontSize: 40, color: EDU.blue }}>WhatsApp {formatGhPhone(CONTACT.phones[0])}</span>
          </div>
        </div>
      </div>
    );
  };
