# Nightfall: Secret Roles — Visual Branding Package

App: **Nightfall: Secret Roles** (`com.dreamcrafterinnovations.nightfall`)
Tagline in `app.json`: *"The ultimate offline party game of deception, strategy, and survival."*

---

## Step 1 — App Analysis

**Category & niche**
Offline, pass-and-play social deduction party game (Werewolf/Mafia genre). The differentiator: instead of one fixed creature, the app ships 20+ swappable "villain themes" — classic horror icons (Werewolf, Vampire, Zombie, Mafia, Witch, Freddy, Jason, Demon, Wild Lion) plus a deep bench of world folklore villains (Hindi Shaitan, Tamil Poochandi, Telugu Pisachi, Korean Gumiho, Japanese Oni, Arabian Ifrit, Mexican La Llorona, Celtic Banshee, Kannada Vetala, Kerala Yakshi). Each theme swaps palette, role names, and flavor text.

**Primary purpose & key features**
- 4–16 players, one shared phone, no accounts/backend
- Role reveal → Night phase (narrator-guided) → Day phase → Voting → repeat until a side wins
- Six role archetypes re-skinned per theme (Villain, Villager, Seer, Healer, Hunter, Chief)
- Narrator/voice mode (`expo-speech`) so the app can read night instructions aloud
- Theme picker with an "International" toggle for the folklore set
- Built for iOS, Android, and web (Expo/React Native)

**Target audience**
Teens through young adults (roughly 13–35) who play party games at gatherings, sleepovers, and game nights. Skews toward South Asian / Indian users first (the folklore roster and bilingual roots) but designed to travel globally — the international theme set is explicitly built for broader appeal. Casual gamers, not hardcore — the tone is "fun scary," not horror-genre enthusiasts.

**Brand personality**
Playful-spooky, theatrical, campfire-story energy rather than genuine horror. Think haunted-house-at-a-carnival, not slasher film: dramatic and a little campy, self-aware ("Sweet dreams! Just kidding, please don't sleep."), inclusive of many cultures' monsters treated with a wink. Premium enough to not feel like a cheap flashlight-app clone.

**Visual style that fits**
Dark-mode-only moody minimalism: near-black backgrounds, one glowing accent color, high contrast, generous negative space. Iconography over illustration detail — emoji-scale symbols (moon, mask, flame) read at a glance the way the in-app role emoji do. Style sits between Material 3 dark theme and a mystical/supernatural poster aesthetic: flat vector shapes with a soft outer glow, not photorealism, not gore.

**Recommended color palette**
The app's own default (DEMON) palette is the strongest candidate for the app-level brand, since every other theme is a *variant* selected inside the app:
- Background / ink: `#0B0B1E` (near-black indigo)
- Primary / signature glow: `#FF8C00` amber-orange (already used for the icon, splash background, and primary buttons)
- Secondary accent: `#C0392B` blood red (danger/evil team)
- Supporting: soft moon-yellow `#FFF8DC` for highlights, muted lavender-grey `#9090B0` for secondary text
Two-tone (ink + amber) is what should carry the icon and splash — it survives being shrunk to 48px, and it's distinct from most competitors' green/red werewolf clichés.

**Competitor design trends**
Werewolf/Mafia-style party apps (Wolvesville, Town of Salem, Werewords, One Night Ultimate Werewolf companion apps, Jackbox-adjacent titles) commonly use: a single dramatic creature silhouette (wolf head, hooded figure) filling the icon frame, dark-to-purple gradients, moon or blood-drop motifs, bold slab or display serif logotype on the splash. Most commit hard to "werewolf" specifically in their branding.

**What should make this app stand out**
Because Nightfall isn't just a werewolf game — it's a rotating cast of world monsters — the icon shouldn't commit to any single creature (wolf, vampire, etc.). A **crescent moon paired with a glowing mask/eye motif** communicates "hidden identity, many faces" without over-promising one theme, and differentiates from the sea of wolf-head icons in this category.

---

## Step 2 — AI Image Generation Prompts

Each asset carries a shared **Prompt** (works in ChatGPT / GPT Image and in Gemini / Imagen), a dedicated **Meta Muse Image** brief, a negative prompt, recommended size, and style keywords.

