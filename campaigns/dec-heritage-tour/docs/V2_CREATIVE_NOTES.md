# Heritage Tour V2: creative overhaul notes

**Status: internal review draft. Not for publication** until the footage licences are cleared and the score has been approved by ear.
Composition `HeritageTourV2` (folder "V2" in Remotion Studio). V1 `HeritageTour` is preserved and unchanged.
Output: 1080×1920, 30 fps, **39.0 s**, H.264 + AAC.

## 1. The biggest finding: V1's narration ran backwards
Transcribing all seven takes offline (`docs/narration_transcript.md`) showed that the filename order is the **reverse** of the script:
`12.46.06` is the opening ("This December, make your return to Ghana…") and `12.44.12` is the closing CTA ("Send Dexterity… a message today").
V1 followed the mapping supplied at the time, so its voice-over plays CTA first and homecoming last. V2 uses content order. V1 is kept as-is for reference; it needs re-cutting only if it is still wanted.

## 2. Shortened narration (23.7 s of voice in 39 s)
Whole phrases only. Cuts sit at measured breath points, and every extracted phrase was re-transcribed to prove no word is clipped. There is no speed change.

| Time | Take (file) | Phrase (as spoken) | Role |
|---|---|---|---|
| 0.35–5.1 | 12.46.06 | "This December, make your return to Ghana more than just a visit." | Hook |
| 6.3–8.7 | 12.46.06 | "Make it a journey back to your roots." | Journey |
| 12.4–18.6 | 12.45.52 | "Reconnect with our rich history, discover the stories that shaped our heritage" | Heritage |
| 20.45–25.1 | 12.45.45 | "Soak in the beauty of our coastline, unwind by the ocean" | Relaxation |
| 28–33 | — | *(music only: montage)* | Energy peak |
| 32.7–38.5 | 12.44.12 | "Send Dexterity Education and Travel and Tour a message today" | CTA |

Dropped: "…and experience the culture that connects us", "…create unforgettable memories along the way", take 12.44.30 (memories), take 12.44.22 ("Don't just visit the motherland…", which overlaps the hook's "more than just a visit"), take 12.45.59 (including the "Central Region coast" location claim, which the footage can't support), and "…to find out more and secure your place" (a booking-style claim).
**Alternative if you want a stronger booking line:** swap the CTA for the full 12.44.12 take (+4.4 s, "…to find out more and secure your place") and shorten the montage to 3 s.

## 3. Edit (120 BPM grid, 1 beat = 15 frames)
| Time | Shot | Transition in | Purpose |
|---|---|---|---|
| 0–1.5 | Terminal wheels, **speed ramp 2.5×→1×** | impact | Hook: motion + sound + type in the first second |
| 1.5–6 | Accra arrival hero (slow dolly-in) | cut + PA chime | Place and character |
| 6–9 | Window gaze (ramps up to 3× into the whip) | photo flash | Anticipation |
| 9–12 | Coastal aerial | **whip-pan in her gaze direction** (eyeline/POV match, motion-blurred) | Discovery |
| 12–14.5 | Fort aerial | **zoom-through** on a sub-drop impact | Heritage reveal |
| 14.5–20 | Guided tour at fort | **graphic match** (white fort walls) | Meaning |
| 20–24.5 | Beachfront meal | **warm light sweep** (the only one) | Shift to relaxation |
| 24.5–28 | Beach (no text, sea ambience) | eyeline cut | Let it breathe |
| 28–33 | 6-shot montage, one cut per beat, beat "punch" in, photo flashes | flash cuts | Excitement / memories |
| 33–39 | Brand plate (slow, duotoned beach) | **diagonal orange brand wipe** | CTA |

Removed versus V1: long repeats (V1 showed the restaurant, palms, aerial_a and both dance clips twice each at 2.4–5.9 s per shot), the ~8 s frozen frame under the end card, the stacked dissolves and every repeated fade. V2 revisits a source only for a different moment: restaurant and fort aerial for one 1 s montage beat each, and the beach clip's second half as the duotoned end-card plate.
Footage check for V2: the SUV interior moment at 4.6–5.8 s (head turn toward the driver, shifting interior) was removed after a 9-frame inspection. All screen-recording crops were re-checked for player UI (none visible).

## 4. Typography system (src/kit)
- **Headline:** Plus Jakarta Sans ExtraBold, uppercase, tight tracking (−0.035 to −0.045 em).
- **Accent:** Instrument Serif Italic, used for the emotional half of each phrase.
- **Labels:** spaced caps (0.3–0.5 em) with a drawn orange rule.

