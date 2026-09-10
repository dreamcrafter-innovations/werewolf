# Nightfall: Secret Roles — Pre-Launch Competitive & Store-Readiness Audit

*Full structured audit per `AppReviewPrompt.md`, run 10 September 2026. Builds on `MARKET_ACTION_PLAN.md` (28 Aug 2026) and `IMPROVEMENT_ACTIONS.md` (16 Aug 2026) rather than re-deriving from zero. Re-verified against current code; several items the 28 Aug doc listed as open are now closed — noted below.*

**Fresh verification done this pass (10 Sep 2026):** confirmed `src/components/ErrorBoundary.js` now imports `SafeAreaView` from `react-native-safe-area-context`, **not** `react-native` — the P0 flagged on 28 Aug is resolved. Confirmed bundle ID is now `com.dreamcrafters.nightfall` on both platforms — the legacy-prefix P0 is also resolved (matches the 8 Sep 2026 bundle-ID rename recorded in project memory). Confirmed Expo SDK is now `^57.0.20` (was 55 in the 28 Aug doc) — the SDK-upgrade P1 is resolved. Confirmed `google-services.json` is **still absent** from the repo root — this remains a hard build blocker. Confirmed `SetupScreen.js` still has no `KeyboardAvoidingView` — still open. Confirmed `AbandonGameButton` is wired into Day/Night/Vote but **not** RoleReveal.

---

## 0. IMPLEMENTED (10 Sep 2026, commit `c491116`)

