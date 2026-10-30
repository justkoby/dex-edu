# Dexterity – December Heritage & Relaxation Tour (Remotion production)

**Status: internal creative review draft v1. Not cleared for public release** (unlicensed placeholder music, unverified stock/screen-recording footage, contact details not supplied).

Originals are never modified. Everything generated lives under `work/` (git-ignored), `public/` (git-ignored) and `out/`.

## Layout
| Path | Purpose |
|---|---|
| `tools/plan.py` | **Edit decisions**: clip registry (crop + per-clip grade) and scene/shot plan |
| `tools/build_timeline.py` | Builds `src/timeline.json` from the VO scene windows + shot plan; nudges internal cuts onto music onsets |
| `tools/make_lut.py` | Generates `luts/dexterity_warm_neutral.cube` (shared look) |
| `tools/prep_clips.py` | FFmpeg: crop → 1080×1920 → 30 fps → normalise → LUT → mood tweak → grain → `work/clips/*.mp4` |
| `audio/vo_master.py` | Voiceover restoration + join (`work/vo_master.wav`, `work/timeline_vo.json`) |
| `audio/mix.py` | Music conditioning, ducking, ambience, loudness master (`work/mix_master.wav`) |
| `src/` | Remotion project: `VideoSequence`, `LightLeaks`, `AnimatedHeading`, `EndCard`, `ReviewOverlay`, `Main` |
| `src/contact.ts` | **Editable end-card contact lines** (placeholders until supplied) |
| `tools/qa.sh` | Post-render checks (black frames, silence, loudness/true peak, format) |
| `tools/finish.sh` | Muxes the Remotion picture with the mastered AAC audio |

## Rebuild from scratch
```bash
cd campaigns/dec-heritage-tour
npm install                                  # TypeScript must stay 5.x for the Remotion bundler
mkdir -p work/vo_raw public/clips public/audio public/fonts public/brand out
# 1. decode the 7 voice notes to work/vo_raw/take1..7.wav (48 kHz mono) – see tools/decode_vo.sh
bash tools/decode_vo.sh
python3 audio/vo_master.py                   # VO master + scene timeline
python3 tools/make_lut.py
python3 tools/analyse_music.py               # music onsets for cut snapping (work/flux.npy)
python3 tools/build_timeline.py
python3 tools/prep_clips.py                  # graded 9:16 clips
python3 audio/mix.py && cp work/mix_master.wav public/audio/
export CHROME_BIN=/path/to/chrome            # any Chromium; Remotion's own download may be blocked offline
npm run render                               # picture only (writes out/draft_v1_video.mp4)
bash tools/finish.sh                         # mux AAC -> out/dexterity_dec_heritage_tour_draft_v1.mp4
bash tools/qa.sh out/dexterity_dec_heritage_tour_draft_v1.mp4
```

## Swap the music
```bash
python3 audio/mix.py --music /path/to/licensed_track.wav [--music-start 12.5] [--music-lufs -24]
cp work/mix_master.wav public/audio/ && bash tools/finish.sh
```
Only the audio is re-rendered – the video render does not need repeating (finish.sh muxes onto the existing picture).

## Turn off review flags
`reviewFlags` prop in `src/Root.tsx` (`defaultProps`) – flags the draft status and unverified footage on screen.
Fonts: Playfair Display (OFL) and Montserrat (OFL) via `@fontsource`, copied to `public/fonts`.
