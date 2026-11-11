# Netherlands 2027 video — status and next steps

**Read this first when resuming.** It replaces the earlier conversation.
Working branch: `claude/keen-einstein-3q5imb` · project folder: `netherlands-2027/` · nothing is on `main`, no PR is open.
Standing rules from the client: do not push/merge to `main` or publish without approval; do not modify earlier video projects
or the original asset folders; no AI voice, no voice cloning.

---

## CURRENT DIRECTION — "stills" approach with the navy-polo 3D character (supersedes ALL character sections below)

Client decision after draft v2: **stop rigging the character.** Use complete character illustrations per emotional beat
(the Stable Plus method) and the supplied **navy-polo 3D cartoon character** as the identity. Do NOT rebuild him from the
SVG parts in `NETHERLANDS/SCENE-01-MONEY/`. Lip-sync not required. Keep narration, music, SFX, brand assets, story order.

- Source images: `character-concept/stills-source/` (presenting-smile, thinking – transparent; plus one on a room background).
- Plan + shot list + list of images still needed: **`docs/SCENE1_STILLS_PLAN.md`**.
- Proof built: `preview/scene1-stills-approach-proof.mp4` (composition `Scene1Stills`, `src/stills/Scene1Stills.tsx`) – all of
  Scene 1 on the existing audio using only the two supplied cut-outs; three shots use stand-ins (flagged in the plan).
- The Stable Plus project is not in this repository; the approach was taken from the client's screen recording
  (`character-concept/references/ref-5-stable-plus-animation-approach-sheet.jpg`).
- **Next:** client supplies images S1-A, S1-B, S1-C (and optional S1-D) → swap them into `SHOTS` → re-render the Scene 1
  preview → on approval, plan and build scenes 2–5 the same way (≈14 more images). The existing graphics components
  (map, cards, winter, CTA) and the timeline are reused; `Actor`/rigs are not.
- Kept for comparison, no longer the direction: draft v1 (first rig), draft v2 (flat character), `src/character2/` test.

---

## LATEST — character v3, flat vector (this is the current state; it supersedes the v2 section below)

Client reviewed the v2 test (supplied layered artwork) and was still not satisfied. Decision: **use a flat vector style close to
`character-concept/references/ref-4-flat-vector-APPROVED-STYLE.webp` and replace the initial character.**

- **Character v3:** `src/rig/CharacterFlat.tsx` — solid shapes, no outlines, one shadow tone, thin fold lines. High-top fade with a
  curly edge, white ringer tee with navy trim, navy trousers, dark smartwatch; winter outfit included. Original design, not a copy.
- **Drop-in:** same props, pose/expression libraries (`poses.ts`) and engine (`perform.ts`) as the first rig, so all five scenes
  use it with no scene changes. Switch in `src/components/Actor.tsx`: `CHARACTER_STYLE = "flat"` (set `"v1"` for the old look).
- **Deliverables:** `preview/netherlands-2027-draft-v2-flat-character.mp4` (full 65 s, same narration/SFX/music),
  `docs/contact-sheet-draft-v2.jpg`, `docs/character-v3-flat-model-sheet.png`. Also now rendered: provisional website
  `dexterityeduconsult.com` and the generic Wittenborg card label.
- **Kept for comparison:** draft v1 (`preview/netherlands-2027-draft-v1.mp4`, `src/rig/Character.tsx`), the v2 experiment
  (`src/character2/`, `preview/scene1-character-v2-test.mp4`), the A/B/C options (`character-options/`).

**NOT yet done in draft v2 (earlier feedback still open — do these after the flat style is approved):**
1. Acting is still the v1 performance: too much smiling, repeated two-hand gestures. Re-key `perfN` in each scene to the
   per-scene emotions in section 2 (scene 1: frustrated/skeptical… ). `src/character2/Scene1Test.tsx` `keys1` is a good beat map for scene 1.
2. Camera is still mostly one medium shot. Add close-ups / push-ins / wider shots per scene (see the camera in `Scene1Test.tsx`).
3. Scene-2 map pin still says "Apeldoorn" (`NLMap.tsx`).
4. Backdrops still use soft gradients/vignette (`Stage.tsx` `Studio`); consider flattening them to match the character.
5. Placeholder music, provisional website/phones/tuition, rights check, optional re-records — unchanged (sections 2, 4, 6).

---

