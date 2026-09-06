# Nightfall — Market & UX Action Plan

*Competitive + navigation review, 28 August 2026. Every claim below was checked against the code in this repo on that date.*

**Run this app in its own session.** Read `../STACK_REFERENCE.md` and `../PORTFOLIO_BRAND_DIFFERENTIATION.md` before adding a dependency or touching a colour. Offline-first is not negotiable.

**Reads with:** `../PARTY_GAMES_MARKET_CONTEXT.md`, `IMPROVEMENT_ACTIONS.md`.

---

## 1. What ships today (verified in code)

| | |
|---|---|
| Folder | `werewolf/` |
| Navigation | `@react-navigation` stack + tabs — `src/navigation/AppNavigator.js` |
| Screens | Tabs (Home/Daily/Leaderboard/Settings) + Setup, RoleReveal, Night, Day, Vote, GameOver, HowToPlay |
| Storage | AsyncStorage |
| Online | No — fully offline |
| Languages | `src/data/languages.js` + `LanguageContext` — multi-language wired |
| Notable | `src/hooks/useSpeech.js` (text-to-speech narration), `src/data/villainThemes.js`, `themeParticles.js`, badges, confetti, `AbandonGameButton` |
| Store IDs | `com.dreamcrafterinnovations.nightfall` (legacy prefix) |
| Expo SDK | ~55 — two majors behind the portfolio's SDK 57 apps |

Keep-awake is correctly wired on RoleReveal, Night, Day and Vote. Android back is handled (9 `BackHandler` references). This app is in better mechanical shape than most of the portfolio.

## 2. The market — US and India

| App | Downloads | Rating | Model | Note |
|---|---:|---:|---|---|
| **Werewolf Master** | — | — | Free | 26+ roles, active — the role-count benchmark |
| **Undercover** (Yanstar) | 5M+ | 4.7 | Ads | Adjacent social deduction, community translations |
| **Imposter Up** (Cosmicode) | — | 4.8 | Ads + IAP | Cross-promoted portfolio |
| Physical card decks (Bezier, Ultimate Werewolf) | — | — | Retail | The real competition: a group that already owns cards |

Werewolf/Mafia is the oldest social-deduction format and the app market for it is crowded with free, ad-supported moderator tools. Nobody is doing it *well* — the category leaders are role databases with a timer stapled on.

## 3. Feature gaps — what competitors have that Nightfall does not

1. **Role breadth.** Werewolf Master ships 26+ roles. Role count is the first thing a returning group compares.
2. **Role balance guidance.** Every competitor lets you build an unplayable 12-player game with 6 werewolves. None warns you.
3. **A physical-deck bridge.** Groups that own cards use the app only as a timer. Nothing captures them.
4. **Deck/session presets.** "Our usual 8-player game" — one tap, no re-picking roles every time.

## 4. Differentiator — what the listing leads with

> **The moderator gets to play.**

`useSpeech.js` is already in the repo. A narrated night phase — the app reads the script aloud, eyes open, eyes closed, the wolves choose — means nobody has to sit out to run the game. That is the single biggest structural complaint about werewolf as a format, it is solvable entirely on-device with TTS, and no competitor leads with it.

This also separates Nightfall from Ruse commercially, which matters: they are the highest-risk pair in the portfolio because they compete for the same shelf.

## 5. Killer feature — the reason someone opens it a second time

**Saved setups + a balance advisor.** A named preset ("Friday crew, 9 players") that remembers the roster and role mix, plus a live balance readout while building: village win probability, whether the game is mathematically decided, and which role to add.

Why:
- Setup is where groups abandon. A preset removes the whole step.
- The balance readout is a genuine expert-tool moment — it makes the app the reason the game is good, not just the timer.
- Pure arithmetic, fully offline, and no competitor has it.

