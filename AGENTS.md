# AGENTS.md — Nightfall: Secret Roles

Start here if you are an AI agent (Claude, Codex, Copilot…) or a new contributor.
Everything between the `dreamcrafters:generated` markers below is regenerated from the repo
(`node _tools/ci-kit/gen.mjs <dreamcrafters folder> <repo>`); add hand-written notes above or below it.

## Portfolio conventions (all dreamcrafters apps)

- Expo managed workflow, EAS for builds. Don't add native `android/`/`ios/` folders.
- Android package / iOS bundle ID stay `com.dreamcrafterinnovations.<app>` unless the owner says otherwise.
- Screens use `react-native-safe-area-context` insets; forms keep `android.softwareKeyboardLayoutMode: "resize"` in app.json.
- Layouts must work on tablets (cap content width) and scroll when content can overflow.
- Never commit secrets: Play service-account JSON, keystores, `google-services.json` with real keys, `.env`.
- Don't remove a feature just because a competitor has it; ask for usage evidence first.
- Keep changes small and verified: run `make build-test` and report what actually ran.

<!-- BEGIN dreamcrafters:generated — regenerate instead of editing by hand (2026-09-28) -->
## Repo context (for agents)

| | |
|---|---|
| App | **Nightfall: Secret Roles** (slug `nightfall`) |
| Bundle IDs | Android `com.dreamcrafterinnovations.nightfall` · iOS `com.dreamcrafterinnovations.nightfall` |
| Stack | Expo ^57.0.20 · React Native 0.86.3 · React 19.2.3 · JavaScript |
| Key libraries | React Navigation, AsyncStorage, Firebase (RN), safe-area-context, Jest, RN Testing Library |
| Layout | Expo app at the repo root. |
| Size | 69 source files, 15 test/check files |
| EAS project | **not linked yet** — run `npx eas-cli init` once |

### Code map (by layer)

**Entry / config**
- `./` (6) — App.js, app.config.js, babel.config.js, eslint.config.js, index.js, jest.config.js

**Screens / routes**
- `src/screens/` (12) — DailyScreen.js, DayScreen.js, GameOverScreen.js, HomeScreen.js, HowToPlayScreen.js, LeaderboardScreen.js, NightScreen.js, RoleRevealScreen.js, SettingsScreen.js, SetupScreen.js, VoteScreen.js, howToPlay/Scenes.js

**Components**
- `src/components/` (13) — AbandonGameButton.js, BurstEffect.js, Confetti.js, ErrorBoundary.js, Gradient.js, KillRevealArt.js, OutcomeHero.js, ParticleField.js, ResultShareCard.js, SectionLabel.js, TabletContainer.js, Toggle.js, theme.js

**State / hooks / context**
- `src/context/` (3) — GameContext.js, LanguageContext.js, ThemeContext.js
- `src/hooks/` (2) — usePalette.js, useSpeech.js

**Services / logic**
- `src/utils/` (8) — analytics.js, analytics.web.js, balance.js, gameLogic.js, haptics.js, interpolate.js, shareResult.js, supportLink.js

**Data / content**
- `src/data/` (6) — badges.js, languages.js, roles.js, strings.js, themeParticles.js, villainThemes.js

**Theme / styles**
- `src/theme/` (1) — colors.js

**Tests**
- `__tests__/` (15) — context/GameContext.test.js, context/mixedVillainTheme.test.js, data/badges.test.js, data/languages.test.js, data/roles.test.js, data/strings.test.js, data/villainThemes.test.js, newRoles.test.js, specialRoles.test.js, storage.test.js, theme/colors.test.js, utils/analytics.web.test.js, … (+3)

**Other**
- `src/` (2) — storage.js, webPolyfills.js
- `src/navigation/` (1) — AppNavigator.js

### Commands

| Goal | Command |
|---|---|
| Install | `make install` |
| Local build (lint is always on) | `make build` |
| Build + unit tests + i18n report | `make build-test` |
| Lint / autofix | `make lint` / `make lint-fix` |
| Typecheck | — (JavaScript project) |
| Unit tests | `make test` → `jest` |
| Content/data validation | — |
| Translations | — |
| Cloud build | `make eas-build PROFILE=preview` (EAS quota) |
| Release | `make release` or GitHub → Actions → *EAS release* |

Toggles: `LINT TYPECHECK TEST I18N PLATFORM PROFILE` on the command line or in a git-ignored `local.mk`.
Before saying work is done: `make build-test` must pass. Do not report a typecheck as clean unless it ran to completion.

### Translation verification

English only today. Strings are centralised in `STRINGS.EN` (`src/data/strings.js`, covered by `__tests__/data/strings.test.js`) so a second language can be added as another block.

### CI/CD

- `.github/workflows/ci.yml` — push/PR to `main` (skips doc-only commits). Steps toggle via repo **Variables**:
  `CI_RUN_LINT` (false), `CI_RUN_TYPECHECK` (true), `CI_RUN_TESTS` (true), `CI_RUN_I18N` (true), `CI_I18N_STRICT` (false), `CI_RUN_SECURITY` (true), `CI_RUN_SEMGREP` (false).
- `.github/workflows/release.yml` — **manual only**. EAS build (profiles: `development`, `preview`, `production`), optional auto-submit.
- No agentic/AI workflows — keep it that way (cost control).
- Lint runs locally (`make build`, and the pre-push hook after `make hooks`), not in GitHub, to save Actions minutes.

### Release checklist (owner, once per app)

1. `npx eas-cli login` then `npx eas-cli init` in the repo root → commit the `extra.eas.projectId` it writes to app.json.
2. GitHub → Settings → Secrets and variables → Actions → secret `EXPO_TOKEN`.
3. Google Play Console: create the app and upload the **first** AAB by hand (Google requires it), from `make eas-build PROFILE=production`.
4. `npx eas-cli credentials` → Android → upload the Play service-account JSON (never commit it). After that, submit works from CI or `make submit`.
5. Submissions land on the **internal** track as a **draft** (`eas.json → submit.production`). Change `releaseStatus` to `completed` once the app has passed its first review. Production promotion stays a manual step in Play Console.
6. iOS: add `ascAppId` + `appleTeamId` under `submit.production.ios` in eas.json once the App Store Connect app exists.
7. Firebase: this app reads `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICE_INFO_PLIST`. Store them as EAS **file** environment variables (expo.dev → project → Environment variables), not as GitHub secrets — EAS builds on its own servers.

Versioning: `appVersionSource: remote` + `autoIncrement` on production — EAS owns versionCode/buildNumber; bump `expo.version` in app.json by hand for user-visible releases. Every EAS build message carries the git SHA.

### Docs in this repo
- `APP_REVIEW_AUDIT.md` — Nightfall: Secret Roles — Pre-Launch Competitive & Store-Readiness Audit
- `APP_REVIEW_AUDIT_V2.md` — Nightfall: Secret Roles — V2 Audit (21-phase master prompt, delta pass)
- `IMPROVEMENT_ACTIONS.md` — Nightfall: Secret Roles — improvement actions
- `MARKET_ACTION_PLAN.md` — Nightfall — Market & UX Action Plan
- `README.md` — 🌕 Werewolf
- `STYLE_PRIVACY_FLOW_REVIEW.md` — Style / Privacy / Flow re-check — 2026-09-15 (Nightfall)
<!-- END dreamcrafters:generated -->
