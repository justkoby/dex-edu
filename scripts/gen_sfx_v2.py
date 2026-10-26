"""V2 extra SFX, synthesised with numpy (original, royalty-free): realistic double-burst ring, call disconnect,
UI tick, title swish, soft end-card chime.  Usage: python scripts/gen_sfx_v2.py public/audio"""
import sys, subprocess, numpy as np, soundfile as sf
out = sys.argv[1]; SR = 44100; rng = np.random.default_rng(11)
def env(n, a=.004, d=.1): x = np.arange(n)/SR; return np.minimum(x/a, 1)*np.exp(-x/d)
def save(name, sig, g=.9):
    sig = sig/np.max(np.abs(sig))*g; sf.write(f"{out}/{name}.wav", sig, SR)
    subprocess.run(["ffmpeg","-v","error","-y","-i",f"{out}/{name}.wav","-b:a","160k",f"{out}/{name}.mp3"], check=True)
    import os; os.remove(f"{out}/{name}.wav")
# ring: classic double-burst (2 x 0.4s, gap 0.2, rest 1.2) with 20 Hz AM -> "brrr-brrr"
n = int(3.2*SR); x = np.arange(n)/SR; ph = x % 2.0
gate = ((ph < .4) | ((ph > .6) & (ph < 1.0))).astype(float)
gate = np.convolve(gate, np.ones(200)/200, "same")
tone = (np.sin(2*np.pi*440*x)+np.sin(2*np.pi*480*x))*(0.6+0.4*np.sign(np.sin(2*np.pi*20*x)))
save("sfx_ring2", tone*gate)
# disconnect: two quick descending blips
n = int(.5*SR); x = np.arange(n)/SR; d = np.zeros(n)
for f, at in ((740, 0), (494, .16)):
    s = np.sin(2*np.pi*f*x)*env(n, .002, .07); i = int(at*SR); d[i:] += s[:n-i]
save("sfx_disconnect", d, .8)
# UI tick
n = int(.08*SR); x = np.arange(n)/SR; save("sfx_tick", np.sin(2*np.pi*1900*x)*env(n, .001, .012)+0.4*np.sin(2*np.pi*3800*x)*env(n, .001, .008), .7)
# title swish: band noise sweep up + tiny click
n = int(.45*SR); x = np.linspace(0, 1, n); w = rng.standard_normal(n)
from numpy.fft import rfft, irfft
sp = rfft(w); fr = np.linspace(0, 1, len(sp)); sp *= np.exp(-((fr-.25)/.12)**2); w = irfft(sp, n)
save("sfx_title", w*np.sin(np.pi*x)**1.5, .8)
# soft end-card chime: A5-E6-A6 arpeggio with long decay + tiny shimmer
n = int(2.6*SR); x = np.arange(n)/SR; c = np.zeros(n)
for f, at in ((880, 0), (1318.5, .11), (1760, .22)):
    s = (np.sin(2*np.pi*f*x)+.25*np.sin(2*np.pi*2*f*x))*np.exp(-x/.7)*np.minimum(x/.004, 1); i = int(at*SR); c[i:] += s[:n-i]*(0.8 if at else 1)
save("sfx_chime", c, .6)