How the three differ:

- **ChatGPT (GPT Image)** — takes descriptive paragraph prompts; exclusions must live inside the prompt body, there is no separate negative field. Reliable at short intentional strings now.
- **Gemini (Imagen / Nano Banana)** — takes tighter, tag-forward phrasing; ignores negative lists natively, so fold exclusions in as positive constraints. Weakest of the three at typography — keep text out of its frames.
- **Meta Muse Image** — agentic: it reasons before generating, writes and executes code to place exact geometry, and self-refines its draft. Give it hard numeric specs and exact strings, then close with a self-check instruction. It renders legible, correctly spelled display type.

**Why this matters more here than in most of the portfolio.** Nightfall's splash and store banner both want the wordmark **baked in** — a glowing amber "NIGHTFALL" in a bold display face is a large part of the key art, not an afterthought composited later. That is exactly the job Imagen fails and Muse now does well. Use Muse for anything with the wordmark in frame.

**One content caution.** The brand is playful-spooky, "haunted house at a carnival," not horror. Muse Image searches the web to ground detail on knowledge-intensive prompts, and prompts naming folklore villains (Gumiho, Yakshi, La Llorona, Pisachi) will pull it toward genuinely frightening or culturally specific horror imagery, and occasionally toward gore. **Every Muse prompt below forbids web search for villain reference and names the tone constraint.** Keep it — the app is rated for teens and the folklore roster is meant to be treated with a wink, not reproduced as horror art.

Muse Image also embeds an invisible **Content Seal** provenance watermark; fine for store art, but produce the final elsewhere if you need a provably unwatermarked master.

### 1. App Icon

**Prompt:**
"A minimalist app icon for a mobile social deduction party game called Nightfall. A single glowing amber-orange crescent moon centered on a deep near-black indigo background (#0B0B1E), with a small stylized mask or narrowed eye shape subtly integrated into the lower curve of the moon, suggesting a hidden watcher in the night. Soft outer glow around the moon in warm orange (#FF8C00), clean flat vector shapes, no gradients other than the glow, high contrast, perfectly centered composition with even padding on all sides, bold and simple enough to read clearly at 48px. Modern 2024-2025 iOS/Android icon design language."

**Meta Muse Image prompt:**
"Design a production app icon for 'Nightfall: Secret Roles,' an offline pass-and-play social deduction party game with 20+ swappable villain themes. Hard specs: 1024×1024, square, full-bleed background `#0B0B1E` (near-black indigo). Single centred subject: a crescent moon in `#FF8C00`, formed by subtracting a circle of 62% diameter from a circle of 74% canvas diameter, offset so the crescent's waist is 15% of the canvas wide and its horns point right. Integrated into the crescent's lower inner curve, a narrowed eye shape — a lens formed by two arcs meeting at points, 20% of canvas width — cut out of the amber as negative space so the indigo shows through, reading as a watcher concealed in the moon rather than a separate object stuck on top. Around the crescent, one soft outer glow in `#FF8C00` at 24% opacity, radius falloff 9% of canvas — a single light source, nothing more. Place the geometry with code so the crescent's arcs are true circles and the eye sits on the crescent's inner curve, not floating. Nothing within 13% of any edge so Android adaptive-icon masking cannot clip it. Flat vector: no gradient other than the single glow, no bevel, no drop shadow, no border. No text, letters or numerals. **Hard constraints: do not search the web for werewolf, monster or folklore reference imagery. Include no wolf, no werewolf, no fangs, no claws, no blood, no gore, no skull, no cartoon face with cute eyes, and no photorealism.** The differentiation logic matters: this game rotates through 20+ villains from many cultures, so the icon must commit to none of them — every competitor in this category puts a wolf head in the frame, and doing the same erases the one thing that makes this app different. Before returning, downscale to 48×48 and confirm the eye is still readable as a distinct shape inside the crescent rather than dissolving into a notch; if it dissolves, enlarge the eye and increase the crescent's waist, then regenerate."