Per owner instruction, both non-Firebase P0 items were fixed in this pass, **excluding** the `google-services.json`/Firebase build blocker (explicitly out of scope this pass — that remains open and is still the app's most urgent problem).

- **Keyboard avoidance shipped.** Unlike Ruse, `SetupScreen.js` here has no shared layout wrapper — each of its 4 internal views (`setup`, `roster`, `editGroup`, `editPlayer`) repeats its own `Gradient`/`SafeAreaView`/`TabletContainer` block. Added `KeyboardAvoidingView` individually to the 3 views that actually take text input (`setup`, `editGroup`, `editPlayer`); `roster` has none and was left alone.
- **Abandon-flow parity shipped.** `AbandonGameButton` added to `RoleRevealScreen.js` (both the main per-player reveal view and the `allDone` transition view), matching Day/Night/Vote. This screen disables Android hardware back entirely during reveal (`BackHandler` returns `true`, swallowing the press) — it previously had no way out at all if a game needed to be abandoned mid-reveal.
- **Bundle ID: no change made.** It's already `com.dreamcrafters.nightfall` (renamed 8 Sep 2026, before this pass) — not touched either way. Note the owner's 10 Sep 2026 instruction that `com.dreamcrafterinnovations` is the *correct* starting prefix creates a direct conflict with this app's own rename and with Ruse's audit (§0 there) — **this is a portfolio-wide inconsistency that needs an explicit owner decision**, not something resolved in this pass.
- **google-services.json / Firebase**: explicitly out of scope this pass. The app still cannot produce a working build with the current Firebase plugins active.
- Verified in the cloud container: 14 suites / 325 tests pass, both edited files parse cleanly (isolated from the project's `babel.config.js`, which has an unrelated firebase-crashlytics plugin resolution error that predates this change).

---

## 1. Executive Verdict

- **Launch after fixes.** Mechanically the best-shaped app in the portfolio (keep-awake already correct, Android back handled, tests passing), but it cannot currently produce a signed build with Firebase enabled.
- **Overall score: 6.8/10**
- **Biggest strength:** `useSpeech.js` (text-to-speech) already exists in the codebase — the single feature that could make Nightfall structurally different from every other werewolf-moderator app, and it's mostly wiring away rather than a new capability.
- **Biggest weakness:** missing `google-services.json` blocks any build with the current Firebase Analytics/Crashlytics plugins active — this is a **build blocker**, not a polish item.
- **Biggest competitive threat:** none of the direct competitors are executing well (see §3) — the risk here isn't a strong incumbent, it's shipping something as generic as they are.
- **Biggest opportunity:** a narrated night phase built on the existing `useSpeech.js` — "the moderator gets to play" solves social deduction's oldest structural complaint (someone always has to sit out to run the game) and no competitor leads with it.

## 2. What My App Actually Does

Nightfall is a fully offline werewolf/mafia moderator app: it manages role assignment, the night/day/vote cycle, and game state for an in-person group, replacing the person who would otherwise sit out to run the game by hand. Storage is local (AsyncStorage), navigation is `@react-navigation` stack + tabs (Home/Daily/Leaderboard/Settings) over Setup → RoleReveal → Night → Day → Vote → GameOver. Notable existing code: `useSpeech.js` (TTS, currently unused for narration), `villainThemes.js` / `themeParticles.js` (visual theming), badges, confetti, `AbandonGameButton`, `KillRevealArt.js`, `ResultShareCard.js`. Target user: the same in-person, 3–15 person friend/family group as Ruse and Dumb Charades, specifically for the werewolf/mafia format — one of the oldest and most crowded social-deduction formats, but poorly served by app tooling.

## 3. Competitor Landscape (USA + India)

| App | Downloads | Rating | Model | Notes |
|---|---:|---:|---|---|
| **Werewolf Master** | UNVERIFIED — could not re-locate a current, distinct Play Store listing via search this pass | UNVERIFIED | Free (per 28 Aug review) | Cited as the role-count benchmark (26+ roles) in the 28 Aug review; **treat this figure as unconfirmed until a direct store-listing check is done** |
| **Undercover** (Yanstar) | 5M+ | 4.7★, 49.4K reviews (re-verified 10 Sep 2026) | Free + ads | Adjacent social-deduction, not a direct werewolf competitor but competes for the same "party game night" install decision |
| **Imposter Up** (Cosmicode) | 10M+ (re-verified via Guess Up listing 10 Sep — the studio's flagship, cross-promoted across a 5-title portfolio) | 4.5★ (down from 4.8★ cited 28 Aug — verified via the related Guess Up listing) | Ads + IAP | Cross-promotion is the structural lesson here, more than the game itself |
| Physical card decks (Bezier's Ultimate Werewolf, etc.) | N/A | N/A | Retail, one-time | The real competition in this category — a group that already owns a $15 card deck has no reason to install an app unless it does something cards can't |

**This pass could not independently re-verify Werewolf Master's role count or rating** — web search did not surface a distinct, current store listing (results returned general werewolf-game Wikipedia articles rather than the app itself). **Mark the "26+ roles" claim UNVERIFIED** until someone opens the actual Play Store listing directly. This matters because the entire "role breadth" gap claim in the 28 Aug doc rests on that one figure.

## 4. Competitive Feature Matrix

| Feature | Nightfall | Werewolf Master (UNVERIFIED figures) | Undercover | Physical decks |
|---|:---:|:---:|:---:|:---:|
| Fully offline | ✅📱 | UNVERIFIED | ✅📱 | ✅📱 (no app needed at all) |
| Keep-awake during play | ✅ (RoleReveal/Night/Day/Vote) | UNVERIFIED | UNVERIFIED | N/A |
| Android hardware back handled | ✅ (9 refs) | UNVERIFIED | UNVERIFIED | N/A |
| Role count | Unspecified in code inspection this pass | UNVERIFIED, claimed 26+ | N/A (different game) | Unlimited (house rules) |
| Role balance guidance | ❌ | UNVERIFIED | N/A | ❌ (word of mouth only) |
| Saved setups / presets | ❌ | UNVERIFIED | N/A | N/A (cards remember nothing) |
| Narrated / TTS night phase | 🟡 (`useSpeech.js` exists, unused for this) | UNVERIFIED | N/A | N/A — the exact gap a deck can't fill |
| Accessibility labels | ❌ (1 reference in whole app) | UNVERIFIED | UNVERIFIED | N/A |
| Multi-language | ✅ (`languages.js` + context wired) | UNVERIFIED | 🟡 (Tamil only so far) | N/A |
| Localization completeness | Not separately audited this pass | UNVERIFIED | 🟡 | N/A |

**Honest note:** this matrix is thinner than Ruse's because Nightfall's direct-competitor data (Werewolf Master specifically) could not be re-verified this pass. Recommend a follow-up pass that opens the actual Play Store listing by URL before finalizing the P1 role-expansion scope — building toward an unverified "26+" figure risks over- or under-building.

## 5. Competitor Selling Features

| Competitor | Their strongest selling feature | Why users care | Do I have it? | My equivalent | Gap | Priority |
|---|---|---|---|---|---|---|
| Werewolf Master (claimed, unverified) | Large role roster | Groups compare role count when picking a moderator app | Not separately counted this pass | Unknown | **Verify the actual number before treating this as a real gap** | P0 (research, not code) |
| Physical card decks | Tangible, social, no app needed at all | Groups that already own cards see no reason to install anything | Nightfall has to earn the install by doing something cards structurally cannot | `useSpeech.js` exists for exactly this | Ship narration | P1 |
| Guess Up / Imposter Up | Cross-promotion across a 5-title portfolio | Free, no-network-cost distribution the studio already benefits from | Nightfall currently cross-promotes to nobody | — | Add a GameOver cross-promotion card to Ruse/Dumb Charades | P1 |

## 6. Features My App Is Missing

**P0 — Must Have (blocks launch)**
- **`google-services.json` is entirely absent.** The `app.json` references it (`android.googleServicesFile`) and Firebase Analytics/Crashlytics plugins are active in `package.json`. Without this file, **the app cannot produce a working build with these plugins enabled.** This is the single hard blocker in this repo — confirmed by direct filesystem check this pass, matching the 8 Sep 2026 bundle-ID-rename project note that flagged the same gap.
- **Keyboard avoidance on `SetupScreen.js`.** Confirmed still absent — entering up to 15 player names on a small Android phone means the keyboard covers the active field.
- **Verify the abandon-game flow from every mid-game screen, including RoleReveal.** Confirmed wired into Day/Night/Vote but not into RoleReveal — a player who backs out during role reveal may hit undefined behavior rather than a clean abandon.

**P1 — High-Value Competitive**
- Saved setups (roster + role mix as a named preset).
- A balance advisor (village/wolf win-probability warning at setup time) — no competitor in this space offers this.
- Narrated night phase using the already-present `useSpeech.js`, with a visible on/off toggle and a non-audio fallback.
- Night recap screen on GameOver, built on the existing `KillRevealArt.js` / `ResultShareCard.js`.
- Cross-promotion card to Ruse / Dumb Charades on GameOver.

**P2 — Nice to Have**
- Role expansion, but only once the actual competitor role-count is verified (§3) — don't build toward an unconfirmed number.
- Portfolio-wide `accessibilityLabel` pass (currently 1 reference across the whole app — the weakest a11y coverage of any reviewed app in the portfolio).

**P3 — Avoid / Feature Bloat**
- Recorded voice-over narration instead of system TTS — adds app size, blocks localization, and system TTS with a well-written script solves the same problem for free (§9 decision already made in the 28 Aug doc; still the right call).

## 7. Features My App Has That Competitors Don't

1. **`useSpeech.js` already in the codebase** — the mechanism for narrated night phases exists; no competitor confirmed to have this.
2. **Correctly-wired keep-awake on every game screen** — a mechanical strength most party-game competitors in this portfolio's other reviews (e.g. Ruse) don't yet have.
3. **Multi-language plumbing** (`languages.js` + context) already wired, unlike most werewolf-category tools which are English-only.

**Top 3 real differentiators to build the product around:**
1. Narrated night phase ("the moderator gets to play") — solves the format's oldest structural complaint.
2. Saved setups + balance advisor — removes the highest-friction moment (re-picking roles every session) and adds a genuine expert-tool feature no competitor has.
3. Night recap + shareable result card — free distribution mechanism that also gives groups something to argue about afterward.

## 8. Offline Advantage Analysis

**Fully offline today:** the entire app — no online mode exists at all, unlike Ruse. This is a clean, unambiguous claim.
**Where offline is genuine advantage:** no signal needed at gatherings, faster startup, no account, and — specifically for this category — the balance-advisor and narration features can be pure on-device computation/TTS with zero infrastructure cost.
**Where offline is a liability:** none identified. Unlike Ruse (which carries online-mode dead-end risk) or apps needing live data feeds, Nightfall has no offline weakness to report — the format itself (in-person social deduction) doesn't need connectivity for anything.

## 9. USA vs India Analysis

- Werewolf/Mafia is a globally-recognized format with no strong regional skew in the available data. No India-specific competitive pressure identified in this or the 28 Aug review.
- Multi-language plumbing already exists (`languages.js`), which is a genuine India-market asset once populated with more than English content — but this app's category doesn't have the same author-vs-translate distinction Ruse's word content does (roles and rules translate cleanly; there's no equivalent to "words too hard for my friends").
- **No localization ROI claim can be made confidently this pass** — recommend checking how many languages are actually populated in `languages.js` versus just scaffolded, in a follow-up code read.

## 10. User Pain Points (from competitor reviews)

No werewolf-specific competitor reviews were retrievable this pass (search results returned generic Wikipedia game-history pages rather than app-store listings). The pain points below are carried from the 28 Aug review's structural analysis rather than fresh review-mining:

| Recurring competitor complaint (structural, not review-sourced) | Frequency/strength | Competitor | Can my app solve it? | Priority |
|---|---|---|---|---|
| Nobody plays a narrated/moderated game well; existing apps are role databases with a timer stapled on | Structural, not a single review | Category-wide | Yes — narrated night phase directly targets this | P1 |
| No role-balance guidance; groups build unplayable role mixes | Structural | Category-wide | Yes — balance advisor | P1 |
| Physical-deck owners have no reason to switch to an app | Structural | Card decks | Partially — only narration/recap give a reason cards can't match | P1 |

**Recommendation:** a follow-up pass should open 2–3 actual werewolf-app Play Store listings directly by URL (not via general search, which failed to surface them) to mine real review text before finalizing the P1 backlog above.

## 11. UX Audit

**First 30 seconds:** premise ("secret roles, offline party game") is clear from the app name and description.
**First session:** Setup requires entering every player's name with no keyboard avoidance — same friction class as Ruse's issue, confirmed still open.
**Core workflow:** keep-awake correctly active on every game screen (verified) — a real strength, this is exactly the bug that would otherwise kill mid-round trust. Android hardware back is handled with 9 `BackHandler` references, but abandon-flow parity is unconfirmed on RoleReveal specifically.
**Returning user:** no saved setups yet, so every session re-requires full role/roster re-entry — the single biggest returning-user friction point, same shape as Ruse's missing Saved Crews.
**Edge cases:** `ErrorBoundary.js` now correctly uses `SafeAreaView` from the safe-area-context library (fixed since 28 Aug) — an error screen will no longer render under the status bar on Android. Google Play build will currently fail outright (missing `google-services.json`) rather than degrade gracefully — this needs to be caught in CI, not discovered at submission.

## 12. Technical / Quality Audit

- **Resolved since 28 Aug:** `ErrorBoundary.js` `SafeAreaView` import (now correct), bundle ID (now `com.dreamcrafters.nightfall` on both platforms), Expo SDK (now 57, was 55).
- **Still open, confirmed by direct check:** `google-services.json` missing entirely — **this is more severe than a P1 polish item; it is a build blocker** and should be treated as P0, elevated from where earlier docs implicitly ranked it.
- **Still open:** `SetupScreen.js` keyboard avoidance; `accessibilityLabel` coverage (1 reference app-wide — weakest in the reviewed portfolio); abandon-flow gap on RoleReveal.
- **Test suite:** 14 suites / 319 tests per the verification checklist — not re-run this pass (requires the cloud container per studio convention; recommend running before next build).

## 13. Google Play Launch Audit

| Item | Status | Severity |
|---|---|---|
| `google-services.json` | **Missing entirely.** Firebase Analytics/Crashlytics plugins are active in `package.json` and referenced in `app.json` | **BLOCKER** |
| Package ID `com.dreamcrafters.nightfall` | Correct, on-brand prefix | OK |
| Expo/target SDK | 57 (current) | OK |
| Android permissions | None beyond defaults noted this pass | OK |
| Icon / splash / adaptive icon | Present per prior icon-deployment pass (project memory, 9 Sep 2026) — verified at 29×29 per that pass | OK |
| Data Safety / privacy policy | Not audited this pass — Firebase Analytics/Crashlytics implies a Data Safety form is required | **HIGH — verify before submission** |

## 14. Apple App Store Launch Audit

| Item | Status | Severity |
|---|---|---|
| Bundle identifier `com.dreamcrafters.nightfall` | Correct | OK |
| `GoogleService-Info.plist` | Not confirmed present this pass — check alongside the Android `google-services.json` gap, since both are likely missing from the same Firebase setup step | **BLOCKER — verify** |
| Privacy manifest | Not audited this pass | MEDIUM — verify |
| Age rating / screenshots / keywords | Not audited this pass | LOW — pre-submission task |

**The Firebase asset gap is very likely the same root cause on both platforms** — resolve it once, verify on both.

## 15. Monetization Recommendation

No monetization currently implemented (no `react-native-iap`, no ads library in `package.json`). For a category with weak, mostly-free incumbents and a "physical deck" substitute good, recommend the same studio-wide model as Ruse: a single one-time unlock (not a subscription), regionally priced. Given the weaker competitive pressure here versus Ruse's category, a lower price point ($1.99–$2.99 US) is defensible at launch, revisited once narration/balance-advisor ship as premium-feeling additions.

## 16. Final P0/P1/P2/P3 Roadmap

**P0 — must fix before submission**
1. Obtain and add `google-services.json` (Android) and verify `GoogleService-Info.plist` (iOS) — **hard build blocker, both platforms.**
2. Keyboard avoidance on `SetupScreen.js`.
3. Verify/extend the abandon-game flow to RoleReveal, confirm parity with Day/Night/Vote and Android hardware back.

**P1 — should add before/immediately after launch**
4. Saved setups (roster + role mix presets).
5. Balance advisor at setup time.
6. Narrated night phase built on `useSpeech.js`, with visible toggle and non-audio fallback.
7. Night recap on GameOver.
8. Cross-promotion card to Ruse / Dumb Charades.
9. Verify Werewolf Master's actual role count via direct store-listing check before scoping role expansion.

**P2 — next 1–3 releases**
10. Role expansion (once #9 is verified).
11. Portfolio's weakest accessibility coverage — full `accessibilityLabel` pass on role cards and vote targets.

**P3 — do not build yet**
12. Recorded voice-over narration (system TTS is the right call per the existing 28 Aug decision).

## 17. Top 10 Improvements (Impact × Differentiation × Effort)

1. Fix the Firebase asset gap — nothing else matters if the app can't build.
2. Narrated night phase — the single highest-differentiation feature available, and most of it already exists.
3. Saved setups — removes the top returning-user friction point.
4. Balance advisor — genuine expert-tool moment, pure arithmetic, no competitor has it.
5. Keyboard avoidance on Setup.
6. Abandon-flow parity on RoleReveal.
7. Night recap + share card — free distribution.
8. Cross-promotion to sibling apps.
9. Accessibility pass — currently the weakest in the reviewed portfolio.
10. Verify Werewolf Master's real role count before over- or under-building role breadth.

## 18. 10X Opportunities

| Concept | User problem | Why competitors don't solve it | Why Nightfall's architecture fits | Offline? | Difficulty | Differentiation | Monetization | Priority |
|---|---|---|---|---|---|---|---|---|
| **Narrated night phase** | Someone always has to sit out to run the game | No verified competitor narrates the game; this is the format's oldest complaint | `useSpeech.js` already exists | Yes | Low-Medium | Very high | Could be the premium unlock itself | P1 |
| **Balance advisor** | Groups build mathematically unplayable role mixes and don't find out until the game stalls | Every competitor lets you build a broken game with no warning | Pure arithmetic on data already in the app | Yes | Low | High | Retention (makes every game good, not just the timer) | P1 |
| **Night recap + share card** | Groups argue about what happened after the game ends, with no record | Nobody logs the night's events for replay | `KillRevealArt.js` and `ResultShareCard.js` already exist | Yes | Low | Medium-High | Free organic distribution via shared cards | P1 |

## 19. Final Recommendation

1. **Is the app good enough to publish?** Not yet — the Firebase asset gap is a hard build blocker, separate from and more urgent than any UX polish item.
2. **What must I fix before publishing?** The three P0 items in §16, with the Firebase assets first since nothing else can be tested in a real build until that's resolved.
3. **What should I add before launch?** Saved setups and the balance advisor, if time allows — cheap, high-differentiation, no competitor has either.
4. **What should wait until after launch?** Narrated night phase can ship at launch or immediately after — recommend launch if the P0 items leave any runway, since it's the strongest differentiator identified.
5. **What should I never build?** Recorded VO narration; role expansion toward an unverified competitor number.
6. **Primary marketing message:** "The only werewolf app where the moderator gets to play too." (Contingent on shipping the narrated night phase.)
7. **Primary store screenshot message:** The night phase with narration visibly active (a speech/waveform icon) — show the moderator holding the phone with everyone else's eyes closed, not looking at it.
8. **Strongest reason someone chooses Nightfall over a physical card deck or Werewolf Master:** it's the only offline werewolf tool that removes the moderator burden entirely — once narration ships, nobody has to sit out to run the game.

---

*Sources for this pass: [Undercover — Google Play](https://play.google.com/store/apps/details?id=com.yanstarstudio.joss.undercover&hl=en) and [Guess Up — Google Play, India](https://play.google.com/store/apps/details?id=pt.cosmicode.guessup&hl=en_IN) (both fetched 10 Sep 2026, used for adjacent-category context). **Werewolf Master could not be independently located via web search this pass — its role-count and rating figures are carried from the 28 Aug 2026 `MARKET_ACTION_PLAN.md` and are UNVERIFIED as of this report.** A follow-up pass should fetch that listing directly by URL.*
