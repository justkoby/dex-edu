#!/usr/bin/env python3
"""Original music bed for the Netherlands 2027 cartoon -> public/audio/stems/music.wav

A playful highlife-flavoured groove (palm-muted guitar picking, round bass, shaker, bell pattern, marimba hook) that is
SYNTHESISED here from scratch, so there is no third-party licence to clear. It is a placeholder-quality bed: see
docs/AUDIO.md for recommended licensed replacements. The arrangement follows the narration timeline:
  s1 light groove -> dead stop just before "MONEY" -> back in on "Exactly!"    s2/s3 full groove (+hook)
  s4 dreamy half-time bells/pad -> thin & icy when the cold hits                 s5 full groove, big chord on the logo, button ending
"""
import json, os, numpy as np, soundfile as sf
from synth import *

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json")))
C, S, TOTAL = TL["cues"], TL["scenes"], TL["total"]
BPM = 108.0; BEAT = 60 / BPM; SIX = BEAT / 4
A2 = 110.0
def n(semi): return A2 * 2 ** (semi / 12)
# I – IV – I – V in A major: roots (semitones from A2) + chord tones
PROG = [(0, [0, 4, 7]), (5, [5, 9, 12]), (0, [0, 4, 7]), (7, [7, 11, 14])]
HOOK = [(0, 16), (3, 19), (6, 21), (8, 19), (12, 16), (14, 14), (16, 16), (22, 12), (24, 14), (26, 16), (28, 19), (32, 21), (35, 24), (38, 21), (40, 19), (44, 16), (48, 14), (51, 16), (54, 19), (56, 16), (60, 12)]  # (16th index over 4 bars, semitone)
BELL = [0, 3, 6, 8, 10, 12, 14]  # highlife-style timeline pattern over 16 sixteenths

cache = {}
def P(f, d, b=0.5, damp=0.995):
    k = (round(f, 2), d, b, damp)
    if k not in cache: cache[k] = fade(pluck(f, d, b, damp), 0.002, 0.03)
    return cache[k]
kick = fade(sweep(120, 46, 0.22, 0.5) * env_exp(0.22, 14))
shak = fade(hp(noise(0.05), 5000) * env_exp(0.05, 60), 0.002, 0.01)
bellS = fade((sine(1245, 0.12) + 0.5 * sine(1868, 0.12)) * env_exp(0.12, 34))
rim = fade(bp(noise(0.04), 900, 2600) * env_exp(0.04, 70) + 0.5 * sine(430, 0.04) * env_exp(0.04, 60))

