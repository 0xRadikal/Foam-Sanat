'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createTranslator,
  defaultLocale,
  getAllMessages,
  isLocale,
  loadMessages,
  localeSettings,
  locales,
  namespaces,
  type Locale,
  type LocaleWithNamespaces,
  type MessagePath,
  type MessagesByLocale,
  type Namespace,
  type NamespaceMessages,
  type Translator
} from './index';

export type ThemePreference = 'light' | 'dark';

const LANG_STORAGE_KEY = 'foam-sanat-lang';
const THEME_STORAGE_KEY = 'foam-sanat-theme';

const isBrowser = typeof window !== 'undefined';

function readStoredLocale(initial: Locale): Locale {
  if (!isBrowser) return initial;
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string' && isLocale(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to read stored locale', error);
  }
  return initial;
}

function readStoredTheme(initial: ThemePreference): ThemePreference {
  if (!isBrowser) return initial;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (parsed === 'light' || parsed === 'dark') {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to read stored theme', error);
  }
  return initial;
}

function persistLocale(locale: Locale) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(locale));
  } catch (error) {
    console.warn('Failed to persist locale', error);
  }
}

function persistTheme(theme: ThemePreference) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn('Failed to persist theme', error);
  }
}

export interface LocaleThemeState {
  locale: Locale;
  theme: ThemePreference;
  dir: 'ltr' | 'rtl';
  langTag: string;
  isReady: boolean;
  toggleLocale: () => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemePreference) => void;
}

export function useLocaleTheme(
  initialLocale: Locale = defaultLocale,
  initialTheme: ThemePreference = 'light'
): LocaleThemeState {
  const [locale, setLocale] = useState<Locale>(() => readStoredLocale(initialLocale));
  const [theme, setTheme] = useState<ThemePreference>(() => readStoredTheme(initialTheme));
  const [isReady, setIsReady] = useState<boolean>(!isBrowser);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.dir = localeSettings[locale].dir;
    document.documentElement.lang = localeSettings[locale].langTag;
  }, [locale]);

  const handleSetLocale = useCallback((next: Locale) => {
    setLocale(next);
    persistLocale(next);
  }, []);

  const handleSetTheme = useCallback((next: ThemePreference) => {
    setTheme(next);
    persistTheme(next);
  }, []);

  const toggleLocale = useCallback(() => {
    const currentIndex = locales.indexOf(locale);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    handleSetLocale(nextLocale);
  }, [handleSetLocale, locale]);

  const toggleTheme = useCallback(() => {
    handleSetTheme(theme === 'light' ? 'dark' : 'light');
  }, [handleSetTheme, theme]);

  const { dir, langTag } = localeSettings[locale];

  return {
    locale,
    theme,
    dir,
    langTag,
    isReady,
    toggleLocale,
    toggleTheme,
    setLocale: handleSetLocale,
    setTheme: handleSetTheme
  };
}

export function useMessages<L extends Locale>(locale: L): MessagesByLocale<L> | null {
  const [messages, setMessages] = useState<MessagesByLocale<L> | null>(() => {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    return getAllMessages(locale);
  });

  useEffect(() => {
    let active = true;

    if (process.env.NODE_ENV !== 'production') {
      setMessages(getAllMessages(locale));
      return () => {
        active = false;
      };
    }

    (async () => {
      const commonMessages = await loadMessages(locale, 'common');
      if (!active) return;
      const homeMessages = await loadMessages(locale, 'home');
      if (!active) return;
      const aboutMessages = await loadMessages(locale, 'about');
      if (!active) return;
      const productsMessages = await loadMessages(locale, 'products');
      if (!active) return;

      const aggregated = {
        common: commonMessages as MessagesByLocale<L>['common'],
        home: homeMessages as MessagesByLocale<L>['home'],
        about: aboutMessages as MessagesByLocale<L>['about'],
        products: productsMessages as MessagesByLocale<L>['products']
      };

      setMessages(aggregated as MessagesByLocale<L>);
    })().catch((error) => {
      console.error('Failed to load messages for locale', locale, error);
    });

    return () => {
      active = false;
    };
  }, [locale]);

  return messages;
}

export interface UseTranslatorResult<L extends Locale, N extends Namespace> {
  translator: Translator<L, N>;
  messages: NamespaceMessages<N>;
}

export function useTranslator<L extends Locale, N extends Namespace>(
  locale: L,
  namespace: N,
  allMessages: MessagesByLocale<L> | null
): UseTranslatorResult<L, N> | null {
  const namespaceMessages = allMessages?.[namespace] ?? null;

  return useMemo(() => {
    if (!namespaceMessages) {
      return null;
    }

    const translator = createTranslator(locale, namespace, namespaceMessages);
    return { translator, messages: namespaceMessages };
  }, [locale, namespace, namespaceMessages]);
}

export function getNamespacePaths<N extends Namespace>(namespace: N): MessagePath<NamespaceMessages<N>>[] {
  const messages = getAllMessages(defaultLocale)[namespace];
  const paths: MessagePath<typeof messages>[] = [];

  const walk = (value: unknown, prefix = ''): void => {
    if (value == null) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      paths.push(prefix as MessagePath<typeof messages>);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const nextPrefix = prefix ? `${prefix}.${index}` : `${index}`;
        walk(item, nextPrefix);
      });
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        walk(child, nextPrefix);
      });
    }
  };

  walk(messages, '');

  return paths.filter((path) => path.length > 0);
}

export function getAvailableNamespaces(): LocaleWithNamespaces[] {
  return locales.map((locale) => ({
    locale,
    namespaces: [...namespaces]
  }));
}

