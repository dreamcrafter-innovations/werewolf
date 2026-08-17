# Nightfall: Secret Roles — improvement actions

*Independent store-side review, 16 August 2026. Read `../PARTY_GAMES_MARKET_CONTEXT.md` first.*

**Repo:** `werewolf/` · **Store name:** Nightfall: Secret Roles · **Version:** 1.0.0 · **Bundle:** `com.dreamcrafterinnovations.nightfall`

Posture for this doc: **conservative on cuts.** Nothing here proposes deleting a working feature. Where something should be de-emphasised rather than removed, it says so.

---

## Verified current state

Read from the code on 16 Aug 2026, not from the plan documents.

| Aspect | Actual state |
|---|---|
| Navigation | `@react-navigation` native-stack + bottom-tabs. 11 screens: Home, Setup, RoleReveal, Night, Day, Vote, GameOver, HowToPlay, Daily, Leaderboard, Settings |
| Offline | **Fully offline.** No fetch, no sockets. Firebase analytics/crashlytics only |
| Content | 11 roles (`src/data/roles.js`), villain themes (`villainThemes.js`, 56KB), badges, particles |
| Languages | **English only.** `src/data/languages.js` exports exactly one entry |
| Narrator | `expo-speech` TTS narrator, user-tunable rate/pitch, off by default |
| Monetization | **None.** No IAP, no ads, no purchase code anywhere |
| Players | 4–16 supported |
| Sharing | `react-native-view-shot` + `ResultShareCard` on Game Over |
| Persistence | AsyncStorage: profiles, settings, session stats, all-time stats, daily challenge |
| Expo SDK | 55 (RN 0.83.2) — one major behind current 57 |
| **Store assets** | **`assets/` contains only `README.txt` reading "Place icon.png, splash.png, adaptive-icon.png here"** |

---

## P0 — Blockers. Nothing else matters until these are done.

### P0.1 · The app cannot build. There are no assets.

`app.json` references `./assets/icon.png`, `./assets/splash.png` and `./assets/adaptive-icon.png`. **None of those files exist.** The directory contains a single README placeholder. Any `eas build` will fail at the asset resolution step.

**Action:** generate and commit the full asset set per `branding/NIGHTFALL_VISUAL_BRANDING_PACKAGE.md`:
- `icon.png` — 1024×1024, no alpha
- `adaptive-icon.png` — 432×432 foreground inside the 264px safe circle
- `splash.png` — 1284×2778, lockup within centre-safe 60%
- `favicon.png` — referenced by `app.json` `web.favicon`

**Verify:** `npx expo prebuild --clean` completes without asset errors, then confirm all four files are non-zero and correctly dimensioned.

### P0.2 · Icon must be tested at 29px before it is accepted

Nightfall's identity is a crescent moon in amber `#FF8C00` on near-black `#0B0B1E`. Amber-on-black is the highest-contrast pairing in the portfolio and should survive downscaling — but a thin crescent will not. **Render the candidate icon at 29×29 and 48×48 and look at it before committing.** If the crescent disappears, thicken it; do not add detail.

### P0.3 · Nightfall vs Ruse must not converge

Per `../PORTFOLIO_BRAND_DIFFERENTIATION.md`, these are the highest commercial-risk pair in the portfolio: two offline pass-the-phone social deduction games from one studio competing for the same shelf. Current separation is 290° of accent hue (amber `#FF8C00` vs magenta `#F020A0`) plus register — Nightfall nocturnal and spooky, Ruse bright and mischievous.

**Action:** treat this as a hard constraint on every generated asset. If any Nightfall asset comes back warm-bright or playful, regenerate. If any Ruse asset comes back dark-moody, regenerate. Add a one-line check to whatever asset review step exists.

---

## P1 — High impact

### P1.1 · Ship Hindi. Then Tamil and Telugu. This is the single highest-value content change.

Nightfall is English-only in a portfolio where Ruse ships nine languages and Dumb Charades ships four. Werewolf/Mafia is culturally native to India — it is played constantly at college fests, hostel nights and corporate offsites — and there is no localized offline Mafia moderator on the Play Store.

The language infrastructure already exists: `src/data/strings.js` and `src/context/LanguageContext.js` are built for multiple languages, `languages.js` just has one entry. **The work is content, not architecture.**

Order: **Hindi → Tamil → Telugu → Kannada → Malayalam → Bengali → Marathi.**

Two things that must be got right, because the competitor is getting them wrong (see the Armenian review quoted in the market context doc):

- **Re-author, do not translate.** Role names carry cultural weight. "Seer" is not a Hindi concept; *jyotishi* or *tantrik* is. The `DON` role already in `roles.js` is exactly the right instinct — a Mafia-native Indian archetype. Extend that thinking to a full India role set rather than translating the European ones.
- **The narrator must speak the same language.** `expo-speech` supports Hindi, Tamil and Telugu voices on both platforms. A Hindi UI with an English narrator voice is worse than English throughout.

**Effort:** ~1 day of engineering per language once the first is done; the cost is translation and cultural review.

### P1.2 · The narrator is the standout feature and it is switched off

`useSpeech.js` defaults `narratorEnabled` to `false`. A TTS narrator that reads the night phase aloud is the one thing Nightfall has that the entire competitive set lacks — Werewolf Master, Mafia Party, Mobile Werewolf are all silent role-dealers. **It is the reason to install this app instead of those, and a first-time user will never discover it.**

Three changes, in order of value:

1. **Default it on.** A user who dislikes it turns it off in Settings in five seconds. A user who never finds it churns.
2. **Offer it during the first game, not in Settings.** On the first Night screen, a single card: *"Let Nightfall narrate? [Yes, narrate] [Stay silent]"*. Chosen once, remembered.
3. **Lead with it in the store listing.** First screenshot, first line of the description, first three seconds of the preview video. "The app runs the game. Nobody has to be the moderator."

