import { CLIPS, ClipId, VOICE, sec } from "./timeline";

export type Word = { text: string; from: number; to: number; accent?: boolean };
export type Chunk = { words: Word[]; from: number; to: number; hero?: boolean };

/** Key phrases highlighted in orange (matched on consecutive words, punctuation ignored). */
const KEYPHRASES = [
  ["east", "legon"], ["budapest"], ["hungary"], ["international", "business", "school"],
  ["budapest", "metropolitan", "university"], ["dexterity", "educational", "consult"], ["whatsapp"], ["dexterity"],
];
const norm = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

function markAccents(words: Word[]) {
  const n = words.map((w) => norm(w.text));
  // longest phrases first
  for (const k of [...KEYPHRASES].sort((a, b) => b.length - a.length))
    for (let i = 0; i + k.length <= n.length; i++)
      if (k.every((x, j) => n[i + j] === x)) for (let j = 0; j < k.length; j++) words[i + j].accent = true;
}

/**
 * Word timing: each recorded phrase has measured start/end (from the audio envelope); words inside a phrase are
 * spaced by character weight. Phrase boundaries are measured, word boundaries inside a phrase are estimated.
 */
function build(id: ClipId): Chunk[] {
  const clip = CLIPS[id];
  const base = VOICE[id].start;
  const chunks: Chunk[] = [];
  const all: Word[] = [];
  const perPhrase: Word[][] = clip.phrases.map((p) => {
    const raw = p.text.split(/\s+/);
    const wt = raw.map((w) => norm(w).length + 1.2 + (/[.?!,]$/.test(w) ? 1.5 : 0));
    const tot = wt.reduce((a, b) => a + b, 0);
    let t = p.start;
    const words = raw.map((w, i) => {
      const len = ((p.end - p.start) * wt[i]) / tot;
      const word: Word = { text: w, from: sec(base + t), to: sec(base + t + len) };
      t += len;
      return word;
    });
    all.push(...words);
    return words;
  });
  markAccents(all);
  for (const words of perPhrase) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) chunks.push({ words: cur, from: cur[0].from, to: cur[cur.length - 1].to });
      cur = [];
    };
    for (const w of words) {
      const len = [...cur, w].map((x) => x.text).join(" ").length;
      if (cur.length >= 3 || len > 22) flush();
      cur.push(w);
      if (id === "s3_reaction" && cur.length === 1 && norm(w.text) === "budapest") flush(); // hero word on its own
    }
    flush();
  }
  // keep chunks visible until the next one begins, but never through a real pause (>0.6 s)
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    c.to = next && next.from - c.to < 18 ? next.from : c.to + 6;
  });
  if (id === "s3_reaction") chunks[0].hero = true;
  return chunks;
}

export const CAPTIONS: Record<ClipId, Chunk[]> = {
  s1_call: build("s1_call"), s2_answer: build("s2_answer"), s3_reaction: build("s3_reaction"), s4_schools: build("s4_schools"),
  s5a_intro: build("s5a_intro"), s5b_help: build("s5b_help"), s6_cta: build("s6_cta"),
};

/** Absolute-frame span of a word (first match from `after` onward), for cueing visuals to speech. */
export function wordSpan(id: ClipId, text: string, nth = 0): { from: number; to: number } {
  const ws = CAPTIONS[id].flatMap((c) => c.words).filter((x) => norm(x.text) === norm(text));
  if (!ws[nth]) throw new Error(`word ${text}#${nth} not in ${id}`);
  return { from: ws[nth].from, to: ws[nth].to };
}
