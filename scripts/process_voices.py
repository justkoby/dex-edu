"""Clean the real voice recordings (originals in BUDAPEST-VID/speech audio files/ are never touched).

Chain per clip (ffmpeg): trim to the measured speech (+natural lead-in/tail, internal pauses kept) ->
high-pass -> light FFT denoise -> subtle EQ -> gentle compression -> 2-pass linear loudness -> true-peak limiter -> micro fades.
No pitch/tempo changes. Writes public/audio/processed/<speaker>/*.wav, src/config/voiceManifest.json
and docs/AUDIO_PROCESSING.md.   Usage: python scripts/process_voices.py
"""
import json, subprocess, re, os, sys
import numpy as np, soundfile as sf

SRC = "BUDAPEST-VID/speech audio files"
OUT = "public/audio/processed"
W = "WhatsApp Audio 2026-10-26 at "
P = "WhatsApp Ptt 2026-10-26 at "

# Phrase times are RAW (seconds in the original file), measured from the energy envelope; text is
# the transcript reviewed against a small speech-to-text pass (see docs/VOICE_MAPPING.md for confidence notes).
CLIPS = [
  dict(id="s1_call", speaker="kofi", file=W+"8.08.50 PM.mp4", scene=1, conf="medium",
       phrases=[(1.25,3.30,"Chale Ama!"),(3.35,6.25,"We dey plan link up for East Legon"),(6.25,7.95,"this weekend. Where you dey?")]),
  dict(id="s2_answer", speaker="ama", file=P+"8.34.17 PM.ogg", scene=2, conf="low",
       phrases=[(0.25,1.90,"Kofi,"),(2.10,3.25,"East Legon ke?"),(3.35,5.60,"Chale, I dey Budapest"),(5.65,6.91,"oo!")]),
  dict(id="s3_reaction", speaker="kofi", file=W+"8.11.16 PM.mp4", scene=3, conf="high",
       phrases=[(1.25,3.15,"Budapest?! As in Hungary? Ei!"),(3.50,4.35,"Since when?!")]),
  dict(id="s4_schools", speaker="ama", file=P+"8.34.42 PM.ogg", scene=4, conf="medium",
       phrases=[(0.20,2.70,"There are lots of schools here like International Business"),(2.65,5.25,"School and Budapest Metropolitan University."),(5.20,6.50,"You should check them out."),(7.50,8.70,"You'll be happy you did.")],
       cut=(6.75,7.30)),  # remove 0.55 s of dead air inside the 1.0 s pause (pause kept at 0.45 s); 20 ms crossfade
  dict(id="s5a_intro", speaker="narrator", file=W+"8.10.52 PM.mp4", scene=5, conf="medium",
       phrases=[(0.85,2.20,"Thinking of studying abroad?"),(2.60,6.15,"Dexterity Educational Consult.")]),
  dict(id="s5b_help", speaker="narrator", file=W+"8.10.46 PM.mp4", scene=5, conf="medium",
       phrases=[(0.45,4.20,"They can help you explore options and guide you through the process.")]),
  dict(id="s6_cta", speaker="narrator", file=W+"8.10.37 PM.mp4", scene=6, conf="medium",
       phrases=[(0.30,2.50,"Your next chapter can start in Hungary."),(2.80,5.05,"WhatsApp Dexterity now.")]),
]
# per-speaker processing (female takes are noisier and higher-pitched)
PARAMS = {
  "kofi":     dict(hp=80,  nr=12, nf=-43, mud=-1.5, pres=2.0),
  "narrator": dict(hp=80,  nr=12, nf=-43, mud=-1.5, pres=2.0),
  "ama":      dict(hp=110, nr=16, nf=-33, mud=-2.0, pres=1.5),
}
TARGET_I, TARGET_TP = -17.0, -1.5   # dialogue pre-mix; the final stereo master is normalised to -16 LUFS / -1 dBTP
LEAD, TAIL = 0.18, 0.28

def run(cmd): return subprocess.run(cmd, capture_output=True, text=True)

def measure(path, af=""):
    chain = (af + "," if af else "") + "loudnorm=I=-16:TP=-1:LRA=11:print_format=json"
    r = run(["ffmpeg","-hide_banner","-nostats","-i",path,"-af",chain,"-f","null","-"])
    j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S).group(0))
    return dict(lufs=float(j["input_i"]), tp=float(j["input_tp"]), lra=float(j["input_lra"]), thresh=j["input_thresh"])

def floor_stats(path, t0=0.0, t1=None):
    cmd = ["ffmpeg","-v","error","-i",path,"-ss",str(t0)]+(["-to",str(t1)] if t1 else [])+["-ac","1","-ar","16000","-f","f32le","-"]
    a = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.float32); sr = 16000
    h = int(.05*sr); r = np.array([20*np.log10(np.sqrt(np.mean(a[i:i+h]**2))+1e-7) for i in range(0, len(a)-h, h)])
    return float(np.percentile(r, 10)), float(np.percentile(r, 95))

