import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Shared tactile vocabulary. No-op on web; never throws.
// In-app switch: the choice is saved on the device (KEY) and read once at launch. The OS
// system-haptics setting still applies on top of this.
const KEY = 'dc.haptics.enabled';
const native = Platform.OS !== 'web';
let enabled = true;
const listeners = new Set();

if (native) {
  try {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === '0') {
          enabled = false;
          listeners.forEach((l) => l(false));
        }
      })
      .catch(() => {});
  } catch {} // storage module missing (e.g. unit tests)
}

export const isHapticsEnabled = () => enabled;

export const setHapticsEnabled = (v) => {
  enabled = v;
  listeners.forEach((l) => l(v));
  try {
    AsyncStorage.setItem(KEY, v ? '1' : '0').catch(() => {});
  } catch {}
};

/** [on, setOn] for a settings switch; stays in sync with the saved value. */
export const useHapticsEnabled = () => {
  const [on, setOn] = useState(enabled);
  useEffect(() => {
    listeners.add(setOn);
    setOn(enabled);
    return () => {
      listeners.delete(setOn);
    };
  }, []);
  return [on, setHapticsEnabled];
};

const run = (fire) => {
  if (native && enabled) fire().catch(() => {});
};

export const tap = () => run(() => Haptics.selectionAsync());
export const bump = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const success = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
