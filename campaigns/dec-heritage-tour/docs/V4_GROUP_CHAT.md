# Heritage Tour V4: "The Group Chat"

Composition `GroupChatV4` (Remotion folder "V4"). V1–V3 compositions and exports are untouched.
Export: `out/Dexterity_HeritageTour_V4_GroupChat_INTERNAL-REVIEW.mp4`, 1080×1920, 30 fps, 34.5 s. Music-led, with no narration.
Reference: the Ryno ad was studied only for its motion language (springy chat bubbles, typing dots, tap, card morphs, map tracking). No Ryno assets, branding or layouts were used.

## Storyboard as built (everything connected by shared elements)
| Time | Beat | Transition |
|---|---|---|
| 0–5.0 | Chat with Akosua: "Girl, December plans?" → typing → "I'm thinking Ghana!" → "Wait, Ghana Ghana?" → typing → "Heritage + beach vibes!" | Bubbles spring in from their tail corner (scale + tilt), the stack scrolls, the header shows "typing…" |
| 5.0–6.0 | Akosua shares a **Ghana location card** (mini map with a pulsing pin at Accra) | Touch indicator approaches and taps at 6.0 |
| 6.05–6.65 | **The card expands to full screen** while the airport footage fades up inside it | Shared-element rect + radius morph; the chat recedes |
| 6.6–10.4 | Arrival (reframed below the inaccurate sign) → suitcase wheels | "Accra, Ghana" chip |
| 9.95–10.8 | **The footage shrinks into a circle that lands on Accra** on the map | Circular mask animated to Accra's projected screen position |
| 10.8–15.9 | The **Dexterity tour bus drives the real N1 road** Accra → Kasoa → Winneba → Mankessim → Cape Coast; route draws behind it; camera tracks it | Natural Earth 10 m roads, heading-aware bus, camera follow |
| 16.0 | **Cape Coast pin** drops with ripple: "Cape Coast · Central Region, Ghana"; the bus parks | Pin drop + tick sound |
| 16.6–17.4 | **The map dives into the pin; the pin head opens into the tour-guide footage** | Exponential zoom + circular reveal centred on the pin head |
| 17.4–28 | "Meet your guide" → fort aerial → coastal aerial (zoom-through) → dance → coconut vendor → dancer → restaurant (light sweep) → beach (whip) | Beat cuts on the 120 BPM grid; "Heritage", "Culture", "The coast" chips |
| 28.55–29.2 | **The footage shrinks into a photo message** in the chat; it keeps playing as a video message | Shared element; the chat stack makes room as it lands |
| 30.0–31.05 | "So we're going?" → typing → "Already booking with Dexterity!" | |
| 31.55–32.25 | **The last bubble morphs into the CTA card** | Shared element rect + colour morph; the chat dims |
| 32.25–34.5 | Logo → "December Heritage & Relaxation Tour" → **"Book your *December* in Ghana."** → "Message us on WhatsApp" + **024 448 9721** (pulses) → "Call 030 398 4034 · dexterityedutravel.com" | |

## Reusable components (src/kit)
- `chat/Chat.tsx`: `ChatScreen` (header, typing state, input bar, media/card slots, `hideIdx` for shared elements), `layoutChat` (exact bubble rects at any time), `Tap`.
- `chat/LocationCard.tsx`: shared-location message card with a real Ghana mini-map.
- `map/RouteMap.tsx`: `GhanaMap`, `project()`, `routeAt()`, `routeCamera()` (country → follow → settle → dive), `BusMarker`, `MapPin`. Data is in `geo/ghana_geo.json`, built by `tools/v4_geo.py` from Natural Earth (public domain).
- `cta/EndCardV4.tsx`: `EndCardV4` (card-style CTA designed as a morph target) and `Chip` (editorial label).

## Audio
Original score and UI sound design, synthesised in code (`audio/v4_score.py` on the shared `audio/synth_kit.py`); no samples.
- **Chat:** light groove; send swoosh on outgoing, two-tone receive on incoming; a typing blip; a kalimba pluck per message.
- **Card tap:** whoosh, then a drop with an impact into the airport.
- **Map:** driving groove with a travel arpeggio; a riser into the pin tick, then a dive whoosh and a reveal impact on the tour.
- **Montage:** cut swishes.
- **Back in the chat:** the music breaks down, then the CTA morph gets a whoosh and a resolve.

Master: about −14 LUFS, −1.2 dBTP (`audio/v4_master.py`, which also accepts a licensed `--music` file).

## Accuracy notes
- Accra → Cape Coast is shown as Natural Earth road geometry (≈138 km after generalisation; the real drive is ~145 km). No distance is shown on screen.
- The heritage footage revealed from the Cape Coast pin is illustrative (AI-generated fort tour). No castle is named.
- The arrival shot is cropped to exclude the inaccurate "ACCRA INTERNATIONAL AIRPORT" sign.
- **WhatsApp:** the CTA labels 024 448 9721 as the WhatsApp line, following the brief and the earlier skit's "WhatsApp" action. The repository does not record which number is on WhatsApp, so confirm before publishing (see `PUBLICATION_CHECKLIST.md`).
