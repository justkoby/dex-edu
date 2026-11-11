# Audio review — narration, music, sound design (draft v1)

**How this review was made:** by measurement (loudness, noise floor, spectrum, speech/pause detection) and by speech-to-text
on each clip — not by ear. Please treat delivery/"feel" notes as prompts to check on a listen.

## 1. Narration: what was recorded

All 10 clips are WhatsApp voice notes (AAC, 64 kbps, mono, 48 kHz). They map 1-to-1 onto the script lines. Nothing was re-voiced,
cloned or pitch/time-altered; the accent and delivery are untouched.

| # | Source file (`WhatsApp Audio 2026-11-11 at …`) | Heard | Loudness | Used |
|---|---|---|---|---|
| 01 | 1.57.43 AM | "(Hmm) Chale, why is it that anytime somebody mentions studying abroad, the first thing that comes to mind is money?" | −16.3 LUFS | 1.22–9.16 s |
| 02 | 1.57.48 AM | "Exactly!" | −19.3 | 0.70–1.64 |
| 03 | 1.57.55 AM | "But what if I told you, you could start planning to study in the Netherlands in 2027?" | −16.5 | 0.78–7.12 |
| 04 | 1.58.02 AM | "Yup. The Netherlands." | −18.7 | 0.66–2.95 |
| 05 | 1.58.09 AM | "You've got **schools like** SRH Haarlem and Wittenborg University of Applied Sciences." | −16.7 | 0.76–8.42 |
| 06 | 1.59.20 AM | "See? … Options!" | −17.1 | 0.96–2.63 |
| 07 | 1.59.26 AM | "Imagine yourself studying in Europe, meeting new people, experiencing a whole new environment." | −16.8 | 0.41–6.00 |
| 08 | 1.59.31 AM | "Although… somebody should've warned me about the cold, **'cause chale, it's too much!**" | −18.7 | 0.25–5.60 |
| 09 | 1.59.37 AM | "Anyway, if the Netherlands is on your list for 2027, (the) Dexterity Educational Consult can help you get started." | −16.8 | 0.25–8.11 |
| 10 | 1.59.44 AM | "So… what are you waiting for? Your next chapter **starts here. Chale, look sharp, look sharp!**" | −18.1 | 0.33–6.86 |

**Script differences (bold) — need your approval.** I kept them because they are good, natural ad-libs and built gags on them
(teeth-chattering on "it's too much", tapping the watch on "look sharp"). Line 10 no longer says "could start right here".

## 2. Issues found

- **Noise:** steady hiss/room tone at about −40 dBFS on every clip (≈ 20 dB below typical speech level); clip 09 is the noisiest (−39.4).
- **Low-end rumble / handling thumps:** 5–12 % of the energy sits below 90 Hz (worst: clips 05, 08).
- **Uneven levels:** 3 dB spread between clips (−16.3 … −19.3 LUFS); the short punch-lines (02, 04, 08, 10) are the quiet ones.
- **Bandwidth:** WhatsApp compression rolls the voice off around 6–9 kHz, so it is a little dull; this cannot be restored, only flattered.
- **Head/tail noises:** "Hmm" before "Chale" (clip 01, 0.38–0.80 s), breath/rustle before "See?" (clip 06, 0.14–1.00 s), clicks at clip ends.
- No digital clipping (one isolated sample in clip 05).

## 3. What was done (non-destructive — originals untouched, chain in `audio/process_vo.py`)

1. High-pass 85 Hz (rumble) → FFT noise reduction ≈ 9 dB → EQ: −2 dB @ 250 Hz, +2.5 dB @ 3.4 kHz (presence), +1.5 dB air shelf.
2. Gentle 3:1 compression; head/tail trims with 20 ms fades (the "Hmm" and the lead-in noises are trimmed, **pauses inside lines are kept**).
3. Every clip loudness-matched to −17 LUFS; peaks capped at −1.5 dBFS. Final film mastered to **−14.9 LUFS, −2 dBFS peak**.