## UPDATE — character v2 from supplied artwork (supersedes the "blocked on a character image" status above)

The client supplied layered character art in `../NETHERLANDS/SCENE-01-MONEY/` (merged from `main`). It is now the character.

- **Parts received (all transparent SVG, auto-traced vector, each in a DIFFERENT canvas size/scale):** head base with ears, nose
  and neck · eyebrows · eyes · mouth (one open smile) · hair · bare torso · striped polo with backpack straps · pointing arm ·
  open-palm arm · `charcater-1.svg` (assembled 3/4 reference) · two pose-sheet screenshots (targets, not usable as parts).
- **Prep:** `scripts/prep-character2.mjs` crops each part to its artwork, namespaces its CSS classes, splits brows into L/R and
  eyes into eye + movable iris → `public/character2/` + `src/character2/parts.json`. Originals untouched, no colour changes.
- **Assembly:** `src/character2/layout.json` places every part with a uniform scale only (eyes 0.47, mouth 0.231, hair 0.79,
  torso 1.2, polo 1.12, pointing arm 0.63, palm arm 1.0, relative to the head). `scripts/assembly-test.mjs` renders a static check.
- **Component:** `src/character2/Character2.tsx` (head tilt/shift, each brow, blink + squint, pupil direction, mouth
  open/width/frown/"oh", body lean/squash, per-side arm: point / palm / tucked behind the back, mirrored as needed).
  `perform2.ts` = keyframed acting + voice-driven mouth/head/brow accents + blinks.
- **Deliverables:** `docs/character-v2-assembly.png` (assembly preview), `preview/scene1-character-v2-test.mp4`
  (11 s Scene 1 test on the existing narration/SFX/music; composition `Scene1Test`), `docs/scene1-character-v2-test-sheet.jpg`.
- The old rig (`src/rig/`), the v1 draft and the `Netherlands2027` composition are unchanged.

**Limits of the supplied set (what to ask the illustrator for next):**
1. Only ONE mouth (open smile). Frown = that mouth flipped; "oh" = it narrowed; closed = it squashed. Need: closed neutral,
   closed smirk, frown/grumble, round "oh", wide shout, plus 2–3 talking shapes.
2. Only TWO arm drawings (pointing, open palm). Recoil = palm arms rotated; "rest" = palm arm tucked behind the back.
   Need: relaxed hanging arm (L+R), raised open hands for the recoil (as in the Pose 4 screenshot), hand-on-chin, fist.
3. Head is front-facing only; the screenshots show 3/4 and tilted heads. Need a 3/4 head (base + matching features).
4. No eyelids as separate art (blink/half-lid is a vertical squash + a drawn lash line). Upper-lid shapes would help.
5. Torso has no trousers; the polo hem must stay below the frame, which limits wide shots. Need waist/legs for full-body shots.
6. Arm sleeves and the polo's own sleeves both exist, so sleeves double up slightly at the shoulders.

**Next:** client reviews the Scene 1 test → if the performance is approved, request the extra parts above (or accept the
work-arounds) → rebuild scenes 2–5 on `Character2` reusing the existing graphics components and timeline.

---

## 1. Current status (before character v2 arrived) (one paragraph)

A complete five-scene **first draft** exists (65 s, 1080×1920, with processed narration, sound effects, music and captions).
The client accepts its **structure, timing, graphics and branding as a starting point** but **rejected the character** — twice:
first the pseudo-3D vector puppet in the draft, then three hand-built 2D SVG options (A/B/C). The project is **blocked on
getting one approved character illustration** made with an image-generation/illustration tool. No video rebuild should start
until the character's visual quality is approved.

| Item | State | Where |
|---|---|---|
| Draft v1 video (old character) | Done, kept for comparison | `preview/netherlands-2027-draft-v1.mp4` |
| Storyboard of draft v1 (1 frame/second) | Done | `docs/contact-sheet-draft-v1.jpg` |
| Narration clean-up + timing | Done | `audio/`, `src/data/vo.json`, `src/data/timeline.json` |
| SFX, placeholder music, 3 stems | Done | `public/audio/sfx/`, `public/audio/stems/` |
| Scenes 1–5, graphics components | Done (built around the old character) | `src/scenes/`, `src/components/` |
| Old character rig | **Rejected** – replace | `src/rig/Character.tsx`, `docs/rig-model-sheet.png` |
| 2D style options A/B/C (SVG) | **Rejected** ("A is closest", quality not enough) | `character-options/` |
| Editorial character concept v1 | **Not generated yet** – prompt ready | `character-concept/PROMPT.md` |
| Opening-scene comparison preview | Not started | — |

