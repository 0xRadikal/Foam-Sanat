import HomePageClient from '@/app/components/home/HomePageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';

interface PageProps {
  searchParams?: { lang?: string };
}

export default function HomePage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams?.lang, { warn: true });
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <HomePageClient initialLocale={locale} initialMessages={messages} />;
}
