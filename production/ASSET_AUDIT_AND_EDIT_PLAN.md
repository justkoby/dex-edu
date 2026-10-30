# Dexterity – December Heritage & Relaxation Tour: Asset Audit & Edit Plan

Status: **Phases 1–2 complete (audit + plan). Implementation is paused** pending the items in §7.
Nothing below claims processing that has not been run. Source assets are untouched.

## 1. Repository state
- No Remotion/React project, `package.json` or existing compositions exist; the repo holds media only. A new Remotion project must be created (§6).
- Tools present: ffmpeg/ffprobe 6.1.1 (afftdn, arnndn, loudnorm, sidechaincompress, deesser, lut3d, xfade, blackdetect, silencedetect), Node 22, Chromium+Playwright, Python+Pillow.
- Not available: any usable speech-to-text. The Hugging Face / OpenAI model hosts are blocked by the sandbox proxy; the only installable recogniser (pocketsphinx) returned unintelligible text. **Narration content is therefore unverified.**

## 2. Narration (`audio files for tour/`)
Seven WhatsApp voice notes, AAC mono 48 kHz, 76.5 s total, filename order = presumed script order.

| # | File (time) | Dur (s) | LUFS | True peak | Noise floor |
|---|---|---|---|---|---|
| 1 | 12.44.12 | 10.92 | -20.7 | -0.7 dBTP | -78 dB |
| 2 | 12.44.22 | 11.41 | -21.1 | -0.7 | -77 |
| 3 | 12.44.30 | 9.94 | -21.1 | -4.0 | -77 |
| 4 | 12.45.45 | 9.69 | -21.0 | -3.3 | -74 |
| 5 | 12.45.52 | 11.61 | -22.1 | -3.1 | -78 |
| 6 | 12.45.59 | 13.35 | -23.3 | -5.8 | -76 |
| 7 | 12.46.06 | 9.56 | -21.1 | -2.4 | -73 |

Findings: low noise floor (no obvious hum on level analysis, to be confirmed by spectrum on listening); levels vary by ~2.6 LU between takes; takes 1–2 peak near -0.7 dBTP. No silence >0.4 s detected below -45 dB. Cleanup plan: HPF ~80 Hz, light afftdn, gentle EQ, de-ess, 2:1 compression, per-take loudness match, 120–250 ms joins. A 76 s voiceover sets the runtime at roughly 80–85 s; the intro/outro tail adds a few seconds.

## 3. Music (`audio/(Audio) Upbeat Background Music…m4a`)
97 s, stereo 44.1 kHz AAC. Measured **-9.3 LUFS, +2.07 dBTP (already clipped/over-limited)** – needs ~-20 dB of headroom treatment under VO. **Licence unverified**: the title says "No Copyright" but there is no artist, URL or licence text; "upbeat" is likely not the requested warm Afro-inspired cinematic mood. Treat as *placeholder*; recommend a licensed Afrobeat/highlife-leaning instrumental (e.g. Artlist, Epidemic Sound, Musicbed, YouTube Audio Library with attribution).

## 4. Video inventory (`videos for tour/`)
Frame contact sheets reviewed for every file.

### Core story (AI-generated, same female traveller, consistent beige outfit/styling – strongest continuity)
| File | Spec | Chapter | Notes |
|---|---|---|---|
| Woman_walking_with_suitcase… | 1080×1920 24p 5.97 s | 1 Coming Home | Night, "ACCRA INTERNATIONAL AIRPORT" sign, walking to camera. **Hero opener.** Sign text is AI-rendered: verify spelling at full res. Darker (meanY 109) – needs lift. |
| Woman_walking_through_airport_te… | 1080×1920 24p 9.96 s | 1 | Low-angle suitcase/feet in terminal. Good B-roll; signage is gibberish-risk – keep tight/blurred. |
| SUV_driving_along_coastal_road | 1080×1920 24p 7.98 s | 2 Journey | Traveller by window, palms + sea. **Defect risk:** car interior geometry and driver change between frames; inspect at full speed. Use first ~4 s. |
| Tour_guide_speaking_at_fortress | 1080×1920 24p 5.97 s | 3 Heritage | White fort, guide + group. **Defect risk:** extras, hands, lanyard text. Not a verified real location; do not label it "Cape Coast/Elmina Castle". |
| Woman_relaxing_at_beach_restaurant | 1080×1920 24p 7.93 s | 4 Relaxation | Juice, seafood, ocean. Bright; strong. |

