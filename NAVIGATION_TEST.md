# werewolf — Navigation Test Map

> Auto-generated from source by `_webtest/nav-extract.js` on 2026-09-30. Route list is exact for file-based routing; edges are best-effort (string-literal targets only). Extend the **Flows** section by hand.

- **App package root:** `.`
- **Navigation mode:** react-navigation (no file routes)
- **Screens/layouts found:** 12
- **Entry gate:** Has an onboarding/welcome route – test harness must complete it first (state is not persisted on web reload).

## Web-test limitations for this app

- none detected

## Screens

| # | Route / screen | File | Inputs | Notes |
|---|---|---|---|---|
| 1 | `Home` | `src/navigation/AppNavigator.js` | 0 |  |
| 2 | `Daily` | `src/navigation/AppNavigator.js` | 0 |  |
| 3 | `Leaderboard` | `src/navigation/AppNavigator.js` | 0 |  |
| 4 | `Settings` | `src/navigation/AppNavigator.js` | 0 |  |
| 5 | `Tabs` | `src/navigation/AppNavigator.js` | 0 |  |
| 6 | `Setup` | `src/navigation/AppNavigator.js` | 0 |  |
| 7 | `RoleReveal` | `src/navigation/AppNavigator.js` | 0 |  |
| 8 | `Night` | `src/navigation/AppNavigator.js` | 0 |  |
| 9 | `Day` | `src/navigation/AppNavigator.js` | 0 |  |
| 10 | `Vote` | `src/navigation/AppNavigator.js` | 0 |  |
| 11 | `GameOver` | `src/navigation/AppNavigator.js` | 0 |  |
| 12 | `HowToPlay` | `src/navigation/AppNavigator.js` | 0 |  |

## Navigation edges (source → target)

- none extracted (navigation may be state-driven; map manually)

## Per-screen test checklist

For every screen above, the web test must confirm:

- [ ] reachable from its parent via real UI taps (not by typing the URL)
- [ ] renders text (not blank) with no console error / pageerror
- [ ] Back (or browser back) returns to the previous screen
- [ ] every primary button leads somewhere or changes state visibly
- [ ] inputs accept text and validation messages appear for bad input
- [ ] layout: nothing clipped at 390px width; scrolls when content is long

## Flows (fill in / extend)

1. **First launch:** _(describe onboarding steps here)_
2. **Core task:** _(the main thing a user does, step by step, with expected result)_
3. **Settings round-trip:** open Settings → change a setting → go back → confirm it stuck

## Coverage record

| Date | Method | Routes reached / total | Console errors | Notes |
|---|---|---|---|---|
| 2026-09-30 | Playwright flow: Quick Start, full game via driver: /role-reveal > /night > /day > /vote > /game-over | 6 screens | 0 | flow: werewolf.js. Only one random game exercised; other role combos not verified |