## 2. Latest approved creative direction

- **Format:** vertical 9:16, single character speaking to camera, fast, funny, graphics that he physically interacts with.
- **Character style (latest, supersedes everything earlier):** clean, polished **2D commercial editorial illustration** in the
  spirit of modern African fintech/startup advertising. **Not 3D, not pseudo-3D, not a simple programmatic SVG puppet.**
  The original 3D sheet (`../NETHERLANDS/Ghanaian Character Expressions and Poses.png`) is **no longer the target look**.
- **Workflow:** illustration-first. Generate/commission a high-quality illustration, then work out animation from layered
  assets, image sequences or a hybrid. Do not sacrifice visual quality for SVG simplicity.
- **Acting:** performance over lip-sync. Distinct emotion per scene, less smiling, fewer repeated gestures, deliberate
  stillness, eye direction, head tilts, posture changes:
  - Scene 1 (studying abroad / money): frustrated, skeptical, slightly dramatic
  - Scene 2 (Netherlands reveal): curious, surprised, intrigued
  - Scene 3 (universities): impressed, excited, confident
  - Scene 4 (daydream): relaxed, imaginative, then comically uncomfortable from the cold
  - Scene 5 (CTA): warm, confident, engaging
- **Camera:** vary it — close-ups, medium shots, three-quarter angles, occasional wide shots; moves should serve the jokes.
  Draft v1 is almost entirely one front-facing medium shot; that was criticised.
- **Graphic interaction:** he must really look at, gesture to and react to graphics (MONEY text, map, university cards).
- **Voice:** keep the natural ad-libs and Ghanaian expressions. Trimming silence, balancing and tightening awkward pauses is allowed.
- **Sound:** playful modern cartoon instrumental kept subtle, carefully timed comedic SFX, narration prominent, automatic ducking.

### Client decisions already made
| Topic | Decision |
|---|---|
| Brand name on screen | "Dexterity Educational Consult" (matches the voice-over). Keep tour branding separate. |
| Website | `dexterityeduconsult.com` — **provisional**, confirm before publishing. Set in `src/config/brand.ts`. |
| Logo / contacts | Reuse from earlier study-abroad videos. Phones 024 448 9721 / 030 398 4034 (same in both earlier projects; re-confirm before publishing). Note: `Logo.svg`'s own wordmark reads "Dexterity Education and Travel & Tour" — it is the only logo those videos used. |
| Tuition | **Provisional / unverified** (client says the brief's figures differ from the universities' published fees). Editable in one place: `SCHOOLS` in `src/config/brand.ts`. Cards say "Tuition · indicative". Needs final confirmation. |
| Wittenborg location | Do not assign one campus without checking (Apeldoorn, Amsterdam, …). Config is now generic, **but the scene-2 map pin still says "Apeldoorn"** (`src/components/NLMap.tsx`) — fix in the rebuild. |
| Image / logo rights | Review before publishing (university photos, SRH + Wittenborg logos). |
| Length | 65 s vs the original 35–45 s target; client has not asked to cut it. |

## 3. Character design requirements

One original **young Ghanaian man, early 20s**: relatable, smart, expressive, warm, slightly playful, confident not arrogant.

Must have: natural believable young-adult proportions · refined facial anatomy and expressions · stylish contemporary
clothing with convincing folds · sophisticated layered shading and subtle gradients · expressive well-drawn hands · relaxed,
slightly asymmetrical stance · distinctive silhouette and personality · polished commercial editorial finish · warm brown to
medium-dark skin · neat haircut (fade / low cut / shaped afro) · works front-on and at a slight 3/4 angle, half- and full-body, in 9:16.

Must avoid: rectangular torsos · rigid shoulders · generic oval heads · stiff hands · expressions made only by swapping brow
and mouth shapes · pseudo-3D / shiny plastic surfaces · childish proportions · generic AI-cartoon look · inconsistent face
between expressions · copying the reference artworks.

Must support: talking to camera, pointing at graphics, reacting to text, shrugging, surprise, frustration, curiosity,
excitement, thinking, confident CTA.