**Negative prompt:**
"no text, no letters, no wordmark, no realistic photo, no gore, no blood, no full wolf or werewolf illustration, no busy background, no multiple objects competing for attention, no drop shadows, no 3D bevels, no cartoon eyes/cute face, no clutter, no watermark, no frame or border, not photorealistic"

**Recommended size / aspect ratio:** 1024×1024 px, 1:1 (export down to iOS 1024px master + Android adaptive icon foreground layer 432×432 safe zone)

**Style keywords:** flat vector, minimal, glow effect, Material 3 dark, iconic, single focal shape, high contrast, premium mobile icon

---

### 2. Splash Screen — Dark Theme (primary)

**Prompt:**
"A premium mobile app splash screen, vertical phone orientation, for a party game called Nightfall: Secret Roles. Background is a deep near-black indigo (#0B0B1E) gradient fading to pure black at the edges, with faint scattered stars and a thin layer of ground fog near the bottom. Centered in the upper-middle third: a glowing amber-orange crescent moon icon (matching the app's mask/eye moon logo mark) with a soft radiating glow. Below the moon, empty space reserved for the app wordmark 'NIGHTFALL' in a bold modern display font with amber-orange color and a subtle outer glow, and a smaller subtitle line below it reserved for 'Secret Roles.' Faint silhouettes of small huts or trees along the very bottom edge suggest a sleeping village at night. Clean, uncluttered, cinematic, lots of negative space, premium mobile game aesthetic."

**Meta Muse Image prompt:**
"Produce a portrait mobile splash screen for 'Nightfall: Secret Roles,' an offline social deduction party game. Canvas 1284×2778. Background: a radial gradient from `#0B0B1E` at the centre to `#000000` at the corners, smooth with no banding. Across the upper 60%, scatter roughly 80 star points in `#FFF8DC` at 6–24% opacity, sizes 1–3px, irregular. Centred at 36% of the frame height, place the brandmark: the amber `#FF8C00` crescent moon with the narrowed-eye shape cut out of its lower inner curve as negative space, crescent height 400px, with one soft `#FF8C00` glow at 26% opacity around it. 96px below the moon, set the wordmark 'NIGHTFALL' in a bold condensed geometric display face, all caps, `#FF8C00`, cap height ~86px, letter-spacing +0.1em, with a subtle `#FF8C00` outer glow at 30% opacity. 26px beneath, set 'SECRET ROLES' in the same family at ~30px, all caps, letter-spacing +0.3em, colour `#9090B0`. Along the bottom 9% of the frame, a flat silhouette skyline in `#000000` of six or seven simple peaked hut roofs and two bare tree shapes, plus a thin band of `#9090B0` fog at 12% opacity drifting just above it. One light source only — everything is lit by the moon. Keep the moon and both text lines inside the central 60% of the frame vertically. **Hard constraints: do not search the web for monster or folklore reference imagery. Include no wolf, no werewolf, no creature, no figures, no faces, no fangs, no claws, no blood or gore, and no photorealism.** Tone is campfire-story spooky and inviting, never genuine horror. Verify before returning: 'NIGHTFALL' and 'SECRET ROLES' are spelled exactly as given with no doubled or dropped letters; the crescent's eye cut-out is clean; there is exactly one light source; and the gradient shows no banding."

**Negative prompt:**
"no readable text baked into the image except where specified, no realistic gore, no photorealistic people, no busy detailed illustration, no clutter, no bright daylight colors, no cartoonish style, no watermark, no logos other than the described moon mark, no low contrast, no multiple light sources"

**Recommended size / aspect ratio:** 1284×2778 px (9:19.5, iPhone splash master) — export/crop variants for standard 1080×1920 (9:16) Android

**Style keywords:** cinematic minimal, dark mode, glow, night atmosphere, premium, flat with subtle gradient, mobile game splash

---

### 3. Splash Screen — Light Theme (alt / marketing use)

