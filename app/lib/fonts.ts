import { Inter, Vazirmatn } from 'next/font/google';
import type { Locale } from '@/app/lib/i18n';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-vazirmatn',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

export const localeFontMap: Record<Locale, typeof vazirmatn | typeof inter> = {
  fa: vazirmatn,
  en: inter,
};
