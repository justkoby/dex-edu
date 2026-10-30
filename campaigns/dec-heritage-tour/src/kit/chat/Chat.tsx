import React from 'react';
import { spring } from 'remotion';
import { COLOR, TYPE } from '../brand';
import { clamp, expoOut, prog } from '../motion';

/**
 * Reusable messaging-UI kit (dark, brand-tinted). Pure functions of time: every bubble springs in from its tail corner,
 * typing indicators precede incoming messages, and the stack scrolls smoothly as messages land.
 * `layoutChat` is exported so shared-element transitions can target a bubble's exact rect.
 */
export type Msg = { at: number; side: 'in' | 'out'; text?: string; typing?: number; kind?: 'text' | 'card' | 'media'; h?: number; w?: number };
export const CHAT_THEME = { bg: '#0A0D1C', bubbleIn: '#1E2546', bubbleOut: COLOR.orange, text: '#FFFFFF', meta: 'rgba(255,255,255,0.45)' };
export const CHAT_GEOM = { left: 56, right: 56, bottom: 1318, top: 262, gap: 16, textH: 116, font: 52, maxW: 968 };

const springAt = (t: number, at: number, fps: number, damping = 13, mass = 0.7) =>
  t < at ? 0 : spring({ frame: (t - at) * fps, fps, config: { damping, mass, stiffness: 170 } });
export const msgH = (m: Msg) => m.h ?? CHAT_GEOM.textH;
export const msgW = (m: Msg) => m.w ?? Math.min(CHAT_GEOM.maxW, Math.round((m.text?.length ?? 10) * CHAT_GEOM.font * 0.53 + 76));

/** Layout at time t: each landed message contributes its (spring-eased) height; a pending typing indicator adds one row. */
export const layoutChat = (msgs: Msg[], t: number, fps: number) => {
  const items: { m: Msg; y: number; x: number; w: number; h: number; k: number }[] = [];
  const typing = msgs.find((m) => m.side === 'in' && (m.typing ?? 0) > 0 && t >= m.at - (m.typing ?? 0) && t < m.at);
  let y = CHAT_GEOM.bottom;
  if (typing) y -= (84 + CHAT_GEOM.gap) * clamp(springAt(t, typing.at - (typing.typing ?? 0), fps, 16));
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i]; if (t < m.at) continue;
    const k = springAt(t, m.at, fps); const h = msgH(m); const w = msgW(m);
    y -= (h + CHAT_GEOM.gap) * clamp(k * 1.15);
    const x = m.side === 'out' ? 1080 - CHAT_GEOM.right - w : CHAT_GEOM.left;
    items.unshift({ m, y, x, w, h, k });
  }
  return { items, typing };
};

const Dots: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: 'flex', gap: 14, padding: '34px 40px', background: CHAT_THEME.bubbleIn, borderRadius: 40, borderBottomLeftRadius: 12 }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.75)', transform: `translateY(${-7 * Math.max(0, Math.sin((t * 2.2 - i * 0.18) * Math.PI * 2))}px)`, opacity: 0.5 + 0.5 * Math.max(0, Math.sin((t * 2.2 - i * 0.18) * Math.PI * 2)) }} />)}
  </div>
);

