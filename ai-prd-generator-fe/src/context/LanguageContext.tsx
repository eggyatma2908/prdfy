import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import id from '../locales/id.json';

export type Locale = 'en' | 'id';

const translations: Record<Locale, any> = { en, id };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('app_locale');
    if (saved === 'id' || saved === 'en') return saved;
    return 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        let fallback: any = translations['en'];
        let foundFallback = true;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            foundFallback = false;
            break;
          }
        }
        if (foundFallback) {
          value = fallback;
        } else {
          value = key;
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (replacements) {
      let result = value;
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
      return result;
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
