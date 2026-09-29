import React from 'react';
import { Pressable } from 'react-native';
import { tap } from './haptics';

/**
 * Drop-in Pressable with press feedback: a slight dip + shrink while held and
 * a selection haptic on press. Caller styles (object or function) still apply.
 * Pass haptic={false} for high-frequency or background taps.
 */
export function Tap({ style, onPress, haptic = true, ...rest }) {
  return (
    <Pressable
      {...rest}
      onPress={
        onPress &&
        ((e) => {
          if (haptic) tap();
          onPress(e);
        })
      }
      style={(state) => [typeof style === 'function' ? style(state) : style, state.pressed && PRESSED]}
    />
  );
}

const PRESSED = { opacity: 0.82, transform: [{ scale: 0.98 }] };
