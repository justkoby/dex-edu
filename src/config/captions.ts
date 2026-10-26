import { VOICE, sec } from "./timeline";

export type Word = { text: string; from: number; to: number; accent?: boolean };
export type Chunk = { words: Word[]; from: number; to: number };

const LINES = {
  s1: "Chale Ama! Where you dey? We dey plan link up for East Legon this weekend.",
  s2: "Kofi, East Legon ke? Chale, I dey Budapest oo!",
  s3: "BUDAPEST?! As in Hungary? Ei! Since when?!",
  s4: "Yes oo! There are schools here like International Business School and Budapest Metropolitan University. You should check them out!",
  s5: "Thinking of studying abroad? Dexterity Educational Consult can help you explore your options and guide you through the application process.",
  s6: "Your next chapter could start in Hungary. WhatsApp Dexterity today!",
} as const;

const ACCENT = /^(chale|budapest|hungary|ei|dexterity|whatsapp|abroad|legon|oo)/i;

/**
 * Word timings are estimated, not forced-aligned: the clip duration is shared between words by
 * character count (+ a pause weight after punctuation). Good enough for a draft; replace with
 * forced-alignment output if you swap in a different voice.
 */
function timeWords(key: keyof typeof LINES): Word[] {
  const raw = LINES[key].split(/\s+/);
  const weight = (w: string) => w.replace(/[^\w]/g, "").length + 1.5 + (/[.?!,]$/.test(w) ? 2.5 : 0);
  const total = raw.reduce((a, w) => a + weight(w), 0);
  const v = VOICE[key];
  let t = sec(v.start);
  const span = sec(v.dur);
  return raw.map((w) => {
    const len = (weight(w) / total) * span;
    const word = { text: w.replace(/^["“]|["”]$/g, ""), from: Math.round(t), to: Math.round(t + len), accent: ACCENT.test(w) };
    t += len;
    return word;
  });
}

/** Group words into short on-screen chunks (max 3 words / 18 chars, break on punctuation). */
function chunk(words: Word[]): Chunk[] {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: cur[0].from, to: cur[cur.length - 1].to });
    cur = [];
  };
  for (const w of words) {
    const len = [...cur, w].map((x) => x.text).join(" ").length;
    if (cur.length >= 3 || len > 20) flush();
    cur.push(w);
    if (/[.?!,]$/.test(w.text)) flush();
  }
  flush();
  return out;
}

export const CAPTIONS: Record<keyof typeof LINES, Chunk[]> = {
  s1: chunk(timeWords("s1")),
  s2: chunk(timeWords("s2")),
  s3: chunk(timeWords("s3")),
  s4: chunk(timeWords("s4")),
  s5: chunk(timeWords("s5")),
  s6: chunk(timeWords("s6")),
};

/** Absolute frame at which a given word of a line starts, e.g. wordFrame("s4", "International"). */
export function wordFrame(key: keyof typeof LINES, text: string): number {
  const w = CAPTIONS[key].flatMap((c) => c.words).find((x) => x.text.toLowerCase().startsWith(text.toLowerCase()));
  if (!w) throw new Error(`word ${text} not in ${key}`);
  return w.from;
}

/** Absolute frame span of a word (first match), for cueing visuals to speech. */
export function wordSpan(key: keyof typeof LINES, text: string): { from: number; to: number } {
  const w = CAPTIONS[key].flatMap((c) => c.words).find((x) => x.text.toLowerCase().startsWith(text.toLowerCase()));
  if (!w) throw new Error(`word ${text} not in ${key}`);
  return { from: w.from, to: w.to };
}
