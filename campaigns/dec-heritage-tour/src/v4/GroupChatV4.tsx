import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import timeline from './timeline.v4.json';
import { Cam, ShotsV2 } from '../v2/ShotV2';
import type { ShotV2T } from '../v2/types';
import {
  BusMarker, COLOR, ChatScreen, Chip, EndCardV4, Flash, GhanaMap, LightSweep, LocationCard, MapPin, Msg, Tap, Vignette,
  backOut, clamp, expoIn, expoInOut, expoOut, layoutChat, lerp, loadKitFonts, project, prog, routeCamera, useTime,
} from '../kit';

/*
 * V4 "The Group Chat". The story moves through shared elements:
 * chat -> Ghana location card expands into the airport -> airport shrinks into the Accra marker -> bus drives the real N1 road
 * -> Cape Coast pin opens into the tour -> culture & coast cuts -> footage shrinks back into a chat photo -> last bubble becomes the CTA.
 */
type Shot4 = ShotV2T & { pre: number; post: number };
const TL = timeline as unknown as { total: number; shots: Shot4[]; chat: { at: number; side: 'in' | 'out'; text: string; typing: number }[] };
const SH = Object.fromEntries(TL.shots.map((s) => [s.id, s])) as Record<string, Shot4>;
// chat messages (sizes for the card/media kinds); the photo is laid out from 28.6 s so the stack makes room while the footage shrinks in
const MSGS: Msg[] = TL.chat.map((c) => c.text === '@location' ? { at: c.at, side: c.side, kind: 'card', w: 680, h: 500, typing: c.typing }
  : c.text === '@photo' ? { at: 28.6, side: c.side, kind: 'media', w: 540, h: 690 } : { at: c.at, side: c.side, text: c.text, typing: c.typing });
const LOC = MSGS.findIndex((m) => m.kind === 'card'); const PHOTO = MSGS.findIndex((m) => m.kind === 'media'); const LAST = MSGS.length - 1;
const K = { tap: 6.0, expand: 6.05, expandEnd: 6.65, shrinkA: 9.95, shrinkAEnd: 10.8, depart: 11.3, arrive: 15.9, pin: 16.0, dive: 16.6, diveEnd: 17.4,
  photo: 28.55, photoEnd: 29.2, morph: 31.55, morphEnd: 32.25 };
const CTA_RECT = { x: 48, y: 290, w: 984, h: 1150 };
const lerpRect = (a: { x: number; y: number; w: number; h: number }, b: typeof a, u: number) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u) });
const FULL = { x: 0, y: 0, w: 1080, h: 1920 };
const ACCRA: [number, number] = [-0.187, 5.6037]; const CAPE: [number, number] = [-1.2466, 5.1053];

/** Plays a prepared V4 clip from its file start at `from` seconds. */
const Clip: React.FC<{ id: string; from: number; dur: number; style?: React.CSSProperties }> = ({ id, from, dur, style }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(from * fps)} durationInFrames={Math.round(dur * fps)} layout="none">
      <OffthreadVideo src={staticFile(`v4/${id}.mp4`)} muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }} />
    </Sequence>
  );
};

const MONTAGE: Shot4[] = (['g2_fort', 'g3_coast', 'c1_dance', 'c2_coconut', 'c3_dancer', 'r1_table', 'r2_beach'] as const).map((id, i) => ({
  ...SH[id], tin: ['flash', 'zoom', 'flash', 'cut', 'cut', 'sweep', 'whip'][i],
}));
const CAMS: Record<string, Cam> = {
  g2_fort: { s0: 1.0, s1: 1.08 }, g3_coast: { s0: 1.0, s1: 1.1, ox: 50, oy: 40 }, c1_dance: { s0: 1.0, s1: 1.04, punch: true },
  c2_coconut: { s0: 1.0, s1: 1.05, punch: true }, c3_dancer: { s0: 1.02, s1: 1.0, punch: true }, r1_table: { s0: 1.0, s1: 1.06, ox: 48, oy: 40 }, r2_beach: { s0: 1.06, s1: 1.0 },
};

