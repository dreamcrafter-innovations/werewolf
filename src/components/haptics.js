import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Shared tactile vocabulary. No-op on web; never throws.
// ponytail: no in-app "haptics off" switch; the OS system-haptics setting governs. Add one if users ask.
const on = Platform.OS !== 'web';
const run = (fire) => {
  if (on) fire().catch(() => {});
};

export const tap = () => run(() => Haptics.selectionAsync());
export const bump = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const success = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
