'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  defaultLocale,
  isLocale,
  locales,
  localeSettings,
  type Locale
} from '@/app/lib/i18n';

type Theme = 'light' | 'dark';

const LANG_STORAGE_KEY = 'foam-sanat-lang';
const THEME_STORAGE_KEY = 'foam-sanat-theme';

const DEFAULT_LANG: Locale = defaultLocale;
const DEFAULT_THEME: Theme = 'light';

export interface SiteChromeState {
  lang: Locale;
  dir: 'ltr' | 'rtl';
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

const SiteChromeContext = createContext<SiteChromeState | null>(null);

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(DEFAULT_LANG);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mobileMenuOpen, setMobileMenuOpenState] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (storedLang) {
        const parsed = JSON.parse(storedLang);
        if (typeof parsed === 'string' && isLocale(parsed)) {
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { dir, langTag } = localeSettings[lang];

    root.lang = langTag;
    root.dir = dir;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty(
      '--site-font-family',
      lang === 'fa' ? 'Vazirmatn, system-ui, sans-serif' : 'system-ui, sans-serif'
    );
  }, [lang, theme]);

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
      const currentIndex = locales.indexOf(prev);
      const next = locales[(currentIndex + 1) % locales.length];
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

  const { dir } = localeSettings[lang];

  const value = useMemo<SiteChromeState>(
    () => ({
      lang,
      dir,
      theme,
      mobileMenuOpen,
      isRTL: dir === 'rtl',
      isDark: theme === 'dark',
      setLang: persistLang,
      setTheme: persistTheme,
      setMobileMenuOpen: handleSetMobileMenuOpen,
      toggleLang,
      toggleTheme,
      toggleMobileMenu,
      closeMobileMenu
    }),
    [
      lang,
      dir,
      theme,
      mobileMenuOpen,
      persistLang,
      persistTheme,
      handleSetMobileMenuOpen,
      toggleLang,
      toggleTheme,
      toggleMobileMenu,
      closeMobileMenu
    ]
  );

  return createElement(SiteChromeContext.Provider, { value }, children);
}

export function useSiteChrome(): SiteChromeState {
  const context = useContext(SiteChromeContext);
  if (!context) {
    throw new Error('useSiteChrome must be used within a SiteChromeProvider');
  }
  return context;
}