def groove(dur, drums=1.0, guitar=1.0, bass=1.0, hook=0.0, bell=1.0):
    buf = np.zeros(int((dur + 1.5) * SR)); steps = int(dur / SIX)
    for s in range(steps):
        t = s * SIX + (SIX * 0.16 if s % 2 else 0)  # light swing
        bar, pos = (s // 16) % 4, s % 16
        root, tones = PROG[bar]
        if drums:
            if pos in (0, 8): place(buf, kick, t, 0.55 * drums)
            if pos in (4, 12): place(buf, rim, t, 0.3 * drums)
            if pos % 2 == 0: place(buf, shak, t, (0.2 if pos % 4 == 0 else 0.11) * drums)
            else: place(buf, shak, t, 0.05 * drums)
        if bell and pos in BELL: place(buf, bellS, t, 0.09 * bell)
        if bass:
            if pos == 0: place(buf, lp(P(n(root - 12), 0.5, 0.15, 0.997), 500), t, 0.75 * bass)
            if pos == 6: place(buf, lp(P(n(root - 5), 0.3, 0.15, 0.996), 500), t, 0.55 * bass)
            if pos == 10: place(buf, lp(P(n(root), 0.3, 0.15, 0.996), 500), t, 0.5 * bass)
            if pos == 14: place(buf, lp(P(n(root - 12 + 7), 0.25, 0.15, 0.996), 500), t, 0.45 * bass)
        if guitar:
            pat = [0, None, 1, 2, None, 1, 0, None, 2, 1, None, 2, 0, 1, None, 2][pos]
            if pat is not None: place(buf, P(n(tones[pat] + 12), 0.22, 0.6, 0.985), t, 0.17 * guitar)
            if pos in (3, 11): place(buf, P(n(tones[2] + 24), 0.2, 0.7, 0.985), t, 0.1 * guitar)
        if hook:
            for (i, semi) in HOOK:
                if i == s % 64: place(buf, marimba(n(semi + 12), 0.5), t, 0.22 * hook)
    return buf[: int(dur * SR)]

def dream(dur, icy=0.0):
    buf = np.zeros(int((dur + 2.5) * SR)); half = BEAT  # arpeggio every beat
    for i in range(int(dur / half)):
        bar = (i // 4) % 4; root, tones = PROG[bar]
        semi = [tones[0] + 24, tones[1] + 24, tones[2] + 24, tones[1] + 36][i % 4]
        place(buf, fade(marimba(n(semi), 1.1) + 0.3 * sine(n(semi + 12), 1.1) * env_exp(1.1, 4)), i * half, 0.2)
        if i % 4 == 0 and icy < 0.5:
            pad = sum(sine(n(s), BEAT * 4.2) for s in [root, root + 7, tones[1] + 12]) * np.sin(np.pi * np.linspace(0, 1, int(BEAT * 4.2 * SR))) ** 0.7
            place(buf, lp(pad, 900), i * half, 0.07)
    out = reverb(buf[: int(dur * SR)], 0.4, 1.6)[: int((dur + 1.2) * SR)]
    return hp(out, 900) * 0.8 if icy else out

music = np.zeros(int((TOTAL + 2) * SR))
def put(x, t, g=1.0, fi=0.02, fo=0.08): place(music, fade(x, fi, fo), t, g)

# s1: light groove, stops dead before MONEY; comes back on "Exactly!"
stop = C["money"] - 0.42
put(groove(stop - 0.05, drums=0.7, guitar=0.0, bass=0.9, bell=1.0), 0.05, 0.9, 0.02, 0.05)
put(groove(S["s2"][0] - C["exactly"] + 0.05, drums=1.0, guitar=1.0, bass=1.0), C["exactly"] - 0.05, 1.0, 0.01, 0.12)
# s2: full groove; s3: + marimba hook
put(groove(S["s3"][0] - S["s2"][0], drums=1.0, guitar=1.0, bass=1.0), S["s2"][0], 1.0, 0.01, 0.12)
put(groove(S["s4"][0] - S["s3"][0], drums=1.0, guitar=1.0, bass=1.0, hook=1.0), S["s3"][0], 1.0, 0.01, 0.15)
# s4: dream -> icy
freeze = C["vo07_end"] + 0.1
put(dream(freeze - S["s4"][0]), S["s4"][0], 1.0, 0.05, 0.4)
put(dream(S["s5"][0] - freeze - 0.15, icy=1.0), freeze, 0.9, 0.05, 0.1)
# s5: groove back, hook from "Dexterity", stinger chord on the logo, button ending
put(groove(C["dexterity"] - S["s5"][0], drums=1.0, guitar=1.0, bass=1.0), S["s5"][0], 1.0, 0.01, 0.1)
end_btn = TOTAL - 0.9
put(groove(end_btn - C["dexterity"], drums=1.0, guitar=1.0, bass=1.0, hook=1.0), C["dexterity"], 1.0, 0.01, 0.03)
for semi in [-12, 0, 4, 7, 12, 16]:
    place(music, P(n(semi), 1.6, 0.7, 0.998), C["here"], 0.2)
    place(music, P(n(semi), 1.4, 0.7, 0.998), end_btn, 0.26)
place(music, kick, end_btn, 0.7)

music = music[: int(TOTAL * SR)]
music = lp(hp(music, 45), 11000)
music = np.tanh(music / (np.abs(music).max() + 1e-9) * 1.4) * 0.7
os.makedirs(os.path.join(ROOT, "public", "audio", "stems"), exist_ok=True)
sf.write(os.path.join(ROOT, "public", "audio", "stems", "music.wav"), music.astype(np.float32), SR, subtype="PCM_16")
print("music", round(len(music) / SR, 2), "s")