Comedic timing is protected rather than "fixed": the 0.7 s pause after "Chale," (clip 01, 2.32–3.05 s), the beat between "See?" and
"Options!" (clip 06, 1.36–2.04 s) and the "Although…" pause (clip 08, 1.11–1.64 s) are all intact and the animation plays on them.

## 4. Lines that would benefit from a re-record

| Clip | Where | Why |
|---|---|---|
| 01 | 8.50–9.00 s "money?" | The key word is *quieter* than the rest of the sentence (≈ −11 dBFS peak vs −7) and trails off. The slam gag wants a punched, surprised "MONEY?!". Also 5.2–6.2 s "studying abroad" is slightly swallowed (speech-to-text misheard it). |
| 02 | whole clip "Exactly!" | Quietest and flattest clip; a sharper, deadpan "Ex-ACT-ly." would land the joke harder. Usable as is. |
| 05 | 1.89–2.98 s | Audible hesitation before "SRH" (faint filler at 2.21–2.74 s), and "Haarlem" is unclear (misheard as "Hallam"). School names should be crisp — **highest-priority re-record.** |
| 09 | ≈ 4.9 s | A stray "the" before "Dexterity Educational Consult" and the noisiest background. Brand line — worth a clean take. |
| 10 | 0.72–1.30 s and 2.0–2.9 s | Long gap after "So" and small mouth noises before "Your next chapter". Fine for the draft. |
| 04, 06, 07, 08 | — | No re-record needed. |

**If re-recording:** quiet soft-furnished room, phone 15–20 cm from the mouth and slightly off-axis, and send the file as a
*document/voice-memo file (WAV or M4A)* rather than a WhatsApp voice note, which is what removes the top end.

## 5. Music

- **In the repo:** only `audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a`. Its title claims "no copyright" but there is
  no licence file, composer or source URL, so it is **not verified for commercial use** — I did not use it. (Earlier projects treated it as a review track for the same reason.)
- **Used in this draft:** an original bed generated by `audio/make_music.py` (highlife-flavoured picking, bass, shaker, bell pattern,
  marimba hook; 108 BPM, A major). It is synthesised from scratch, so there is nothing to license — but it is *placeholder quality*.
  The arrangement follows the story: light groove → dead stop before "MONEY" → back in on "Exactly!" → full groove + hook for the
  universities → dreamy bells for the daydream → thin and icy for the cold → groove back, chord on the logo, button ending.
- **Recommended replacement sources** (pick a playful afrobeats/highlife or quirky-pizzicato track ≈ 100–115 BPM; I have not vetted individual tracks):
  - **Pixabay Music** — free, commercial use allowed under the Pixabay Content Licence, no attribution required. Keep the download receipt/licence certificate.
  - **YouTube Audio Library** — free for monetised videos; some tracks require attribution (CC BY) — check each track's licence line. Written for YouTube; confirm before paid ads elsewhere.
  - **Uppbeat** — free tier needs a credit and is aimed at creator channels; a paid plan covers business/client and ad use.
  - **Epidemic Sound / Artlist** — subscription; a *commercial/business* plan covers client work and paid social. Safest for a paid campaign.
  Whatever is chosen: save the licence proof next to the file, then swap `public/audio/stems/music.wav` (or point `mix.py` at it) and run `python3 audio/mix.py`.

## 6. Sound effects

28 effects, all synthesised in `audio/make_sfx.py` (no third-party samples). Every one is keyed to a narration cue in
`audio/build_timeline.py`: falling whistle + slam + coins on "MONEY"; pop/boing for the map; stamp on "2027"; rubber stretch + snap;
card swishes; suitcase roll + bump; poofs for each winter garment; wind, frost crackle and teeth chatter; tick on the checklist;
riser + chord on the logo; watch taps on "look sharp".

## 7. Mix

Three separate tracks: `public/audio/stems/narration.wav`, `music.wav` (un-ducked) and `sfx.wav`.
Music is side-chained to the voice automatically (`mix.py`: ≈ −8.4 dB while he speaks, 0.1 s look-ahead, ~0.45 s release) and the
curve is stored in `timeline.json → duck`. Levels: narration −16.1 LUFS, music (ducked) −28.5, SFX −23.3.
