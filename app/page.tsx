import HomePageClient from '@/app/components/home/HomePageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';

interface PageProps {
  // Next.js 15: searchParams is provided as a Promise.
  searchParams?: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(resolvedSearchParams?.lang, { warn: true });
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <HomePageClient initialLocale={locale} initialMessages={messages} />;
}
