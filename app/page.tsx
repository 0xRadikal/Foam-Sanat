import HomePageClient from '@/app/components/home/HomePageClient';
import { defaultLocale, getAllMessages, isLocale, type Locale, type MessagesByLocale } from '@/app/lib/i18n';

interface PageProps {
  searchParams?: { lang?: string };
}

function resolveLocale(rawLang?: string): Locale {
  if (rawLang && isLocale(rawLang)) {
    return rawLang;
  }
  return defaultLocale;
}

export default function HomePage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams?.lang);
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <HomePageClient initialLocale={locale} initialMessages={messages} />;
}
