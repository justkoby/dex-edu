# ASSET MANIFEST — Concept 1 "Chale, I'm in Budapest!"

All originals live in `BUDAPEST-VID/` and `Logo.svg` and are **never modified**. `npm run prep`
(`scripts/prep-media.mjs`) writes muted, 30 fps web-ready copies to `public/media/` (git-ignored).
Content below was identified from FFprobe + visual contact sheets, not filenames.

## Videos (FFprobe)

| Original file | Spec | Actually shows | Source audio | Used as |
|---|---|---|---|---|
| `Man_making_video_call_20261026154547.mp4` | 1280×720, 24 fps, 10 s | Kofi (young man, black tee, bed) looking at / holding phone | AAC (muted in edit) | **Scene 1** Kofi calling; **Scene 3** reaction (later segment, punch-in); Kofi PiP in Scene 2; Kofi call avatar |
| `14685997_1080_1920_30fps.mp4` | 1080×1920, 29.97 fps, 15.3 s | Equestrian statue before Hungarian Parliament | none | Scene 5 montage (Budapest city) |
| `16296368_1440_2562_30fps.mp4` | 1440×2562, 30 fps, 6.7 s | Parliament dome + spires, blue sky | none | Scene 5 montage (opening shot) |
| `Drone_shot_of_university_campus_20261026152253.mp4` | 1280×720, 24 fps, 10 s | Round white campus building, courtyard (matches the BMU stills) | AAC (muted) | Scene 4 BMU cutaway; Scene 5 BMU shot |
| `Generated Video October 26, 2026 - 2_49PM.mp4` | 1280×720, 24 fps, 8 s | IBS building with students seated outside | AAC (muted) | Scene 4 IBS cutaway; Scene 5 IBS shot |
| `Generated Video October 26, 2026 - 3_04PM.mp4` | 1280×720, 24 fps, 10 s | IBS building dissolving into a large international student group photo | AAC (muted) | Scene 5 (group shot) |

## Stills

| Original file | Size | Shows | Used |
|---|---|---|---|
| `Sunny Campus Video Call Wave.png` | 941×1672 | **Ama**, waving, phone in hand, campus behind | **Scenes 2 & 4 (fallback, Ken Burns)** + call avatar |
| `Ghanaian Student Video Storyboard Guide.png` | 1536×1024 | Character reference sheet (Kofi/Ama + prompts) | Reference only (composite, too low-res to crop) |
| `Budapest_Metropolitan_University.png` | 3543×3543 | BMU logo | Not used (third-party mark; name set as text) |
| `brive-ibs-…-budapest-6.jpg`, `20140919_…jpg` | 689×460 / 1200×628 | IBS building | Prepped, available; not in the final cut |
| `images.jpg`, `images (1).jpg`, `Garden_party-020…webp`, `164735_LandinPage3….avif` (+ duplicate `(1)`, byte-identical) | various | BMU facade / campus / student crowd | Prepped; not in the final cut |
| `east-legon.jpg`, `east-legon-2.jpg`, `images (2).jpg` | ≈400–515 px | Accra aerial / night city (labelled East Legon by filename — **not verified**) | Not used |
| `Logo.svg` | vector | Dexterity logo (#283C8D / #F37A20) | End card (placed on a white card for contrast) |

## Scene → asset map

| # | Scene | Visual | Status |
|---|---|---|---|
| 1 | Kofi calls Ama | Real Kofi clip + animated call UI | **Real footage** |
| 2 | Ama answers from Budapest | `Sunny Campus Video Call Wave.png`, Ken Burns, call UI, Kofi PiP | **TEMPORARY FALLBACK** – no Ama video exists |
| 3 | Kofi reacts | Kofi call clip (segment 6.5 s+), punch-in, shake, flash | **TEMPORARY FALLBACK** – no "surprised" clip exists; face is smiling, reaction is carried by motion + voice |
| 4 | Ama reveals | Ama still (fallback) + real IBS / BMU clips on the spoken names | Ama = fallback; cutaways real |
| 5 | Montage | Parliament dome, IBS, BMU, group, statue (all real) | **Real footage** |
| 6 | CTA | `Logo.svg`, brand end card | Motion graphics |

No footage was fabricated. Upscaling note: 720p clips are scaled ~2.7× to fill 1080×1920 (soft at full export).

## Audio (V2)

### Dialogue — real recordings (see `docs/VOICE_MAPPING.md` for the full table and confidence notes)

| Scene | Speaker | Original | Processed copy |
|---|---|---|---|
| 1 | Kofi | `BUDAPEST-VID/speech audio files/WhatsApp Audio … 8.08.50 PM.mp4` | `public/audio/processed/kofi/s1_call.wav` |
| 2 | Ama | `… WhatsApp Ptt … 8.34.17 PM.ogg` | `public/audio/processed/ama/s2_answer.wav` |
| 3 | Kofi | `… 8.11.16 PM.mp4` (byte-different but sample-identical duplicate: `8.09.04 PM.mp4`) | `public/audio/processed/kofi/s3_reaction.wav` |
| 4 | Ama | `… WhatsApp Ptt … 8.34.42 PM.ogg` | `public/audio/processed/ama/s4_schools.wav` |
| 5 | Narrator (male) | `… 8.10.52 PM.mp4`, `… 8.10.46 PM.mp4` | `public/audio/processed/narrator/s5a_intro.wav`, `s5b_help.wav` |
| 6 | Narrator (male) | `… 8.10.37 PM.mp4` | `public/audio/processed/narrator/s6_cta.wav` |

Processing details and measurements: `docs/AUDIO_PROCESSING.md`. Originals are untouched.
The Kokoro TTS files from V1 (`public/audio/s1_kofi.mp3` … `s6_narr.mp3`) remain in the repo for reference but are **not used** any more.

### Music — `audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a`
AAC 44.1 kHz stereo, 97 s, ≈100 BPM, −13.2 LUFS, no embedded metadata (no title, artist, licence or source URL).
**Licence NOT verified.** "No Copyright" in a filename is not a licence, and nothing in the file or repo says who made it or on what terms it may be used.
→ It is used **only as a temporary review track**. Before publishing: identify the original source and licence (or replace it with a licensed
track / the original synthesised bed from `scripts/gen_audio_fx.py`). The edit is built around its tempo (reveal = the track's groove drop at 12.19 s;
cuts snap to its 0.6 s beat grid), so a replacement at a different tempo needs `BEAT` / `MUSIC_DROP` in `src/config/timeline.ts` updated.

### SFX (all original, synthesised with numpy — `scripts/gen_audio_fx.py`, `scripts/gen_sfx_v2.py`)
ring (double-burst), call connect, UI tick, call disconnect, whooshes, record scratch, impact, title swish, soft end-card chime.

## Visual verification notes
- **IBS clip** (`Generated Video … 2_49PM.mp4`): the building signage reads "IBS – International Business School" → labelled IBS.
- **Round white building** (`Drone_shot…mp4`): same building as `images.jpg`, whose facade sign reads "Budapest Metropolitan Egyetem" → labelled Budapest Metropolitan University.
- **Statue / Parliament dome clips**: generic Budapest — labelled "Budapest, Hungary" only.
- **Group/crowd clip** (`… 3_04PM.mp4`, 2nd half) and the `Garden_party` / `164735_LandinPage3` crowd photos: no signage, **not** labelled with a university.
- East Legon images: still unverified, unused.
