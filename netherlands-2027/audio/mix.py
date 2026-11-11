#!/usr/bin/env python3
"""Assembles the three editable stems on the master timeline and computes the music ducking curve.

  public/audio/stems/narration.wav   processed voice clips at their timeline positions
  public/audio/stems/sfx.wav         sound effects (timeline.json -> sfx)
  public/audio/stems/music.wav       (from make_music.py – left UN-ducked so it stays re-mixable)
  timeline.json -> duck[]            per-frame music gain: sidechained to the narration (fast attack, slow release)
  out/audio/mix_reference.wav        what the film sounds like (Remotion performs the same sum at render time)
"""
import json, os, numpy as np, soundfile as sf, pyloudnorm as pyln

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TLP = os.path.join(ROOT, "src", "data", "timeline.json")
TL = json.load(open(TLP)); SR = 48000; N = int(TL["total"] * SR); FPS = TL["fps"]
MUSIC_BASE, DUCK_TO = 0.95, 0.36   # music gain when nobody is talking / while the voice is active  (≈ -8.4 dB of ducking)
SFX_GAIN = 0.62

def load(p):
    x, sr = sf.read(os.path.join(ROOT, "public", p)); assert sr == SR; return x if x.ndim == 1 else x.mean(1)
def place(buf, x, t, g=1.0):
    i = int(t * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n] * g

vo = np.zeros(N)
for c in TL["vo"]: place(vo, load(c["file"]), c["start"])
sfx = np.zeros(N)
for t, name, g in TL["sfx"]: place(sfx, load(f"audio/sfx/{name}.wav"), t, g * SFX_GAIN)
music = load("audio/stems/music.wav")[:N]; music = np.pad(music, (0, N - len(music)))

# sidechain: narration level per video frame -> gate -> attack 2 frames / release ~0.45 s
hop = SR // FPS; nf = N // hop
lvl = np.sqrt((vo[: nf * hop].reshape(nf, hop) ** 2).mean(1)); active = (20 * np.log10(lvl + 1e-9) > -38).astype(float)
look = np.maximum.reduce([np.roll(active, -k) for k in range(0, 4)])  # 0.1 s look-ahead so the dip lands before the word
g = np.empty(nf); cur = 0.0
for i, a in enumerate(look):
    cur += (a - cur) * (0.5 if a > cur else 0.075); g[i] = cur
duck = MUSIC_BASE + (DUCK_TO - MUSIC_BASE) * g
TL["duck"] = [round(float(v), 3) for v in duck] + [round(float(duck[-1]), 3)] * 3
json.dump(TL, open(TLP, "w"), separators=(",", ":"))

stems = os.path.join(ROOT, "public", "audio", "stems"); os.makedirs(stems, exist_ok=True)
sf.write(os.path.join(stems, "narration.wav"), vo.astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(stems, "sfx.wav"), np.clip(sfx, -1, 1).astype(np.float32), SR, subtype="PCM_24")
gain = np.interp(np.arange(N) / hop, np.arange(nf), duck)
mix = vo + sfx + music * gain
out = os.path.join(ROOT, "out", "audio"); os.makedirs(out, exist_ok=True)
sf.write(os.path.join(out, "music_ducked.wav"), (music * gain).astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(out, "mix_reference.wav"), np.clip(mix, -1, 1).astype(np.float32), SR, subtype="PCM_24")
m = pyln.Meter(SR)
for name, x in [("narration", vo), ("music (ducked)", music * gain), ("sfx", sfx), ("mix", mix)]:
    print(f"{name:16s} {m.integrated_loudness(x):6.1f} LUFS   peak {20 * np.log10(np.abs(x).max() + 1e-9):5.1f} dBFS")
