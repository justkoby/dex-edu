# Draft v1 report – December Heritage & Relaxation Tour
**Internal creative review draft – NOT cleared for public release.** 1080×1920, 30 fps, H.264 High + AAC-LC 320k, 85.07 s.

## 1. What was actually done / checked
| Item | Status |
|---|---|
| Narration order | Your mapping used: takes 1–7 = scenes 1, 2, 3, 4, 5, 6A, 6B |
| VO restoration | **Done** (FFmpeg): 80 Hz HPF, mild afftdn (nr 6), adeclick, EQ (+1.2 dB @220 Hz, +1.8 dB @3.2 kHz, −1.5 dB @7.5 kHz), de-esser (i 0.3), 2.2:1 compression, per-take two-pass linear loudness match. Takes landed at −18.7…−19.0 LUFS (were −20.7…−23.3). |
| VO joins | 0.5 s gaps between scenes; **0.20 s** between 6A and 6B with 20 ms edge fades; 6A/6B levels within 0.3 LU on integrated loudness. Take 2 ends abruptly at about −22 dB (recording stopped mid-sound) – only a 20 ms fade was applied. |
| VO listening check | **Not possible here.** Everything above is measured, not heard. Please listen for clicks, sibilance and the 6A→6B join. |
| Music | Existing track: pulled down 12 dB, loudness-normalised to −24 LUFS, ducked ~7 dB under VO, level-automated (soft intro, lift at journey and relaxation, swell after the last line, fade-out). Source is already clipped (+2.07 dBTP) – that distortion is baked in. **Unlicensed placeholder.** Swap with `audio/mix.py --music <file>`. |
| Ambience/SFX | **Synthesised placeholders** (airport murmur, road rumble, sea, wind, transition swells, low end-card hit); self-generated, no licence issue, but not real recordings. |
| Final loudness | Measured on the muxed MP4: **−14.0 LUFS integrated, LRA 3.6 LU, true peak −1.1 dBTP** (target −14 / −1). |
| Video checks | blackdetect: 0 black frames. Last 0.5 s is an intentional fade to silence. Format verified by ffprobe. |
| Colour | Per-clip normalise (levels / gamma / saturation / white-balance offsets) → shared warm-neutral 3D LUT (`luts/dexterity_warm_neutral.cube`, soft toe/shoulder, vibrance-limited saturation, blues eased) → heritage/coast mood tweak → fine grain. Verified by contact sheets and per-clip luma/chroma statistics (all graded clips: Yhigh 198–227, Ylow 20–79). **No waveform/vectorscope was reviewed**; the skin-hue check was a crude mask (it also catches beige clothing and wood), indicative only. |
| Frame review | Contact sheets of every graded shot and 22 frames of the final were looked at. **Full-speed playback was not watched**, so motion artefacts in the AI clips (SUV driver, fortress extras) are not cleared. |

## 2. Footage used / excluded
**Used (AI, Dexterity-provided):** suitcase night arrival; terminal low-angle; SUV window (0–6.2 s); fortress guide (generic, not named); beach restaurant (0–5.9 s and 5.5–7.9 s).
**Used – UNVERIFIED source/licence (flagged on screen in amber):** aerial castle ×2 (`Recording …003533`, `…003419`, cropped to remove UI, ~1.7× enlargement; location unconfirmed); palms/umbrella (`…003912`, ~1.5×, ends in a held frame under the end card); stock dancers `6193112`, `6193113`, `6174521` (identifiable people, no release; 6174521 is dark 720p).
**Excluded after test crops/grades:** `…003245` ocean/boats (≈2× upscale looked painted); `…003821` drummers (crushed faces, stylised colour); `…004023` tuk-tuk (blown sky, bar line at edges); `9694500` fishing beach (hazy, muddy after crop); `18102810` coconut seller (head cropped at 9:16 and a phone number is legible on the sign); `12716487` interchange (flat grey); `…003655` street (blown sky). Budapest assets untouched and unused.
**Not available:** golden-hour beach walk with friends – closing sequence uses restaurant / dancing / aerial / beach instead, as agreed.

## 3. Editorial structure (global time)
1 Coming Home 0–12.5 s · 2 The Journey 12.5–24.4 · 3 Heritage 24.4–34.8 · 4 Coast 34.8–45.0 · 5 Memories 45.0–57.1 · 6 Invitation 57.1–85.1 (end card from 76.5 s).
Transitions: hard cuts inside scenes; dissolves; warm light-leak dissolves at chapter changes; one push with parallax (journey → aerial). Slow push-in/pull-out on every shot. Internal cuts were nudged to detected music onsets (±0.28 s) – approximate, not a beat-matched edit. Selective speed ramps were **not** used (24 p sources, no safe interpolation); no true match cuts were engineered – the terminal/suitcase pairing is a continuity dissolve.
Typography (Playfair Display italic + Montserrat; brand orange): COMING HOME / A JOURNEY BACK TO YOUR ROOTS / DISCOVER YOUR HERITAGE / UNWIND BY THE COAST / MAKE MEMORIES THAT LAST / JOIN US THIS DECEMBER / YOUR HERITAGE. YOUR EXPERIENCE. No narration captions were invented.

## 4. Unresolved / needs your decision
1. **Contact details** – end card shows dashed "TO BE CONFIRMED" placeholders (phone/WhatsApp, email, website/social); edit `src/contact.ts`.
2. **Music licence** – replace the placeholder; the build structure allows a drop-in swap and re-master without re-rendering the picture.
3. **Footage licences/sources** – all stock and screen-recorded clips; releases for identifiable people; confirm aerial castle location before naming it. Clean originals of the aerial and beach clips would remove the soft 1.5–1.7× upscaling.
4. **Narration script** – wording not verified (no working speech recogniser here); timings between scenes are provisional. Titles are thematic, not synchronised to specific spoken words.
5. **Known visual issues:** orange second line of "JOIN US THIS DECEMBER" has weak contrast on the bright sand; heritage aerials are noticeably softer than the AI clips; the AI SUV/guide shots need a full-speed artefact check; dancer clips remain stylistically different (stock, dark) from the AI core.
6. Review overlays (draft banner, amber unverified-footage tags) are burned in; set `reviewFlags: false` for a clean cut once cleared.

## 5. Files
`out/dexterity_dec_heritage_tour_draft_v1.mp4` (master-quality, ~217 MB) · `out/dexterity_dec_heritage_tour_PREVIEW_v1.mp4` (review encode) – both git-ignored; regenerate with the README commands.
