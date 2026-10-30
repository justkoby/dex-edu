#!/usr/bin/env python3
"""V4 master: score music + UI/transition FX (no narration) -> public/v4/mix_v4.wav at -14 LUFS / -1.2 dBTP.
--music <file> swaps the score for another (e.g. licensed) track; the FX layer stays."""
import argparse, json, os, subprocess
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); W = f'{root}/work/v4'
ap = argparse.ArgumentParser(); ap.add_argument('--music', default=f'{W}/score_music.wav'); ap.add_argument('--fx-db', type=float, default=2.0)
a = ap.parse_args()
T = json.load(open(f'{root}/src/v4/timeline.v4.json')); D = T['total']
fc = (f"[0:a]atrim=0:{D},asetpts=PTS-STARTPTS[m];[1:a]atrim=0:{D},asetpts=PTS-STARTPTS,volume={a.fx_db}dB[f];"
      f"[m][f]amix=inputs=2:normalize=0,afade=t=out:st={D - 0.45}:d=0.45[o]")
pre = f'{W}/_premix_v4.wav'
subprocess.run(['ffmpeg','-y','-v','error','-i',a.music,'-i',f'{W}/score_fx.wav','-filter_complex',fc,'-map','[o]','-ar','48000','-c:a','pcm_f32le',pre], check=True)
r = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',pre,'-af','loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.87:attack=3:release=60:level=false")
os.makedirs(f'{root}/public/v4', exist_ok=True)
subprocess.run(['ffmpeg','-y','-v','error','-i',pre,'-af',ln,'-ar','48000','-c:a','pcm_s24le',f'{root}/public/v4/mix_v4.wav'], check=True)
print('premix', j['input_i'], 'LUFS', j['input_tp'], 'dBTP')