**Prompt:**
"A premium mobile app splash screen companion to a dark-mode night version, same composition, vertical phone orientation. Background is a soft dawn gradient from warm cream (#FFF8DC) at top to pale warm grey at the bottom, evoking the moment night breaks into morning after the game ends. Centered: the same crescent moon mask/eye logo mark, now rendered in deep indigo (#0B0B1E) with a soft amber-orange (#FF8C00) glow outline instead of full glow, so it still reads as the same brand mark. Empty space reserved below for the 'NIGHTFALL' wordmark in deep indigo. Faint pale silhouettes of huts/trees near the bottom edge, softer and lighter than the dark version. Clean, minimal, premium mobile aesthetic, subtle not saccharine."

**Meta Muse Image prompt:**
"Produce the light-theme companion to the Nightfall splash screen — the moment night breaks into morning after a game ends. Canvas 1284×2778. Background: a vertical gradient from warm cream `#FFF8DC` at the top to a pale warm grey `#DAD5CC` at the bottom, smooth with no banding, no stars. Centred at 36% of the frame height, the same crescent moon mark with the narrowed-eye cut-out, now rendered as a solid `#0B0B1E` shape with a soft `#FF8C00` glow outline at 40% opacity tracing its outer edge only — same silhouette as the dark variant so it reads as one brand mark. Crescent height 400px. 96px below, the wordmark 'NIGHTFALL' in the same bold condensed display face, all caps, `#0B0B1E`, cap height ~86px, letter-spacing +0.1em, no glow. 26px beneath, 'SECRET ROLES' at ~30px, all caps, letter-spacing +0.3em, `#5A5A72`. Along the bottom 9%, the same hut-and-tree skyline silhouette but in `#B8B2A6` rather than black, softer and lighter. **Hard constraints: do not search the web for monster or folklore reference imagery. Include no wolf, no creature, no figures, no faces, no gore, no photorealism.** Subtle, not saccharine — this is dawn, not a sunrise poster. Verify before returning: the crescent silhouette exactly matches the dark variant's geometry; both strings are spelled correctly; and the gradient shows no banding."

**Negative prompt:**
"no bright saturated colors, no cartoon style, no clutter, no realistic photography, no gore, no busy background detail, no watermark, no extra logos, no harsh shadows"

**Recommended size / aspect ratio:** 1284×2778 px (9:19.5), same crop set as dark version

**Style keywords:** soft minimal, dawn palette, premium, flat with soft gradient, brand-consistent light variant

---

### 4. Google Play Feature Graphic (1024×500)

**Prompt:**
"A wide horizontal banner image, 1024 by 500 pixels, for the Google Play Store feature graphic of a party game called Nightfall: Secret Roles. Deep near-black indigo background (#0B0B1E) with a large glowing amber-orange crescent moon positioned in the upper right, casting warm light across the scene. In silhouette across the lower half: a circle of 6-8 diverse people sitting together at night as if playing a party game, rendered as simple flat dark silhouettes with just rim-lighting from the moon, no facial detail. Faint fog and a few small hut/tree silhouettes ground the scene at night. Left third of the image kept relatively open/darker to leave room for the game logo and title text to be added separately. Cinematic, moody, inviting rather than scary, premium mobile game store art."

**Meta Muse Image prompt:**
"Create a Google Play feature graphic for 'Nightfall: Secret Roles,' an offline pass-and-play social deduction party game for 4–16 players. Exact canvas 1024×500, no transparency. Background `#0B0B1E` deepening to `#000000` toward the lower left, smooth with no banding, with roughly 40 star points in `#FFF8DC` at 6–20% opacity across the upper area. Upper right (centred near x=830, y=140): the amber `#FF8C00` crescent moon with the narrowed-eye cut-out, height 230px, with a soft `#FF8C00` glow at 26% opacity — the single light source in the frame. Across the lower half, a flat silhouette in `#000000` of seven simple seated human forms arranged in a shallow arc, seen from behind and slightly below, each a plain rounded shape with **no facial features, no fingers, no detail of any kind** — only a thin `#FF8C00` rim-light at 45% opacity along the edge of each form facing the moon. Behind them, three or four small peaked hut roofs and two bare trees in the same flat black, plus a thin `#9090B0` fog band at 10% opacity. **Keep the left third (x < 340) noticeably darker and free of silhouettes** so the store's overlaid title has somewhere to sit. Do not render any text in this asset. **Hard constraints: do not search the web for monster, werewolf or folklore reference imagery. Include no wolf, no creature, no fangs, no claws, no blood or gore, no facial detail, and no photorealism.** Tone: moonlit and inviting, a group enjoying a game at night — never menacing, never a horror poster. Before returning, confirm the left third is clear, confirm none of the seven silhouettes has any facial or hand detail, and confirm there is exactly one light source."

