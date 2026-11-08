import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CTACard, CTA_CARD_RECT, COLOR, EDU, FocusRing, Line, LocationPin, Scrim, SubMode, TYPE, Underline, backOut, clamp, expoIn, expoOut, prog, rich } from '../kit';

/*
 * V3C (V3K re-cut to "Comfort", 99 BPM): cue times follow the beat-synced cuts; narration-tied cues unchanged.
 * V3K typography track (V3 + Kakum + Dexterity Edu Tour brand). One family (Bricolage Grotesque), placed shot by shot.
 * Word anchors are measured word onsets from tools/word_timings.py (src/v3c/words.v3c.json).
 */
export const CTA_START = 33.33;                       // V3C: CTA lands on a song downbeat
const WD = { this: 0.35, december: 0.83, more: 3.71, visit: 4.59, stories: 16.32, connect: 16.5, unwind: 26.24, message: 37.34 };

/** 0–1.5 s: two huge words land with the voice on the wheels shot, then lift away on the cut. */
const HookWords: React.FC<{ t: number }> = ({ t }) => (
  t > 1.91 ? null : (
    <div style={{ position: 'absolute', left: 84, top: 780 }}>
      <Line t={t} at={WD.this - 0.04} dur={0.38} enter="drop" outAt={1.61} outDur={0.2} size={214} weight={800} tracking={-0.05}>THIS</Line>
      <Line t={t} at={WD.december - 0.04} dur={0.4} enter="rise" outAt={1.64} outDur={0.2} size={150} weight={800} tracking={-0.05} color={COLOR.orange}>DECEMBER</Line>
    </div>
  )
);

/**
 * 1.5–6 s: the headline becomes the terminal signage – set on the facade's angle over the blurred (inaccurate) AI sign,
 * lighting up left-to-right on the cut. Then "More than a visit." sits in the open space left of her head.
 */
const SignHeadline: React.FC<{ t: number }> = ({ t }) => {
  if (t < 1.81 || t > 6.06) return null;
  const on = expoOut(prog(t, 1.83, 2.31)); const off = expoIn(prog(t, 5.61, 5.91));
  const glow = Math.max(0, 1 - Math.abs(t - 2.06) / 0.35);
  return (
    <div style={{ position: 'absolute', left: 572, top: 300, transform: 'translate(-50%, -50%) rotate(10.4deg)' }}>
      <div style={{ clipPath: `inset(-20% ${100 - 100 * on + 100 * off * 0}% -20% ${100 * off}%)`, fontFamily: TYPE.display, fontWeight: 800, fontSize: 104, letterSpacing: '-0.035em', whiteSpace: 'nowrap', color: COLOR.white,
        textShadow: `0 0 ${18 + 40 * glow}px rgba(255,214,170,${0.35 + 0.5 * glow}), 0 3px 16px rgba(4,7,22,0.45)` }}>
        THIS <span style={{ color: COLOR.orange }}>DECEMBER</span>
      </div>
    </div>
  );
};
const MoreThan: React.FC<{ t: number }> = ({ t }) => (
  t < WD.more - 0.05 || t > 6.0 ? null : (
    <div style={{ position: 'absolute', left: 84, top: 618 }}>
      <Line t={t} at={WD.more - 0.05} dur={0.42} enter="rise" outAt={5.6} size={70} weight={700} tracking={-0.03}>More than</Line>
      <Line t={t} at={WD.more + 0.12} dur={0.42} enter="rise" outAt={5.63} size={70} weight={700} tracking={-0.03}>a {rich('*visit.*')}</Line>
      <div style={{ marginLeft: 62, marginTop: -4, opacity: 1 - expoIn(prog(t, 5.6, 5.8)) }}><Underline t={t} at={WD.visit} width={196} /></div>
    </div>
  )
);

