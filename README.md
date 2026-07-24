# 🌕 Bhoot Gaon — भूत गाँव
### A Haunted Indian Village Werewolf Game

> *"Gaon mein kuch toh hai..."*

A spooky, kid-friendly Werewolf/Mafia party game set in a haunted Indian village. Built with React Native + Expo SDK 51 for iOS, Android, and Web.

---

## 🎮 How to Play

**Players:** 4–16 players, one shared phone

1. **Setup** — Enter all player names and avatars
2. **Role Reveal** — Pass the phone around; each player secretly sees their role
3. **Night Phase** — Narrator uses the app to guide night actions (eyes closed!)
4. **Day Phase** — Morning reveals who died; village discusses
5. **Voting** — Vote someone out; most votes = eliminated
6. **Repeat** — Until village or Pisach wins!

---

## 👥 Roles

| Role | Hindi | Team | Ability |
|------|-------|------|---------|
| 👿 Pisach | पिशाच | Evil | Kills one villager each night |
| 🧑‍🌾 Gaon Wasi | गाँव वासी | Good | No special power |
| 🔮 Tantrik | तांत्रिक | Good | Checks one player's alignment each night |
| 🌿 Vaidya | वैद्य | Good | Protects one player each night |
| 🏹 Shikari | शिकारी | Good | When eliminated, takes one player with them |
| 👑 Mukhiya | मुखिया | Good | Vote counts double |

---

## ⚖️ Role Distribution

| Players | Pisach | Tantrik | Vaidya | Shikari | Mukhiya |
|---------|--------|---------|--------|---------|---------|
| 4–5 | 1 | ✓ | – | – | – |
| 6 | 1 | ✓ | ✓ | – | – |
| 7–8 | 1 | ✓ | ✓ | ✓ | – |
| 9 | 2 | ✓ | ✓ | ✓ | – |
| 10+ | 2–3 | ✓ | ✓ | ✓ | ✓ |

---

## 🚀 Getting Started

```bash
npm install
npx expo start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web browser

---

## 🏗️ Architecture

```
src/
  context/GameContext.js    — All game state (useReducer)
  navigation/AppNavigator.js
  screens/
    HomeScreen.js           — Spooky title screen
    SetupScreen.js          — Player name/avatar setup
    RoleRevealScreen.js     — Private role reveal (pass phone)
    NightScreen.js          — Narrator night phase guide
    DayScreen.js            — Morning reveal + discussion
    VoteScreen.js           — Voting + Shikari revenge
    GameOverScreen.js       — Victory/defeat + full reveal
  components/
    Gradient.js             — Cross-platform gradient wrapper
    theme.js                — Colors, fonts, shadows
  data/roles.js             — Role definitions + assignment logic
  utils/gameLogic.js        — Win conditions, vote tally, etc.
```

**Key patterns (same as Imposter India):**
- `Pressable` wrapping `Animated.View` for web compatibility
- Custom `Gradient.js` (CSS on web, solid color on native)
- React Navigation `linking` config for web URL routing
- All state client-side in `GameContext` (no backend)
- EAS Build for cloud compilation

---

## 📦 Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS/Android
eas build --platform ios
eas build --platform android
```

---

## ✨ Unique Features

- **Bilingual narrator text** — Hindi + English atmospheric mix
- **Indian folklore roles** — Pisach, Tantrik, Vaidya, Shikari, Mukhiya
- **Spooky prophecies** — Random Hindi omens each round
- **Village atmosphere** — Diya 🪔 motifs, dark indigo + amber palette
- **Shikari revenge mechanic** — Dramatic "last arrow" moment
- **Mukhiya double vote** — Adds political intrigue
- **Full role reveal** — Game over screen shows everyone's secret role

---

*Built with ❤️ for Indian party game nights*
