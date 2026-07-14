import AboutPageClient from '@/app/about/AboutPageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';

interface AboutPageProps {
  // Next.js 15: searchParams is provided as a Promise.
  searchParams?: Promise<{ lang?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(resolvedSearchParams?.lang, { warn: true });
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <AboutPageClient initialLocale={locale} initialMessages={messages} />;
}
