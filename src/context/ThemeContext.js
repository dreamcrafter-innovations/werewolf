// ThemeContext.js — App-wide theme management for Bhoot Gaon.
// Stores the selected palette ID in AsyncStorage and provides it app-wide.
// Screens read { palette, themeId, setTheme, isDark } from useTheme().

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paletteForThemeId, PALETTE_IDS } from '../theme/colors';
import { saveSettings, loadSettings } from '../storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState('shadow');

  // Restore persisted theme on mount
  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      if (s?.themeId && PALETTE_IDS.includes(s.themeId)) {
        setThemeIdState(s.themeId);
      }
    })();
  }, []);

  const setTheme = useCallback(async (id) => {
    if (!PALETTE_IDS.includes(id)) return;
    setThemeIdState(id);
    const existing = (await loadSettings()) ?? {};
    await saveSettings({ ...existing, themeId: id });
  }, []);

  const palette = paletteForThemeId(themeId);
  const isDark  = palette.isDark ?? true;

  return (
    <ThemeContext.Provider value={{ themeId, palette, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
