import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import timeline from './timeline.v3.json';
import words from './words.v3.json';
import type { TimelineV2 } from '../v2/types';
import { Cam, ShotsV2 } from '../v2/ShotV2';
import { WipeBand } from '../v2/TypeV2';
import { CTA_START, TypeV3, subMode } from './TypeV3';
import { Flash, LightSweep, ReviewFlags, Subtitles, Vignette, Word, loadKitFonts, useTime } from '../kit';

const T = timeline as unknown as TimelineV2;
const WORDS: Word[] = (words as { words: Word[] }[]).flatMap((p) => p.words);
/** Caption pages, broken where the speaker phrases them (verified wording; timings stay word-accurate). */
const SUB_PAGES = ['This December,', 'make your return to Ghana', 'more than just a visit.', 'Make it a journey', 'back to your roots.',
  'Reconnect with our rich history,', 'discover the stories', 'that shaped our heritage', 'Soak in the beauty', 'of our coastline,', 'unwind by the ocean',
  'Send Dexterity', 'Education and Travel and Tour', 'a message today'];
const CAMS: Record<string, Cam> = {
  h1_wheels: { s0: 1.08, s1: 1.0, oy: 70 },
  h2_arrival: { s0: 1.0, s1: 1.035, ox: 50, oy: 16 },          // origin at the facade so the sign headline stays locked
  j1_window: { s0: 1.04, s1: 1.0, x1: -1.5, ox: 35, oy: 38 },
  j2_coast: { s0: 1.0, s1: 1.1, ox: 16, oy: 22 },               // push toward the pin
  g1_fort: { s0: 1.0, s1: 1.05, ox: 31, oy: 34 },               // push toward the focus ring
  g2_guide: { s0: 1.0, s1: 1.05, ox: 45, oy: 38 },
  r1_table: { s0: 1.0, s1: 1.07, ox: 48, oy: 40 },
  r2_beach: { s0: 1.06, s1: 1.0, x0: 1.5, x1: -1.5 },
  m1_dance: { s0: 1.0, s1: 1.03, punch: true }, m2_spin: { s0: 1.02, s1: 1.0, punch: true }, m3_coconut: { s0: 1.0, s1: 1.04, punch: true },
  m4_friends: { s0: 1.02, s1: 1.0, punch: true }, m5_smile: { s0: 1.0, s1: 1.03, punch: true }, m6_joy: { s0: 1.0, s1: 1.04, punch: true },
  c1_plate: { s0: 1.1, s1: 1.0, duotone: true },
};
const FLASH_AT = T.shots.filter((s) => s.tin === 'flash').map((s) => s.t0);
const SWEEP_AT = T.shots.filter((s) => s.tin === 'sweep').map((s) => s.t0);

/** V3: Bricolage type system, word-synced subtitles (toggle `subtitles`), location graphics, no on-screen review banners. */
export const HeritageTourV3: React.FC<{ subtitles?: boolean; reviewFlags?: boolean; withAudio?: boolean }> = ({ subtitles = true, reviewFlags = false, withAudio = true }) => {
  loadKitFonts();
  const { t } = useTime();
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060f' }}>
      <ShotsV2 shots={T.shots} cams={CAMS} dir="v3" />
      <Vignette amount={t >= CTA_START ? 0.5 : 0.28} />
      {FLASH_AT.map((a) => <Flash key={a} t={t} at={a} />)}
      {SWEEP_AT.map((a) => <LightSweep key={a} t={t} at={a} />)}
      <WipeBand t={t} />
      <TypeV3 t={t} />
      {subtitles && <Subtitles t={t} words={WORDS} pages={SUB_PAGES} modeAt={subMode} />}
      {reviewFlags && <ReviewFlags lines={['INTERNAL REVIEW · V3']} />}
      {withAudio && <Audio src={staticFile('v3/mix_v3.wav')} />}
    </AbsoluteFill>
  );
};
