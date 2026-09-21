# Nightfall: Secret Roles — V2 Audit (21-phase master prompt, delta pass)

*Run 20 Sep 2026. Delta audit: re-verifies the 10 Sep `APP_REVIEW_AUDIT.md`, executes checks that pass did not (clean `npm ci`, Metro bundle export for both platforms, coverage gate, SDK alignment), refreshes live competitor data, and adds security/privacy, store-requirements and monetization sections.*

**Evidence key:** VERIFIED (read/run this pass) · PARTIAL · INFERRED · UNVERIFIED · N/A.

---

## 1. Executive Summary

- **Release classification: BLOCKED** (until Firebase files exist or Firebase is removed; see B2). One blocker found this pass was invisible to the previous audit and is now fixed (B1).
- **Overall:** a well-tested (325 tests, 87.5% statement coverage) offline party-game moderator with sound structure. Its problem was never gameplay; it was the build pipeline.
- **Biggest strength:** the code is mechanically solid and the moderator loop (setup → role reveal → night → day → vote → game over) is fully implemented with narration, daily challenge, badges and stats.
- **Biggest weakness:** **the app could not produce a JS bundle at all.** `babel.config.js` required `@react-native-firebase/crashlytics/babel-plugin`, a subpath v26 no longer exports; `expo export` failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` before bundling a single module. The 10 Sep audit called this error "unrelated". **Fixed and verified** (Android and iOS bundles now export).
- **Biggest competitive threat:** none is strong (see §4), but the V1 claim that no competitor leads with narration is **wrong**: Werewolf Moderator (Android) advertises automatic text-to-speech.
- **Biggest opportunity:** polish and reliability over role count; the incumbents are weakly rated or barely installed.
- **Most important unresolved risk:** Firebase config (`google-services.json`, `GoogleService-Info.plist`) exists nowhere, and no device or release build has been run.
- **Next action:** owner decides Firebase: create the project and upload files as EAS file env vars (wired this pass), or drop the three `@react-native-firebase/*` packages.

## 2. What the App Actually Does (VERIFIED)

Offline in-person Werewolf/Mafia moderator: role assignment (11 roles defined, 9 assignable), night/day/vote cycle with text-to-speech narration (`useSpeech`, wired in `NightScreen`/`DayScreen`), daily challenge, badges, session and all-time stats, result share card. English is the only language defined (`src/data/languages.js`, VERIFIED). React Navigation stack + tabs, AsyncStorage persistence, Firebase Analytics + Crashlytics (native only; web builds use no-op stubs).

## 3. Technical Inventory

| Area | Implementation | Status | Evidence |
|---|---|---|---|
| Framework | Expo 57.0.20, RN 0.86.3, React 19.2.3 | VERIFIED; **0 SDK mismatches** (script vs `bundledNativeModules.json`) | install + script |
| Bundling | `babel-preset-expo` only (after fix) | **was broken**, now Android + iOS export OK | `expo export` |
| Tests | 14 suites, **325 pass**; coverage 87.5/87.9/86.9/86.9 vs 85% gate | VERIFIED | `npm run test:coverage` |
| Type checking / lint | none (JS project, no ESLint) | VERIFIED absent | package.json |
| Install | plain `npm ci` from committed lock | VERIFIED OK (542 pkgs) | clean dir |
| Firebase | analytics + crashlytics, no consent gate, all calls try/catch | VERIFIED | `src/utils/analytics.js` |
| Native config | `android/` is git-ignored and stale (`com.helloworld`); EAS cloud builds prebuild fresh | VERIFIED | git ls-files, build.gradle |
| Permissions | none declared beyond defaults | VERIFIED | app.json |

## 4. Competitors (re-checked 20 Sep 2026, US Play/App Store pages)

| App | Rating / reviews | Installs | Model | Notes (store listing = marketing claim) |
|---|---|---|---|---|
| Undercover: Word Party Game (Yanstar, Play) | 4.8★ / 52.7K (V1: 4.7★/49.4K) | 5M+ | ads + IAP | adjacent genre; updated 10 Sep 2026 |
| Werewolf Master – Party Game (Play, `com.EnesSorucu.werewolf`) | rating not shown | 5K+ | free + IAP | "over 26 unique roles" — V1's UNVERIFIED figure now **VERIFIED**; updated 25 Jul 2026 |
| Werewolf Moderator (Play, `com.sewookori.werewolf_assistant`) | 3.2★ / 27 | 10K+ | ads + IAP | 29 characters, **automatic TTS playback**, auto-save/resume, stats, 8 languages listed |
| Werewolf – Narrator (App Store) | 3.3★ / 3 ratings | n/a | free + donations $0.99–$8.99 | 40 characters, music + 150 sound effects; last updated Sep 2023 |
| Physical card decks | n/a | n/a | retail | the real substitute (V1) |

India-market and App Store India listings: **UNVERIFIED** this pass. User-review themes were not mined; no recurrence claims are made.

## 5–6. Feature Matrix & Selling Propositions (summary)

Nightfall has 11 roles against 26–40 for the app competitors (**VERIFIED gap**). It matches TTS narration (not unique), has stats/badges/daily challenge/share card, and is dark-themed with strong visual identity. Competitors sell role count, narration, sound effects and (Moderator) auto-resume. Whether users choose on role count is **INFERRED**, not measured.

## 7. Gaps

- **P0:** B1 (fixed), B2 Firebase config, B3 device release-build test.
- **P1:** role expansion only after checking that users ask for it (breadth is expensive to balance for a solo developer); sound effects/music; auto-resume of an interrupted game; accessibility labels (1 `accessibilityLabel` across 171 pressables, VERIFIED).
- **P2:** additional languages (competitor Moderator lists 8; Nightfall has English only), App Store India check.
- **P3:** online play, accounts.

## 8. Differentiators

1. Fully offline, no account. VERIFIED — but Analytics/Crashlytics are on with no opt-out, so "nothing leaves the device" must **not** be claimed in store copy; the website policy already discloses Firebase (VERIFIED).
2. Narration — **not** unique (see §4). Keep as table stakes.
3. Visual/theming polish (villain themes, particles, kill-reveal art): observable in code, unmeasured with users.

## 9. Offline Advantage

Full gameplay offline; no sync needed. Weakness: no export/backup of stats and rosters (AsyncStorage only); a phone change loses history. Not a launch issue.

## 10. US vs India

US: crowded free market; differentiation by polish. India: TTS narration in Indian languages would be a real edge but only if the TTS voices exist on target devices (**UNVERIFIED**). No pricing conclusions drawn without market data; keep free.

## 12. UX / Accessibility

Not inspected on a device. Code review only: Android back is handled, keep-awake is used, keyboard avoidance was added 10 Sep. Accessibility labels nearly absent (P1). Small-screen and font-scale behaviour: **NOT TESTED**.

## 13. Workflow results

All game-flow logic covered by unit tests (325 pass); no UI execution. Every workflow below the logic layer (first launch, interruption, restart, share image, offline) is **NOT TESTED**.

## 14. Engineering & Reliability

| # | Finding | Status |
|---|---|---|
| B1 | Metro failed: removed crashlytics babel plugin subpath | VERIFIED, **fixed**; Android + iOS Hermes bundles export |
| B2 | Firebase files absent and git-ignored; `app.json` hard-coded a path EAS cloud can never satisfy; iOS `googleServicesFile` missing (RN Firebase's iOS plugin throws without it) | VERIFIED; **fixed structurally** with `app.config.js` (EAS file env vars, plugins only when files exist, clear error on production build); files themselves still owner-supplied |
| E3 | iOS `ITSAppUsesNonExemptEncryption` unset → export-compliance prompt every upload | VERIFIED, set to `false` in `app.config.js`; **owner to confirm declaration** |
| E4 | Unused `@types/react-redux` | removed; `npm ci` re-verified |
| E5 | Stale local `android/` (`com.helloworld`) could mislead `eas build --local` | VERIFIED; left (git-ignored), delete it before any local build |

## 15. Security & Privacy

Analytics events carry player count, theme, winner and rounds — no names or free text (VERIFIED in `analytics.js`). Crashlytics receives stack traces and `recordError` context. No consent prompt: acceptable if the store forms and policy disclose collection and the app is not child-directed; **confirm the target-audience and age-rating answers** (the game has "kill/elimination" themes and minors may play). No secrets in repo (`.gitignore` excludes Firebase files and keystores); gitleaks not run here. Dependency audit not run here. Static review only.

## 16. Tests

Executed in a clean tree: `npm ci`, `npx jest` (325 pass), `npm run test:coverage` (thresholds met), `npx expo export --platform android|ios` (both succeed after fix). Not executed: device, EAS build, `npm audit`. Recommended: add `npx expo export` to CI so a broken Metro/Babel config fails a pull request (it went undetected here); tests alone cannot catch it because `jest.config.js` deliberately bypasses `babel.config.js`.

## 17. Google Play

Target API 36 required for new apps/updates since 31 Aug 2026 (extension to 1 Nov available); RN 0.86 defaults `targetSdk = 36`, `minSdk = 24` (read from its gradle file; **PARTIAL**). Package `com.dreamcrafterinnovations.nightfall`, `versionCode 1`. Data Safety must declare Firebase Analytics/Crashlytics collection (device/app-instance IDs, crash logs, app interactions). Closed-testing gate applies only to personal accounts created after 13 Nov 2023; organisation accounts are exempt — confirm the account type. Store listing, screenshots, content rating: not in repo.

## 18. App Store

Uploads need Xcode 26 / iOS 26 SDK since 28 Apr 2026 (EAS-managed; **NOT VERIFIED**). Privacy nutrition label must list analytics and diagnostics. iOS Firebase file and privacy manifest: not verifiable without an iOS build. `buildNumber` 1. Sign in with Apple / account deletion: N/A.

## 19. Monetization

Free with optional cosmetic packs or a one-time "remove ads / supporter" purchase later; ads would conflict with a party-game passing-the-phone flow and add a further Data Safety declaration. No subscription. Competitors use ads+IAP (Moderator) or donation tiers (Narrator). No billing code exists; add none until store products exist.

## 20. Backlog

**P0:** B2 (owner Firebase decision), B3 device smoke test of a release build, store forms + privacy label + Data Safety, EAS project.
**Completed this pass:** B1, B2 wiring, E3, E4; live competitor refresh; `README` Firebase setup section.
**P1:** CI bundle smoke test; accessibility labels; game auto-resume; role breadth only with evidence.

## 21. Top 10 (rough)

1 Firebase decision 2 device smoke test 3 CI bundle check 4 store forms 5 accessibility labels 6 auto-resume 7 sound effects 8 stats export 9 role expansion 10 more languages.

## 22. High-Differentiation Opportunities

1. **Solo-host narrator that fully runs the night** (already largely built) — pair with Indian-language voices if device TTS supports them.
2. **Pass-the-phone privacy design** (screens that never reveal roles on lock-screen/recents) — small, distinctive.
3. **Game-night recap card** — share card exists; make it the growth loop.

## 23. Scorecard (descriptive, 0–10)

| Category | Score | Confidence | Limitation |
|---|---:|---|---|
| Core functionality | 8 | Medium | logic tested, UI not run |
| Reliability | 7 | Medium | no device |
| Privacy | 6.5 | Medium | no consent, disclosure depends on forms |
| Security | 7 | Low | static only |
| Differentiation | 5.5 | Medium | narration no longer unique; role gap real |
| Google Play readiness | 3 | Medium | Firebase files, no store setup |
| App Store readiness | 2.5 | Low | nothing built for iOS |
| Accessibility | 3 | Medium | 1 label / 171 pressables |

## 24. Final Recommendation

Ready to publish? **No.** Fix first: Firebase decision, device test, store setup. Add before launch: nothing feature-wise. After launch: accessibility, auto-resume, sound. Do not build: online play, accounts. Message: "Run the whole game night from one phone — no one has to sit out." Screenshot: the night-phase narrator screen. Reason to choose it: polished, offline, moderator-included, in a category whose app competitors are small and weakly rated. Remaining risks: Firebase/consent, unrun native paths. Next: decide Firebase, then build a preview APK.

## 25. Verification Appendix

Inspected: package.json/lock, app.json, eas.json, `babel.config.js`, `jest.config.js`, `.gitignore`, CI workflow (steps only), `src/utils/analytics.js`, `src/storage.js`, `src/data/roles.js`, narration wiring, website policy page (Firebase disclosure). Environment: Linux container, Node 22; **no device, no emulator, no EAS build, no iOS build**. Research accessed 20–21 Sep 2026: Play listings (Undercover, Werewolf Master, Werewolf Moderator), App Store (Werewolf – Narrator), Google Play target-API and closed-testing docs, Apple upcoming-requirements page. Unverified: India listings, competitor reviews, TTS voice availability, iOS behaviour of RN Firebase without extra build properties.
