import { defaultLocale, isLocale, type Locale } from './i18n/locales';

export function resolveLocale(rawLang?: string, { warn = false }: { warn?: boolean } = {}): Locale {
  if (rawLang && isLocale(rawLang)) {
    return rawLang;
  }

  if (warn && rawLang && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`Unsupported locale "${rawLang}" received, falling back to ${defaultLocale}.`);
  }

  return defaultLocale;
}
