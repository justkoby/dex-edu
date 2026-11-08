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
