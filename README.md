# DEX EDU — "Chale, I'm in Budapest!" (Concept 1, TikTok skit)

React + TypeScript + [Remotion](https://remotion.dev). Composition `Dexterity-Skit`, 1080×1920 @ 30 fps, 40.5 s.
**Version 2** — real Ghanaian voice recordings (Kofi, Ama, narrator), beat-locked edit, improved call UI. See `docs/VOICE_MAPPING.md`, `docs/AUDIO_PROCESSING.md`, `ASSET_MANIFEST.md`.
Skit with fictional characters (no on-screen disclaimer, by request).

```bash
npm install
npm run prep            # builds public/media from BUDAPEST-VID (originals untouched) + fonts/logo
npm run studio          # Remotion Studio
npm run voices          # re-process the real voice recordings (needs python3 + numpy + soundfile + ffmpeg) -> public/audio/processed + src/config/voiceManifest.json
npm run render:draft    # 720×1280  -> out/dexterity-skit-v2-preview.mp4  (renders, then masters audio to -16 LUFS / -1.5 dBTP)
npm run render:full     # 1080×1920 -> out/dexterity-skit-v2-final.mp4
scripts/qa.sh out/dexterity-skit-v2-preview.mp4 out/qa-v2   # contact sheet, black/freeze scan, loudness
npm run typecheck
```

If Remotion cannot download its browser, point it at any Chromium:
`export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell`.

## Layout
- `src/config/timeline.ts` — the whole timeline is chained off the real recordings' durations (`voiceManifest.json`), cuts snap to the music's beat grid; music/ducking curves live here too.
- `src/config/captions.ts` — subtitles from the manifest phrases (edit text in `scripts/process_voices.py` → `npm run voices`); phrase times are measured, word times inside a phrase are estimated.
- `src/config/brand.ts` — colours, contacts, safe areas.
- `src/components/` — reusable: Captions, CallCard, LowerThird, TitleBurst, EndCard, Reveal (masked transitions), Media.
- `src/scenes/` — Scene1–5; `EndCard` is Scene 6.
- `scripts/` — `prep-media.mjs`, `gen_voices.py` (Kokoro), `gen_audio_fx.py`, `qa.sh`.
- `ASSET_MANIFEST.md` — what every original file is and where it is used (and which scenes are fallbacks).
- `docs/preview-contact-sheet.jpg` — 1 frame/second review sheet of the draft.

Generated exports (`out/`) and prepped media (`public/media/`) are git-ignored.
