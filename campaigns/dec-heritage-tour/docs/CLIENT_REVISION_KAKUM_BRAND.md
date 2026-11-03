# Client revision (Nov 2026): Kakum National Park + Dexterity Edu Tour brand

New compositions **`HeritageTourV3K`** (folder "V3K") and **`GroupChatV4K`** (folder "V4K"). V3, V4 and every earlier composition and export are preserved unchanged.

| Export | Length |
|---|---|
| `out/Dexterity_HeritageTour_V3K_Kakum_INTERNAL-REVIEW.mp4` | 39.0 s |
| `out/Dexterity_HeritageTour_V4K_GroupChat_Kakum_INTERNAL-REVIEW.mp4` | 34.5 s |

## Assets used (from `kakum scenes and logo/`, merged from main)
| File | Check | Used |
|---|---|---|
| `DEX-EDU-TOUR-logo.svg` | valid SVG, 1080² canvas, blue #043391 / orange #F77C02; copied byte-identical to `public/brand/` | Both CTAs, via `src/kit/BrandLogo.tsx`. A CSS crop frames the artwork (bbox measured from a render); the file, its proportions and its colours are untouched. |
| `Woman_walking_on_canopy_walkway_f1752b9d_1080p.mp4` (wide, bridge + platform tower) | 1080×1920, 24 fps, 7.93 s, decodes clean | V3K 20.0–21.9 s · V4K 21.7–23.3 s (revealed from the Kakum pin) |
| `Traveller_smiling_on_canopy_walkway_cd902895_1080p.mp4` (forest view → turns and smiles) | same spec | V3K 21.9–23.5 s |
| `Woman_walking_on_canopy_walkway_87b222e5_1080p.mp4` (medium walk) | same spec | V4K 23.3–24.6 s |
| 3 reference PNGs | matching keyframes | catalogued only |

Each video uses two of the three Kakum clips, so no clip repeats within a video. The traveller is consistent with the rest of the footage (same beige set, white top and black bag). All three clips go through the same grade pipeline as the other AI footage (normalise → shared LUT → grain).

## V3K changes (V3 → V3K)
- **Order:** Homecoming → Coastal Journey → Heritage → **Kakum Adventure (20.0–23.5)** → Beach Relaxation (23.5–28) → montage → CTA. The runtime stays at **39.0 s**.
- **Kakum entry:** a zoom-through from the tour-guide shot (on the music's full-energy entry at 20 s) into the wide canopy walkway.
- **Kakum pin:** drops with a tick: "Kakum National Park / CANOPY WALKWAY · CENTRAL REGION".
- **Kakum close:** her turn-and-smile over the forest, then a whip-pan into the restaurant on the beat.
- **Sound:** restrained rainforest air and a few soft bird calls under Kakum.
- **Relaxation:** shortened to make room; the narration phrase "Soak in the beauty of our coastline, unwind by the ocean" moved from 20.45 s to 23.40 s. Word timings were re-measured, and "UNWIND." now lands on the spoken "unwind" (26.24 s) over the beach. No narration was added or altered.
- **CTA:**
  - White card rising over the blue-tinted plate.
  - New logo, "December Heritage & Relaxation Tour", **"Your December. Your *story.*"**, "Heritage. *Adventure.* Relaxation.", "Book your experience."
  - **dexterityedutour.com** as the primary orange button, with WhatsApp 024 448 9721 beneath.
- Audio: −14.0 LUFS, −1.2 dBTP; narration intelligibility re-tested on the final mix.

## V4K changes (V4 → V4K)
- **Kept:** chat, Ghana card → airport expansion, and the bus route Accra → Cape Coast.
- **New beat:** after "Meet your guide", the tour footage **shrinks back onto the Cape Coast pin**. A dashed connector draws inland to a second pin, **Kakum National Park · Rainforest canopy walkway**. The camera glides and dives into it, and the pin opens into the canopy walkway (circular reveal), followed by a walk-toward-camera shot.
- **Geography:** Kakum is placed at its real position, inland north-west of Cape Coast, on land. The bus is used only for the road leg and stays parked at Cape Coast; the pin introduces Kakum. No distances or travel times are shown.
- **Montage:** after Kakum: restaurant (whip) → beach (light sweep) → dance (flash) → friends shrink into the chat, as in V4. The fort/coast aerials, coconut and dancer beats were dropped to keep 34.5 s.
- **CTA:** the last chat bubble now morphs into the **same CTA card as V3K** (identical rect, copy, logo, website and WhatsApp line).
- **Sound:** re-timed (shrink whoosh, Kakum pin blip, riser, dive, reveal hit, forest air, cut swishes). Master −13.8 LUFS, −1.2 dBTP.

## Reusable components added or updated
- `src/kit/BrandLogo.tsx`: official-logo component (aspect-locked, no recolour).
- `src/kit/cta/CTACard.tsx`: shared end card + `CTA_CARD_RECT`.
- `src/kit/brand.ts`: `EDU` colour tokens from the new logo; `CONTACT.website` = dexterityedutour.com.
- `src/kit/map/RouteMap.tsx`: `MapPin` gained `labelSize`.
- `src/kit/LocationPin.tsx`: reused for the V3K Kakum label.
- `audio/v2_score.py`: new `forest` cue type.
- `audio/v4_master.py`: now version-aware.

## Additional Kakum footage that would strengthen the cut
The three supplied clips are **AI-generated depictions** of the Kakum canopy walkway. They are good for continuity with the traveller, but they are not filmed at Kakum. For a fully authentic Kakum section, film or license:
1. **Real canopy walkway establishing shot.** A drone or high-angle view of the actual Kakum bridges and platforms above the forest, about 3–5 s, 4K, ideally with a slow push.
2. **Visitors crossing the real walkway.** A medium shot, natural light, people in motion; releases needed if faces are identifiable.
3. **Forest-floor-to-canopy reveal.** A tilt up a tree trunk to the walkway; good as a transition plate.
4. **POV on the bridge.** A handheld or gimbal walk along the walkway (adventure energy).
5. **Natural sound.** A real canopy ambience (birds, wind in leaves) to replace the synthesised forest bed.

The V3K/V4K labels name the park, not a specific viewpoint, so authentic shots can drop into the same slots (`tools/v3k_plan.py`, `tools/v4k_plan.py`) without editorial changes.
