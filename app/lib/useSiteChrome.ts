// app/lib/useSiteChrome.ts - UPDATED to use centralized theme tokens
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
import { THEME_TOKENS, type Theme, type ChromeThemeTokens } from '@/app/lib/theme-tokens'; // ✅ Import theme tokens

const LANG_STORAGE_KEY = 'foam-sanat-lang';
const THEME_STORAGE_KEY = 'foam-sanat-theme';

const DEFAULT_LANG: Locale = defaultLocale;
const DEFAULT_THEME: Theme = 'light';

function readStoredLang(fallback: Locale): Locale {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (storedLang) {
      const parsed = JSON.parse(storedLang);
      if (typeof parsed === 'string' && isLocale(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load language from storage:', error);
  }

  return fallback;
}

function readStoredTheme(fallback: Theme): Theme {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
      const parsed = JSON.parse(storedTheme) as Theme;
      if (parsed === 'light' || parsed === 'dark') {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
  }

  return fallback;
}

export interface SiteChromeState {
  lang: Locale;
  dir: 'ltr' | 'rtl';
  theme: Theme;
  mobileMenuOpen: boolean;
  isRTL: boolean;
  isDark: boolean;
  fontFamily: string;
  themeClasses: ChromeThemeTokens;
  setLang: (nextLang: Locale) => void;
  setTheme: (nextTheme: Theme) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const SiteChromeContext = createContext<SiteChromeState | null>(null);

export function SiteChromeProvider({
  children,
  initialLocale = DEFAULT_LANG
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [lang, setLangState] = useState<Locale>(() => readStoredLang(initialLocale));
  // Hydrate with the server default theme to prevent SSR/CSR mismatches, then sync the stored preference on the client.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mobileMenuOpen, setMobileMenuOpenState] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme(DEFAULT_THEME);
    if (stored !== theme) {
      setThemeState(stored);
    }
  }, [theme]);

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
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to persist language preference:', error);
      }
    }
  }, []);

  const persistTheme = useCallback((value: Theme) => {
    setThemeState(value);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to persist theme preference:', error);
      }
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const currentIndex = locales.indexOf(prev);
      const next = locales[(currentIndex + 1) % locales.length];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
          console.warn('Failed to persist language preference:', error);
        }
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
          console.warn('Failed to persist theme preference:', error);
        }
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    if (mobileMenuOpen) {
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
    } else {
      body.style.overflow = '';
      body.style.touchAction = '';
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [mobileMenuOpen]);

  const handleSetMobileMenuOpen = useCallback((open: boolean) => {
    setMobileMenuOpenState(open);
  }, []);

  const { dir } = localeSettings[lang];

  const fontFamily = useMemo(
    () => (lang === 'fa' ? 'Vazirmatn, sans-serif' : 'system-ui, sans-serif'),
    [lang]
  );

  // ✅ REFACTOR #1: Use centralized theme tokens instead of inline definitions
  const themeClasses = useMemo<ChromeThemeTokens>(
    () => THEME_TOKENS[theme],
    [theme]
  );

  const value = useMemo<SiteChromeState>(
    () => ({
      lang,
      dir,
      theme,
      mobileMenuOpen,
      isRTL: dir === 'rtl',
      isDark: theme === 'dark',
      fontFamily,
      themeClasses,
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
      closeMobileMenu,
      fontFamily,
      themeClasses
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