export const GroupChatV4: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  loadKitFonts();
  const { t, fps } = useTime();
  // ---------- chat state + shared-element rects
  const lay = layoutChat(MSGS, t, fps);
  const rectOf = (idx: number) => { const it = lay.items.find((x) => x.m === MSGS[idx]); return it ? { x: it.x, y: it.y, w: it.w, h: it.h } : null; };
  const cardRect = rectOf(LOC) ?? { x: 56, y: 800, w: 680, h: 500 };
  const ex = clamp(expoInOut(prog(t, K.expand, K.expandEnd)));
  const showChat1 = t < K.expandEnd + 0.05; const showChat2 = t >= K.photo - 0.05;
  // ---------- map camera
  const { cam, f, bus } = routeCamera(t, { show: K.shrinkA, depart: K.depart, arrive: K.arrive, dive: K.dive, diveEnd: K.diveEnd });
  const [ax, ay] = project(ACCRA, cam); const [cx, cy] = project(CAPE, cam); const [bx, by] = project(bus.ll, cam);
  const shrinkA = expoInOut(prog(t, K.shrinkA, K.shrinkAEnd));
  const reveal = expoIn(prog(t, K.dive + 0.15, K.diveEnd));
  // ---------- photo + CTA morphs
  const pr = rectOf(PHOTO); const phE = expoInOut(prog(t, K.photo, K.photoEnd));
  const lastR = rectOf(LAST); const mo = expoInOut(prog(t, K.morph, K.morphEnd));
  const hide = [...(t >= K.expand ? [LOC] : []), PHOTO, ...(t >= K.morph ? [LAST] : [])];

  return (
    <AbsoluteFill style={{ backgroundColor: '#05060f' }}>
      {/* ===== 0 – 6.6 s: chat, Ghana card, tap ===== */}
      {showChat1 && (
        <AbsoluteFill style={{ transform: `scale(${1 - 0.07 * ex})`, opacity: 1 - 0.6 * ex }}>
          <ChatScreen t={t} fps={fps} msgs={MSGS.slice(0, LOC + 1)} name="Akosua" hideIdx={t >= K.expand ? [LOC] : []}
            renderMedia={(m) => m.kind === 'card' ? <LocationCard w={680} h={500} mapH={320} title="Ghana" sub="Shared location · December" pinPulse={(t * 1.3) % 1} /> : null} />
          <Tap t={t} at={K.tap} x={cardRect.x + 340} y={cardRect.y + 190} />
        </AbsoluteFill>
      )}
      {/* ===== 6.05 – 10.8 s: card expands into the airport; airport shrinks into the Accra marker ===== */}
      {t >= K.expand && t < K.shrinkAEnd + 0.05 && (() => {
        const r = lerpRect(cardRect, FULL, ex); const rad = lerp(34, 0, ex);
        const circleR = lerp(1250, 46, shrinkA); const ccx = lerp(540, ax, shrinkA); const ccy = lerp(960, ay, shrinkA);
        return (
          <AbsoluteFill style={{ clipPath: shrinkA > 0 ? `circle(${circleR}px at ${ccx}px ${ccy}px)` : undefined, zIndex: 3 }}>
            <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: rad, overflow: 'hidden', background: '#0E1638', boxShadow: ex < 1 ? '0 30px 80px rgba(0,0,0,0.5)' : 'none' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${r.w / 680})`, transformOrigin: 'left top', opacity: 1 - expoOut(prog(t, K.expand + 0.1, K.expand + 0.38)) }}>
                <LocationCard w={680} h={500} mapH={320} title="Ghana" sub="Shared location · December" />
              </div>
              <AbsoluteFill style={{ opacity: expoOut(prog(t, K.expand + 0.08, K.expand + 0.42)) }}>
                <Clip id="a1_arrival" from={SH.a1_arrival.t0 - SH.a1_arrival.pre} dur={3.0} style={{ transform: `scale(${lerp(1.18, 1.0, ex) * lerp(1, 1.05, prog(t, 6.6, 8.6))})` }} />
                {t >= SH.a2_wheels.t0 && <Clip id="a2_wheels" from={SH.a2_wheels.t0} dur={2.5} style={{ transform: `scale(${1.06 - 0.06 * prog(t, 8.6, 10.4)})` }} />}
              </AbsoluteFill>
            </div>
            <Chip t={t} at={6.9} outAt={8.4} text="Accra, Ghana" />
          </AbsoluteFill>
        );
      })()}
      {/* ===== 9.95 – 17.6 s: route map ===== */}
      {t >= K.shrinkA && t < K.diveEnd + 0.2 && (
        <AbsoluteFill style={{ zIndex: 2 }}>
          <GhanaMap cam={cam} drawn={f} />
          {/* Accra marker (where the airport footage landed) */}
          {t >= K.shrinkAEnd - 0.05 && <div style={{ position: 'absolute', left: ax - 30, top: ay - 30, width: 60, height: 60, borderRadius: 30, border: '5px solid #fff', background: COLOR.orange, transform: `scale(${backOut(prog(t, K.shrinkAEnd - 0.05, K.shrinkAEnd + 0.3), 1.6)})`, boxShadow: '0 0 0 10px rgba(243,122,32,0.25)' }} />}
          {t >= K.depart - 0.5 && <BusMarker x={bx} y={by} heading={bus.heading} scale={backOut(prog(t, K.depart - 0.5, K.depart - 0.1), 1.8) * Math.min(1.5, Math.max(0.9, cam.zoom / 3.4)) * (1 - expoIn(prog(t, K.pin - 0.05, K.pin + 0.3)))} />}
          <Chip t={t} at={11.0} outAt={16.2} text="Accra → Cape Coast" x={60} y={250} />
          <MapPin t={t} at={K.pin} x={cx} y={cy} label="Cape Coast" sub="Central Region, Ghana" />
        </AbsoluteFill>
      )}
      {/* ===== 16.75 – 20 s: the pin opens into the tour ===== */}
      {t >= K.dive + 0.1 && t < 20.05 && (
        <AbsoluteFill style={{ zIndex: 4, clipPath: reveal < 1 ? `circle(${lerp(18, 1300, reveal)}px at ${cx}px ${cy - 62}px)` : undefined }}>
          <Clip id="g1_guide" from={SH.g1_guide.t0 - SH.g1_guide.pre} dur={3.4} style={{ transform: `scale(${lerp(1.35, 1.0, expoOut(prog(t, K.dive + 0.1, K.diveEnd + 0.3))) * lerp(1, 1.05, prog(t, 17.4, 20))})`, transformOrigin: '50% 40%' }} />
          <Chip t={t} at={17.8} outAt={19.7} text="Meet your guide" />
        </AbsoluteFill>
      )}
      {/* ===== 20 – 28 s: heritage, culture, coast (beat cuts) ===== */}
      {t >= 19.95 && t < 28.4 && (
        <AbsoluteFill style={{ zIndex: 4 }}>
          <ShotsV2 shots={MONTAGE} cams={CAMS} dir="v4" />
          {MONTAGE.filter((s) => s.tin === 'flash').map((s) => <Flash key={s.id} t={t} at={s.t0} />)}
          {MONTAGE.filter((s) => s.tin === 'sweep').map((s) => <LightSweep key={s.id} t={t} at={s.t0} />)}
          <Chip t={t} at={20.15} outAt={21.8} text="Heritage" />
          <Chip t={t} at={22.15} outAt={24.8} text="Culture" />
          <Chip t={t} at={25.2} outAt={27.7} text="The coast" />
        </AbsoluteFill>
      )}
      {/* ===== 28.5 – 34.5 s: back to the chat; footage becomes a photo; last bubble becomes the CTA ===== */}
      {showChat2 && (
        <AbsoluteFill style={{ zIndex: 5, opacity: clamp(prog(t, K.photo - 0.05, K.photo + 0.2) * 1.5) }}>
          <ChatScreen t={t} fps={fps} msgs={MSGS} name="Akosua" hideIdx={hide}
            renderMedia={(m) => m.kind === 'card' ? <LocationCard w={680} h={500} mapH={320} title="Ghana" sub="Shared location · December" /> : null} />
          <AbsoluteFill style={{ background: 'rgba(5,8,22,0.78)', opacity: mo }} />
        </AbsoluteFill>
      )}
      {t >= SH.r3_friends.t0 && (() => {
        const target = pr ?? { x: 56, y: 640, w: 540, h: 690 }; const r = lerpRect(FULL, target, phE);
        return (
          <div style={{ position: 'absolute', zIndex: 6, left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', borderRadius: lerp(0, 34, phE), clipPath: `inset(${Math.max(0, 252 - r.y)}px 0 0 0)`, opacity: 1 - mo * 0.9 }}>
            <Clip id="r3_friends" from={SH.r3_friends.t0} dur={6.6} />
          </div>
        );
      })()}
      {t >= K.morph && lastR && (() => {
        const r = lerpRect(lastR, CTA_RECT, mo);
        return (
          <div style={{ position: 'absolute', zIndex: 7, left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: lerp(40, 48, mo), background: lerp(0, 1, mo) > 0.5 ? '#fff' : '#1E2546', overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: clamp(mo * 1.6 - 0.3) }} />
            <div style={{ position: 'absolute', left: 38, top: (lastR.h - 62) / 2, fontFamily: 'DexBricolage', fontWeight: 600, fontSize: 52, color: '#fff', whiteSpace: 'nowrap', opacity: 1 - clamp(mo * 3) }}>Already booking with Dexterity!</div>
            {mo >= 1 && <EndCardV4 t={t - K.morphEnd} w={CTA_RECT.w} headline="Book your|*December*|in Ghana." pulseAt={1.4} />}
          </div>
        );
      })()}
      <Vignette amount={0.22} />
      {withAudio && <Audio src={staticFile('v4/mix_v4.wav')} />}
    </AbsoluteFill>
  );
};
