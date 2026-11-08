# Licensed-song soundtrack pass ("Comfort", Mr Eazi ft. MOLIY)

## Local-only dependency
The MP3 is **not in the repository** and must not be committed: `*.mp3` and `local-music/` are git-ignored. Put it at
`campaigns/dec-heritage-tour/local-music/Comfort.mp3`, or point the env var at it:
```bash
export DEX_MUSIC_COMFORT=/path/to/Comfort.mp3
```

## Pipeline
```bash
# 1. analyse the song (tempo, beat grid, downbeats, bars, sections, hook candidates)
python3 tools/music_analyze.py "$DEX_MUSIC_COMFORT" work/music/comfort_analysis.json --png work/music/comfort_analysis.png
# 2. build each video's soundtrack from its excerpt config (in/out points, joins, fades, automation, ducking, master)
python3 audio/music_edit.py audio/music_edits/v3k_comfort.json
python3 audio/music_edit.py audio/music_edits/v4k_comfort.json
```
- `tools/music_analyze.py`: band-weighted onset detection, so off-beat shakers and hats don't capture the beat; dynamic-programming beat tracking; a constant-tempo grid fit; and downbeats from low-end hits plus chord changes. On our own 120 BPM score it measures 119.98 BPM, beats within ±14 ms and correct bar lines.
- `audio/music_edit.py`: one JSON per video gives that video its own excerpt of the same track.
  - In/out points are snapped to downbeats, with equal-power crossfades at joins.
  - Fade in/out and volume automation in dB keyframes.
  - Narration ducking from the restored voice phrases.
  - Optional sound-design layer.
  - Two-pass loudness master to −14 LUFS / −1.2 dBTP with a limiter, plus a report of the exact song timestamps used.

## Rights
"Comfort" is a commercially released recording. This pass produces **internal review exports only**. Before publishing an advert with it, Dexterity needs one of the following:
- A **sync licence** from the rights holders (label/publisher) for advertising use.
- For organic TikTok/Instagram posts: add the song **in-app** from the platform's music library on the posting account. Business accounts can only use the platforms' commercial libraries, and the track may not be in them.

Our own original score remains available as a cleared fallback; switching back is just a re-mux.

## Analysis of the supplied file (measured)
`Mr_Eazi_ft_MOLIY_-_Comfort_Official_Visualizer.mp3`: 146.13 s, MP3 44.1 kHz stereo, about 197 kb/s; source −8.0 LUFS with peaks at +2.2 dBFS (hot master).
- **Tempo:** 99.00 BPM, steady (beat-grid fit 10.9 ms rms). Beat 0.606 s, bar 2.424 s; first downbeat 0.96 s.
- **Structure** (energy, novelty and rough vocal transcript):

| Time | Section |
|---|---|
| 0.96–8.2 s | Intro (sparse, −11.7 dB) |
| 8.2–10.66 s | Pickup bar |
| 10.66 s | Groove entry |
| 30.05–47.0 s | Chorus 1 |
| 47.0–68.8 s | Lighter section |
| 68.8 s | One-bar breakdown |
| 68.8–85.8 s | Verse ("make we take a trip…") |
| 85.81 s | Pickup bar with the strongest low-end hit |
| 88.2–107.6 s | **Chorus 2 (peak)** |
| 105.2 s | Breakdown bar |
| 107.6 s | Groove return |
| 124.6–146 s | Outro |

- **Candidates:**
  - A: 85.81–120.3 s (pickup + chorus 2 + breakdown/return), the strongest hook.
  - B: 1.57–40.6 s (intro → groove → chorus 1), a natural build with no edits.
  - C: 68.8–107.6 s (breakdown → "take a trip" verse → chorus 2).

## Placement
| Video | Excerpt | Song → video | Key alignments |
|---|---|---|---|
| **V3C Heritage** (`HeritageTourV3C`) | B, one continuous piece, 0.35 s fade-in, 1.4 s fade-out | song 1.57 s = video 0 | Quiet intro under the opening narration · groove entry on the coast whip (9.09 s) · verse energy through heritage and Kakum · **chorus 1 on the first montage cut (28.48 s)** · CTA on a downbeat (33.33 s) |
| **V4C Group Chat** (`GroupChatV4C`) | A, one continuous piece, 12 ms fade-in (hook on frame 1), 1.1 s fade-out | song 85.81 s = video 0 | Pickup hit on frame 1 · bubbles on beats · card tap/expansion on beats · bus departs/arrives on beats · **Cape Coast reveal on a downbeat (16.97 s)** · **Kakum reveal on the song's breakdown return (21.81 s)** · montage cuts on downbeats · CTA morph on a downbeat (31.51 s) |

Both excerpts are single continuous pieces of the song, so there are no audio splices. The picture was re-cut to the song instead: the earlier edits were on a 120 BPM grid, so every cut and key event moved to the nearest song beat or downbeat (V3: at most +0.48 s; narration untouched).

## Mix
- **V3C:**
  - The narration (already restored) ducks the song by −11 dB. A **dynamic-EQ cut of −7 dB on the song's 300 Hz–4 kHz vocal band** applies under speech, so the narrator isn't masked by the singers and the groove keeps its low end.
  - The music lifts in the narration-free Kakum section (+1 dB) and the chorus montage (+2 dB).
  - Ambient and transition design sits underneath: sea, forest air, chime, whooshes and pins.
- **V4C:** music-led; UI/transition sound design on the same beat-snapped keys; −2.5 dB while the story is back in the chat so the message sounds read clearly.
- Masters: V3C −14.0 LUFS / −1.3 dBTP; V4C −14.0 LUFS / −1.2 dBTP.

## Verification
- `tools/sync_check.py` detects the cuts in the **exported** file and measures each one's offset to the nearest beat of the excerpt used.
- V3C: median 12 ms, 90% within one frame. For comparison, the same excerpt under the un-retimed V3K edit gives a median of 159 ms and 0%.
- V3C narration intelligibility, re-transcribed from the final mix: 4.7% WER vs the isolated voice (remaining differences are recogniser quirks).
