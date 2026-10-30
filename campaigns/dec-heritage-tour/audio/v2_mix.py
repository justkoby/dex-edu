#!/usr/bin/env python3
"""V2 mix: restored narration phrases + original score (music + fx stems) -> public/v2/mix_v2.wav (-14 LUFS / -1 dBTP).
Narration chain = V1 chain (HPF, light denoise, declick, EQ, de-ess, gentle compression) + per-phrase linear loudness match.
Music is ducked from the narration envelope. Replace the score with --music <file> (e.g. a licensed track).
"""
import argparse, json, os, subprocess, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from vo_master import CHAIN
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); W = f'{root}/work/v2'; SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('--music', default=f'{W}/score_music.wav'); ap.add_argument('--fx', default=f'{W}/score_fx.wav')
ap.add_argument('--music-db', type=float, default=-3.0); ap.add_argument('--duck-db', type=float, default=-8.0)
a = ap.parse_args()
T = json.load(open(f'{root}/src/v2/timeline.v2.json')); TOTAL = T['total']; N = int(TOTAL * SR)
def run(c): r = subprocess.run(c, capture_output=True, text=True); assert r.returncode == 0, r.stderr[-400:]; return r
def rd(p, ch=2):
    r = subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac',str(ch),'-ar',str(SR),'-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, ch).T.copy()
def fit(x):
    return np.pad(x, ((0, 0), (0, max(0, N - x.shape[1]))))[:, :N]
# --- narration
vo = np.zeros((1, N), np.float32); report = []
for v in T['vo']:
    raw, pre, out = f"{W}/{v['id']}_raw.wav", f"{W}/{v['id']}_pre.wav", f"{W}/{v['id']}_proc.wav"
    run(['ffmpeg','-y','-v','error','-i',raw,'-af',CHAIN,'-c:a','pcm_f32le',pre])
    r = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',pre,'-af','loudnorm=I=-19:TP=-3:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
    ln = (f"loudnorm=I=-19:TP=-3:LRA=7:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
          f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(['ffmpeg','-y','-v','error','-i',pre,'-af',ln,'-ar',str(SR),'-c:a','pcm_f32le',out])
    x = rd(out, 1); i = int(v['at'] * SR); j2 = min(N, i + x.shape[1]); vo[:, i:j2] += x[:, :j2 - i]
    report.append(dict(id=v['id'], in_lufs=float(j['input_i'])))
# --- music + fx, ducked by the narration envelope
mus = fit(rd(a.music)) * 10 ** (a.music_db / 20); fx = fit(rd(a.fx))
def smooth(x, n): return np.convolve(x, np.ones(n) / n, 'same')
rms = np.sqrt(smooth(vo[0] ** 2, int(0.04 * SR)) + 1e-12); act = (20 * np.log10(rms) > -45).astype(float)
act = np.maximum.reduce([np.roll(act, k) for k in range(0, int(0.15 * SR), 480)])
duck = 10 ** (a.duck_db * smooth(act, int(0.22 * SR)) / 20)
tail = np.ones(N); tail[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR)) ** 2            # last 0.5 s fade
mix = (mus * duck + fx * (0.6 + 0.4 * duck) + np.repeat(vo, 2, 0)) * tail
raw = f'{W}/_premix.f32'; mix.T.astype('<f4').tofile(raw)
inp = ['-f','f32le','-ar',str(SR),'-ac','2','-i',raw]
r = subprocess.run(['ffmpeg','-hide_banner','-nostats',*inp,'-af','loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.87:attack=3:release=60:level=false")
os.makedirs(f'{root}/public/v2', exist_ok=True)
run(['ffmpeg','-y','-v','error',*inp,'-af',ln,'-ar',str(SR),'-c:a','pcm_s24le',f'{root}/public/v2/mix_v2.wav'])
json.dump(dict(phrases=report, premix=j, music=os.path.basename(a.music)), open(f'{W}/mix_v2_report.json','w'), indent=1)
print(json.dumps(dict(phrases=report, premix_I=j['input_i'], premix_TP=j['input_tp'], linear_gain=j['target_offset']), indent=1))