def main():
    manifest, rows = {}, []
    for c in CLIPS:
        spk = c["speaker"]; p = PARAMS[spk]
        src = os.path.join(SRC, c["file"]); os.makedirs(f"{OUT}/{spk}", exist_ok=True)
        if c.get("cut"):  # tighten one long pause (not a speed change): splice around the cut with a short crossfade
            a, b = c["cut"]; tmp = f"/tmp/_cut_{c['id']}.wav"
            r = run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",f"[0:a]atrim=0:{a},asetpts=PTS-STARTPTS[x];[0:a]atrim=start={b},asetpts=PTS-STARTPTS[y];[x][y]acrossfade=d=0.02:c1=tri:c2=tri","-ar","48000",tmp])
            if r.returncode: sys.exit(r.stderr)
            src = tmp; shift = b - a
            c = dict(c, phrases=[(x - (shift if x >= b else 0), y - (shift if y >= b else 0), t) for x, y, t in c["phrases"]])
        dst = f"{OUT}/{spk}/{c['id']}.wav"
        t0 = max(0.0, c["phrases"][0][0]-LEAD); t1 = c["phrases"][-1][1]+TAIL
        dur = t1-t0
        pre = (f"atrim=start={t0}:end={t1},asetpts=PTS-STARTPTS,highpass=f={p['hp']}:poles=2,"
               f"afftdn=nr={p['nr']}:nf={p['nf']}:tn=0,"
               f"equalizer=f=250:t=q:w=1.0:g={p['mud']},equalizer=f=3200:t=q:w=1.0:g={p['pres']},"
               f"acompressor=threshold=-20dB:ratio=1.8:attack=15:release=160:makeup=1")
        before = measure(src); mid = measure(src, pre)
        gain = TARGET_I - mid["lufs"]
        gain = min(gain, TARGET_TP - mid["tp"] + 0.0 + 6)  # never ask the limiter for >6 dB of work
        af = (pre + f",volume={gain:.2f}dB,alimiter=limit={10**(TARGET_TP/20):.4f}:attack=3:release=40:level=disabled,"
              f"afade=t=in:d=0.012,afade=t=out:st={dur-0.06:.3f}:d=0.06")
        r = run(["ffmpeg","-v","error","-y","-i",src,"-af",af,"-ar","48000","-ac","1","-c:a","pcm_s16le",dst])
        if r.returncode: sys.exit(r.stderr)
        after = measure(dst)
        nf_b, pk_b = floor_stats(src, t0, t1); nf_a, pk_a = floor_stats(dst)
        info = sf.info(dst)
        manifest[c["id"]] = dict(
            file=f"audio/processed/{spk}/{c['id']}.wav", speaker=spk, scene=c["scene"], duration=round(info.duration, 3),
            source=c["file"], confidence=c["conf"], trimStart=round(t0, 3),
            phrases=[dict(from_=round(a-t0, 3), to=round(b-t0, 3), text=t) for a, b, t in c["phrases"]])
        rows.append((c["id"], spk, c["file"], before, after, nf_b, nf_a, nf_b-before["lufs"], nf_a-after["lufs"], gain, info.duration, dur))
        print(c["id"], "before %.1f LUFS/%.1f dBTP -> after %.1f LUFS/%.1f dBTP; floor %.0f->%.0f dB" % (before["lufs"], before["tp"], after["lufs"], after["tp"], nf_b, nf_a))
    # JSON can't use 'from' conveniently in TS; keep keys start/end
    for m in manifest.values():
        m["phrases"] = [dict(start=x["from_"], end=x["to"], text=x["text"]) for x in m["phrases"]]
    json.dump(manifest, open("src/config/voiceManifest.json", "w"), indent=1)
    with open("docs/AUDIO_PROCESSING.md", "w") as f:
        f.write("# Voice processing report (generated by `scripts/process_voices.py`)\n\n")
        f.write("Chain per clip: trim to speech (+0.18 s lead / 0.28 s tail, internal pauses untouched) → high-pass (80 Hz male / 110 Hz female) → "
                "light FFT denoise (12 dB male, 16 dB female; noise floor set from measurements) → EQ (−1.5/−2 dB @250 Hz mud, +2/+1.5 dB @3.2 kHz presence) → compressor (1.8:1, −20 dB) → "
                "linear gain to −17 LUFS dialogue level → true-peak limiter (−1.5 dBTP) → 12 ms fade-in / 60 ms fade-out. "
                "No pitch, formant or tempo processing. Sources are untouched.\n\n")
        f.write("| Clip | Speaker | Source | LUFS before→after | True peak before→after (dBTP) | Noise floor before→after (dBFS, 10th pct) | Floor re. dialogue loudness (dB) | Gain applied |\n|---|---|---|---|---|---|---|---|\n")
        for (i, s, fl, b, a, nb, na, sb, sa, g, d, _) in rows:
            f.write(f"| {i} | {s} | {fl} | {b['lufs']:.1f} → {a['lufs']:.1f} | {b['tp']:.1f} → {a['tp']:.1f} | {nb:.0f} → {na:.0f} | {sb:.0f} → {sa:.0f} | {g:+.1f} dB |\n")
        f.write("\nThe final stereo mix is mastered separately (see README → *Render*) to −16 LUFS / −1 dBTP.\n")
main()
