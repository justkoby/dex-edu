# Production review — draft v1

## Needs your approval / answer

1. **Website.** Earlier *Educational Consult* videos use **dexterityedutravel.com**; the heritage-tour campaign switched to
   **dexterityedutour.com** ("client update, Nov 2026"). The draft shows `dexterityedutravel.com`. I could not check either site from here. Which is correct for study-abroad enquiries?
2. **Brand name vs logo.** The narration and script say "Dexterity Educational Consult", but the official `Logo.svg` wordmark reads
   **"Dexterity Education and Travel & Tour"**. The end card currently shows both (logo + the spoken name). Confirm the name to display.
3. **Phone numbers.** 024 448 9721 and 030 398 4034 come from the earlier projects (never marked as re-confirmed there). Which one is WhatsApp?
4. **Tuition figures** (SRH €9,950 / €12,500; Wittenborg €9,250 / €12,250) are exactly as given in the brief. No fee document exists in the
   assets and I could not verify them, so the cards label them **"Tuition · indicative"**. Please confirm against the universities' 2027 fee pages (non-EU rate).
5. **Length: 65 s** against the 35–45 s target. The narration alone is 52 s of speech. To get to ~45 s: tighter re-records, or drop
   the ad-libs / trim the daydream. I did not speed the voice up.
6. **Script ad-libs** in lines 5, 8 and 10 (see `AUDIO_REVIEW.md`) — keep or re-record to script?
7. **Wittenborg city.** The card and map pin say Apeldoorn (its main campus); it also teaches in Amsterdam. Confirm which to promote.
8. **Rights to the photos/logos** in `NETHERLANDS/` (university press images, SRH and Wittenborg logos): confirm Dexterity may use them in advertising.

## Limitations — read before judging the look

- **This is not true 3D.** The reference character is a single flat image sheet; there is no 3D model or rig, and I cannot
  generate 3D character animation in this environment. I rebuilt him as a **layered vector puppet** with gradients/rim-light to echo
  the 3D render. He is fully consistent and fully editable, but he reads as a polished 2D cartoon, front-facing, waist-up.
  The auto-traced `.svg` of the sheet (10k unstructured paths) was not usable for rigging.
- **To reach the reference's 3D finish** you would need one of: (a) a rigged 3D model of the character (Blender/Maya) animated to this
  timeline; or (b) an AI image-to-video tool driven by the reference sheet, shot by shot, composited over these graphics. This
  project's timeline, cues, graphics and audio would carry over to either route.
- Mouth movement is performance-style (driven by the real loudness of the voice), not phoneme-accurate lip-sync — as briefed.
- Hands are simple shapes; "pointing at the viewer" is a foreshortening cheat. No walk/legs.
- The Netherlands scenery is the supplied photo (students on a Haarlem square), blurred as a backdrop; the canal photo is only
  600×400 so it appears as a small polaroid. No true winter scenery was supplied — snow/frost are drawn.
- I reviewed frames and measurements, not full-speed playback with sound; please watch for timing feel.

## Missing assets that would improve it

- Higher-resolution / layered character art (separate head turns, hands, 3/4 views), or the 3D source if it exists.
- A wide, high-resolution Dutch street/canal scene (ideally one summer, one winter).
- A vector SRH logo (only a small AVIF with a white box was supplied).
- A licensed music track (see `AUDIO_REVIEW.md`).
- Clean re-records of lines 1 ("money"), 5 and 9.

## Self-assessment

**Character consistency — good.** One rig component draws every frame; proportions, hair, skin tone, polo and watch never
change. The winter outfit is layered on the same rig. Distance from the reference: flatter shading, simpler hands, no 3/4 angle.

**Animation quality — decent first pass.** Acting is keyed to the words: anticipation glance before the slam, flinch → knocked
sideways → stare at the word → slow deadpan turn → "Exactly!"; lean-in whisper for "what if I told you"; nod on "Yup."; holds on
pauses. Eyes lead to each graphic before it lands. Weak spots: some arm transitions swing wide (e.g. arms dropping after the
head-grab, ~9.2 s); shoulders are rigid; gestures in long lines (3, 5, 9) could use one more beat each.

**Pacing — lively but long.** Something new happens every 1–2 s and scene 1 is the strongest. Scenes 3 and 5 sit on static
layouts for 3–4 s while a long line finishes. 65 s is long for the format.

**Sound design — functional.** Every gag has a synced effect and the music breathes with the story (stop before MONEY, icy for the
cold). The synthesised music and effects are clean but plain; a real track and a few recorded foley hits would lift it most.

**Scene transitions — motivated.** Swatting MONEY off-screen → wipe; map rushes the camera → universities; cards drop away →
thought-bubble iris into the daydream; shaking off the winter clothes → studio; pulling the consultation card open → brand screen.
The colour wipes themselves are simple and could be made more distinctive.

## Creative decisions I made

- Captions are on (phrase by phrase); "MONEY" is deliberately not captioned — the graphic is the caption.
- Orange puffer + navy beanie/scarf = Dexterity brand colours (and a Dutch nod). Suitcase carries Ghana and Netherlands stickers.
- Thermometer drops to 1 °C (plausible Dutch winter) rather than an exaggerated figure.
- "My 2027 list" checklist stands in for the "consultation graphic" set-up, then flips into the consultation card.
- End card holds 3.4 s after the last word; contact block stays inside the 9:16 safe area.
