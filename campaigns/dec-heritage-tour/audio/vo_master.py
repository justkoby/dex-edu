#!/usr/bin/env python3
"""Voiceover restoration + master. Source takes are never modified (work/vo_raw are decoded copies).
Chain per take: HPF -> mild afftdn -> declick -> corrective EQ -> de-ess -> gentle compression ->
two-pass linear loudnorm (matches takes to a common level) -> joined with short faded gaps.
Output: work/vo_master.wav (48k mono) + work/timeline_vo.json (scene boundaries, seconds from VO start)."""
import subprocess, json, wave, sys, os
import numpy as np
W = os.path.join(os.path.dirname(__file__), '..', 'work')
SCENES = ['1-homecoming', '2-journey', '3-heritage', '4-relaxation', '5-memories', '6a-invitation', '6b-invitation']
GAPS = [0.50, 0.50, 0.50, 0.50, 0.50, 0.20]   # gap AFTER take i (6A->6B is a short, rhythm-preserving join)
TARGET_I = -19.0                               # per-take level before mixing (mix stage does final -14 LUFS)
CHAIN = ("highpass=f=80,afftdn=nr=6:nf=-65:tn=0,adeclick=w=40:o=75:a=2,"
         "equalizer=f=220:t=q:w=0.9:g=1.2,equalizer=f=3200:t=q:w=0.8:g=1.8,equalizer=f=7500:t=q:w=1.2:g=-1.5,"
         "deesser=i=0.3:m=0.5:f=0.5,"
         "acompressor=threshold=0.063:ratio=2.2:attack=15:release=160:makeup=2")

def run(cmd): return subprocess.run(cmd, capture_output=True, text=True)

def process(i):
    src = f'{W}/vo_raw/take{i}.wav'; pre = f'{W}/vo_raw/take{i}_pre.wav'; out = f'{W}/vo_raw/take{i}_proc.wav'
    run(['ffmpeg','-y','-v','error','-i',src,'-af',CHAIN,'-c:a','pcm_f32le',pre])
    r = run(['ffmpeg','-hide_banner','-nostats','-i',pre,'-af',f'loudnorm=I={TARGET_I}:TP=-3:LRA=7:print_format=json','-f','null','-'])
    j = json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1])
    ln = (f"loudnorm=I={TARGET_I}:TP=-3:LRA=7:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(['ffmpeg','-y','-v','error','-i',pre,'-af',ln,'-ar','48000','-c:a','pcm_f32le',out])
    return out, float(j['input_i'])

def read_f32(p):
    r = subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','1','-ar','48000','-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).copy()

if __name__ == '__main__':
    sr = 48000; parts = []; info = []
    for i in range(1, 8):
        out, li = process(i); x = read_f32(out)
        f = int(0.020*sr); x[:f] *= np.linspace(0,1,f); x[-f:] *= np.linspace(1,0,f)   # click-safe edges (takes are cut tight)
        parts.append(x); info.append({'take': i, 'scene': SCENES[i-1], 'in_lufs': li, 'dur': len(x)/sr})
    pos = 0.0; tl = []; chunks = []
    for i, x in enumerate(parts):
        tl.append({'scene': SCENES[i], 'start': round(pos,3), 'end': round(pos+len(x)/sr,3)})
        chunks.append(x); pos += len(x)/sr
        if i < len(GAPS):
            g = int(GAPS[i]*sr); chunks.append(np.zeros(g, np.float32)); pos += GAPS[i]
    y = np.concatenate(chunks)
    pk = float(np.abs(y).max())
    with wave.open(f'{W}/vo_master.wav','wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
    json.dump({'takes': info, 'timeline': tl, 'total': len(y)/sr, 'peak': pk}, open(f'{W}/timeline_vo.json','w'), indent=1)
    print(json.dumps({'timeline': tl, 'total': len(y)/sr, 'peak_lin': pk}, indent=1)); print(info)
