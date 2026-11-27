'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  dictionaries,
  LOCALES,
  type Locale,
} from './dictionaries';

const STORAGE_KEY = 'hal_locale';

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** `t('section.key')`, avec interpolation `{param}` via le 2ᵉ argument. */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const [section, name] = key.split('.');
  const value =
    dictionaries[locale]?.[section]?.[name] ??
    dictionaries[DEFAULT_LOCALE]?.[section]?.[name] ??
    key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, p: string) =>
    p in params ? String(params[p]) : `{${p}}`,
  );
}

interface Props {
  children: React.ReactNode;
  /** Langue du profil connecté ; prioritaire sur le choix local anonyme. */
  userLocale?: string | null;
}

export function I18nProvider({ children, userLocale }: Props) {
  // SSR + 1ᵉʳ rendu client : DEFAULT_LOCALE, puis correction en effet
  // (évite tout écart d'hydratation ; bref flash pour les non-francophones).
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage indisponible */
    }
    const resolved: Locale = isLocale(userLocale)
      ? userLocale
      : isLocale(stored)
        ? stored
        : DEFAULT_LOCALE;
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture navigateur post-hydratation (SSR-safe)
    setLocaleState(resolved);
  }, [userLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