Both families are OFL-1.1 (licences in `public/fonts/`). Satoshi was not used: no verifiable licence or package source was available offline. Plus Jakarta Sans is one of the alternatives the brief names.
Each chapter uses a different composition:

1. Hook: a huge stack that **morphs** into a right-aligned kicker across the cut.
2. Arrival: a bottom-right serif block.
3. Journey: a bottom-left serif-and-bold split that leaves *with* the whip.
4. Coast: a top-left destination label.
5. Fort: a centred **outline** word whose solid fill wipes off on the impact.
6. Guide: a top-left chapter label.
7. Beach: a top-centred serif display that bridges the cut.
8. Montage: beat words alternating side and colour.
9. End card.

All text phrases are taken from the spoken narration. Nothing covers a face; the safe area is 240–1490 px vertically.

## 5. Motion language
Masked reveals (no fades for type), expo/quint easing, velocity-based directional motion blur only while something moves (SVG filter), slow constant-speed camera dollies on emotional shots, beat "punches" only in the montage, speed ramps built in FFmpeg (frame dropping only, no AI interpolation), and one light sweep in the whole film.

## 6. Audio
- **Narration:** the same restoration chain as V1 (HPF 80 Hz, light denoise, declick, corrective EQ, de-ess, 2.2:1 compression) and per-phrase linear loudness match (input −18.6 to −19.9 LUFS → −19).
- **Score: original, generated in code** (`audio/v2_score.py`). A minor, 120 BPM: kick, amapiano-style log drum, swung shaker, a Ghanaian-style 7-stroke bell timeline, congas, claps, kalimba hook and pads with brightness automation per chapter. It is half-time and darker in the heritage section, at full energy in the montage, and resolves to A minor under the logo with a kalimba "button". No samples or third-party material are used, so it is owned by the project. Stems are in `work/v2/stems/` for rebalancing or replacement.
- **Sound design (synthesised):** opening impact, arrival PA chime on the Accra cut, whip whoosh, riser and sub-drop into heritage, a soft air cue on the graphic match, a shimmer into the light sweep, sea wash, shutter clicks on photo flashes, and a brand-wipe whoosh with a low hit.
- **Mix:** music ducked 8 dB under the voice. The master measures −14.0 LUFS integrated with a true peak of −1.2 dBTP.
- **Intelligibility test:** each narration window was re-transcribed from the final mix. It matches the isolated voice at 1.5 % mean word error; the only difference is the recogniser's own "coastline" accent error.
- **Not done:** listening. Nothing here was auditioned by ear; the score in particular must be approved by a person. To use a licensed track instead, run `python3 audio/v2_mix.py --music <file>` and `tools/finish_v2.sh`. The picture does not need re-rendering.

## 7. Contact details (end card)
`024 448 9721 · 030 398 4034 · dexterityedutravel.com`. These come from the earlier Dexterity promotional video in this repository (`feature/dexterity-skit*` → `src/config/brand.ts`, first added in commit `d2ad658`; reused in the `dexterity-motion-budapest` compositions). The repository doesn't say which number is on WhatsApp, so the CTA says "Message us today" (the narration's own words) rather than "WhatsApp". Please confirm both numbers before publishing.

## 8. Creative-director check (honest answers)
QA_PLACEHOLDER

## 9. Reuse for the November series
`src/kit/` is campaign-agnostic: `brand.ts` (colours, type, safe area, verified contacts), `Reveal`/`WordReveal`, `Headline`/`Accent`/`Label`/`Rule`, `DestinationLabel`, `BeatWord`, `Flash`/`LightSweep`/`Vignette`/`Scrim`, `EndCard` (props for kicker/title/CTA/timing), `ReviewFlags`, `Blur` and the `motion` easing set. The V2 transition engine (`src/v2/ShotV2.tsx`: whip, zoom-through, match, sweep, flash and brand wipe with per-shot camera moves) is driven entirely by a JSON timeline (`tools/v2_plan.py`). This supports:

1. The 35–40 s cinematic ad (this one).
2. A 15–20 s typography-led ad: `Reveal`, `BeatWord` and `EndCard` over brand plates, with no shot plan needed.
3. A 25–30 s footage-led ad: a new `SHOTS` list in `v2_plan.py` with the same prep, grade and transition engine.
