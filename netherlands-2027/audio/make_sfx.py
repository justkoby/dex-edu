#!/usr/bin/env python3
"""Generates the cartoon sound-effect kit (public/audio/sfx/*.wav). 100% synthesised here – no licensing needed."""
import os, numpy as np, soundfile as sf
from synth import *

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)
K = {}

# pop: little bubble pop for things appearing
K["pop"] = fade(sweep(380, 980, 0.09) * env_exp(0.09, 28))
K["pop_low"] = fade(sweep(220, 520, 0.11) * env_exp(0.11, 22))
# whoosh: filtered-noise swish
def whoosh(d=0.42, f0=500, f1=3800):
    n = noise(d); x = np.linspace(0, 1, len(n)); e = np.sin(np.pi * x) ** 1.6
    lo = bp(n, 300, 1400) * (1 - x) + bp(n, 1400, 6000) * x
    return fade(lo * e, 0.02, 0.05)
K["whoosh"] = whoosh(); K["whoosh_fast"] = whoosh(0.24); K["whoosh_long"] = whoosh(0.8)
# falling whistle (cartoon drop) then SLAM
K["fall"] = fade(sweep(2100, 420, 0.42, 1.6) * np.linspace(0.15, 1, int(0.42 * SR)) * (1 + 0.25 * sine(28, 0.42)), 0.01, 0.01)
thump = sweep(150, 38, 0.5, 0.5) * env_exp(0.5, 7.5)
crunch = lp(noise(0.3), 2400) * env_exp(0.3, 16)
rattle = np.zeros(int(0.6 * SR))
for f, o in [(310, 0.08), (420, 0.16), (260, 0.25)]: place(rattle, fade(sine(f, 0.12) * env_exp(0.12, 30)), o)
slam = np.zeros(int(0.7 * SR)); place(slam, thump, 0, 1.0); place(slam, crunch, 0, 0.7); place(slam, rattle, 0, 0.18)
K["slam"] = np.tanh(slam * 1.8)
# coins: bright metallic pings scattered
def coin(f): return (sine(f, 0.35) + 0.6 * sine(f * 1.5, 0.35) + 0.3 * sine(f * 2.76, 0.35)) * env_exp(0.35, 13)
c = np.zeros(int(1.1 * SR))
for i, (f, o) in enumerate([(2637, 0), (3136, 0.07), (2349, 0.15), (3520, 0.22), (2794, 0.33), (3136, 0.47), (2637, 0.66)]): place(c, fade(coin(f)), o, 0.8 - i * 0.08)
K["coins"] = c
# boing: spring
d = 0.55; ph = 2 * np.pi * np.cumsum(170 + 120 * np.exp(-tt(d) * 5) * np.sin(2 * np.pi * 11 * tt(d)) + 60 * np.exp(-tt(d) * 3)) / SR
K["boing"] = fade((np.sin(ph) + 0.4 * np.sin(2 * ph)) * env_exp(d, 5.5))
# stretch: rubbery rising squeak, then snap
st = (np.sign(sweep(140, 520, 0.75, 1.5)) * 0.25 + sweep(140, 520, 0.75, 1.5)) * np.linspace(0.3, 1, int(0.75 * SR)) * (1 + 0.35 * sine(34, 0.75))
K["stretch"] = fade(lp(st, 2600), 0.03, 0.02)
K["snap"] = fade(hp(noise(0.06), 1800) * env_exp(0.06, 60) + sweep(900, 300, 0.06) * env_exp(0.06, 50))
# stamp: woody thud + paper
K["stamp"] = np.tanh((sweep(190, 70, 0.22, 0.6) * env_exp(0.22, 16) + 0.6 * lp(noise(0.22), 3000) * env_exp(0.22, 30)) * 1.6)
# card: paper swish + soft landing tick
cd = np.zeros(int(0.45 * SR)); place(cd, whoosh(0.22, 800, 5000), 0, 0.7); place(cd, fade(sweep(520, 240, 0.08) * env_exp(0.08, 40)), 0.2, 0.9); place(cd, hp(noise(0.03), 3000) * env_exp(0.03, 90), 0.2, 0.5)
K["card"] = cd
K["slide"] = fade(bp(noise(0.3), 500, 2500) * np.linspace(1, 0.1, int(0.3 * SR)) ** 1.5, 0.02, 0.03)
K["bump"] = np.tanh((sweep(130, 60, 0.18, 0.6) * env_exp(0.18, 18) + 0.3 * lp(noise(0.18), 1200) * env_exp(0.18, 40)) * 1.5)
# sparkle / dream chime: ascending bells with tail
sp = np.zeros(int(1.6 * SR))
for i, f in enumerate([1047, 1319, 1568, 2093, 2637, 3136]): place(sp, fade(marimba(f, 0.9) + 0.4 * sine(f * 2, 0.9) * env_exp(0.9, 6)), i * 0.085, 0.6)
K["sparkle"] = reverb(sp, 0.35, 1.2)[: int(2.4 * SR)]
K["ding"] = fade((sine(1760, 0.6) + 0.5 * sine(2640, 0.6) + 0.25 * sine(3520, 0.6)) * env_exp(0.6, 7))
K["tick"] = fade((sine(1318, 0.18) + 0.5 * sine(1976, 0.18)) * env_exp(0.18, 22))
# suitcase wheels rolling in + bump
roll = bp(noise(0.7), 180, 900) * (0.55 + 0.45 * np.sign(sine(23, 0.7))) * np.linspace(0.2, 1, int(0.7 * SR))
K["roll"] = fade(roll, 0.03, 0.03)
# poof: soft airy burst for clothes appearing
K["poof"] = fade(lp(noise(0.3), 2800) * env_exp(0.3, 11) * np.minimum(1, tt(0.3) * 90) + 0.5 * sweep(300, 120, 0.3) * env_exp(0.3, 14))
# wind: slow filtered noise gust
w = noise(2.6); g = 0.5 + 0.5 * np.sin(2 * np.pi * 0.42 * tt(2.6) - 1.2)
K["wind"] = fade(bp(w, 250, 1100) * g * 0.9 + bp(w, 1100, 2600) * g ** 3 * 0.35, 0.3, 0.6)
# shiver: teeth chatter (fast woody clicks)
sh = np.zeros(int(0.9 * SR))
for i in range(15): place(sh, fade(sine(1500 + 300 * (i % 2), 0.018) * env_exp(0.018, 120) + 0.5 * hp(noise(0.018), 2500) * env_exp(0.018, 160), 0.001, 0.004), i * 0.058 + 0.004 * (i % 3), 0.8)
K["chatter"] = sh
# ice crack / freeze
K["freeze"] = fade(hp(noise(0.5), 4500) * env_exp(0.5, 8) * (0.5 + 0.5 * np.sign(sine(60, 0.5))) + 0.4 * sweep(3200, 5200, 0.5) * env_exp(0.5, 9))
# record-scratch style "zip" for the snap back to reality
K["zip"] = fade(sweep(300, 2600, 0.16, 2.2) * np.linspace(0.3, 1, int(0.16 * SR)) + 0.3 * hp(noise(0.16), 2000))
# tap (watch)
K["tap"] = fade(sine(2200, 0.05) * env_exp(0.05, 70) + 0.6 * sine(880, 0.05) * env_exp(0.05, 60))
# brand hit: warm major chord swell + sparkle for the logo
ch = sum(fade(sine(f, 1.8) * env_exp(1.8, 2.2)) for f in [196, 293.7, 392, 493.9, 587.3])
bh = np.zeros(int(2.4 * SR)); place(bh, ch, 0, 0.22); place(bh, sweep(120, 45, 0.5, 0.5) * env_exp(0.5, 6), 0, 0.9)
for i, f in enumerate([1568, 1976, 2349, 3136]): place(bh, fade(marimba(f, 0.8)), 0.05 + i * 0.07, 0.35)
K["brand"] = reverb(bh, 0.3, 1.4)[: int(3.2 * SR)]
# riser into a scene change
r = noise(0.7); x = np.linspace(0, 1, len(r))
K["riser"] = fade((bp(r, 600, 5000) * x ** 2 + 0.4 * sweep(300, 1500, 0.7, 2) * x ** 2), 0.02, 0.015)
# small "huh?" blip for looks / eyebrow raises
K["blip"] = fade(sweep(520, 780, 0.07) * env_exp(0.07, 24))

for name, x in K.items():
    sf.write(os.path.join(OUT, name + ".wav"), norm(np.asarray(x, dtype=np.float64), 0.85).astype(np.float32), SR, subtype="PCM_16")
print("sfx:", ", ".join(sorted(K)))
