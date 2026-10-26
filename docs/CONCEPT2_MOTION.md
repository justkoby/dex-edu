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
