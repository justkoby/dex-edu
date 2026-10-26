"""Concept 2 SFX (original, numpy-synthesised): typography hit, riser, route shimmer, destination ping, logo swell, brand stinger.
Usage: python scripts/gen_sfx_motion.py public/audio"""
import sys, os, subprocess, numpy as np, soundfile as sf
from numpy.fft import rfft, irfft
out = sys.argv[1]; SR = 44100; rng = np.random.default_rng(23)
def save(name, sig, g=.9):
    sig = sig/np.max(np.abs(sig))*g; p = f"{out}/{name}.wav"; sf.write(p, sig, SR)
    subprocess.run(["ffmpeg","-v","error","-y","-i",p,"-b:a","160k",f"{out}/{name}.mp3"], check=True); os.remove(p)
def env(n, a=.003, d=.1): x = np.arange(n)/SR; return np.minimum(x/a, 1)*np.exp(-x/d)
def band(n, c, w):
    sp = rfft(rng.standard_normal(n)); fr = np.linspace(0, 1, len(sp)); sp *= np.exp(-((fr-c)/w)**2); return irfft(sp, n)
# typography hit: short low thump + noise click (tight, not boomy)
n = int(.35*SR); x = np.arange(n)/SR; f = 90*np.exp(-x*30)+48
save("sfx_hit", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*16)+band(n, .3, .2)*np.exp(-x*60)*.5, .85)
# riser: filtered noise sweeping up + rising tone, 1.2 s
n = int(1.2*SR); x = np.linspace(0, 1, n); sp = rfft(rng.standard_normal(n)); fr = np.linspace(0, 1, len(sp)); r = np.zeros(n)
for k in range(6):
    c = .03+.4*(k/6); sp2 = rfft(rng.standard_normal(n))*np.exp(-((fr-c)/.05)**2); r += irfft(sp2, n)*(x**(1.5+k*.1))
tone = np.sin(2*np.pi*np.cumsum(180+900*x**2)/SR)*x**3*.25
save("sfx_riser", (r/np.max(np.abs(r))*.7+tone)*np.minimum(1, (1-x)*30+0*x), .8)
# route shimmer: airy band-noise swell with slow tremolo (3.4 s)
n = int(3.4*SR); x = np.arange(n)/SR; w = band(n, .35, .12)*(0.5+0.5*np.sin(2*np.pi*3.1*x))
save("sfx_route", w*np.sin(np.pi*np.linspace(0, 1, n))**1.5, .55)
# destination ping: soft bell, two partials + short ring
n = int(1.4*SR); x = np.arange(n)/SR
save("sfx_ping", (np.sin(2*np.pi*988*x)+.35*np.sin(2*np.pi*1976*x)+.15*np.sin(2*np.pi*2960*x))*env(n, .002, .35), .6)
# logo swell: sub rise + shimmer then soft landing (1.6 s)
n = int(1.6*SR); x = np.arange(n)/SR; t = x/1.6
sub = np.sin(2*np.pi*np.cumsum(55+40*t)/SR)*np.sin(np.pi*t)**2*.6
shim = band(n, .5, .1)*np.sin(np.pi*t)**2*.4
save("sfx_swell", sub+shim, .75)
# brand stinger: A major pad-ish chord with bell attack, 2.6 s
n = int(2.6*SR); x = np.arange(n)/SR; c = np.zeros(n)
for f, at, g in ((440, 0, 1), (554.4, .06, .8), (659.3, .12, .8), (880, .2, .9)):
    s = (np.sin(2*np.pi*f*x)+.2*np.sin(2*np.pi*3*f*x))*np.exp(-x/.9)*np.minimum(x/.006, 1); i = int(at*SR); c[i:] += s[:n-i]*g
save("sfx_brand", c, .6)
