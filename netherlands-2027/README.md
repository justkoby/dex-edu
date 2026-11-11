# Netherlands 2027 — "Chale, Have You Heard About This?"

Single-character cartoon promo for **Dexterity Educational Consult** (Netherlands 2027 intake).
React + TypeScript + [Remotion](https://remotion.dev) · 1080×1920 · 30 fps · **65.0 s** (first draft, v1).

> **Resuming this project? Read [`NEXT_STEPS.md`](NEXT_STEPS.md) first** — status, approved direction, and what to do next.

**Preview:** `preview/netherlands-2027-draft-v1.mp4` · contact sheet: `docs/contact-sheet-draft-v1.jpg` · character model sheet: `docs/rig-model-sheet.png`
**Reviews:** [`docs/AUDIO_REVIEW.md`](docs/AUDIO_REVIEW.md) · [`docs/PRODUCTION_REVIEW.md`](docs/PRODUCTION_REVIEW.md) (open questions, missing assets, limitations)

Nothing in the earlier video projects (other branches) or in the original asset folders is modified; this folder is self-contained.

## Run it

```bash
npm install
npm run prep          # copies/converts originals from ../NETHERLANDS + ../Logo.svg into public/ ; builds the NL map
npm run audio         # voice clean-up -> timeline -> SFX -> music -> stems + ducking   (python3: numpy scipy soundfile pyloudnorm, ffmpeg)
npm run studio        # Remotion Studio: scrub, edit, three separate audio tracks
scripts/render.sh draft   # 540×960 quick look  -> out/
scripts/render.sh full    # 1080×1920           -> out/netherlands-2027-draft-v1.mp4 (mastered to -14 LUFS)
scripts/stills.sh out/sheet.jpg 7.8 7.9 8.1   # review stills at given seconds
```

If Remotion cannot download its browser: `export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell` (the scripts auto-detect a Playwright install).

## How the timing works (voice drives everything)

```
NETHERLANDS/NARRATION AUDIO FILES/*.mp4      originals, never touched
        │  audio/process_vo.py     clean-up + trims + caption phrases + named "marks" per line (e.g. money, netherlands, witt)
        ▼
src/data/vo.json  ──► audio/build_timeline.py ──► src/data/timeline.json   scenes · cues · captions · SFX list · mouth envelope · music ducking
                                                        │
                    ┌───────────────────────────────────┼─────────────────────────────┐
              src/scenes/*.tsx                    audio/make_music.py            audio/mix.py
      (every pose/gag is keyed to a cue)      (arrangement follows the cues)   (3 stems + duck curve)
```

Re-record a line → drop the file in, adjust its `trim` / `marks` in `audio/process_vo.py` → `npm run audio` → the animation, captions, SFX and music re-time themselves. The only hand-set timings are the pauses between lines (`GAP` in `audio/build_timeline.py`).

## Layout

| Path | What |
|---|---|
| `src/rig/Character.tsx` | The character: a vector puppet built to match the reference sheet (hair, brows, eyes, polo, watch) + winter outfit. One component = identical design in every scene. |
| `src/rig/poses.ts` | Expression + arm-pose libraries named after the reference sheet (happy, skeptical, worried… / talk, explain, pointUp, headGrab…). |
| `src/rig/perform.ts` | Performance engine: keyframed acting + voice-driven mouth, head/brow accents, hand beats, blinks, breathing. |
| `src/scenes/Scene1…5` | One file per scene: the acting (`perfN`) and the interactive graphics, all keyed to narration cues. |
| `src/components/` | Reusable: `MoneyWord`, `NLMap`, `UniCard`, `Winter` (snow, frost, thermometer, suitcase, polaroids), `Cta` (checklist, consult card, end card), `Stage` (camera, backdrop, wipes, poofs), `Captions`. |
| `src/config/brand.ts` | Colours, contacts, tuition figures — the single place to edit them. |
| `audio/` | Voice processing, timeline builder, SFX + music synthesis, mixer. |
| `public/audio/stems/` | `narration.wav`, `music.wav` (un-ducked), `sfx.wav` — the three separate tracks. |

Captions can be switched off with the `captions` prop of the `Netherlands2027` composition.
