// analytics.js — native only (iOS / Android)
// Metro uses analytics.web.js automatically for web builds, so this
// file never runs on web. No Platform guards needed here.

let analytics = null;
let crashlytics = null;

try {
  analytics = require('@react-native-firebase/analytics').default();
} catch (_) {}
try {
  crashlytics = require('@react-native-firebase/crashlytics').default();
} catch (_) {}

export async function logGameStarted({ playerCount, villainThemeId }) {
  try {
    await analytics?.logEvent('game_started', {
      player_count: playerCount,
      villain_theme: villainThemeId,
    });
  } catch (_) {}
}

export async function logGameCompleted({ playerCount, villainThemeId, winner, rounds }) {
  try {
    await analytics?.logEvent('game_completed', {
      player_count: playerCount,
      villain_theme: villainThemeId,
      winner,
      rounds,
    });
  } catch (_) {}
}

export async function logThemeSelected(themeId) {
  try {
    await analytics?.logEvent('theme_selected', { villain_theme: themeId });
  } catch (_) {}
}

export async function logLanguageSelected(languageId) {
  try {
    await analytics?.logEvent('language_selected', { language: languageId });
  } catch (_) {}
}

export async function logScreenView(screenName) {
  try {
    await analytics?.logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch (_) {}
}

export async function logSettingsChanged(setting, oldValue, newValue) {
  try {
    await analytics?.logEvent('settings_changed', {
      setting,
      old_value: String(oldValue),
      new_value: String(newValue),
    });
  } catch (_) {}
}

export async function logThemeChanged(themeId) {
  try {
    await analytics?.logEvent('app_theme_changed', { theme_id: themeId });
  } catch (_) {}
}

export async function logDailyChallengeStarted(villainThemeId) {
  try {
    await analytics?.logEvent('daily_challenge_started', { villain_theme: villainThemeId });
  } catch (_) {}
}

export async function logDailyChallengeCompleted(villainThemeId) {
  try {
    await analytics?.logEvent('daily_challenge_completed', { villain_theme: villainThemeId });
  } catch (_) {}
}

export async function logBadgeEarned(badgeId) {
  try {
    await analytics?.logEvent('badge_earned', { badge_id: badgeId });
  } catch (_) {}
}

export async function recordError(error, context = '') {
  try {
    if (context) await crashlytics?.log(context);
    await crashlytics?.recordError(error);
  } catch (_) {}
}

export async function log(message) {
  try {
    await crashlytics?.log(message);
  } catch (_) {}
}
