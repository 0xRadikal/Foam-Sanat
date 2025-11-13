import ProductsPageClient from '@/app/products/ProductsPageClient';
import { defaultLocale, getAllMessages, isLocale, type Locale, type MessagesByLocale } from '@/app/lib/i18n';

interface ProductsPageProps {
  searchParams?: { lang?: string };
}

function resolveLocale(rawLang?: string): Locale {
  if (rawLang && isLocale(rawLang)) {
    return rawLang;
  }
  return defaultLocale;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const locale = resolveLocale(searchParams?.lang);
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <ProductsPageClient initialLocale={locale} initialMessages={messages} />;
}
