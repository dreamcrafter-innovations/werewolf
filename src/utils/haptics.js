// haptics.js
// Thin wrapper around expo-haptics, gated by the "Haptic Feedback" setting.
// expo-haptics is already a project dependency but was never actually imported anywhere —
// the Settings toggle saved a value that nothing ever read. This makes it real.
//
// The enabled flag is cached at module scope (not per-component) so every screen shares
// one source of truth without a storage round-trip on every tap, and so it updates
// instantly when the user flips the toggle in Settings — call setHapticsEnabledCache()
// from there.
import * as Haptics from 'expo-haptics';
import { loadSettings } from '../storage';

let hapticsEnabled = true; // optimistic default, matches SettingsScreen's initial state
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  try {
    const s = await loadSettings();
    hapticsEnabled = s?.hapticsEnabled ?? true;
  } catch (_) {
    // keep default
  } finally {
    loaded = true;
  }
}
// Kick off the initial load right away so it's usually already resolved by the time
// the player's first tap happens.
ensureLoaded();

export function setHapticsEnabledCache(value) {
  hapticsEnabled = value;
  loaded = true;
}

function fire(fn) {
  if (!hapticsEnabled) return;
  try {
    const result = fn();
    // expo-haptics returns a promise; swallow rejections (e.g. unsupported on web)
    // the same way the rest of this app treats native-only APIs as best-effort.
    if (result?.catch) result.catch(() => {});
  } catch (_) {}
}

export const haptics = {
  light:   () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium:  () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