**Negative prompt:**
"no visible text or logos baked in, no gore, no realistic detailed faces, no bright daylight, no busy clutter, no cartoon proportions, no watermark, no stock-photo look, no low resolution artifacts"

**Recommended size / aspect ratio:** 1024×500 px exactly (Google Play required feature graphic spec)

**Style keywords:** cinematic silhouette, dark atmospheric, flat illustration, moonlit, premium store art, wide banner composition

---

### 5. Store Banner (App Store Promo / Cross-Platform Marketing)

A wider promotional banner distinct from the Play feature graphic — sized for Apple Search Ads / App Store promotional imagery, website hero sections, and social sharing, with the logo lockup baked directly into the image (the Play feature graphic above intentionally leaves that space empty for separately-added text).

**Prompt:**
"A wide cinematic promotional banner, 1920 by 1080 pixels, for a mobile party game called Nightfall: Secret Roles. Deep near-black indigo background (#0B0B1E) with a large glowing amber-orange crescent moon positioned off-center to the right, its mask/eye motif visible in the lower curve, casting warm rim-light across the scene. Thin fog drifting near the bottom, faint stars scattered across the upper background. In silhouette along the bottom edge: a small cluster of huts and bare trees suggesting a sleeping village at night. Centered-left, clear open space where the wordmark 'NIGHTFALL' appears in a bold modern display font in amber-orange with a soft glow, and directly below it in smaller text 'SECRET ROLES' in muted white, both baked into the composition with generous breathing room around them — not cramped. Balanced, premium, cinematic key-art feel suitable for a store banner or website hero image."

**Meta Muse Image prompt:**
"Create a wide cinematic key-art banner for 'Nightfall: Secret Roles,' an offline social deduction party game. Canvas 1920×1080. Background `#0B0B1E` deepening to `#000000` at the edges, smooth with no banding, with roughly 110 star points in `#FFF8DC` at 5–24% opacity across the upper two-thirds. Right of centre (near x=1340, y=340): the amber `#FF8C00` crescent moon with the narrowed-eye cut-out visible in its lower inner curve, height 420px, with one soft `#FF8C00` glow at 26% opacity — the only light source. Along the bottom 12%, a flat `#000000` silhouette of a sleeping village: six peaked hut roofs of varying heights and three bare trees, with a `#9090B0` fog band at 12% opacity drifting just above. Centre-left lockup (centred near x=620): 'NIGHTFALL' in a bold condensed geometric display face, all caps, `#FF8C00`, cap height ~130px, letter-spacing +0.1em, with a soft `#FF8C00` outer glow at 30%; 28px below it 'SECRET ROLES' in the same family, all caps, `#F0F0FF`, ~44px, letter-spacing +0.32em. Give the lockup generous breathing room — at least 90px clear on every side, never cramped against the moon. The lockup must fit inside the region x 200–1080, y 340–720 so the banner crops cleanly to 1200×628 and to a 2:1 2400×1200 without clipping any letter. **Hard constraints: do not search the web for monster, werewolf or folklore reference imagery. Include no wolf, no creature, no figures, no faces, no fangs, no blood or gore, no photorealism, and no brand mark other than the crescent and the wordmark.** Tone: cinematic and campfire-spooky, inviting rather than frightening. Before returning, proofread 'NIGHTFALL' and 'SECRET ROLES' letter by letter for doubled or dropped characters, simulate both crops and confirm no letter is lost, and confirm the wordmark holds at least 4.5:1 contrast against the background behind it."

**Negative prompt:**
"no extra logos or brand marks other than the described moon mark and wordmark, no gore or blood, no realistic photographic people, no busy clutter, no cartoonish style, no low contrast text, no watermark, no stock-photo look, no distorted or misspelled lettering"

