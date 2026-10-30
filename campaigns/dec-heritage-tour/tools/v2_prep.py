#!/usr/bin/env python3
"""V2 clip prep: speed-ramp (piecewise trim+setpts+concat) then the shared V1 grade chain (crop, conform, normalise, LUT, grain).
Speed-ups drop frames (no synthesis); the only slow segment (end-card plate) uses frame blending, never motion-compensated morphing.
Output: public/<ver>/<shot>.mp4. Usage: [DEX_VER=v3] v2_prep.py [shot ...]"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
from plan import CLIPS
from prep_clips import chain           # identical grade pipeline to V1
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VER = os.environ.get('DEX_VER', 'v2')
T = json.load(open(f'{root}/src/{VER}/timeline.{VER}.json')); os.makedirs(f'{root}/public/{VER}', exist_ok=True)
def do(s):
    c = dict(CLIPS[s['clip']])
    if s.get('crop'): c['crop'] = tuple(s['crop'])                     # per-shot reframe (V3)
    if s['clip'] in T.get('grade_override', {}): c['grade'] = T['grade_override'][s['clip']]
    src = os.path.abspath(os.path.join(root, c['file']))
    parts, labels, t = [], [], s['src']
    for k, (d, sp) in enumerate(s['ramp']):
        parts.append(f"[0:v]trim=start={t:.4f}:end={t+d:.4f},setpts=(PTS-STARTPTS)/{sp}[s{k}]"); labels.append(f'[s{k}]'); t += d
    slow = any(sp < 1 for _, sp in s['ramp'])
    pre = f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0" + (",minterpolate=fps=30:mi_mode=blend" if slow else "")
    fc = ';'.join(parts) + f';{pre},{chain(c, c["grade"], 0)}[out]'
    out = f"{root}/public/{VER}/{s['id']}.mp4"
    cmd = ['ffmpeg','-y','-v','error','-i',src,'-filter_complex',fc,'-map','[out]','-t',f"{s['out_dur']:.3f}",'-r','30','-an',
           '-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return f"{s['id']:11s} {'OK' if r.returncode == 0 else 'FAIL ' + r.stderr[-300:]}"
if __name__ == '__main__':
    want = set(sys.argv[1:]); shots = [s for s in T['shots'] if not want or s['id'] in want]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(do, shots): print(line)