**Reference files (quality benchmarks, not to be copied)** — `character-concept/references/`:
- `ref-2-oremi-fintech-fullbody.webp` — **primary benchmark** (full-body, mature proportions, linework + shading, outfit styling)
- `ref-1-editorial-woman-phone.png` — character presence, simplified stylish shapes, expressive hands
- `ref-3-simple-vector-groceries.webp` — readable forms, clear silhouette, animation-friendly

**Requested next deliverable:** ONE substantially improved character concept showing a natural **full-body pose** and an
expressive **waist-up view**. Approval of visual quality comes before any expressions or animation work.

**Latest concept (proposed, not yet seen by the client as an image):** `character-concept/PROMPT.md` — low fade with textured
top, defined jaw, light goatee; navy overshirt, cream tee, tan chinos, white sneakers, dark smartwatch (navy/cream/tan chosen so
he separates from Dexterity-orange graphics); contrapposto full-body with a hand in his pocket; waist-up leaning in with one
eyebrow raised. Thin contour lines, layered cel shading, subtle gradients.

**Why it has not been generated:** the only image tool connected to the session (Gamma) refused twice with
"Insufficient credits" (free plan, 50 credits left). No other image-generation tool was available. Hand-drawn SVG was
deliberately not attempted again because the client rejected that route.

### Proposed animation approach for an illustrated character
1. From the approved concept, generate a **pose/expression set** (about 8–12 images across the five scenes), using the concept
   as the subject reference so the face and outfit stay consistent. Poses are listed in section 7, step 3.
2. Cut each image into **layers** (head, each arm/hand, torso, legs; eyes/brows/mouth variants where needed) with transparent
   backgrounds, and animate them in the existing Remotion project: head tilts, arm moves, blinks, a few mouth shapes driven by
   the narration loudness envelope, squash/anticipation, plus real camera moves (crop/zoom/pan between close-up, medium, wide).
3. Optional: **image-to-video** for two or three hero moments (the MONEY hit, the cold shiver) if such a tool is available,
   composited over the existing graphics.
Main risk: consistency between generated poses — hence one approved concept first, then the set.

## 4. Narration and audio status

- 10 WhatsApp voice notes in `../NETHERLANDS/NARRATION AUDIO FILES/` map 1-to-1 to the script lines. Originals untouched.
- Processing (`audio/process_vo.py`): high-pass 85 Hz → ~9 dB noise reduction → light EQ → 3:1 compression → head/tail trims →
  loudness-matched to −17 LUFS. Per-line `trim`, caption `phrases` and named cue `marks` live in the `CLIPS` table there.
- Timeline (`audio/build_timeline.py` → `src/data/timeline.json`): scene boundaries, cues, captions, SFX list, mouth envelope
  and music ducking are all derived from the narration. Only the pauses between lines (`GAP`) are hand-set.
- Mix (`audio/mix.py`): three stems in `public/audio/stems/` (`narration.wav`, `music.wav` un-ducked, `sfx.wav`); music ducks
  ≈ 8.4 dB under the voice. Final master −14.9 LUFS, −2 dBFS peak.
- **Ad-libs kept by client decision:** line 5 "schools like…", line 8 "…'cause chale, it's too much!", line 10 "Your next
  chapter starts here. Chale, look sharp, look sharp!"
- **Suggested re-records (optional, not yet answered):** line 5 at 1.9–3.0 s (hesitation, unclear "Haarlem") — highest value;
  line 1 at 8.5–9.0 s ("money" is quieter than the sentence); line 9 at ~4.9 s (stray "the" before the brand name).
- **Music is a synthesised placeholder** (`audio/make_music.py`). The repo's only track
  (`../audio/(Audio) Upbeat Background Music…m4a`) has no licence proof and was not used. A licensed track is still needed;
  sources are listed in `docs/AUDIO_REVIEW.md` §5. Client wants the music more subtle and modern.
- The audio review was done by measurement and speech-to-text, **not by ear**. Full detail: `docs/AUDIO_REVIEW.md`.

## 5. Existing animation implementation (reusable vs replace)

Remotion 4 + React + TypeScript; see `README.md` for commands and the data-flow diagram.

**Keep / reuse**
- `src/data/tl.ts`, `timeline.json` — cue system (`cue("money")` etc.); every gag is keyed to a spoken word.
- `src/components/`: `MoneyWord` (slam + coins), `NLMap` (real outline, pins, 2027 stamp), `UniCard`, `Winter` (snow, frost,
  thermometer, suitcase, polaroids), `Cta` (checklist, consult card, end card), `Stage` (camera, backdrops, wipes, poofs), `Captions`.