That last line is also the strongest positioning statement Nightfall has. In every real Mafia game one person is stuck moderating and doesn't get to play. **Nightfall's promise is "everybody plays."** Nothing in the current listing says that.

**Effort:** half a day. Highest value-to-effort ratio in this document.

### P1.3 · Setup is the abandonment point — add saved groups to the front

`SetupScreen.js` supports groups (`activeGroup` state exists) but typing 8–16 names on a phone keyboard while the group waits is the highest-friction moment in the product, and 16-player support makes it worse than the competition rather than better.

**Actions:**
- **Quick Start on Home** — one tap into a 6-player game with default names (Player 1…6) and a balanced role loadout. Names can be edited later or never. This should be the emphasised button; "Custom Setup" sits below it.
- **Surface saved groups above the name inputs**, not below. Repeat groups are the retention mechanism in this category; the second session should take one tap.
- **Number fallback** — a "just use numbers" toggle that skips naming entirely.

### P1.4 · Role count: 11 vs Werewolf Master's 26+

This is a legitimate content gap and it is visible in store screenshots, which is where it costs installs. Do not pad it with variants of existing roles — add roles that create *new decisions*:

Well-established roles currently missing: **Doppelgänger** (copies a role on night 1), **Drunk** (doesn't know their own role), **Minion** (evil, knows the villains, villains don't know them), **Tanner/Fool** (wins by being voted out — different from Jester), **Mason pair** (know each other), **Sheriff/Investigator** variants.

Then a small **India role pack** to sit alongside: archetypes drawn from Indian film and folk narrative rather than European village roles. This is content Cosmicode and Yanstar cannot credibly produce.

**Target: 20 roles before the next store update.** Ship as a visible "20 roles, all free" claim.

### P1.5 · Keep-awake is missing

`expo-keep-awake` is not in `package.json`. A Night phase where players are discussing for two minutes will let the screen sleep, and the moderator has to unlock the phone mid-round.

**Action:** `npx expo install expo-keep-awake`, `useKeepAwake()` in Night, Day, Vote and RoleReveal screens. Dumb Charades already does this correctly — copy the pattern from there.

**Effort:** under an hour. This is a real bug being reported as a missing feature.

### P1.6 · Monetization: there is none, and the honest one is easy

No IAP, no ads, no purchase path anywhere in the codebase.

**Recommended model — one-time unlock, regionally priced:**

| Free forever | One-time unlock ($3.99 US / ₹99 India) |
|---|---|
| All 11 base roles (all 20 after P1.4) | Villain theme packs |
| Full narrator | Extra narrator voices |
| Unlimited players and rounds | India role pack, seasonal packs |
| Stats, streaks, daily challenge | Custom role builder |

**Rules:** never gate a role that changes game balance for the group — the free game must be complete. Gate cosmetics, voices and themed content. `villainThemes.js` at 56KB is already the natural paid surface. Use `react-native-iap` per `STACK_REFERENCE.md`, not the deprecated `expo-in-app-purchases`.

**India:** set ₹99 explicitly in the console. Do not let it auto-convert from USD.

---

## P2 — Worth doing, not urgent

- **Upgrade Expo SDK 55 → 57.** Ruse and DebateCraft are already on 57. Staying a major behind fragments the portfolio's dependency surface and will eventually block a Play target-SDK requirement.
- **Cross-promote to Ruse and Dumb Charades** on the Game Over screen. Bundle the app list locally so it works offline. Zero marginal cost, and a group that just finished Nightfall is the best-qualified Ruse lead in existence.
- **Reduce max players from 16 to 12** in the default UI, with 16 behind an "advanced" toggle. A 16-player pass-the-phone round takes ~4 minutes just to deal roles. This is presented as a feature and experienced as a wait.
- **Share card wording.** `ResultShareCard` exists — make sure the exported image carries the app name and a QR or short link. This is the only organic acquisition loop that works offline.
- **`react-redux` is in `package.json` but the app uses Context.** Harmless, but it is dead weight in the bundle. Remove when convenient.

---

## Explicitly do NOT do

- **Do not add online multiplayer.** Ruse already has an online beta and it is the wrong bet for Nightfall. Nightfall's whole claim is the physical table.
- **Do not add a subscription.** See §3 of the market context doc — it is the leaders' most-complained-about behaviour.
- **Do not add interstitial ads.** An ad firing mid-Night-phase in a room of people is the worst placement in mobile gaming.
- **Do not remove the narrator to simplify.** It is the differentiator.
- **Do not lighten the palette or soften the tone** to broaden appeal. That collapses the separation from Ruse.

---

## Order of work

1. P0.1 assets → P0.2 icon size test → P0.3 divergence check
2. P1.5 keep-awake (1 hour, real bug)
3. P1.2 narrator default + first-run prompt (half day, biggest lever)
4. P1.3 Quick Start + saved groups
5. P1.4 roles to 20
6. P1.1 Hindi, then Tamil, Telugu
7. P1.6 IAP
8. P2 as capacity allows

## Verification checklist

- [ ] `npx expo prebuild --clean` succeeds; all four asset files present and correctly sized
- [ ] Icon legible at 29×29 (screenshot it, look at it)
- [ ] Airplane mode: full game start-to-finish, no degradation, no error toast
- [ ] Screen does not sleep during a 3-minute Night phase
- [ ] Fresh install → first game started in under 30 seconds without reading anything
- [ ] Narrator audible and correct-language on both iOS and Android
- [ ] Side-by-side icon/screenshot comparison with Ruse — no observer confuses them
- [ ] India store price shows ₹99, not a converted figure
