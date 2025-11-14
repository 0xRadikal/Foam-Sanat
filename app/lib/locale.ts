import { defaultLocale, isLocale, type Locale } from './i18n/locales';

export function resolveLocale(rawLang?: string): Locale {
  if (rawLang && isLocale(rawLang)) {
    return rawLang;
  }

  return defaultLocale;
}
