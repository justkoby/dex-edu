#!/usr/bin/env python3
"""Word-level timings for subtitles from the ACTUAL narration audio.
Recogniser: NVIDIA Parakeet-TDT 0.6B v2 (sherpa-onnx int8, offline) -> token timestamps -> words. The recognised words are then
aligned (difflib) to the verified phrase wording, so subtitles always show the verified text; a script word the recogniser
spelled differently inherits the timing of its aligned counterpart (or is interpolated between neighbours).
usage: word_timings.py <parakeet_dir> <timeline.json> <out.json>"""
import sys, os, json, re, difflib, subprocess, numpy as np, sherpa_onnx
m, tlp, outp = sys.argv[1:4]; root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f'{m}/encoder.int8.onnx', decoder=f'{m}/decoder.int8.onnx', joiner=f'{m}/joiner.int8.onnx',
        tokens=f'{m}/tokens.txt', model_type='nemo_transducer', num_threads=4)
T = json.load(open(tlp)); norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
out = []
for v in T['vo']:
    x = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f"{root}/work/v2/{v['id']}_proc.wav",'-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout, np.float32)
    s = rec.create_stream(); s.accept_waveform(16000, x); rec.decode_stream(s); r = s.result
    words = []                                         # [text, start, end]; a leading space marks a new word
    for tok, ts, du in zip(r.tokens, r.timestamps, r.durations):
        if tok.startswith((' ', '\u2581')) or not words: words.append([tok.strip(' \u2581'), ts, ts + max(du, 0.08)])
        else: words[-1][0] += tok; words[-1][2] = ts + max(du, 0.08)
    words = [w for w in words if norm(w[0])]           # drop punctuation-only tokens
    dur = len(x) / 16000
    hyp = [dict(w=w[0], s=w[1], e=w[2]) for w in words]
    script = v['text'].split()
    sm = difflib.SequenceMatcher(a=[norm(w) for w in script], b=[norm(h['w']) for h in hyp], autojunk=False)
    t = [None] * len(script)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
            for k in range(i2 - i1): t[i1 + k] = (hyp[j1 + k]['s'], hyp[j1 + k]['e'])
        elif tag == 'replace':                          # n script words <-> m recognised words: spread the span
            a, b = hyp[j1]['s'], hyp[j2 - 1]['e']
            for k in range(i2 - i1): t[i1 + k] = (a + (b - a) * k / (i2 - i1), a + (b - a) * (k + 1) / (i2 - i1))
    for i in range(len(script)):                       # interpolate any leftovers
        if t[i] is None:
            p = next((t[j][1] for j in range(i - 1, -1, -1) if t[j]), 0.0); n = next((t[j][0] for j in range(i + 1, len(script)) if t[j]), dur)
            t[i] = (p, n)
    ws = [dict(w=w, start=round(v['at'] + a, 3), end=round(v['at'] + min(b, a + 1.0), 3)) for w, (a, b) in zip(script, t)]
    out.append(dict(id=v['id'], heard=r.text.strip(), words=ws))
    print(f"{v['id']:12s} heard: {r.text.strip()}")
    print('   ' + ' '.join(f"{w['w']}@{w['start']:.2f}" for w in ws))
json.dump(out, open(outp, 'w'), indent=1)