/** 14.5–20 s: scene headline in the sky to the right of the fort tower. */
const Stories: React.FC<{ t: number }> = ({ t }) => (
  t < 16.1 || t > 19.9 ? null : (
    <div style={{ position: 'absolute', right: 84, top: 262, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <Line t={t} at={16.2} dur={0.5} enter="fromRight" outAt={19.45} size={84} weight={700} tracking={-0.03} align="right">Stories that</Line>
      <Line t={t} at={WD.connect} dur={0.6} enter="track" outAt={19.5} size={84} weight={700} tracking={-0.03} align="right">{rich('*connect* us.')}</Line>
    </div>
  )
);

/** 25.5–28 s: two words crossing in opposite directions over the open sky, on the spoken "unwind". */
const UnwindReconnect: React.FC<{ t: number }> = ({ t }) => (
  t < 26.1 || t > 28.0 ? null : (
    <div style={{ position: 'absolute', right: 84, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <Line t={t} at={26.2} dur={0.42} enter="fromRight" outAt={27.62} size={128} weight={800} tracking={-0.045} align="right">UNWIND.</Line>
      <Line t={t} at={26.55} dur={0.42} enter="fromLeft" outAt={27.68} size={128} weight={800} tracking={-0.045} align="right" color={COLOR.orange}>RECONNECT.</Line>
    </div>
  )
);

/** 28–33 s: one word per beat-cut; position, entrance and colour vary; only the last word is orange. */
const MONTAGE: { a: number; b: number; w: string; side: 'left' | 'right'; enter: 'drop' | 'rise' | 'fromLeft' | 'fromRight' | 'track'; color?: string }[] = [
  { a: 28.48, b: 29.69, w: 'Celebrate.', side: 'left', enter: 'drop' },
  { a: 29.69, b: 30.30, w: 'Dance.', side: 'right', enter: 'fromRight' },
  { a: 30.30, b: 31.51, w: 'Taste.', side: 'left', enter: 'rise' },
  { a: 31.51, b: 32.12, w: 'Connect.', side: 'right', enter: 'track' },
  { a: 32.12, b: 32.72, w: 'Smile.', side: 'left', enter: 'fromLeft' },
  { a: 32.72, b: 33.31, w: 'December.', side: 'right', enter: 'rise', color: COLOR.orange },
];
const Montage: React.FC<{ t: number }> = ({ t }) => {
  const m = MONTAGE.find((x) => t >= x.a && t < x.b); if (!m) return null;
  return (
    <div style={{ position: 'absolute', top: 1150, left: 84, right: 84, display: 'flex', justifyContent: m.side === 'left' ? 'flex-start' : 'flex-end' }}>
      <Line t={t} at={m.a} dur={0.24} enter={m.enter} size={156} weight={800} tracking={-0.045} color={m.color ?? COLOR.white} align={m.side}>{m.w}</Line>
    </div>
  );
};

/** Subtitle behaviour per moment: simplify while a major headline is on screen, hide where nobody speaks. */
export const subMode = (t: number): SubMode => {
  if (t < 1.81) return 'compact';                     // giant hook words
  if (t >= WD.more - 0.05 && t < 5.4) return 'compact';
  if (t >= 26.1 && t < 27.9) return 'compact';      // UNWIND. RECONNECT.
  if (t >= 32.6) return 'compact';                   // montage tail + end card
  return 'normal';
};

export const TypeV3: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Scrim side="top" p={prog(t, 9.19, 9.49) * (1 - prog(t, 11.72, 12.02)) + prog(t, 16.0, 16.3) * (1 - prog(t, 19.5, 19.8)) + prog(t, 20.09, 20.39) * (1 - prog(t, 21.52, 21.82))} strength={0.5} reach={30} />
    <Scrim side="bottom" p={prog(t, 28.43, 28.53) * (1 - prog(t, 33.28, 33.38))} strength={0.5} reach={42} />
    <HookWords t={t} />
    <SignHeadline t={t} />
    <MoreThan t={t} />
    <LocationPin t={t} at={9.19} outAt={11.62} x={170} y={430} title="Ghana's Central Coast" sub="HERITAGE & RELAXATION" />
    <LocationPin t={t} at={20.14} outAt={21.47} x={120} y={330} title="Kakum National Park" sub="CANOPY WALKWAY · CENTRAL REGION" />
    <FocusRing t={t} at={12.42} outAt={14.29} x={330} y={660} r={150} label="Rich history" labelAt={13.95} />
    <Stories t={t} />
    <UnwindReconnect t={t} />
    <Montage t={t} />
    {t >= CTA_START && (
      <>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(2,30,92,0.84) 0%, rgba(4,51,145,0.62) 48%, rgba(2,20,60,0.94) 100%)', opacity: expoOut(prog(t, CTA_START + 0.08, CTA_START + 0.55)) }} />
        {(() => { const e = backOut(prog(t, CTA_START + 0.15, CTA_START + 0.7), 1.1); const R = CTA_CARD_RECT;
          return (
            <div style={{ position: 'absolute', left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: 48, background: EDU.white, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.5)', opacity: clamp(prog(t, CTA_START + 0.15, CTA_START + 0.4) * 2), transform: `translateY(${(1 - e) * 160}px)` }}>
              <CTACard t={t - CTA_START - 0.6} pulseAt={WD.message - CTA_START - 0.6} />
            </div>
          ); })()}
      </>
    )}
  </AbsoluteFill>
);


/** Orange brand band riding the diagonal wipe edge into the end card (V3C timing). */
export const WipeBandC: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, CTA_START - 0.05, CTA_START + 0.45); if (p <= 0 || p >= 1) return null;
  const e = p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2; const x = -40 + 180 * e;
  return <AbsoluteFill style={{ background: COLOR.orange, clipPath: `polygon(${x - 6}% 0%, ${x}% 0%, ${x - 40}% 100%, ${x - 46}% 100%)` }} />;
};
