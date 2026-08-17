import { useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { loadSettings } from '../storage';

/**
 * Reads narratorEnabled from persisted settings and exposes speak/stop helpers.
 * speak() is a no-op when narration is disabled, so callers need no guard.
 */
export const NARRATOR_DEFAULTS = { rate: 0.85, pitch: 0.8 };

export function useSpeech() {
  // Default on: the narrator is Nightfall's standout feature and a first-time user who
  // never finds the Settings toggle would otherwise never hear it.
  const enabledRef = useRef(true);
  // Voice shape is user-tunable in Settings — a slow, low narrator suits a horror table,
  // but it is unusably slow for some players and some device voices.
  const voiceRef = useRef({ ...NARRATOR_DEFAULTS });

  useEffect(() => {
    loadSettings().then(s => {
      enabledRef.current = s?.narratorEnabled ?? true;
      voiceRef.current = {
        rate:  s?.narratorRate  ?? NARRATOR_DEFAULTS.rate,
        pitch: s?.narratorPitch ?? NARRATOR_DEFAULTS.pitch,
      };
    });
    return () => { Speech.stop(); };
  }, []);

  const speak = useCallback((text) => {
    if (!enabledRef.current || !text) return;
    Speech.stop();
    Speech.speak(text, voiceRef.current);
  }, []);

  const stop = useCallback(() => Speech.stop(), []);

  // Lets a caller (the first-run narrator prompt) flip narration immediately, without
  // waiting for a remount to re-read storage.
  const setEnabled = useCallback((val) => {
    enabledRef.current = val;
    if (!val) Speech.stop();
  }, []);

  return { speak, stop, setEnabled };
}
