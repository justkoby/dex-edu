#!/usr/bin/env python3
"""Contact sheet of graded shots: 3 frames each. usage: sheet.py out.jpg [shot_id ...]"""
import json, os, subprocess, sys
from PIL import Image
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
T = json.load(open(f'{root}/src/timeline.json'))
out = sys.argv[1]; want = sys.argv[2:]
shots = [s for s in T['shots'] if not want or s['id'] in want]
H = 480; rows = []
for s in shots:
    tot = s['head'] + s['dur'] + s['tail']; ims = []
    for k, f in enumerate((0.12, 0.5, 0.88)):
        p = f'/tmp/_sh_{s["id"]}_{k}.png'
        subprocess.run(['ffmpeg','-y','-v','error','-ss',f'{tot*f:.2f}','-i',f'{root}/work/clips/{s["id"]}.mp4','-frames:v','1','-vf',f'scale=-2:{H}',p])
        ims.append(Image.open(p))
    rows.append(ims)
per = 3; cols = []
W = sum(i.width for i in rows[0])
cell_w = max(sum(i.width for i in r) for r in rows) + 8
ncols = 3; nrows = (len(rows) + ncols - 1)//ncols
sheet = Image.new('RGB', (cell_w*ncols, H*nrows), (20,20,20))
for n, r in enumerate(rows):
    x = (n % ncols)*cell_w; y = (n//ncols)*H
    for i in r: sheet.paste(i, (x, y)); x += i.width
sheet.save(out, quality=82); print(sheet.size)
