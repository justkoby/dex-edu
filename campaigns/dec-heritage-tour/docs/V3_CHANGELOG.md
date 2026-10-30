# Heritage Tour V3: changelog (V2 → V3)

Composition `HeritageTourV3` (Remotion folder "V3"). V1 `HeritageTour` and V2 `HeritageTourV2` are untouched, and their exports are not overwritten.
Export: `out/Dexterity_HeritageTour_V3_INTERNAL-REVIEW.mp4`, 1080×1920, 30 fps, 39.0 s. It is an internal creative review; publication items are tracked in `docs/PUBLICATION_CHECKLIST.md`, not on screen.

## Kept from V2
39 s runtime, 120 BPM edit grid, the five narration phrases in corrected order (no speed change), the arrival, journey, coastal aerial, fort, guide and restaurant footage, the V1/V2 grade pipeline, the whip / zoom-through / graphic-match / light-sweep / photo-flash / brand-wipe transitions, and the original score.

## Typography: one family, designed per shot
| | V2 | V3 |
|---|---|---|
| Typefaces | Plus Jakarta + Instrument Serif italic + outline type + spaced caps | **Bricolage Grotesque only** (Google Fonts build, OFL): 800 headlines, 700 scene lines / captions, 600 supporting, 500 labels |
| Case | mostly uppercase, wide tracking | mostly sentence case, tight tracking; caps only for "THIS DECEMBER" and "UNWIND. RECONNECT." |
| Orange | whole lines | individual key words (*December*, *visit.*, *connect*, *story.*) |
| Font loading | silent fallback possible | render **fails** if any Bricolage weight is missing (`document.fonts.check`) |

## Shot-by-shot placement
| Time | V3 treatment |
|---|---|
| 0–1.5 | "THIS / DECEMBER" lands word-by-word on the measured voice onsets (0.35 s / 0.83 s) over the wheels shot, now reframed below the AI overhead signs. Lifts out on the cut. |
| 1.5–6 | **The headline becomes the terminal sign**: the inaccurate AI lettering is blurred out and "THIS DECEMBER" lights up on the facade's angle (10.4°). "More than a *visit.*" sits in open space left of her head; an orange stroke draws under "visit" on the spoken word. Traveller, face and suitcase stay clear. |
| 6–9 | Clean window shot; subtitles only. |
| 9–12 | **Location pin** drops onto the breakwater (ground ripple + tick), a connector draws out, and "Ghana's Central Coast / HERITAGE & RELAXATION" reveals through masks. No numbered chapter label. |
| 12–14.5 | **Heritage focus ring**: a drawn circle with compass ticks around the fort, with a "Rich history" leader label on the spoken words. Replaces the outline "HERITAGE". |
| 14.5–20 | "Stories that / *connect* us." in the sky right of the fort tower (directional + tracking entrances). |
| 20–23.5 | Restaurant: **no headline** (subtitles only). It appears once (V2 showed it twice). |
| 23.5–28 | "UNWIND." / "RECONNECT." cross in from opposite sides over open sky, then the beach plays clean. The beach is used once (V2 also used it as the CTA plate). |
| 28–33 | Montage with new human/cultural moments: **coconut vendor's hands** (new), a second dancer moment (new); restaurant and fort repeats removed. Words: "Celebrate. Dance. Taste. Connect. Smile. *December.*", each with its own entrance and side. |
| 33–39 | New end card: logo → "December Heritage & Relaxation Tour" → **"Your December. Your *story.*"** → "Book your heritage experience." → large orange **024 448 9721** pill ("Call or message", pulses on the spoken "message") → 030 398 4034 · dexterityedutravel.com. Plate = duotoned fort/coast aerial (not the beach again). |

## Subtitles (new)
- `src/kit/Subtitles.tsx`, toggle with `--props='{"subtitles":false}'`.
- Word timings are **measured from the narration audio**: NVIDIA Parakeet-TDT 0.6B v2 (offline, sherpa-onnx) gives token times and durations, which are aligned to the verified wording (`tools/word_timings.py` → `src/v3/words.v3.json`, 80 ms resolution).
- The active word turns orange with a small lift; caption pages are broken at the speaker's phrasing.
- Captions automatically switch to a compact, lower mode while a major headline is on screen (hook, "More than a visit", "UNWIND. RECONNECT.", end card) and are absent where nobody speaks.

## Footage
- Airport sign issue resolved without new AI material: a local blur plus the headline over the sign region. The wheels shot is reframed.
- Re-tested the fishing-beach clip with a milder grade; still muddy, so excluded again.

## Audio
- The score is regenerated to the V3 cut, with three understated new cues: pin tick, opposing swishes on UNWIND/RECONNECT, and a swish on the CTA headline.
- The whip whoosh now starts after "roots" ends.
- The music ducks −10 dB under the voice (was −8) and SFX also yield to the voice.
- Master: −14.0 LUFS integrated, true peak ≤ −1.2 dBTP.
- Intelligibility: narration re-transcribed from the final mix, mean WER 1.5 % against the isolated voice. The only miss is the recogniser's "coastline" accent error, which also occurs on the clean voice.

## Reusable components (src/kit)
`Campaign.tsx` (Line with rise/drop/fromLeft/fromRight/track entrances, `rich()` highlight markup, Underline), `Subtitles.tsx` (word-synced, editorial paging, modes), `LocationPin.tsx` (LocationPin, FocusRing), `EndCardV3.tsx`, plus the existing transitions/effects (`v2/ShotV2.tsx` now takes a media folder and optional sign masks), `brand.ts` (TYPE.display, CONTACT.primaryLabel), `fonts.ts` (strict Bricolage loading).

## QA
QA_V3
