#!/usr/bin/env python3
"""Final audio mix. Replace the music by passing --music <file> (any ffmpeg-readable audio) [--music-start seconds].
Stages: music conditioning (headroom + loudness) -> level automation -> VO-driven ducking -> synthesized ambience beds
(placeholders, self-generated so no licence issue) + transition swells -> sum with VO -> two-pass loudnorm to -14 LUFS / -1 dBTP.
Outputs work/mix_master.wav (+ work/mix_report.json)."""
import argparse, json, os, subprocess, sys
import numpy as np
ap = argparse.ArgumentParser()
ap.add_argument('--music', default='../../audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a')
ap.add_argument('--music-start', type=float, default=0.0)
ap.add_argument('--music-lufs', type=float, default=-24.0, help='music loudness before ducking (VO sits at about -19 LUFS)')
ap.add_argument('--no-sfx', action='store_true')
a = ap.parse_args()
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); W = f'{root}/work'; SR = 48000
T = json.load(open(f'{root}/src/timeline.json')); total = T['total']; N = int(round(total*SR))
def ff(args): 
    r = subprocess.run(['ffmpeg','-y','-v','error']+args, capture_output=True); assert r.returncode == 0, r.stderr.decode()[-500:]
def rd(p, ch):
    r = subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac',str(ch),'-ar',str(SR),'-'], capture_output=True)
    x = np.frombuffer(r.stdout, np.float32).copy(); return x.reshape(-1, ch).T
def place(buf, x, t0):
    i = int(round(t0*SR)); j = min(buf.shape[-1], i + x.shape[-1]); 
    if j > i: buf[..., i:j] += x[..., :j-i]
def env_interp(pts):
    t = np.arange(N)/SR; return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
