import React, { createContext, useContext, useState, useCallback } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../data/languages';
import { STRINGS } from '../data/strings';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [languageId, setLanguageId] = useState(DEFAULT_LANGUAGE);

  const setLanguage = useCallback((id) => {
    if (LANGUAGES[id]) setLanguageId(id);
  }, []);

  const t = useCallback((key) => {
    const langStrings = STRINGS[languageId] || STRINGS[DEFAULT_LANGUAGE];
    return langStrings[key] ?? STRINGS[DEFAULT_LANGUAGE][key] ?? key;
  }, [languageId]);

  return (
    <LanguageContext.Provider value={{ languageId, setLanguage, t, lang: LANGUAGES[languageId] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