- `src/anim.ts` easing/spring helpers; `src/Film.tsx` scene order + three audio tracks.
- `src/scenes/Scene1…5.tsx` — the beat-by-beat choreography and cue usage are a good map, but each scene's `perfN` acting
  track and `<Actor>` placement are written for the old rig.

**Replace**
- `src/rig/Character.tsx`, `poses.ts`, `perform.ts`, `components/Actor.tsx` — the rejected vector puppet. The *idea* in
  `perform.ts` (keyframed acting + voice-driven mouth/head accents + blinks) carries over to a layered-image character.

**Environment notes**
- Rendering needs a Chromium headless shell: `scripts/render.sh` and `scripts/stills.sh` auto-detect a Playwright install,
  otherwise set `REMOTION_BROWSER_EXECUTABLE`. Without it Remotion tries to download a browser and fails offline.
- Python deps: `numpy scipy soundfile pyloudnorm` (+ `ffmpeg`). `npm run prep` then `npm run audio` regenerate everything in `public/`.
- `brand.ts` was edited after the last render (new website, generic Wittenborg city), so the committed preview still shows
  `dexterityedutravel.com` and "Apeldoorn". That is expected; it changes at the next render.

## 6. Outstanding issues

1. **Character not approved** — blocker (section 3).
2. No image-generation capability in the session: Gamma credits exhausted.
3. Acting too smiley/repetitive and camera too static in draft v1 (client feedback; section 2).
4. Scene-2 map pin label "Apeldoorn" contradicts the "don't assign one campus" decision.
5. Website, phone numbers, tuition figures, photo/logo rights: all provisional, to confirm before publishing.
6. Placeholder music; needs a licensed, subtler, more modern track.
7. Optional re-records of lines 5, 1, 9.
8. Length 65 s (no decision to shorten).
9. Draft v1 has only been checked via frames and measurements, not full-speed playback with sound.

## 7. Exact next steps

1. **Get the character concept image.** One of:
   a. client refills Gamma credits (https://gamma.app/settings/billing) → rerun the prompt in `character-concept/PROMPT.md`
      with the Gamma image tool, 16:9, type "illustration"; or
   b. client generates it in another tool with that prompt and saves `character-concept/concept-v1.png`; or
   c. a different image tool is connected to the session.
   Show the client; iterate on the prompt until the **visual quality is approved**. Do nothing else on the video first.
2. **Lock the design**: save the approved image as `character-concept/approved.png`; note outfit colours and any face/hair changes here.
3. **Generate the pose/expression set** from the approved image (same character as subject reference), plain background, each
   as a separate image, roughly:
   - S1: frustrated/skeptical talking (waist-up); finger-to-temple thinking; flinch looking up; knocked-sideways shock; deadpan "Exactly" point at viewer
   - S2: leaning-in conspiratorial; surprised look up-right at the map; arms-wide stretch; satisfied nod
   - S3: impressed look up; shove-aside push; excited double point up
   - S4: dreamy chin-in-hand; winter outfit version hugging himself, cold face
   - S5: warm confident talk; pointing at viewer; tapping watch ("look sharp")
   Include at least two close-up head shots and one full-body wide for camera variety.
4. **Prepare layers**: remove backgrounds, cut head/arms/torso, save under `public/character/`. Build a small
   `LayeredCharacter` component to replace `Actor` (pose switching with squash-and-settle, head/arm offsets, blinks, mouth shapes from `envAt`).
5. **Opening-scene comparison preview only** (client asked for this before any full rebuild): re-stage Scene 1 with the new
   character, the frustrated/skeptical performance, and varied framing (close-up for "Chale…", push-in on "comes to mind",
   snap wide on the MONEY slam, close deadpan for "Exactly!"). Render ~11 s (`scenes.s1` range) and send it alongside draft v1.
6. After approval: rebuild scenes 2–5 the same way; fix the Wittenborg pin; swap in licensed music; apply any re-records
   (`npm run audio`); full render with `scripts/render.sh full`; update `docs/PRODUCTION_REVIEW.md`.
7. Before publishing: confirm website, phones, tuition, name/logo, photo and logo rights with the client. Do not merge to `main` without approval.