def smooth(x, n): return np.convolve(x, np.ones(n)/n, 'same')
# --- VO
vo = np.zeros((1, N), np.float32); v = rd(f'{W}/vo_master.wav', 1); place(vo, v, T['voStart'])
# --- music conditioning: start offset, -headroom, loudness match (the supplied file is already clipped at +2 dBTP: pull it down BEFORE any other processing)
ff(['-ss', str(a.music_start), '-i', a.music, '-af', f'volume=-12dB,loudnorm=I={a.music_lufs}:TP=-4:LRA=12', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', f'{W}/music_cond.wav'])
m = rd(f'{W}/music_cond.wav', 2)
if m.shape[1] < N: m = np.pad(m, ((0,0),(0, N-m.shape[1])))
m = m[:, :N].copy()
# --- level automation (dB): soft intro, full from the first build, small lift for the relaxation scenes, swell after the VO, fade to end
s = {x['id']: x for x in T['scenes']}
auto = env_interp([(0,-60),(0.01,-8),(2.5,-4),(s['2-journey']['start']-0.5,-4),(s['2-journey']['start']+1.5,0),
                   (s['4-relaxation']['start'],0),(s['4-relaxation']['start']+2.0,1.0),(s['6-invitation']['start'],1.0),
                   (T['voEnd']-3.0,0.0),(T['voEnd']+0.3,2.5),(total-3.2,1.5),(total,-40)])
# --- ducking from VO activity
vo_rms = np.sqrt(smooth(vo[0]**2, int(0.05*SR)) + 1e-12); act = (20*np.log10(vo_rms) > -48).astype(float)
act = np.maximum.reduce([np.roll(act, k) for k in range(0, int(0.12*SR), 480)])       # hold 120 ms over word gaps
duck_db = -7.0*smooth(act, int(0.30*SR))                                              # ~300 ms attack/release smoothing
g = 10**((auto + duck_db)/20)
music = m*g[None, :]
# --- ambience + swells (self-synthesised)
sfx = np.zeros((2, N), np.float32); report = {}
if not a.no_sfx:
    def noise(color, dur, filt):
        ff(['-f','lavfi','-i',f'anoisesrc=c={color}:r={SR}:d={dur}:a=0.5','-af',filt,'-ac','2','-c:a','pcm_f32le', f'{W}/_n.wav']); return rd(f'{W}/_n.wav', 2)
    def bed(x, t0, t1, db, fi=1.5, fo=1.5):
        i = int(t0*SR); j = min(N, int(t1*SR)); y = x[:, :j-i].copy()
        if y.shape[1] < j-i: y = np.pad(y, ((0,0),(0,j-i-y.shape[1])))
        e = np.ones(j-i); nfi, nfo = int(fi*SR), int(fo*SR); e[:nfi] = np.linspace(0,1,nfi); e[-nfo:] *= np.linspace(1,0,nfo)
        sfx[:, i:j] += y*e*10**(db/20)
    sc = lambda k: s[k]
    air = noise('pink', 14, 'highpass=f=120,lowpass=f=900,tremolo=f=0.3:d=0.2')
    road = noise('brown', 16, 'lowpass=f=170,volume=1.6') + noise('pink', 16, 'highpass=f=500,lowpass=f=1800,tremolo=f=0.11:d=0.5,volume=0.25')
    sea = noise('pink', 60, 'highpass=f=180,lowpass=f=2200,tremolo=f=0.13:d=0.8,tremolo=f=0.1:d=0.5')
    wind = noise('pink', 60, 'highpass=f=700,lowpass=f=3500,tremolo=f=0.1:d=0.9,volume=0.5')
    bed(air, 0, sc('1-homecoming')['end']+1.0, -29)
    bed(road, sc('2-journey')['start']-1.0, sc('2-journey')['start']+6.4, -28)
    bed(sea, sc('2-journey')['start']+5.0, sc('3-heritage')['start']+1.5, -34, 2.5, 2.0)
    bed(sea, sc('4-relaxation')['start']-0.5, total, -29, 2.0, 3.0)
    bed(wind, sc('4-relaxation')['start']-0.5, total, -36, 2.5, 3.0)
    # swells on light-leak / push transitions
    for sh in T['shots']:
        if sh['trans']['type'] in ('leak','push'):
            sw = noise('white', 1.0, 'highpass=f=600,lowpass=f=5000,afade=t=in:d=0.45,afade=t=out:st=0.5:d=0.5')
            place(sfx, sw*10**(-31/20), sh['start']-0.45)
    # soft low "resolve" hit as the end card lands
    ec = T['voEnd'] - 4.0; t = np.arange(int(2.5*SR))/SR
    hit = (np.sin(2*np.pi*55*t)*np.exp(-t*1.6)*0.5).astype(np.float32); place(sfx, np.stack([hit,hit]), ec)
    place(sfx, np.stack([hit,hit])*0.0, 0)
    report['sfx'] = 'synthesised placeholders: airport murmur bed, road rumble, sea, wind, transition swells, end-card low hit'
mix = music + sfx + np.repeat(vo, 2, axis=0)
mix = mix.astype(np.float32)
with open(f'{W}/_premix.f32', 'wb') as f: f.write(mix.T.astype('<f4').tobytes())
# two-pass loudnorm
def run_ln(extra):
    return subprocess.run(['ffmpeg','-hide_banner','-nostats','-f','f32le','-ar',str(SR),'-ac','2','-i',f'{W}/_premix.f32','-af',extra,'-f','null','-'], capture_output=True, text=True).stderr
e = run_ln('loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json'); j = json.loads(e[e.rfind('{'):e.rfind('}')+1])
ln = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89:level=false")
ff(['-f','f32le','-ar',str(SR),'-ac','2','-i',f'{W}/_premix.f32','-af',ln,'-ar',str(SR),'-c:a','pcm_s24le', f'{W}/mix_master.wav'])
report.update(premix=j, music=os.path.basename(a.music), music_start=a.music_start)
json.dump(report, open(f'{W}/mix_report.json','w'), indent=1); print(json.dumps(report, indent=1))
