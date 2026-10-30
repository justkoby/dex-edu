#!/usr/bin/env python3
"""Crops, conforms (1080x1920 / 30 fps), normalises and grades every shot with FFmpeg -> work/clips/<shot>.mp4 (+ copy in public/clips).
Order per shot: crop -> Lanczos scale -> 30 fps -> RGB -> per-clip normalise (levels, gamma, sat, WB balance) -> shared LUT -> mood tweak -> fine grain.
Sources are read-only. Usage: prep_clips.py [shot_id ...]"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__)); from plan import CLIPS
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
T = json.load(open(f'{root}/src/timeline.json')); FPS = T['fps']
os.makedirs(f'{root}/work/clips', exist_ok=True); os.makedirs(f'{root}/public/clips', exist_ok=True)
def probe_dur(p):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
def chain(c, g, pre):
    f = []
    if c.get('crop'): x,y,w,h = c['crop']; f.append(f'crop={w}:{h}:{x}:{y}')
    sc = 'scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int'
    if c.get('matrix'): sc += f":in_color_matrix={c['matrix']}:in_range=tv"
    f.append(sc); f.append('setsar=1'); f.append(f'fps={FPS}')
    if pre > 0: f.append(f'tpad=start_duration={pre:.3f}:start_mode=clone')
    f.append('tpad=stop_duration=30:stop_mode=clone')
    f.append('format=gbrp')
    bp, wp = g['bp']/255, g['wp']/255
    f.append(f'colorlevels=rimin={bp:.4f}:gimin={bp:.4f}:bimin={bp:.4f}:rimax={wp:.4f}:gimax={wp:.4f}:bimax={wp:.4f}')
    f.append(f"eq=gamma={g['gamma']}:saturation={g['sat']}")
    cb = g.get('cb') or {}
    if cb: f.append('colorbalance=' + ':'.join(f'{k}={v}' for k, v in cb.items()))
    f.append(f"lut3d=file='{root}/luts/dexterity_warm_neutral.cube':interp=tetrahedral")
    if g.get('mood') == 'heritage': f.append('eq=saturation=0.96:contrast=1.04,colorbalance=bm=-0.012:rh=0.012')
    if g.get('mood') == 'coast': f.append('eq=gamma=1.04:saturation=1.03,colorbalance=rm=0.020:bm=-0.020:rh=0.010')
    f.append('noise=c0s=3:c0f=t+u:c1s=0:c2s=0')
    f.append('scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p')
    f.append('setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv')
    return ','.join(f)
def do(s):
    c = CLIPS[s['clip']]; src = os.path.abspath(os.path.join(root, c['file']))
    sd = probe_dur(src); ss = s['srcIn'] - s['head']; pre = 0.0
    if ss < 0: pre = -ss; ss = 0.0
    total = s['head'] + s['dur'] + s['tail']
    out = f"{root}/work/clips/{s['id']}.mp4"
    cmd = ['ffmpeg','-y','-v','error','-ss',f'{ss:.3f}','-i',src,'-an','-vf',chain(c, c['grade'], pre),'-t',f'{total:.3f}','-r',str(FPS),
           '-c:v','libx264','-preset','slow','-crf','13','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    status = 'OK' if r.returncode == 0 else 'FAIL ' + r.stderr[-400:]
    if r.returncode == 0: subprocess.run(['cp', out, f"{root}/public/clips/{s['id']}.mp4"])
    live = max(0, min(total, sd - ss))
    return f"{s['id']:16s} {s['clip']:10s} len {total:5.2f}s  src-live {live:5.2f}s  frozen-tail {max(0,total-live-pre):4.2f}s  {status}"
if __name__ == '__main__':
    want = set(sys.argv[1:])
    shots = [s for s in T['shots'] if not want or s['id'] in want]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(do, shots): print(line)
