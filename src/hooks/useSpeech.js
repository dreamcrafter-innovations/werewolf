import { useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { loadSettings } from '../storage';

/**
 * Reads narratorEnabled from persisted settings and exposes speak/stop helpers.
 * speak() is a no-op when narration is disabled, so callers need no guard.
 */
export function useSpeech() {
  const enabledRef = useRef(false);

  useEffect(() => {
    loadSettings().then(s => {
      enabledRef.current = s?.narratorEnabled ?? false;
    });
    return () => { Speech.stop(); };
  }, []);

  const speak = useCallback((text) => {
    if (!enabledRef.current) return;
    Speech.stop();
    Speech.speak(text, { rate: 0.85, pitch: 0.8 });
  }, []);

  const stop = useCallback(() => Speech.stop(), []);

  return { speak, stop };
}
