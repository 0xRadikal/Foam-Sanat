export const locales = ['fa', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fa';

export const localeSettings = {
  fa: {
    label: 'فارسی',
    dir: 'rtl',
    langTag: 'fa-IR',
    analyticsEnabled: true,
  },
  en: {
    label: 'English',
    dir: 'ltr',
    langTag: 'en-US',
    analyticsEnabled: true,
  }
} as const satisfies Record<Locale, { label: string; dir: 'ltr' | 'rtl'; langTag: string; analyticsEnabled: boolean }>;

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export type LocaleRecord<T> = { [L in Locale]: T };