**Recommended size / aspect ratio:** 1920×1080 px (16:9) — also export a 1200×628 crop for social/link-preview use and a 2400×1200 (2:1) crop if Apple promotional imagery specs require it

**Style keywords:** cinematic key art, dark atmospheric, wordmark baked in, premium hero banner, moonlit glow, wide landscape composition, brand-consistent

---

### 6. Google Play Screenshots (8 concepts)

General settings for all 8: vertical phone frame, 1080×1920 px (9:16) or 1242×2688 px for larger devices, dark theme background matching `#0B0B1E`/`#FF8C00` brand colors, consistent logo lockup treatment top or bottom of each shot, headline in bold display font + one line of supporting copy, device screenshot mockup inset in the lower two-thirds.

**Screenshot 1 — Hook / App Identity**
Headline: "Every Night, A New Monster"
Supporting text: "20+ villains to unmask — from Werewolves to world folklore legends."
Visual: App home screen mockup showing the theme carousel (Werewolf, Vampire, Mafia icons visible), moon glow background, logo lockup at top.

**Screenshot 2 — Core Gameplay Loop**
Headline: "Pass the Phone. Play in the Dark."
Supporting text: "One device, 4–16 players — no accounts, no internet needed."
Visual: Illustrated circle of silhouetted friends passing a glowing phone at night, app UI mockup of the Role Reveal screen inset.

**Screenshot 3 — Role Variety**
Headline: "Six Roles. Endless Strategy."
Supporting text: "Villager, Seer, Healer, Hunter, Chief, or the Villain themselves."
Visual: Grid of the 6 role emoji/icons glowing against the dark background, role card mockup from the app.

**Screenshot 4 — Theme Showcase (flagship differentiator)**
Headline: "From Werewolves to World Legends"
Supporting text: "Shaitan, Gumiho, Oni, La Llorona, Vetala — monsters from around the world."
Visual: A mosaic/grid of 8-10 small theme icons (moon, fox, mask, fire) each tinted in their theme color, fanned out like a deck of cards.

**Screenshot 5 — Narrator Feature**
Headline: "Let the App Be Your Narrator"
Supporting text: "Built-in voice guide walks the group through every night phase."
Visual: Night Phase screen mockup with a glowing sound-wave/speech icon animation graphic overlaid.

**Screenshot 6 — Day & Voting Drama**
Headline: "Debate. Accuse. Vote."
Supporting text: "Morning reveals who fell in the night — now the village decides."
Visual: Voting screen mockup with player avatars and a dramatic red vote-tally glow.

**Screenshot 7 — Setup Simplicity**
Headline: "Set Up in Under a Minute"
Supporting text: "Add players, pick a theme, and you're ready to play."
Visual: Setup screen mockup showing player name/avatar entry with playful glow accents.

**Screenshot 8 — Win Moment / Payoff**
Headline: "Every Round Ends With a Reveal"
Supporting text: "See everyone's secret role when the game is over."
Visual: Game Over screen mockup with a triumphant amber glow burst and full role reveal grid.

**Shared Meta Muse Image template (all 8)** — substitute the slide's `[HEADLINE]`, `[SUPPORTING]` and `[SCREEN]` from the list above. Use this one parameterised brief rather than eight prose prompts; that is what makes the strip pixel-consistent.

