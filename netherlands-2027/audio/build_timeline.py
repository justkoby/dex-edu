#!/usr/bin/env python3
"""Builds src/data/timeline.json – the single source of truth that video, captions, SFX, music and the mix all read.

Nothing here is a fixed animation timing: every scene boundary and gag cue is derived from the processed narration
(src/data/vo.json). Re-record a line -> `npm run audio` -> the whole film re-times itself.
Only the GAPS between lines (room for a reaction / gag) are creative choices – edit GAP below.
"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS = 30
vo = {c["id"][:2]: c for c in json.load(open(os.path.join(ROOT, "src", "data", "vo.json")))}

# seconds of air BEFORE each line (after the previous line ends / the scene starts)
GAP = {
    "01": 0.60,  # character pops in
    "02": 1.05,  # MONEY has landed: stunned look at it, slow turn back to camera -> "Exactly!"
    "03": 1.00,  # swats MONEY away, new scene
    "04": 1.45,  # touches the map and stretches it wide
    "05": 0.95,  # map folds away
    "06": 0.60,  # both cards settle
    "07": 1.00,  # cards drop away, he drifts into the daydream
    "08": 1.20,  # fully dressed for winter... and the cold hits
    "09": 1.10,  # shakes the winter off, snap back to the studio
    "10": 0.45,
}
TAIL = 3.4  # end-card hold after the last word
SCENE_OF = {"01": "s1", "02": "s1", "03": "s2", "04": "s2", "05": "s3", "06": "s3", "07": "s4", "08": "s4", "09": "s5", "10": "s5"}
# how long before a scene's first line the scene itself begins (the rest of the gap belongs to the previous scene)
LEAD = {"s1": 0.60, "s2": 0.45, "s3": 0.45, "s4": 0.50, "s5": 0.55}

t, clips, cues, scenes, captions = 0.0, [], {}, {}, []
for k in sorted(vo):
    c = vo[k]; t += GAP[k]; s = SCENE_OF[k]
    if s not in scenes: scenes[s] = [round(t - LEAD[s], 3), None]
    clips.append(dict(id=c["id"], file=c["file"], start=round(t, 3), dur=c["dur"]))
    cues[f"vo{k}"] = round(t, 3); cues[f"vo{k}_end"] = round(t + c["dur"], 3)
    for name, mt in c["marks"].items(): cues[name] = round(t + mt, 3)
    ph = c["phrases"]
    for i, (pt, txt) in enumerate(ph):
        if txt: captions.append(dict(t0=round(t + pt, 2), t1=round(t + (ph[i + 1][0] if i + 1 < len(ph) else c["dur"]) , 2), text=txt))
    t += c["dur"]
total = t + TAIL
order = ["s1", "s2", "s3", "s4", "s5"]
for i, s in enumerate(order): scenes[s][1] = scenes[order[i + 1]][0] if i + 1 < len(order) else round(total, 3)

# mouth / gesture envelope for the whole film @ FPS
n = int(round(total * FPS)) + 1
env = [0.0] * n
for cl in clips:
    e = vo[cl["id"][:2]]["env"]; f0 = int(round(cl["start"] * FPS))
    for i, v in enumerate(e):
        if f0 + i < n: env[f0 + i] = v

C = cues
# ---- sound effects: [time, name, gain] – all keyed to cues so they follow the voice ----
sfx = [
    [0.12, "pop_low", 0.7], [0.18, "whoosh_fast", 0.4],
    [C["abroad"] - 0.1, "whoosh_fast", 0.35], [C["abroad"] + 0.15, "pop", 0.45],
    [C["mind"] + 0.25, "blip", 0.4],
    [C["money"] - 0.36, "fall", 0.55], [C["money"] + 0.02, "slam", 1.0], [C["money"] + 0.1, "coins", 0.55], [C["money"] + 0.55, "boing", 0.3],
    [C["exactly"] - 0.5, "blip", 0.35], [C["exactly"] - 0.05, "pop", 0.45],
    [scenes["s2"][0] - 0.38, "whoosh", 0.75], [scenes["s2"][0] - 0.3, "bump", 0.5],
    [C["netherlands"] - 0.08, "pop", 0.7], [C["netherlands"] + 0.02, "boing", 0.35],
    [C["y2027"] + 0.1, "stamp", 0.85],
    [C["vo03_end"] + 0.3, "blip", 0.4], [C["vo03_end"] + 0.55, "stretch", 0.6], [C["vo03_end"] + 1.22, "snap", 0.7], [C["vo03_end"] + 1.25, "pop", 0.5], [C["vo03_end"] + 1.4, "pop", 0.4],
    [C["thenl"] + 0.15, "ding", 0.3],
    [scenes["s3"][0] - 0.3, "whoosh", 0.6],
    [C["srh"] - 0.12, "card", 0.8], [C["and_"] - 0.05, "slide", 0.65], [C["witt"] - 0.1, "card", 0.8], [C["witt"] + 0.12, "bump", 0.4],
    [C["see"], "pop", 0.35], [C["options"] + 0.02, "ding", 0.4], [C["options"] + 0.02, "pop_low", 0.5],
    [scenes["s4"][0] - 0.42, "whoosh", 0.6],
    [C["imagine"] + 0.05, "sparkle", 0.55],
    [C["europe"] + 0.25, "roll", 0.55], [C["europe"] + 0.93, "bump", 0.65],
    [C["people"] + 0.02, "pop", 0.55], [C["people"] + 0.34, "pop", 0.5],
    [C["experiencing"] - 0.05, "whoosh_long", 0.4],
    [C["experiencing"] + 0.2, "poof", 0.7], [C["experiencing"] + 0.6, "poof", 0.7], [C["experiencing"] + 1.0, "poof", 0.75],
    [C["vo07_end"] + 0.05, "wind", 0.75], [C["vo07_end"] + 0.35, "freeze", 0.5], [C["vo07_end"] + 0.5, "chatter", 0.6],
    [C["although"] + 0.9, "chatter", 0.45], [C["cold"] + 0.35, "freeze", 0.4], [C["cold"] + 0.5, "wind", 0.45], [C["vo08_end"] + 0.1, "chatter", 0.5],
    [scenes["s5"][0] - 0.35, "zip", 0.6], [scenes["s5"][0] - 0.12, "poof", 0.7], [scenes["s5"][0], "whoosh_fast", 0.6],
    [C["ifnl"] - 0.1, "card", 0.7], [C["list"] + 0.12, "tick", 0.8],
    [C["dexterity"] - 0.12, "whoosh_fast", 0.55], [C["dexterity"] + 0.08, "pop_low", 0.6], [C["help"] + 0.3, "ding", 0.3],
    [C["waiting"] - 0.05, "blip", 0.4],
    [C["chapter"] - 0.05, "riser", 0.55], [C["here"], "brand", 0.9], [C["here"] + 0.5, "pop", 0.35], [C["here"] + 0.68, "pop", 0.35], [C["here"] + 0.86, "pop", 0.35],
    [C["looksharp"] + 0.12, "tap", 0.8], [C["looksharp"] + 0.42, "tap", 0.8], [C["looksharp"] + 0.95, "tap", 0.8], [C["looksharp"] + 1.25, "tap", 0.8],
]
sfx = sorted([[round(max(0, a), 3), b, c] for a, b, c in sfx])

out = dict(fps=FPS, total=round(total, 3), frames=int(round(total * FPS)), scenes=scenes, vo=clips,
           cues={k: v for k, v in sorted(cues.items(), key=lambda kv: kv[1])}, captions=captions, sfx=sfx, env=env)
json.dump(out, open(os.path.join(ROOT, "src", "data", "timeline.json"), "w"), separators=(",", ":"))
print(f"total {total:.2f}s  ({out['frames']} frames)")
for s in order: print(f"  {s}: {scenes[s][0]:6.2f} – {scenes[s][1]:6.2f}")
print("  cues:", ", ".join(f"{k}={v}" for k, v in out["cues"].items()))