Second hook, cheap: **the night recap.** After GameOver, a scrollable replay of what actually happened each night — who targeted whom, who was saved. `KillRevealArt.js` and `ResultShareCard.js` already exist; the recap is the thing groups argue about afterwards, and the share card is free distribution.

## 6. Navigation & flow findings (verified in code)

- **`src/components/ErrorBoundary.js` imports `SafeAreaView` from `react-native`** (line 6). That component is deprecated and is a no-op on Android — if the error boundary ever renders on an Android phone, its content sits under the status bar. Switch to `react-native-safe-area-context`.
- **`src/screens/SetupScreen.js` takes text input with no keyboard avoidance.** Entering 9 player names on a small phone means the keyboard covers the field.
- Abandon-game flow exists (`AbandonGameButton.js`) but is still listed as an open decision in the portfolio punch list — confirm it works from every mid-game screen and that Android hardware back does the same thing as the button.
- Good: keep-awake on all four game screens; haptics wired; `TabletContainer` for wide screens.

## 7. Layout — iOS and Android

- 11 files import `SafeAreaView` from `safe-area-context` (correct); one from `react-native` (above).
- `accessibilityLabel` appears once in the entire app. For a game read at arm's length in a dark room by people of mixed ages, that is a real gap — label every role card and every vote target.
- Dark ground (`#0B0B1E`) with amber accent: check contrast of the amber-on-near-black body text at 4.5:1. Glow effects commonly fail.
- Test at 1.3× system font scale — role descriptions are the longest text in the app.

## 8. Order of work

### P0
1. Fix the `react-native` `SafeAreaView` import in `ErrorBoundary.js`.
2. Keyboard avoidance on `SetupScreen.js`.
3. Verify the abandon-game flow from Night, Day, Vote and RoleReveal, and from Android hardware back.

### P1
4. **Saved setups** — roster + role mix, stored in `src/storage.js`, picker on `SetupScreen`.
5. **Balance advisor** on the setup screen — village/wolf win probability from the current mix, with a plain-language warning.
6. **Narrated night phase** built on `useSpeech.js`, with a visible on/off toggle and a visual fallback (never make audio the only channel).
7. **Night recap** on `GameOverScreen`.

### P2
8. Role expansion toward parity with Werewolf Master, prioritising roles that change the *shape* of a round rather than adding another one-shot ability.
9. `accessibilityLabel` pass across role cards and vote targets.
10. Expo SDK 55 → 57 alignment.
11. Cross-promotion card to Ruse / Dumb Charades on GameOver.

## 9. Decisions for the owner

1. **Narration voice.** System TTS is free and offline but sounds like a GPS. Recorded VO is atmospheric but adds app size and blocks localisation. Recommendation: system TTS, with the script written to sound acceptable in a flat voice.
2. **Bundle ID `com.dreamcrafterinnovations.nightfall`** — permanent after first submission.
3. **SDK 55 → 57 now or after launch.** Two majors behind is a compliance risk on Play; doing it before the first submission is cheaper than after.

## 10. Verification checklist

- [ ] Play a full 9-player game start to finish on a physical Android phone with no network.
- [ ] Screen never sleeps during Night, Day, Vote or RoleReveal.
- [ ] Every name field on Setup is reachable with the keyboard open on a ≤5.5" screen.
- [ ] Android hardware back during Night does the same thing as Abandon Game — never silently drops the round.
- [ ] Force an error to render the ErrorBoundary on Android — content is below the status bar.
- [ ] Existing Jest suite (14 suites / 319 tests) passes before and after — run it in the cloud container.
- [ ] Icon rendered at 29×29 and looked at (thin crescents fail at this size).

## Sources

- [Undercover: Word Party Game — Google Play](https://play.google.com/store/apps/details?id=com.yanstarstudio.joss.undercover&hl=en)
- [Imposter Game: Word Party — Google Play (India)](https://play.google.com/store/apps/details?id=com.gtm.imposter&hl=en_IN)
- [India Gaming Market — Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/india-gaming-market)
