# Scene 1 preview plan — "stills" animation approach

**Approach (client decision):** stop rigging. Use COMPLETE character illustrations, one per emotional beat, and make them
feel alive with cuts, push-ins, scale punches, shakes and transitions. Typography, backgrounds, pop-ups and sound effects
animate independently. No lip-sync. Reference: the Stable Plus video (`character-concept/references/ref-5-stable-plus-animation-approach-sheet.jpg`).

**Character identity (approved source):** the supplied navy-polo character — `character-concept/stills-source/`
(`presenting-smile.webp`, `thinking.webp`, both transparent 1122×1402; plus the same pose on a bedroom background).
Every new image must keep his face, textured high-top fade, goatee, skin tone, navy polo with white-tipped collar and cuffs,
and dark smartwatch.

**Unchanged:** narration, timings/cues (`src/data/timeline.json`), music, sound effects, the MONEY gag, brand assets, story order.
**Not overwritten:** draft v1, draft v2 (flat character), the earlier rigs and tests.

## Proof already built
`preview/scene1-stills-approach-proof.mp4` (composition `Scene1Stills`, code `src/stills/Scene1Stills.tsx`) — the whole of
Scene 1 (11 s) on the existing audio, using ONLY the two cut-outs supplied so far. It shows the method working; three shots
use a stand-in image and are the weak points (he smiles through the frustration and the MONEY hit).

## Shot list (times follow the narration automatically)

| # | Time (s) | Line | Image | Framing / motion | Graphics + sound |
|---|---|---|---|---|---|
| 1 | 0.0 – 2.3 | "Chale," (+ his pause) | **presenting** ✔ have | Pops up from below; medium shot; slow creep in; sunburst backdrop | Pop + whoosh; caption |
| 2 | 2.3 – 5.8 | "why is it that anytime somebody mentions studying abroad," | **S1-A weary / skeptical ask** ✘ needed (stand-in: thinking) | Hard cut with a scale punch; medium; warm room backdrop; slow push | Thought bubbles pop on "studying abroad": *Visa? · Flights? · School fees?!* |
| 3 | 5.8 – 7.9 | "the first thing that comes to mind is…" | **thinking** ✔ have | Cut to close-up; steady push toward the eyes; bubbles clear | Music drops out just before the word (already in the mix) |
| 4 | 7.9 – 9.5 | "MONEY?" | **S1-B shocked recoil** ✘ needed (stand-in: presenting) | Snap to the widest shot; image knocked sideways and settles; screen shake; white flash | MONEY slams in on the word; cedi coins; falling whistle + slam + coins |
| 5 | 9.5 – 11.1 | "Exactly!" | **S1-C deadpan point at viewer** ✘ needed (stand-in: presenting) | Punch-in close-up; MONEY is swatted off-screen as the shot lands | Blip + pop; music back in; wipe into Scene 2 |

Optional sixth image for extra life between 4 and 5: **S1-D staring up at the word** (eyes up-left, mouth slightly open), held for ~0.6 s.

## Images still needed for Scene 1
Generate each from the approved character as the identity reference, **transparent or plain white background, same framing
as the supplied cut-outs (waist-up, portrait, ~1122×1402 or larger), same lighting**. Suggested prompt core for each:
"Same character, same navy polo with white-tipped collar and cuffs, same hair, goatee and smartwatch, same 3D cartoon render
style and lighting, waist-up, plain background — …"

| ID | Expression and pose |
|---|---|
| S1-A | …weary, skeptical "why is it always like this?" look: one eyebrow raised, head tilted, lips pressed to one side, **not smiling**; one hand out palm-up in a questioning shrug. |
| S1-B | …shocked recoil: leaning back, eyes wide, eyebrows high, mouth open in an "oh!", both hands raised palms out in front of his chest, looking up and slightly to his right. |
| S1-C | …deadpan, knowing look straight at the viewer: eyebrows flat, half-lidded eyes, small closed-mouth smirk, one hand pointing directly at the camera. |
| S1-D (optional) | …staring up at something above him: head tilted back, eyes up, mouth slightly open, arms lowered. |

Tip: ask for all of them in one session, from the same reference image, so the face stays consistent. Reject any where the
polo, hairline or goatee drift.

## What each new image changes in code
Drop the file in `public/character-stills/`, add its name to the `img` type and point the shot at it in `SHOTS`
(`src/stills/Scene1Stills.tsx`). Framing per shot is three numbers (start zoom, end zoom, focus point). Nothing else changes.

## Rest of the video (for planning only — not started)
About 14 more images would cover scenes 2–5 at the same density: conspiratorial lean-in, surprised look at the map, proud
"yup"; impressed look up at the cards, pushing gesture, excited double point; dreamy gaze, winter-clothes happy, freezing
hug (winter outfit), accusing-while-shivering; brushing it off, ticking the list, confident point at viewer, tapping the watch.
