import AboutPageClient from '@/app/about/AboutPageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';

interface AboutPageProps {
  searchParams?: { lang?: string };
}

export default function AboutPage({ searchParams }: AboutPageProps) {
  const locale = resolveLocale(searchParams?.lang);
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <AboutPageClient initialLocale={locale} initialMessages={messages} />;
}
