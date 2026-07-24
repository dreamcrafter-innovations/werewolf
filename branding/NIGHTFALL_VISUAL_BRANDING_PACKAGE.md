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

Use these directly in ChatGPT (DALL·E), Gemini, or Midjourney/Muse. Each includes a main prompt, a negative prompt, recommended size, and style keywords.

### 1. App Icon

**Prompt:**
"A minimalist app icon for a mobile social deduction party game called Nightfall. A single glowing amber-orange crescent moon centered on a deep near-black indigo background (#0B0B1E), with a small stylized mask or narrowed eye shape subtly integrated into the lower curve of the moon, suggesting a hidden watcher in the night. Soft outer glow around the moon in warm orange (#FF8C00), clean flat vector shapes, no gradients other than the glow, high contrast, perfectly centered composition with even padding on all sides, bold and simple enough to read clearly at 48px. Modern 2024-2025 iOS/Android icon design language."

**Negative prompt:**
"no text, no letters, no wordmark, no realistic photo, no gore, no blood, no full wolf or werewolf illustration, no busy background, no multiple objects competing for attention, no drop shadows, no 3D bevels, no cartoon eyes/cute face, no clutter, no watermark, no frame or border, not photorealistic"

**Recommended size / aspect ratio:** 1024×1024 px, 1:1 (export down to iOS 1024px master + Android adaptive icon foreground layer 432×432 safe zone)

**Style keywords:** flat vector, minimal, glow effect, Material 3 dark, iconic, single focal shape, high contrast, premium mobile icon

---

### 2. Splash Screen — Dark Theme (primary)

**Prompt:**
"A premium mobile app splash screen, vertical phone orientation, for a party game called Nightfall: Secret Roles. Background is a deep near-black indigo (#0B0B1E) gradient fading to pure black at the edges, with faint scattered stars and a thin layer of ground fog near the bottom. Centered in the upper-middle third: a glowing amber-orange crescent moon icon (matching the app's mask/eye moon logo mark) with a soft radiating glow. Below the moon, empty space reserved for the app wordmark 'NIGHTFALL' in a bold modern display font with amber-orange color and a subtle outer glow, and a smaller subtitle line below it reserved for 'Secret Roles.' Faint silhouettes of small huts or trees along the very bottom edge suggest a sleeping village at night. Clean, uncluttered, cinematic, lots of negative space, premium mobile game aesthetic."

**Negative prompt:**
"no readable text baked into the image except where specified, no realistic gore, no photorealistic people, no busy detailed illustration, no clutter, no bright daylight colors, no cartoonish style, no watermark, no logos other than the described moon mark, no low contrast, no multiple light sources"

**Recommended size / aspect ratio:** 1284×2778 px (9:19.5, iPhone splash master) — export/crop variants for standard 1080×1920 (9:16) Android

**Style keywords:** cinematic minimal, dark mode, glow, night atmosphere, premium, flat with subtle gradient, mobile game splash

---

### 3. Splash Screen — Light Theme (alt / marketing use)

**Prompt:**
"A premium mobile app splash screen companion to a dark-mode night version, same composition, vertical phone orientation. Background is a soft dawn gradient from warm cream (#FFF8DC) at top to pale warm grey at the bottom, evoking the moment night breaks into morning after the game ends. Centered: the same crescent moon mask/eye logo mark, now rendered in deep indigo (#0B0B1E) with a soft amber-orange (#FF8C00) glow outline instead of full glow, so it still reads as the same brand mark. Empty space reserved below for the 'NIGHTFALL' wordmark in deep indigo. Faint pale silhouettes of huts/trees near the bottom edge, softer and lighter than the dark version. Clean, minimal, premium mobile aesthetic, subtle not saccharine."

**Negative prompt:**
"no bright saturated colors, no cartoon style, no clutter, no realistic photography, no gore, no busy background detail, no watermark, no extra logos, no harsh shadows"

**Recommended size / aspect ratio:** 1284×2778 px (9:19.5), same crop set as dark version

**Style keywords:** soft minimal, dawn palette, premium, flat with soft gradient, brand-consistent light variant

---

### 4. Google Play Feature Graphic (1024×500)

**Prompt:**
"A wide horizontal banner image, 1024 by 500 pixels, for the Google Play Store feature graphic of a party game called Nightfall: Secret Roles. Deep near-black indigo background (#0B0B1E) with a large glowing amber-orange crescent moon positioned in the upper right, casting warm light across the scene. In silhouette across the lower half: a circle of 6-8 diverse people sitting together at night as if playing a party game, rendered as simple flat dark silhouettes with just rim-lighting from the moon, no facial detail. Faint fog and a few small hut/tree silhouettes ground the scene at night. Left third of the image kept relatively open/darker to leave room for the game logo and title text to be added separately. Cinematic, moody, inviting rather than scary, premium mobile game store art."

**Negative prompt:**
"no visible text or logos baked in, no gore, no realistic detailed faces, no bright daylight, no busy clutter, no cartoon proportions, no watermark, no stock-photo look, no low resolution artifacts"

**Recommended size / aspect ratio:** 1024×500 px exactly (Google Play required feature graphic spec)

**Style keywords:** cinematic silhouette, dark atmospheric, flat illustration, moonlit, premium store art, wide banner composition

---

### 5. Store Banner (App Store Promo / Cross-Platform Marketing)

A wider promotional banner distinct from the Play feature graphic — sized for Apple Search Ads / App Store promotional imagery, website hero sections, and social sharing, with the logo lockup baked directly into the image (the Play feature graphic above intentionally leaves that space empty for separately-added text).

**Prompt:**
"A wide cinematic promotional banner, 1920 by 1080 pixels, for a mobile party game called Nightfall: Secret Roles. Deep near-black indigo background (#0B0B1E) with a large glowing amber-orange crescent moon positioned off-center to the right, its mask/eye motif visible in the lower curve, casting warm rim-light across the scene. Thin fog drifting near the bottom, faint stars scattered across the upper background. In silhouette along the bottom edge: a small cluster of huts and bare trees suggesting a sleeping village at night. Centered-left, clear open space where the wordmark 'NIGHTFALL' appears in a bold modern display font in amber-orange with a soft glow, and directly below it in smaller text 'SECRET ROLES' in muted white, both baked into the composition with generous breathing room around them — not cramped. Balanced, premium, cinematic key-art feel suitable for a store banner or website hero image."

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

**Negative prompt (all 8):** "no real brand logos other than Nightfall's own mark, no realistic photography of people's faces, no gore or blood, no cluttered layouts, no low contrast text, no mismatched color palettes between screenshots, no watermark"

**Style keywords (all 8):** Material 3 dark, flat minimal UI mockup, consistent amber-on-indigo brand system, premium App Store screenshot template, glow accents, bold sans-serif headline type

---

## Consistency Checklist
- Same crescent-moon-mask mark on icon, splash, feature graphic, and every screenshot's logo lockup
- Same two-tone palette everywhere: `#0B0B1E` ink + `#FF8C00` amber glow, with `#C0392B` red reserved for danger/vote/kill moments only
- No baked-in text on the icon; text only on splash, feature graphic, and screenshots where specified
- Keep all creature-specific art (wolf, vampire, etc.) out of app-level branding — those live inside the app's theme picker, not on the store-facing identity