/** Chat screen. `renderMedia(msg, rect)` draws card/media messages (lets callers hide them during shared-element moves). */
export const ChatScreen: React.FC<{ t: number; fps: number; msgs: Msg[]; name: string; renderMedia?: (m: Msg, r: { x: number; y: number; w: number; h: number }) => React.ReactNode; hideIdx?: number[] }> =
  ({ t, fps, msgs, name, renderMedia, hideIdx = [] }) => {
    const { items, typing } = layoutChat(msgs, t, fps);
    const isTyping = !!typing;
    return (
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 70% at 50% 0%, #141A38 0%, ${CHAT_THEME.bg} 60%)`, fontFamily: TYPE.display, overflow: 'hidden' }}>
        {/* status bar + header */}
        <div style={{ position: 'absolute', top: 56, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600, fontSize: 30, opacity: 0.85 }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <svg width="34" height="22" viewBox="0 0 34 22">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 9} y={16 - i * 5} width="6" height={6 + i * 5} rx="1.5" fill="#fff" />)}</svg>
            <svg width="48" height="22" viewBox="0 0 48 22"><rect x="1" y="1" width="40" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" /><rect x="4" y="4" width="30" height="14" rx="3" fill="#fff" /><rect x="43" y="7" width="3" height="8" rx="1" fill="#fff" opacity="0.7" /></svg>
          </span>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, height: 128, display: 'flex', alignItems: 'center', gap: 24, padding: '0 50px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,13,28,0.85)', zIndex: 2 }}>
          <svg width="30" height="44" viewBox="0 0 30 44"><path d="M24 4 L6 22 L24 40" stroke={COLOR.orange} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ width: 92, height: 92, borderRadius: 46, background: `linear-gradient(135deg, ${COLOR.orange}, #FFB36B)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 40 }}>{name[0]}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 46, lineHeight: 1.1 }}>{name}</div>
            <div style={{ color: isTyping ? COLOR.orange : CHAT_THEME.meta, fontWeight: 500, fontSize: 30 }}>{isTyping ? 'typing…' : 'online'}</div>
          </div>
        </div>
        {/* messages */}
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${CHAT_GEOM.top - 10}px 0 0 0)` }}>
          {items.map(({ m, x, y, w, h, k }, i) => {
            if (hideIdx.includes(msgs.indexOf(m))) return null;
            const out = m.side === 'out'; const rot = (1 - clamp(k)) * (out ? 7 : -7);
            const style: React.CSSProperties = { position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${0.35 + 0.65 * k}) rotate(${rot}deg)`, transformOrigin: out ? '100% 100%' : '0% 100%', opacity: clamp(k * 3) };
            if (m.kind === 'card' || m.kind === 'media') return <div key={i} style={style}>{renderMedia?.(m, { x, y, w, h })}</div>;
            return (
              <div key={i} style={{ ...style, background: out ? CHAT_THEME.bubbleOut : CHAT_THEME.bubbleIn, borderRadius: 40, [out ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 12, display: 'flex', alignItems: 'center', padding: '0 38px', color: CHAT_THEME.text, fontWeight: 600, fontSize: CHAT_GEOM.font, whiteSpace: 'nowrap', boxShadow: out ? '0 10px 30px rgba(243,122,32,0.25)' : 'none' }}>
                {m.text}
              </div>
            );
          })}
          {typing && (() => { const k = clamp(springAt(t, typing.at - (typing.typing ?? 0), fps, 16)); const out = 1 - expoOut(prog(t, typing.at - 0.08, typing.at));
            return <div style={{ position: 'absolute', left: CHAT_GEOM.left, top: CHAT_GEOM.bottom - 84, transform: `scale(${0.5 + 0.5 * k})`, transformOrigin: '0% 100%', opacity: k * out }}><Dots t={t} /></div>; })()}
        </div>
        {/* input bar */}
        <div style={{ position: 'absolute', left: 50, right: 50, top: 1372, height: 92, borderRadius: 46, background: '#161B33', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 14px 0 36px', justifyContent: 'space-between' }}>
          <span style={{ color: CHAT_THEME.meta, fontSize: 34, fontWeight: 500 }}>Message</span>
          <div style={{ width: 66, height: 66, borderRadius: 33, background: COLOR.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24"><path d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5z" fill="#fff" /></svg>
          </div>
        </div>
      </div>
    );
  };

/** Touch indicator: approaches, presses (shrink + ripple), releases. */
export const Tap: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const app = expoOut(prog(t, at - 0.45, at - 0.1)); const press = prog(t, at - 0.1, at + 0.05); const rel = prog(t, at + 0.05, at + 0.45);
  if (t < at - 0.45 || rel >= 1) return null;
  const s = 1 - 0.25 * Math.sin(Math.PI * press);
  return (
    <>
      <div style={{ position: 'absolute', left: x - 44, top: y - 44 + (1 - app) * 60, width: 88, height: 88, borderRadius: 44, background: 'rgba(255,255,255,0.35)', border: '3px solid rgba(255,255,255,0.8)', transform: `scale(${s})`, opacity: app * (1 - rel) }} />
      {rel > 0 && <div style={{ position: 'absolute', left: x - 44 - 60 * rel, top: y - 44 - 60 * rel, width: 88 + 120 * rel, height: 88 + 120 * rel, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.7)', opacity: 1 - rel }} />}
    </>
  );
};
