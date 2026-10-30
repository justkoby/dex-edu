import React from 'react';
import { COLOR, TYPE } from './brand';
import { clamp, expoOut, prog } from './motion';

export type Word = { w: string; start: number; end: number };
export type SubMode = 'normal' | 'compact' | 'hidden';
/** Pages of 1–2 short lines: break after punctuation, on long pauses, or when a page would exceed `maxChars`. */
export const paginate = (words: Word[], maxChars = 26, maxWords = 6) => {
  const pages: Word[][] = []; let cur: Word[] = [];
  words.forEach((w, i) => {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    const prev = cur[cur.length - 1];
    if (cur.length && (len > maxChars || cur.length >= maxWords || (prev && w.start - prev.end > 0.45))) { pages.push(cur); cur = []; }
    cur.push(w);
    if (/[,.!?]$/.test(w.w) && cur.length >= 2 && i < words.length - 1) { pages.push(cur); cur = []; }
  });
  if (cur.length) pages.push(cur);
  // never leave a single orphaned word on its own page: fold it into the previous page (becomes a second line)
  for (let i = pages.length - 1; i > 0; i--) {
    const chars = pages[i - 1].reduce((n, x) => n + x.w.length + 1, 0) + pages[i][0].w.length;
    if (pages[i].length === 1 && chars <= 36 && pages[i][0].start - pages[i - 1][pages[i - 1].length - 1].end < 0.45) { pages[i - 1].push(...pages[i]); pages.splice(i, 1); }
  }
  return pages;
};

/** Editorial paging: `pages` lists the caption pages as text; words are consumed in order (punctuation-insensitive). */
export const paginateBy = (words: Word[], pages: string[]) => {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9']/g, '');
  const out: Word[][] = []; let i = 0;
  for (const p of pages) {
    const n = p.split(/\s+/).filter(Boolean).length; const chunk = words.slice(i, i + n);
    if (chunk.map((w) => norm(w.w)).join(' ') !== p.split(/\s+/).map(norm).join(' ')) return paginate(words);   // mismatch -> safe fallback
    out.push(chunk); i += n;
  }
  return i === words.length ? out : paginate(words);
};

/**
 * TikTok-style word-synced subtitles. Timings come from the narration audio (tools/word_timings.py), never estimates.
 * The spoken word turns orange with a small lift/scale; the rest stay white. `modeAt(t)` lets the composition simplify or
 * move the subtitles while a major headline is on screen. Toggle with the composition's `subtitles` prop.
 */
export const Subtitles: React.FC<{ t: number; words: Word[]; pages?: string[]; modeAt?: (t: number) => SubMode; y?: number; compactY?: number }> =
  ({ t, words, pages: pageText, modeAt = () => 'normal', y = 1330, compactY = 1410 }) => {
    const mode = modeAt(t); if (mode === 'hidden') return null;
    const pages = pageText ? paginateBy(words, pageText) : paginate(words);
    const idx = pages.findIndex((p, i) => { const nxt = pages[i + 1]; const a = p[0].start - 0.06; const b = nxt ? Math.min(nxt[0].start - 0.06, p[p.length - 1].end + 0.6) : p[p.length - 1].end + 0.45; return t >= a && t < b; });
    if (idx < 0) return null;
    const page = pages[idx]; const pin = expoOut(prog(t, page[0].start - 0.06, page[0].start + 0.1));
    const compact = mode === 'compact'; const size = compact ? 44 : 60;
    return (
      <div style={{ position: 'absolute', left: 90, right: 90, top: (compact ? compactY : y) - size, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: Math.round(size * 0.27), rowGap: 2,
        transform: `translateY(${(1 - pin) * 14}px)`, opacity: clamp(pin * 1.6) }}>
        {page.map((w, i) => {
          const next = page[i + 1]?.start ?? w.end + 0.15;
          const on = t >= w.start - 0.02 && t < next - 0.02;
          const k = on ? expoOut(prog(t, w.start - 0.02, w.start + 0.08)) : 0;
          return (
            <span key={i} style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: size, lineHeight: 1.12, letterSpacing: '-0.015em',
              color: on ? COLOR.orange : COLOR.white, display: 'inline-block', transform: `translateY(${-4 * k}px) scale(${1 + 0.07 * k})`,
              textShadow: '0 2px 3px rgba(4,7,22,0.55), 0 4px 18px rgba(4,7,22,0.5)' }}>{w.w}</span>
          );
        })}
      </div>
    );
  };
