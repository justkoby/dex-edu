#!/usr/bin/env python3
"""Dense review sheet of V2 shots: N evenly spaced frames per shot, one row per shot. usage: v2_sheet.py out.jpg N shot..."""
import sys, io, subprocess, json, os
from PIL import Image, ImageDraw
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
out, N, ids = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
H = 320; W = 180; rows = []
for sid in ids:
    p = f"{root}/public/{os.environ.get('DEX_VER','v2')}/{sid}.mp4"
    d = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
    r = subprocess.run(['ffmpeg','-v','error','-i',p,'-vf',f'fps={N/d:.4f},scale={W}:{H}','-f','image2pipe','-vcodec','png','-'],capture_output=True)
    data = r.stdout; ims = []; i = 0
    while True:
        j = data.find(b'\x89PNG', i + 1)
        chunk = data[i:j] if j > 0 else data[i:]
        if chunk: ims.append(Image.open(io.BytesIO(chunk)).convert('RGB'))
        if j < 0: break
        i = j
    rows.append((sid, ims[:N]))
sheet = Image.new('RGB', (W * N + 120, H * len(rows)), (15, 15, 15)); dr = ImageDraw.Draw(sheet)
for k, (sid, ims) in enumerate(rows):
    dr.text((4, k * H + 4), sid, fill=(255, 200, 80))
    for n, im in enumerate(ims): sheet.paste(im, (120 + n * W, k * H))
sheet.save(out, quality=78); print(sheet.size)
