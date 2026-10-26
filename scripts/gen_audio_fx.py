"""Synthesises the temporary music bed + SFX (original, royalty-free, numpy-generated) into public/audio/.
Timings mirror src/config/timeline.ts so the music lands on the visual changes (120 BPM, 0.5 s/beat).
Usage: python scripts/gen_audio_fx.py public/audio"""
import sys, subprocess, numpy as np, soundfile as sf
out = sys.argv[1]; SR = 44100; rng = np.random.default_rng(7)
T = 40.5; N = int(T*SR); t = np.arange(N)/SR
def env(n, a=0.005, d=0.1):
    x = np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
def put(buf, sig, at, g=1.0):
    i = int(at*SR); j = min(len(buf), i+len(sig))
    if i < len(buf): buf[i:j] += sig[:j-i]*g
def kick(): n=int(.3*SR); x=np.arange(n)/SR; f=45+110*np.exp(-x*28); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*11)
def clap(): n=int(.18*SR); return rng.standard_normal(n)*env(n,.001,.05)*.6
def hat(): n=int(.05*SR); x=rng.standard_normal(n); return np.diff(x,prepend=0)*env(n,.001,.015)*.35
def pluck(f, d=.22): n=int(.5*SR); x=np.arange(n)/SR; return (np.sin(2*np.pi*f*x)+.4*np.sin(4*np.pi*f*x))*env(n,.003,d)
def bass(f): n=int(.45*SR); x=np.arange(n)/SR; return np.tanh(2*np.sin(2*np.pi*f*x))*env(n,.005,.2)*.6
# ---- music (A minor-ish afro-pop feel) ----
m = np.zeros(N)
roots=[110.0,87.31,130.81,98.0]            # Am F C G, 2 beats each... one chord per bar (4 beats = 2s)
arp=[[220,261.63,329.63,261.63],[174.61,220,261.63,220],[261.63,329.63,392,329.63],[196,246.94,293.66,246.94]]
beat=.5
def intensity(s):  # 0 sparse .. 1 full
    if s<15.5: return .35          # dialogue: light bed
    if s<25.5: return .8           # Budapest reveal
    if s<34.5: return 1.0          # montage
    return .9                      # CTA
for b in range(int(T/beat)):
    s=b*beat; I=intensity(s); bar=(b//4)%4; step=b%4
    if I>=.8 or step in(0,2): put(m,kick(),s,.9*(1 if I>.5 else .5))
    if step in(1,3) and I>.5: put(m,clap(),s,.7)
    for h in (0,.25): 
        if I>.5: put(m,hat(),s+h+.125*(h>0)*0,.5)
    put(m,bass(roots[bar]),s,.55*I+.2)
    for k in range(2):
        put(m,pluck(arp[bar][(b*2+k)%4]*(2 if I>.9 else 1)),s+k*.25,.28*I+.1)
# riser into CTA (33.5-34.5) and into reveal (14.5-15.5)
for a,bnd in((14.5,15.5),(33.5,34.5)):
    n=int((bnd-a)*SR); x=np.linspace(0,1,n); put(m,rng.standard_normal(n)*x**2*.35,a)
# ducking under voice lines (voice windows from timeline.ts)
voice=[(2.9,6.87),(7.4,11.58),(12.5,14.46),(16.1,24.98),(25.7,34.32),(34.8,38.77)]
duck=np.ones(N)
for a,b in voice:
    i,j=int((a-.1)*SR),int((b+.2)*SR); duck[i:j]=.45
duck=np.convolve(duck,np.ones(int(.12*SR))/int(.12*SR),mode="same")
m*=duck
# silence music during the record-scratch gag (11.55-12.0) then hit on beat 12.0
m[int(11.55*SR):int(12.0*SR)]*=.0
fade=np.minimum(1,(T-t)/1.5); m*=fade; m*=np.minimum(1,t/.4)
m/=np.max(np.abs(m))*1.0; m*=.8
sf.write(f"{out}/music_raw.wav", m, SR)
# ---- SFX ----
def save(name, sig): sf.write(f"{out}/{name}.wav", sig/np.max(np.abs(sig))*.9, SR)
# ring: two-tone phone ring
n=int(2.2*SR); x=np.arange(n)/SR; g=((x%1.1)<.45)*1.0
save("sfx_ring", (np.sin(2*np.pi*440*x)+np.sin(2*np.pi*480*x))*g*np.minimum(1,x*20))
# connect ding (rising two notes)
n=int(.7*SR); x=np.arange(n)/SR; d=np.zeros(n)
for k,(f,at) in enumerate(((880,0),(1318.5,.12))):
    seg=np.sin(2*np.pi*f*x)*env(n,.002,.18); d[int(at*SR):]+=seg[:n-int(at*SR)]
save("sfx_connect", d)
# whoosh
n=int(.6*SR); x=np.linspace(0,1,n); w=rng.standard_normal(n); 
from numpy.fft import rfft, irfft
sp=rfft(w); fr=np.linspace(0,1,len(sp)); sp*=np.exp(-((fr-.12)/.08)**2); w=irfft(sp,n)
save("sfx_whoosh", w*np.sin(np.pi*x)**2)
# record scratch: noise bursts + pitch-dropping saw
n=int(.55*SR); x=np.arange(n)/SR; f=900*np.exp(-x*5)+60; saw=2*((np.cumsum(f)/SR)%1)-1
nz=rng.standard_normal(n)*.5; sc=(saw*.7+nz*.5)*np.minimum(1,x*60)*np.exp(-x*3.5)*(1+.5*np.sin(2*np.pi*14*x))
save("sfx_scratch", sc)
# impact hit
n=int(1.0*SR); x=np.arange(n)/SR; f=60*np.exp(-x*3)+35; h=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*5)+rng.standard_normal(n)*np.exp(-x*30)*.4
save("sfx_impact", h)
# pop / tick
n=int(.15*SR); x=np.arange(n)/SR; save("sfx_pop", np.sin(2*np.pi*(600+1500*x*3)*x)*env(n,.001,.04))