### Real/stock + screen recordings
| File | Spec | Use | Concerns |
|---|---|---|---|
| Recording …003245 | 926×976 30p 6.8 s | Ocean, boats (Ghanaian coast?) | Screen-capture crop; very teal/cool; low res for 9:16 |
| Recording …003419 | 1460×1174 | Aerial of fort (Cape Coast Castle-like) | **Player UI "Pause recording" banner visible**; heavy crop needed; source/licence unknown |
| Recording …003533 | 1726×1190 | Aerial coastal castle + town | Player UI; same |
| Recording …003655 | 1954×1196 | Street from car | Overexposed, 3rd-party screen capture |
| Recording …003821 | 1818×1338 | Drummer, cultural | Player UI/`2160 25fps` HUD burned in; excellent culture shot if a clean source is obtained |
| Recording …003912 | 1252×1366 | Beach, palms, loungers | Player UI at bottom |
| Recording …004023 | 1372×1362 | Tuk-tuk street | Player UI |
| 12716487 (2560×1440 24p) | Accra interchange, grey/overcast | Flat, dull sky; transport B-roll only |
| 18102810 (3840×2160 30p 4.5 s) | Coconut seller by road | Authentic; landscape → needs 9:16 crop |
| 6174521 (720×1280, 18 s) | Dancer in red/gold | Dark indoor, low-res. Stock; faces of identifiable people → release unknown |
| 6193112 / 6193113 (1080×1920 30p) | Group dancing, African prints | Dark/warm, saturated; good "memories/culture" energy; needs model/venue release check |
| 9694500 (1920×1080 24p) | Fishing beach, boats (Jamestown-like) | Grey sky; wide; good authentic coastal texture |

Recordings and stock files carry no licence data. **Do not use them in a paid public ad until source/licence is confirmed.** Stock files named with Pexels-style IDs should be checked against their sites.

### Stills (index only)
`Golden Journey Through the Terminal.png`, `Accra Airport Arrival at Dusk.png`, `Coastal Road Trip Breeze.png`, `Seaside Fortress Tour in Ghana.png`, `Tropical Beachside Dining Retreat.png` – likely AI keyframes for the five clips; useful as end-card/poster references, not for final footage.

### Out of scope for this campaign
`BUDAPEST-VID/**` and the root `Woman_answering_smartphone…mp4` belong to the separate Budapest study-abroad concept (Kofi/Ama storyboard). Catalogued only.

### Missing / not found
- Verified narration script/transcript
- Contact details (phone, WhatsApp, email, web, social handle) – nothing in the repo; **will not be invented**
- Licensed music; ambient SFX (airport, car, waves, wind); a "golden-hour beach walk with friends" clip (Chapter 5 has no matching footage – best substitutes: dancers 6193112/3 + beach 9694500 + Recording 003912)
- Dexterity wordmark: `Logo.svg` (orange #f37a20, navy #283c8d; no font file) – usable for end card; check tagline/typeface with brand owner.
- Chapter 3 "verified location footage": only the aerial screen recordings look real; location identity must be confirmed by Dexterity.

## 5. Colour matching (to be implemented – not yet run)
Measured mean luma: suitcase 109, SUV 99 (too dark); airport/relax/guide 139–140. Plan per clip: exposure/gamma normalize → WB with `colorbalance`/`colortemperature` toward neutral using skin + white fabric refs → per-clip saturation cap → shared warm-neutral `lut3d` (to be authored, light touch) plus soft shoulder (`curves`), subtle `noise` grain. Cool screen-recording shots (teal ocean, grey interchange) pulled warm. Check on waveform/vectorscope via ffmpeg `waveform`/`vectorscope` exports.

## 6. Proposed timeline (≈ 80–85 s, 1080×1920, 30 fps; timings final only after transcript)
Footage is 24 p/30 p mixed → conform all to 30 fps (frame-blend free, 24→30 via pulldown-style frame repeat or `minterpolate` off) – speed ramps only on 30 p sources.

| Chapter | ≈ VO | Picture | Type |
|---|---|---|---|
| 1 Coming Home | takes 1–2 | Suitcase@night hero → terminal feet B-roll → push-in | `COMING HOME`, `A JOURNEY BACK TO YOUR ROOTS` |
| 2 Journey | take 3 | SUV window shots → coastal road → whip/light-leak to coast | – |
| 3 Discovering Heritage | takes 4–5 | Guide at fortress → (aerial fort, once clean) → drummer | `DISCOVER YOUR HERITAGE` |
| 4 Relaxation | take 5–6 | Beach restaurant → palms/loungers → fishing beach; warmer, brighter | `UNWIND BY THE COAST` |
| 5 Memories | take 6–7 | Dancing/friends + beach; music peak | `MAKE MEMORIES THAT LAST` |
| 6 Invitation | take 7 | Hero hold → Logo.svg end card | `JOIN US THIS DECEMBER`, `YOUR HERITAGE. YOUR EXPERIENCE.` + CTA |

Chapter mapping to takes is a guess from durations. Reusable Remotion components to build: `VideoSequence`, `AnimatedHeading`, `TextOverlay`, `SceneTransition` (cut / push / light-leak), `EndCard`, `AudioTrack` with VO-driven ducking envelope. Pre-processing (grade, crop, conform, VO master) done with ffmpeg into `production/work/` (git-ignored), then Remotion composes and encodes H.264/AAC.

## 7. Needs your approval / input before building
1. **Narration script** (or confirm I may use auto-subtitles from a machine with Whisper). Needed for sync, captions and to confirm take order.
2. **Contact details** for the CTA, exactly as they should print.
3. **Music**: supply a licensed track or approve the "No Copyright" file as a temporary placeholder (it is clipped at -9.3 LUFS and licence is unverified).
4. **Licence/source** for the stock clips and screen recordings; clean (non-screen-captured) versions of the aerial castle, drummer and beach clips if possible.
5. OK to remove the player UI by cropping (loses ~15 % of frame) – or provide originals.
6. Confirm the fortress/castle may be shown without a named location.
7. Approve a ~80–85 s runtime (VO is 76.5 s).
