#!/usr/bin/env python3
"""Non-destructive narration clean-up for the Netherlands 2027 cartoon.

Reads the ORIGINAL WhatsApp recordings in ../NETHERLANDS/NARRATION AUDIO FILES (never modified) and writes
processed copies to public/audio/vo/ plus src/data/vo.json (durations, word timings, mouth envelope).

Chain per clip (all gentle, the voice/accent/delivery are untouched):
  high-pass 85 Hz -> FFT noise reduction (~9 dB) -> EQ (-2 dB @ 250 Hz mud, +2.5 dB @ 3.4 kHz presence, +1.5 dB air)
  -> 3:1 compressor -> trim head/tail silence (short fades) -> loudness match to a common target -> -1.5 dB peak cap.

Edit CLIPS below to change trims or text. Requires: ffmpeg, numpy, soundfile, pyloudnorm.
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "..", "NETHERLANDS", "NARRATION AUDIO FILES")
OUT = os.path.join(ROOT, "public", "audio", "vo")
SR, FPS = 48000, 30
TARGET_LUFS = -17.0

# Each clip: id, source file, [trim start, trim end] in SOURCE seconds, the text as actually spoken,
# phrases  = caption chunks as [source-time, text]   (measured from the recording: pauses + keyword search),
# marks    = named performance anchors in SOURCE seconds (what the animation, SFX and music key off).
# Re-time anything here after a re-record, then run `npm run audio` – the whole video follows.
N = "NETHERLANDS/NARRATION AUDIO FILES/"
CLIPS = [
    dict(id="01_hook", src="WhatsApp Audio 2026-11-11 at 1.57.43 AM.mp4", trim=[1.22, 9.16],
         text="Chale, why is it that anytime somebody mentions studying abroad, the first thing that comes to mind is MONEY?",
         phrases=[[1.28, "Chale,"], [3.05, "why is it that anytime"], [4.2, "somebody mentions"], [5.2, "studying abroad,"],
                  [6.5, "the first thing"], [7.3, "that comes to mind is…"], [8.5, ""]],
         marks=dict(chale=1.28, why=3.05, abroad=5.2, first=6.5, mind=7.3, money=8.5)),
    dict(id="02_exactly", src="WhatsApp Audio 2026-11-11 at 1.57.48 AM.mp4", trim=[0.70, 1.64], text="Exactly!",
         phrases=[[0.76, "Exactly!"]], marks=dict(exactly=0.76)),
    dict(id="03_whatif", src="WhatsApp Audio 2026-11-11 at 1.57.55 AM.mp4", trim=[0.78, 7.12],
         text="But what if I told you, you could start planning to study in the Netherlands in 2027?",
         phrases=[[0.84, "But what if I told you"], [2.1, "you could start planning"], [4.17, "to study in"], [5.02, "the Netherlands"], [6.12, "in 2027?"]],
         marks=dict(whatif=0.84, planning=2.1, study=4.17, netherlands=5.04, y2027=6.12)),
    dict(id="04_yup", src="WhatsApp Audio 2026-11-11 at 1.58.02 AM.mp4", trim=[0.66, 2.95], text="Yup. The Netherlands!",
         phrases=[[0.72, "Yup."], [1.3, "The Netherlands!"]], marks=dict(yup=0.72, thenl=1.3)),
    dict(id="05_schools", src="WhatsApp Audio 2026-11-11 at 1.58.09 AM.mp4", trim=[0.76, 8.42],
         text="You've got schools like SRH Haarlem and Wittenborg University of Applied Sciences!",
         phrases=[[0.82, "You've got schools like"], [2.98, "SRH Haarlem"], [4.45, "and"], [4.91, "Wittenborg University"], [6.6, "of Applied Sciences!"]],
         marks=dict(schools=0.82, srh=2.98, and_=4.45, witt=4.91)),
    dict(id="06_options", src="WhatsApp Audio 2026-11-11 at 1.59.20 AM.mp4", trim=[0.96, 2.63], text="See? Options!",
         phrases=[[1.02, "See?"], [2.04, "Options!"]], marks=dict(see=1.02, options=2.04)),
    dict(id="07_imagine", src="WhatsApp Audio 2026-11-11 at 1.59.26 AM.mp4", trim=[0.41, 6.00],
         text="Imagine yourself studying in Europe, meeting new people, experiencing a whole new environment…",
         phrases=[[0.47, "Imagine yourself"], [1.2, "studying in Europe,"], [2.42, "meeting new people,"], [4.14, "experiencing"], [4.7, "a whole new environment…"]],
         marks=dict(imagine=0.47, europe=1.2, people=2.42, experiencing=4.14, environment=4.9)),
    dict(id="08_cold", src="WhatsApp Audio 2026-11-11 at 1.59.31 AM.mp4", trim=[0.25, 5.60],
         text="Although… somebody should've warned me about the cold! 'Cause chale, it's too much!",
         phrases=[[0.31, "Although…"], [1.64, "somebody should've"], [2.4, "warned me about"], [3.4, "the cold!"], [4.22, "'cause chale,"], [4.9, "it's too much!"]],
         marks=dict(although=0.31, somebody=1.64, cold=3.6, toomuch=4.22)),
    dict(id="09_dexterity", src="WhatsApp Audio 2026-11-11 at 1.59.37 AM.mp4", trim=[0.25, 8.11],
         text="Anyway, if the Netherlands is on your list for 2027, Dexterity Educational Consult can help you get started.",
         phrases=[[0.31, "Anyway,"], [1.39, "if the Netherlands"], [2.5, "is on your list"], [3.3, "for 2027,"], [4.91, "Dexterity"], [5.92, "Educational Consult"], [6.9, "can help you get started."]],
         marks=dict(anyway=0.31, ifnl=1.39, list=2.75, dexterity=4.91, help=6.9)),
    dict(id="10_cta", src="WhatsApp Audio 2026-11-11 at 1.59.44 AM.mp4", trim=[0.33, 6.86],
         text="So, what are you waiting for? Your next chapter starts here. Chale, look sharp, look sharp!",
         phrases=[[0.39, "So…"], [1.3, "what are you waiting for?"], [2.94, "Your next chapter"], [3.56, "starts here."], [4.05, "Chale,"], [5.06, "look sharp, look sharp!"]],
         marks=dict(so=0.39, waiting=1.3, chapter=2.94, here=3.6, chale2=4.05, looksharp=5.06)),
]

FILTER = ",".join([
    "highpass=f=85",
    "afftdn=nr=9:nf=-44:tn=0",
    "equalizer=f=250:t=q:w=1.0:g=-2",
    "equalizer=f=3400:t=q:w=1.2:g=2.5",
    "highshelf=f=7500:g=1.5",
    "acompressor=threshold=-21dB:ratio=3:attack=8:release=140:makeup=1.5",
])


def decode(path, flt=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", flt] if flt else []) + ["-ar", str(SR), "-ac", "1", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype=np.float32).astype(np.float64)


def frame_db(x, hop):
    n = len(x) // hop
    fr = x[: n * hop].reshape(n, hop)
    return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)


def active_loudness(x):
    """LUFS for clips >= 0.5 s of gated audio; pads very short clips so the BS.1770 meter has a full block."""
    y = x if len(x) >= SR * 1.2 else np.tile(x, int(np.ceil(SR * 1.2 / len(x))))
    return pyln.Meter(SR).integrated_loudness(y)


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    for c in CLIPS:
        path = os.path.join(SRC, c["src"])
        raw = decode(path)
        x = decode(path, FILTER)
        a, b = int(c["trim"][0] * SR), min(len(x), int(c["trim"][1] * SR))
        seg, rawseg = x[a:b].copy(), raw[a:b]
        f = int(0.02 * SR)
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        gain = 10 ** ((TARGET_LUFS - active_loudness(seg)) / 20)
        seg *= gain
        peak = np.abs(seg).max()
        if peak > 10 ** (-1.5 / 20):  # soft cap instead of hard clipping
            seg = np.tanh(seg / peak * 1.25) / np.tanh(1.25) * 10 ** (-1.5 / 20)
        sf.write(os.path.join(OUT, c["id"] + ".wav"), seg.astype(np.float32), SR, subtype="PCM_24")

        # diagnostics on the ORIGINAL for the audio review
        db = frame_db(raw, SR // 100)
        floor = float(np.percentile(db, 5))
        # mouth envelope @ video fps: band-limited loudness, normalised 0..1
        env_db = frame_db(seg, SR // FPS)
        env = np.clip((env_db + 38) / 26, 0, 1)
        # pauses inside the trimmed clip (>0.28 s under threshold)
        d10 = frame_db(seg, SR // 100); quiet = d10 < -36; pauses = []; st = None
        for i, q in enumerate(list(quiet) + [False]):
            if q and st is None: st = i
            if not q and st is not None:
                if i - st >= 28: pauses.append([round(st / 100, 2), round(i / 100, 2)])
                st = None
        t0 = c["trim"][0]
        phrases = [[round(max(0.0, t - t0), 2), txt] for t, txt in c["phrases"]]
        marks = {k: round(max(0.0, v - t0), 2) for k, v in c["marks"].items()}
        manifest.append(dict(
            id=c["id"], file=f"audio/vo/{c['id']}.wav", text=c["text"], dur=round(len(seg) / SR, 3),
            srcFile=c["src"], srcTrim=c["trim"], phrases=phrases, marks=marks,
            pauses=pauses, env=[round(float(v), 2) for v in env],
            src=dict(dur=round(len(raw) / SR, 2), peakDb=round(20 * np.log10(np.abs(raw).max()), 1),
                     lufs=round(active_loudness(rawseg), 1), noiseFloorDb=round(floor, 1), gainDb=round(20 * np.log10(gain), 1)),
        ))
        m = manifest[-1]
        print(f"{m['id']:14s} {m['dur']:5.2f}s  src {m['src']['lufs']:6.1f} LUFS  peak {m['src']['peakDb']:5.1f}  floor {m['src']['noiseFloorDb']:5.1f}  gain {m['src']['gainDb']:+.1f} dB  pauses {pauses}")
    json.dump(manifest, open(os.path.join(ROOT, "src", "data", "vo.json"), "w"), indent=1)
    print("total speech", round(sum(m["dur"] for m in manifest), 2), "s")


if __name__ == "__main__":
    sys.exit(main())
