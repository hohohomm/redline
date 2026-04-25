# Hero clip image prompts

Anime mascot clips removed. New direction: dark fintech / liquid glass / red-line motif. NO HUMANS.

Reference (this aesthetic = locked):
- `/Users/phillippreketes/Desktop/failed-doneinvoice.png`

That image shows: chaos cards on left dissolving into clean grid on right, vivid red rail dividing the two, dark studio floor with red reflections, no people, premium product-film feel. **Match this exactly.**

## Workflow

1. Feed image prompt below to Sora / Midjourney / Imagen / Flux to generate static reference image.
2. Send generated image + corresponding video prompt to ElevenLabs / Runway / Sora-video to animate.
3. Save as `public/assets/redline-clips/NN-name.mp4` + matching `.prompt.txt`.
4. Wire into hero (currently uses single `redline-login-loop.mp4` — can rotate or compose 3 clips).

---

## Clip 1 — Invoice tunnel (forward push)

**Image prompt:**
> Cinematic dark fintech product render. Endless tunnel of floating black liquid-glass invoice cards, suspended in a deep graphite-black void. A vivid red automation rail (#ff4b3e) curves through the center of the tunnel like a glowing track. Subtle warm-white status dots (#f5f1ea) glow on a few cards. Reflections shimmer on a polished black studio floor. Shallow depth of field, Apple-level product film quality, 16:9 wide aspect, no humans, no readable text, no logos, no watermarks. Style: premium SaaS, deep black, vivid red glow, subtle violet edge reflection.

**Video prompt (after image generated):**
> Animate this reference image into a 5-second seamless loop. Camera glides forward through the floating glass invoice cards. Cards drift slightly past lens with shallow depth of field. Red line pulses from card to card like an automation path. Tiny warm-white status lights wake up sequentially on cards. Reflections ripple subtly across glass surfaces. Smooth, no jitter, no flicker, no fade. Style: Apple product film, deep black, warm white, Redline red, subtle violet reflection.

---

## Clip 2 — Chaos to paid (sorting transformation)

**Image prompt:**
> Cinematic dark fintech split scene. Left half: chaotic floating overdue invoice cards drifting at random angles, edges torn, faint red warning glyphs. Right half: clean grid of perfectly aligned paid invoice cards with soft white check-mark dots. A vivid red automation line (#ff4b3e) cuts vertically down the center, dividing chaos from order. Deep graphite-black studio floor with red reflections. No humans, no readable text, no logos. 16:9 wide aspect. Style: premium SaaS product film, liquid glass surfaces, Apple-level lighting, subtle warm-white accents.

**Video prompt:**
> Animate this 6-second product transformation. Left-side invoices drift, rotate, feel messy. Red line surges forward like a sorting force. Cards crossing the red line snap into a precise grid. White check marks pulse softly on completed cards. Red particles scatter across the black floor. Internal cuts: 0-1.5s close-up of chaotic overdue cards drifting; 1.5-3s red line sweeps through the mess; 3-4.5s cards align into a precise paid grid; 4.5-6s calm wide shot with organized cards and soft red reflection. No humans, no jitter, no flicker.

---

## Clip 3 — Pay-link activation (close macro)

**Image prompt:**
> Extreme macro shot of a single black liquid-glass invoice card floating in dark graphite void. A glowing red node (#ff4b3e) pulses in the lower-right corner of the card, suggesting a payment confirmation. Faint warm-white text-line indicators across the card surface (no readable text). Soft red rim-light glows around card edges. Shallow depth of field, premium product render, no humans, 16:9 wide. Style: Apple-level product photography, dark fintech, deep black, vivid red, subtle violet bounce-light.

**Video prompt:**
> Animate this 4-second macro clip. Camera slowly pushes in toward the glass card. Red node in the corner pulses three times — first soft, then bright, then a final confirmation flash. Warm-white text indicators light up sequentially top to bottom. Card surface ripples once subtly with a red reflection wave. End on a held shot with the red node steady-glowing. Smooth, calm, no jitter, no fade.

---

## Clip 4 (optional) — Reminder cascade

**Image prompt:**
> Cinematic top-down view of three black liquid-glass invoice cards arranged in a vertical timeline, connected by a glowing red automation line (#ff4b3e). First card has a soft warm-white "sent" dot. Middle card has an amber warning dot. Third card has a vivid red urgent dot. Dark graphite floor, subtle red reflections, premium SaaS product render, no humans, no readable text. 16:9 wide.

**Video prompt:**
> Animate this 5-second sequence. Red automation line pulses sequentially down the three cards: first card glows warm-white (sent), then amber on middle card (overdue warning), then vivid red on third card (final notice). Each transition smooth with a 1-second hold. Subtle camera drift downward following the line. End on a wide held shot.

---

## Clip 5 (optional) — Calm dashboard wide shot

**Image prompt:**
> Cinematic wide shot of an organized grid of 24 black liquid-glass invoice cards floating in a dark studio space. Each card has a small warm-white check dot indicating paid status. A subtle red horizontal line (#ff4b3e) runs across the bottom edge of the grid as a unifying accent. Deep graphite floor with soft red reflection, premium product render, Apple-level lighting, no humans, no readable text, no logos. 16:9 wide aspect.

**Video prompt:**
> Animate this 4-second calm hero loop. Cards remain steady. White check dots pulse very gently in a wave pattern across the grid. Red bottom line slowly brightens then dims in a 4-second breathing rhythm. Subtle red reflection on floor shimmers. Camera holds still. Use as ambient background loop on landing page hero.

---

## Style guard rails — apply to all prompts

ALWAYS include:
- Dark graphite (#08090b) background
- Vivid red (#ff4b3e) as accent only, not flooding the scene
- Warm white (#f5f1ea) for status dots / accents
- Liquid glass / matte black / studio reflections
- Premium fintech / Apple product film quality
- 16:9 wide aspect

NEVER include:
- Humans (any kind, any style — no anime, no realistic, no silhouettes)
- Readable text (especially no fake invoice numbers or company names)
- Logos / watermarks
- Bright colors outside the palette
- Comic / cartoon style
- Slow fades to black at end (must loop seamlessly)
