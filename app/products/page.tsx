import ProductsPageClient from '@/app/products/ProductsPageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';

interface ProductsPageProps {
  searchParams?: { lang?: string };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const locale = resolveLocale(searchParams?.lang);
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);

  return <ProductsPageClient initialLocale={locale} initialMessages={messages} />;
}
