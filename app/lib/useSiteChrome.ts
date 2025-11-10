'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/app/lib/i18n';

type Theme = 'light' | 'dark';

const LANG_STORAGE_KEY = 'foam-sanat-lang';
const THEME_STORAGE_KEY = 'foam-sanat-theme';

const DEFAULT_LANG: Locale = 'fa';
const DEFAULT_THEME: Theme = 'light';

export interface SiteChromeState {
  lang: Locale;
  theme: Theme;
  mobileMenuOpen: boolean;
  isRTL: boolean;
  isDark: boolean;
  setLang: (nextLang: Locale) => void;
  setTheme: (nextTheme: Theme) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export function useSiteChrome(): SiteChromeState {
  const [lang, setLangState] = useState<Locale>(DEFAULT_LANG);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mobileMenuOpen, setMobileMenuOpenState] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (storedLang) {
        const parsed = JSON.parse(storedLang) as Locale;
        if (parsed === 'fa' || parsed === 'en') {
          setLangState(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load language from storage:', error);
    }

    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        const parsed = JSON.parse(storedTheme) as Theme;
        if (parsed === 'light' || parsed === 'dark') {
          setThemeState(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }, []);

  const persistLang = useCallback((value: Locale) => {
    setLangState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(value));
    }
  }, []);

  const persistTheme = useCallback((value: Theme) => {
    setThemeState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'fa' ? 'en' : 'fa';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpenState((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpenState(false);
  }, []);

  const handleSetMobileMenuOpen = useCallback((open: boolean) => {
    setMobileMenuOpenState(open);
  }, []);

  return {
    lang,
    theme,
    mobileMenuOpen,
    isRTL: lang === 'fa',
    isDark: theme === 'dark',
    setLang: persistLang,
    setTheme: persistTheme,
    setMobileMenuOpen: handleSetMobileMenuOpen,
    toggleLang,
    toggleTheme,
    toggleMobileMenu,
    closeMobileMenu
  };
}
