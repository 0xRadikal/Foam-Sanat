import { headers } from 'next/headers';
import Script from 'next/script';
import ProductsPageClient from '@/app/products/ProductsPageClient';
import { getAllMessages, type MessagesByLocale } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';
import { getBreadcrumbSchema, getProductSchemas } from '@/app/lib/seo/schema';
import { sanitizeForInnerHTML } from '@/app/lib/sanitize';
import { getCommentsAvailability } from '@/app/api/comments/lib/status';

interface ProductsPageProps {
  searchParams?: { lang?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const locale = resolveLocale(searchParams?.lang, { warn: true });
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);
  const cspNonce = headers().get('x-csp-nonce') ?? undefined;
  const productSchemas = getProductSchemas(locale as 'fa' | 'en');
  const breadcrumbSchema = getBreadcrumbSchema(locale as 'fa' | 'en', [
    { name: messages.common.nav.home, path: '' },
    { name: messages.common.nav.products, path: 'products' },
  ]);
  const commentsAvailability = await getCommentsAvailability();

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={cspNonce}
        dangerouslySetInnerHTML={{
          __html: sanitizeForInnerHTML(JSON.stringify(productSchemas)),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={cspNonce}
        dangerouslySetInnerHTML={{
          __html: sanitizeForInnerHTML(JSON.stringify(breadcrumbSchema)),
        }}
      />
      <ProductsPageClient
        initialLocale={locale}
        initialMessages={messages}
        commentsEnabled={commentsAvailability.enabled}
        commentsDisabledReason={commentsAvailability.reason}
      />
    </>
  );
}
