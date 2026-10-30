import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Accent, BeatWord, Blur, COLOR, DestinationLabel, EndCard, Headline, Label, Reveal, Scrim, TYPE, clamp, expoIn, expoOut, lerp, prog, quintInOut } from '../kit';

/*
 * V2 typography track. Every on-screen phrase is taken from the recorded narration (verified by transcription),
 * timed to the spoken word (anchors measured from the narration envelope, +-0.15 s). Layout changes per chapter:
 * hook stack -> bottom-right editorial block -> bottom-left split -> top-left destination label -> centred outline
 * -> top-left serif label -> top-centred serif display -> beat words -> end card.
 */
const W = { p1: 0.35, this: 0.43, december: 0.88, visit: 3.83, p2: 6.3, journey: 7.15, roots: 7.6, p3: 12.4, rich: 14.15, discover: 15.6, p4: 20.45, unwind: 23.3, ocean: 24.15, p5: 32.7, message: 37.0 };
export const CTA_START = 33.0;

/** 0–6 s: giant two-line stack lands with the words, then morphs into a small right-aligned kicker on the arrival shot. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t > 6.1) return null;
  const m = quintInOut(prog(t, 1.36, 1.8));                  // morph progress across the 1.5 s cut
  const out = expoIn(prog(t, 5.55, 5.9));
  const big = 166, small = 34, smallTrack = 0.3;
  const cw = small * (0.6 + smallTrack);                      // measured advance of Jakarta 800 caps at this tracking
  const kickerW = 13 * cw;           // approx. rendered width of "THIS DECEMBER" as a label
  const lines = [{ w: 'THIS', at: W.this, y: 700, xs: 996 - kickerW }, { w: 'DECEMBER', at: W.december, y: 700 + big * 0.95, xs: 996 - kickerW + 5 * cw }];
  return (
    <>
      {lines.map((l, i) => {
        const pin = prog(t, l.at, l.at + 0.42); if (pin <= 0) return null;
        const size = lerp(big, small, m); const track = lerp(-0.045, smallTrack, m);
        const x = lerp(84, l.xs, m); const y = lerp(l.y, 1180, m);
        const blur = Math.sin(Math.PI * m) * 10 + (1 - expoOut(pin)) * 16;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, overflow: 'hidden', paddingBottom: 8 }}>
            <Blur y={m > 0 ? 0 : blur} x={m > 0 ? blur : 0}>
              <div style={{ transform: `translateY(${(1 - expoOut(pin)) * 105 - out * 110}%)`, fontFamily: TYPE.sans, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: `${track}em`, color: `color-mix(in srgb, ${COLOR.orange} ${Math.round(m * 100)}%, ${COLOR.white})`, textShadow: '0 4px 30px rgba(5,8,25,0.4)', whiteSpace: 'nowrap' }}>{l.w}</div>
            </Blur>
          </div>
        );
      })}
      <div style={{ position: 'absolute', right: 84, top: 1232, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Reveal t={t} at={W.visit} dur={0.6} outAt={5.55}><Accent size={104}>more than</Accent></Reveal>
        <Reveal t={t} at={W.visit + 0.14} dur={0.6} outAt={5.58}><Accent size={104}>just a visit.</Accent></Reveal>
        <Reveal t={t} at={2.15} dur={0.5} outAt={5.62} style={{ marginTop: 12 }}><Label size={22} tracking={0.3} color="rgba(255,255,255,0.85)">Accra · Ghana</Label></Reveal>
      </div>
    </>
  );
};

/** 6–9 s: bottom-left split (serif lead-in + bold orange payoff); leaves with the whip-pan. */
const Journey: React.FC<{ t: number }> = ({ t }) => {
  if (t < 6.8 || t > 9.1) return null;
  const p = prog(t, 8.8, 9.08); const tx = -expoOut(p) * 70;
  return (
    <div style={{ position: 'absolute', left: 84, top: 1215, transform: `translateX(${tx}%)` }}>
      <Blur x={p > 0 && p < 1 ? 22 * Math.sin(Math.PI * p) : 0}>
        <Reveal t={t} at={W.journey} dur={0.6} dir="up"><Accent size={108}>a journey back</Accent></Reveal>
        <Reveal t={t} at={W.roots} dur={0.55} dir="left" style={{ marginTop: 4 }}><Headline size={104} color={COLOR.orange}>to your roots</Headline></Reveal>
      </Blur>
    </div>
  );
};

