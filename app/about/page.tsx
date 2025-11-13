import AboutPageClient from '@/app/about/AboutPageClient';
import { defaultLocale, getAllMessages, isLocale, type Locale, type MessagesByLocale } from '@/app/lib/i18n';

interface AboutPageProps {
  searchParams?: { lang?: string };
}

function resolveLocale(rawLang?: string): Locale {
  if (rawLang && isLocale(rawLang)) {
    return rawLang;
  }
  return defaultLocale;
}

export default function AboutPage({ searchParams }: AboutPageProps) {
  const locale = resolveLocale(searchParams?.lang);
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <AboutPageClient initialLocale={locale} initialMessages={messages} />;
}