> Build one slide of an 8-slide Google Play screenshot set for "Nightfall: Secret Roles," an offline pass-and-play social deduction party game. Canvas 1080×1920. Background: a radial gradient from `#0B0B1E` at the upper centre to `#000000` at the corners, smooth with no banding, with roughly 50 star points in `#FFF8DC` at 6–20% opacity across the upper third. At the very top, a small brand lockup: the amber `#FF8C00` crescent moon mark, 84px tall, with "NIGHTFALL" beside it in a bold condensed display face, all caps, `#FF8C00`, cap height ~34px. Headline "[HEADLINE]" in the same display face, `#F0F0FF`, ~62px, centred, 150px below the lockup, maximum two lines. Supporting line "[SUPPORTING]" in a clean sans-serif Regular, `#9090B0`, ~28px, centred, 22px below the headline. Below that, a realistic slim-bezel smartphone mockup 700px wide, centred, bottom-aligned so the lower 9% of the device is cropped by the canvas edge, with a soft `#FF8C00` glow at 14% opacity behind it. On the device screen render: [SCREEN] — dark UI on `#0B0B1E`, cards with 16px radius and `#1A1A38` surfaces, amber `#FF8C00` primary accents, `#C0392B` used on at most one element, body text `#F0F0FF`, secondary `#9090B0`. **Every string on the device screen must be real, legible and correctly spelled** — no lorem ipsum, no garbled glyphs. **Hard constraints: do not search the web for monster, werewolf or folklore reference imagery. Include no wolf, no creature illustration, no photographic faces, no fangs, no claws, no blood or gore. Where a slide references world-folklore villains by name, represent them only as abstract tinted icons — a moon, a mask, a flame, a simple animal silhouette — never as rendered depictions of the actual legend.** Tone is playful-spooky, teen-appropriate, carnival haunted-house rather than horror. Keep the lockup, headline baseline, supporting-line baseline, device width and device y-position pixel-identical across all eight slides. Before returning, proofread every rendered string including those inside the device screen, and confirm no frame contains a creature depiction or facial detail.

**Negative prompt (all 8):** "no real brand logos other than Nightfall's own mark, no realistic photography of people's faces, no gore or blood, no cluttered layouts, no low contrast text, no mismatched color palettes between screenshots, no watermark"

**Style keywords (all 8):** Material 3 dark, flat minimal UI mockup, consistent amber-on-indigo brand system, premium App Store screenshot template, glow accents, bold sans-serif headline type

---

## Consistency Checklist
- Same crescent-moon-mask mark on icon, splash, feature graphic, and every screenshot's logo lockup
- Same two-tone palette everywhere: `#0B0B1E` ink + `#FF8C00` amber glow, with `#C0392B` red reserved for danger/vote/kill moments only
- No baked-in text on the icon; text only on splash, feature graphic, and screenshots where specified
- Keep all creature-specific art (wolf, vampire, etc.) out of app-level branding — those live inside the app's theme picker, not on the store-facing identity

## Production notes

- **The folklore-search guardrail is the one to watch.** Muse Image searches the web to ground detail on knowledge-intensive prompts, and any prompt naming Gumiho, Yakshi, Pisachi, La Llorona or Oni will pull it toward genuine horror art and, occasionally, toward gore. This app is aimed at 13–35 and treats each culture's monster with a wink; a store asset that reproduces a frightening or culturally loaded depiction is both off-brand and a ratings risk. Every Muse prompt above forbids web search for villain reference and requires abstract tinted icons instead. Inspect outputs for creatures that crept in.
- **Silhouettes must stay featureless.** The feature graphic and several screenshot concepts include human silhouettes. All three engines will add faces, fingers and expressions if not explicitly stopped. The Muse briefs specify "no facial features, no fingers, no detail" and require a verification pass — keep that, because a rim-lit group of faceless shapes reads as inviting, while the same group with faces reads as a horror poster.
- **Text rendering, updated 2026-07-31.** This brand wants the wordmark baked into the splash and the banner — glowing amber "NIGHTFALL" is a large part of the key art. Imagen cannot do that reliably; GPT Image manages short strings; Muse Image sets it accurately. Use Muse for the splash pair and the store banner, and reserve the art-only route for the Play feature graphic, where the store overlays its own title anyway.
- **Reference-image chaining.** Generate the icon first, then attach it as a reference image for the splash pair, feature graphic, banner and screenshot lockups. Muse composes from multiple references, which holds the crescent's waist width and eye placement constant across the set far better than re-describing it each time.
- **Colour drift.** All three engines pull `#FF8C00` toward red-orange and `#0B0B1E` toward flat black, which kills the indigo cast that keeps the brand from feeling like every other black-and-orange party game. Sample and correct.
- **Content Seal.** Muse Image embeds an invisible provenance watermark. Fine for store listings; produce a press-kit master elsewhere if you need one demonstrably clean.
- **`app.json` is correct:** `splash.backgroundColor` and `android.adaptiveIcon.backgroundColor` are both `#0B0B1E`, matching the DEMON default palette. Leave them.