/** 12–14.5 s: centred outline word over the fort aerial, filled on the impact; serif line on "rich history". */
const Heritage: React.FC<{ t: number }> = ({ t }) => {
  if (t < 11.95 || t > 14.55) return null;
  const pin = expoOut(prog(t, 12.0, 12.7)); const fill = prog(t, 12.05, 12.5);
  const out = expoIn(prog(t, 14.28, 14.5)); const s = lerp(1.22, 1, pin) * lerp(1, 1.04, prog(t, 12.7, 14.5));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out }}>
      <div style={{ transform: `translateY(-90px) scale(${s})`, textAlign: 'center' }}>
        <Blur y={(1 - pin) * 18}>
          <div style={{ position: 'relative', fontFamily: TYPE.sans, fontWeight: 800, fontSize: 172, letterSpacing: '-0.03em', lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px #fff', textShadow: '0 6px 40px rgba(5,8,25,0.35)', opacity: clamp(pin * 2) }}>
            HERITAGE
            {/* solid fill lands with the impact, then wipes off left-to-right leaving the outline */}
            <div style={{ position: 'absolute', inset: 0, color: COLOR.white, WebkitTextStroke: '0px', clipPath: `inset(0 0 0 ${100 * expoOut(fill)}%)` }}>HERITAGE</div>
          </div>
        </Blur>
        <Reveal t={t} at={W.rich} dur={0.45} style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}><Accent size={96}>rich history</Accent></Reveal>
      </div>
    </AbsoluteFill>
  );
};

/** 20–25.5 s: top-centred serif display word on "unwind", spaced caps on "by the ocean"; bridges the cut to the beach. */
const Unwind: React.FC<{ t: number }> = ({ t }) => {
  if (t < 23.2 || t > 25.8) return null;
  return (
    <>
      <Scrim side="top" p={prog(t, 23.2, 23.6) * (1 - prog(t, 25.3, 25.7))} strength={0.42} reach={36} />
      <div style={{ position: 'absolute', top: 236, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Reveal t={t} at={W.unwind} dur={0.7} outAt={25.3}><Accent size={230} color={COLOR.white} style={{ lineHeight: 1.05 }}>Unwind</Accent></Reveal>
        <Reveal t={t} at={W.ocean} dur={0.5} outAt={25.32} style={{ marginTop: -6 }}><Label size={32} tracking={0.5}>by the ocean</Label></Reveal>
      </div>
    </>
  );
};

/** 28–33 s: one word per montage cut, alternating side and colour, landing on the beat. */
const MONTAGE: [number, number, string, 'left' | 'right', string][] = [
  [28.0, 29.0, 'DISCOVER', 'left', COLOR.white], [29.0, 29.5, 'CONNECT', 'right', COLOR.orange], [29.5, 30.5, 'RELAX', 'left', COLOR.white],
  [30.5, 31.0, 'CELEBRATE', 'right', COLOR.orange], [31.0, 32.0, 'HERITAGE', 'left', COLOR.white], [32.0, 32.98, 'DECEMBER', 'right', COLOR.orange],
];

export const TypeV2: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Scrim side="bottom" p={prog(t, 0.3, 0.6) * (1 - prog(t, 5.6, 6.0)) + prog(t, 6.9, 7.2) * (1 - prog(t, 8.8, 9.0)) + prog(t, 27.95, 28.1) * (1 - prog(t, 32.9, 33.1))} strength={0.55} reach={44} />
    <Hook t={t} />
    <Journey t={t} />
    <Scrim side="top" p={prog(t, 9.3, 9.6) * (1 - prog(t, 11.6, 11.9)) + prog(t, W.discover - 0.15, W.discover + 0.2) * (1 - prog(t, 19.5, 19.8))} strength={0.5} reach={30} />
    <DestinationLabel t={t} at={9.35} outAt={11.6} index="01" title="The coast" sub="Ghana" />
    <Heritage t={t} />
    <DestinationLabel t={t} at={W.discover - 0.1} outAt={19.55} index="02" title="The stories that shaped" sub="our heritage" />
    <Unwind t={t} />
    {MONTAGE.map(([a, b, w, al, c]) => <BeatWord key={w} t={t} at={a} until={b} word={w} align={al} color={c} y={1280} />)}
    {t >= CTA_START && (
      <>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(20,30,77,0.78) 0%, rgba(40,60,141,0.62) 45%, rgba(11,16,48,0.92) 100%)`, opacity: expoOut(prog(t, CTA_START + 0.1, CTA_START + 0.6)) }} />
        <EndCard t={t - CTA_START} ctaAt={W.message - CTA_START} />
      </>
    )}
  </AbsoluteFill>
);

/** Orange brand band riding the diagonal wipe edge into the end card. */
export const WipeBand: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, CTA_START - 0.05, CTA_START + 0.45); if (p <= 0 || p >= 1) return null;
  const e = p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2;
  const x = lerp(-40, 140, e);
  return <AbsoluteFill style={{ background: COLOR.orange, clipPath: `polygon(${x - 6}% 0%, ${x}% 0%, ${x - 40}% 100%, ${x - 46}% 100%)` }} />;
};
