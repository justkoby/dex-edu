# Publication checklist: Dexterity Heritage & Relaxation Tour

Creative approval and publication clearance are handled separately. Nothing in the V3 video carries on-screen warnings; this list is where outstanding items live.
Status as of 2026-10-30.

## Cleared / no action needed
| Asset | Basis |
|---|---|
| Stock footage (`6193112`, `6193113`, `6174521`, `18102810`; `9694500` and `12716487` unused) | Pexels, free for commercial use, no attribution required. Links: pexels.com/video/<id>/ (see `asset-library/CATALOGUE.md`). |
| Screen recordings (`Recording 2026-10-30 0035…`) | Recordings of Pexels videos (Dexterity, 30 Oct 2026). Same Pexels licence. |
| Narration (7 WhatsApp voice notes) | Project-owned recordings. |
| Music + sound design (V2/V3) | Original score and SFX synthesised in-project (`audio/v2_score.py`); no samples or third-party material. |
| Fonts | Bricolage Grotesque, Plus Jakarta Sans, Instrument Serif: SIL Open Font License 1.1 (licences in `public/fonts/`). |
| Logo | Dexterity's own `Logo.svg`. |
| Contact details | 024 448 9721 · 030 398 4034 · dexterityedutravel.com, the same as the earlier Dexterity skit / motion videos (`feature/dexterity-skit*`, `src/config/brand.ts`). |

## Open items before publishing
1. **Which number carries WhatsApp?** The earlier videos list both numbers without assigning WhatsApp. V3 shows 024 448 9721 (mobile) as the primary line with the neutral label "Call or message". If WhatsApp is confirmed for it, the label can read "Call or WhatsApp" (`src/kit/brand.ts → CONTACT.primaryLabel`).
2. **Listen to the score.** It was built and measured but never auditioned by a person. Approve it by ear, or swap in a licensed track: `DEX_VER=v3 python3 audio/v2_mix.py --music <file>`, then re-mux. The picture doesn't need re-rendering.
3. **AI-generated clips** (airport, terminal, SUV, fortress tour, beach restaurant): confirm the generation tool's terms allow commercial advertising use.
4. **Pexels "endorsement" condition.** Pexels does not allow implying that identifiable people endorse a product. The dance clips show identifiable people inside an advert, which is common practice, but the brand owner should be comfortable with it. The coconut shot is hands only.
5. **"Ghana's Central Coast" label** (requested copy). The aerial fort footage is not location-verified. The label names a region, not a specific site; keep it that way unless the location is confirmed.
6. **AI airport shot.** The inaccurate "ACCRA INTERNATIONAL AIRPORT" lettering is blurred out and covered by the V3 headline. Other small AI signage in the background is illegible gibberish at phone size. A new generation would remove the issue entirely.
7. **Narration.** The phrase choice and the reverse-order finding should be confirmed by ear (`docs/narration_transcript.md`).

## Not used in V2/V3
`audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a`: not from Pexels, licence unverified. Used only in the V1 internal draft.
