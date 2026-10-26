# Concept 2 — "YOUR NEXT STOP: BUDAPEST" (motion-design Reel)

Composition `Dexterity-Motion-Budapest` · 1080×1920 · 30 fps · 30.0 s · code in `src/motion/` (independent of the skit; no dialogue, no Kofi/Ama footage).

## Timeline (all cuts on the music's 0.6 s beat grid; the groove drop = the BUDAPEST? slam at 3.0 s)
| Time | Scene | What happens |
|---|---|---|
| 0.0–4.2 | Hook | WHAT IF / YOUR NEXT STOP / WAS… rise out of masks on the beat, riser → **BUDA / PEST?** slams on the drop (stretch + skew for 5 frames, offset ghost, motion blur, shake). The letters then turn into windows onto the next scene. |
| 4.2–9.0 | Accra → Budapest | Real geography (Natural Earth, Mercator, verified lat/lon). Camera starts tight on Accra, pulls back to frame the whole route, pushes into Budapest. Dotted route draws as a plane follows the great-circle arc; distance counter (great-circle ≈ 5,010 km) counts up; pins ping; Hungary fills orange; Budapest footage opens from the pin. |
| 9.0–13.8 | IBS spotlight | Orange sweep → full-bleed IBS footage, justified display name, location label, framed photograph that drifts against the footage (parallax), drawn lines. |
| 13.8–18.6 | Budapest Metropolitan University | Same system, mirrored drift. |
| 18.6–24.0 | Message | EXPLORE. (navy, rotating compass) → APPLY. (orange, motion-blurred slam, tick draws) → GO FURTHER. (off-white, scale-out with echoes, aircraft streak) → YOUR FUTURE HAS NO BORDERS. (route line crosses the word). One wipe device carries every cut. |
| 24.0–30.0 | Dexterity CTA | Circle opens (echoes the logo's D) → logo plate wipe + light sweep + drawn border, headline, **ENQUIRE ON WHATSAPP** button (largest element), both phone numbers, website, clean hold, brand sign-off. |

## Animation techniques
- **Letters-as-window transition**: an SVG `<clipPath>` built from the BUDA/PEST? text, scaled exponentially about a point inside the "B" stem, so the next scene is revealed *through* the letters and the zoom ends with the map filling the frame (white outline rides the letter edges).
- **SVG path animation**: `@remotion/paths` (`evolvePath`, `getPointAtLength`) for the dotted route mask and the aircraft position + heading from the path tangent; stroke widths/dashes are divided by camera scale so lines stay constant on screen.
- **Map camera + 3 parallax layers**: graticule (slow), land (1×), soft atmospheric blobs (fast); keyframed scale/centre with ease-in-out.
- **Masked type reveals**: every headline rises out of an `overflow:hidden` line mask with a small velocity-based blur; display lines are *justified* to exact width with SVG `textLength` (Archivo variable, wdth 62 / wght 900).
- **Motion blur**: `@remotion/motion-blur` `CameraMotionBlur` only on the slam and the APPLY. entry; CSS blur proportional to velocity elsewhere.
- **Springs** for slam, photo card, logo plate, CTA button; cubic-bezier ease-in-out for camera/wipes; `expo` ease-out for reveals.
- **One recurring device** (orange diagonal sweep / bottom wipe / circle) so transitions read as a system.

## Sound (preview-only music) — see `ASSET_MANIFEST.md` for licence status
Existing 100 BPM track, started 3.0 s before its groove drop so the drop = the slam. SFX (original, synthesised by `scripts/gen_sfx_motion.py` + earlier scripts): typography hits, riser, impact, whooshes, route shimmer, destination ping, university title swish, logo chime, logo swell, button pop, brand stinger. Master: −16 LUFS / −1.5 dBTP.

## Asset usage
| Asset | Where |
|---|---|
| `14685997_1080_1920_30fps.mp4` (statue, Parliament) | Finale backdrop (dimmed) |
| `16296368_1440_2562_30fps.mp4` (Parliament dome) | Budapest arrival footage |
| `Generated Video … 2_49PM.mp4` (IBS building, signage reads "IBS International Business School") | IBS spotlight |
| `20140919_…jpg` (IBS building photo, IBS signage) | IBS photo card |
| `Drone_shot_of_university_campus…mp4` (round building = Budapest Metropolitan Egyetem facade) | BMU spotlight |
| `images.jpg` (facade sign reads "Budapest Metropolitan Egyetem") | BMU photo card |
| `Logo.svg` | End card (on an off-white plate for contrast) |
Not used: Kofi/Ama footage and audio, the crowd photos/clip (no verifiable university), East Legon images.
Map data: Natural Earth via the `world-atlas` npm package (public domain), converted by `scripts/gen-map.mjs`.

## Render
```
npm install && npm run prep
npm run motion:studio     # Remotion Studio, pick "Dexterity-Motion-Budapest"
npm run motion:draft      # out/dexterity-motion-budapest-preview.mp4  (720×1280)
npm run motion:full       # out/dexterity-motion-budapest-final.mp4    (1080×1920)
scripts/qa.sh out/dexterity-motion-budapest-preview.mp4 out/qa-motion
```


---
# V2 refinement (branch `feature/dexterity-motion-budapest-v2`)

Duration 30.6 s (was 30.0) — the route scene lost one beat so the end card holds for 7.2 s (≈4 s of readable hold). All cuts remain on the 0.6 s beat grid.

## What changed
| Area | V1 | V2 |
|---|---|---|
| Opening | stretch/skew/ghost slam | clean spring slam (scale + tiny settle), no glitch; "WAS…" now enters on the beat before the drop and holds until the impact; masks use expo-in / in-out-out |
| Map | route a small element | route is the hero: glow underlay, bolder dotted line, larger aircraft (shadowed, heading from path tangent), tighter camera with eased pull-back/push-in; labelled geography (Gulf of Guinea, Sahara, Mediterranean, Adriatic, Black Sea, Atlantic); Accra quiet/small, Budapest large + orange; verified lat/lon captions (5.60° N 0.19° W / 47.50° N 19.04° E); the destination ring becomes the circular mask that opens onto Budapest footage |
| IBS | same card layout as BMU | editorial photo grid: Parliament footage contracts into the dominant panel, a left→right wipe swaps it to IBS, justified two-line name overlaps the panel edge, giant orange "IBS", second *verified* view (wide facade photo) masks in with an orange offset block; hero & photo drift in opposite directions |
| BMU | same as IBS | cinematic full-bleed: IBS panel expands to full frame (frame extension / match cut), slanted wipe to BMU, slow push, name slides in from the right edge with motion blur, thin frame + rule draw themselves, pulsing orange location marker, navy bars close into the next scene |
| Kinetic type | three similar slams | EXPLORE. revealed over layered outline rows drifting in opposite directions + compass; APPLY. letters stamped on beat subdivisions with a drawn tick; GO FURTHER. slides along the direction of travel with a horizontal outline trail, speed lines and aircraft; campaign line rises out of masks with the route line crossing "BORDERS." Each colour field arrives by the same left→right slanted wipe |
| Logo | rectangular plate | `Logo.svg` has **no** background rectangle (transparent, 38 paths); the plate was my own. The original paths are now drawn directly on navy: orange mark rises glyph by glyph, wordmark follows letter by letter. Navy wordmark is shown white on the navy field (standard one-colour reversal); orange is untouched |
| End card | crowded | order: logo → message → WhatsApp action → contacts, 7.2 s with a ~4 s hold, safe-area spacing |
| Transitions | orange sweep everywhere | one language: letters-as-window, ring-expands-to-circle, frame contraction/extension (match cuts), left→right slanted wipes, closing bars |
| Colour | unchecked | shared light grade (`GRADE` in tokens.ts) per clip + no decorative cards |
| Sound | many effects | fewer, quieter cues on the beat grid; music drop re-measured at 13.19 s |

## Music licence
Still the unverified-licence track → **preview only**.
