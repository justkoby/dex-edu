# DEX EDU — "Chale, I'm in Budapest!" (Concept 1, TikTok skit)

React + TypeScript + [Remotion](https://remotion.dev). Composition `Dexterity-Skit`, 1080×1920 @ 30 fps, 40.5 s.
Illustrative skit with fictional characters (Kofi & Ama) — not a student testimonial.

```bash
npm install
npm run prep            # builds public/media from BUDAPEST-VID (originals untouched) + fonts/logo
npm run studio          # Remotion Studio
npm run render:draft    # 720×1280  -> out/dexterity-skit-preview.mp4
npm run render:full     # 1080×1920 -> out/dexterity-skit-full.mp4
scripts/qa.sh           # contact sheet, black/freeze scan, loudness
npm run typecheck
```

If Remotion cannot download its browser, point it at any Chromium:
`export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell`.

## Layout
- `src/config/timeline.ts` — scene boundaries (on 0.5 s beats), voice start times, SFX cues. **Edit here to retime.**
- `src/config/captions.ts` — dialogue text; word timings are *estimated* from clip length (not forced-aligned).
- `src/config/brand.ts` — colours, contacts, safe areas.
- `src/components/` — reusable: Captions, CallCard, LowerThird, TitleBurst, EndCard, Reveal (masked transitions), Media.
- `src/scenes/` — Scene1–5; `EndCard` is Scene 6.
- `scripts/` — `prep-media.mjs`, `gen_voices.py` (Kokoro), `gen_audio_fx.py`, `qa.sh`.
- `ASSET_MANIFEST.md` — what every original file is and where it is used (and which scenes are fallbacks).
- `docs/preview-contact-sheet.jpg` — 1 frame/second review sheet of the draft.

Generated exports (`out/`) and prepped media (`public/media/`) are git-ignored.
