import { headers } from 'next/headers';
import Script from 'next/script';
import ProductsPageClient from '@/app/products/ProductsPageClient';
import { getAllMessages, type Locale, type MessagesByLocale, type ProductsNamespaceSchema } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';
import { getBreadcrumbSchema, getProductSchemas } from '@/app/lib/seo/schema';
import { sanitizeForInnerHTML } from '@/app/lib/sanitize';
import { getCommentsAvailability } from '@/app/api/comments/lib/status';
import { prisma } from '@/app/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductsPageProps {
  searchParams?: { lang?: string };
}

type UiProduct = ProductsNamespaceSchema['products'][number];
type UiCategory = ProductsNamespaceSchema['categories'][number];

type PrismaProduct = Prisma.ProductGetPayload<{
  include: { category: true; media: true };
}>;

const LOCALE_MAP: Record<Locale, { localeTag: string; currency: string }> = {
  fa: { localeTag: 'fa-IR', currency: 'IRR' },
  en: { localeTag: 'en-US', currency: 'IRR' },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : [];

const formatPrice = (
  product: PrismaProduct,
  locale: Locale,
  messages: MessagesByLocale<Locale>,
): { priceLabel: string; hasPrice: boolean; priceMode: UiProduct['priceMode']; priceNote: string | null } => {
  const priceMode = product.priceMode ?? 'UNAVAILABLE';
  const priceNote = locale === 'fa' ? product.priceNoteFa ?? null : product.priceNoteEn ?? null;

  if (priceMode !== 'FIXED') {
    const priceModes = messages.products.ui.priceModes;
    const labelMap = {
      CONTACT: priceModes.contact,
      NEGOTIABLE: priceModes.negotiable,
      FREE: priceModes.free,
      UNAVAILABLE: priceModes.unavailable,
      FIXED: priceModes.fixed,
    } as const;
    const resolvedMode = (priceMode ?? 'UNAVAILABLE') as keyof typeof labelMap;
    return {
      priceLabel: priceNote || labelMap[resolvedMode],
      hasPrice: false,
      priceMode,
      priceNote,
    };
  }

  const numeric = product.priceAmount ? Number(product.priceAmount) : NaN;
  if (Number.isNaN(numeric)) {
    return {
      priceLabel: messages.products.ui.priceModes.unavailable,
      hasPrice: false,
      priceMode: 'UNAVAILABLE',
      priceNote,
    };
  }
  const formatter = new Intl.NumberFormat(LOCALE_MAP[locale].localeTag, {
    style: 'currency',
    currency: LOCALE_MAP[locale].currency,
    maximumFractionDigits: 0,
  });
  return { priceLabel: formatter.format(numeric), hasPrice: true, priceMode, priceNote };
};

const buildCategoriesByLocale = (
  locale: Locale,
  messages: MessagesByLocale<Locale>,
  products: PrismaProduct[],
): UiCategory[] => {
  const allCategory = messages.products.categories.find((cat) => cat.id === 'all');
  const allLabel = allCategory?.name ?? (locale === 'fa' ? 'همه' : 'All');
  const slugSet = new Set<string>();
  const categories: UiCategory[] = [{ id: 'all', name: allLabel }];

  for (const product of products) {
    const slug = product.category?.slug;
    if (!slug || slugSet.has(slug)) continue;
    slugSet.add(slug);
    categories.push({
      id: slug,
      name: locale === 'fa' ? product.category?.nameFa ?? slug : product.category?.nameEn ?? slug,
    });
  }

  return categories;
};

const mapProductToUi = (product: PrismaProduct, locale: Locale, messages: MessagesByLocale<Locale>): UiProduct => {
  const specsRecord = isRecord(product.specs) ? product.specs : {};
  const localizedName = locale === 'fa' ? product.titleFa : product.titleEn;
  const localizedShort = locale === 'fa' ? product.shortFa : product.shortEn;
  const localizedDesc = locale === 'fa' ? product.descFa : product.descEn;
  const { priceLabel, hasPrice, priceMode, priceNote } = formatPrice(product, locale, messages);

  const badge = toStringValue(specsRecord.badge) || undefined;

  return {
    id: product.id,
    category: product.category?.slug ?? 'all',
    name: localizedName,
    images: (product.media ?? [])
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((media) =>
        media.type === 'EMOJI'
          ? { type: 'emoji', value: media.emoji ?? '' }
          : { type: 'url', value: media.url ?? '' },
      ),
    price: priceLabel,
    priceMode,
    priceNote,
    badge,
    shortDesc: localizedShort,
    description: localizedDesc,
    fullDescription: toStringValue(specsRecord.fullDescription) || localizedDesc,
    features: toStringArray(specsRecord.features),
    specs: {
      pressure: toStringValue(specsRecord.pressure),
      capacity: toStringValue(specsRecord.capacity),
      temp: toStringValue(specsRecord.temp),
      power: toStringValue(specsRecord.power),
      dimensions: toStringValue(specsRecord.dimensions),
    },
    applications: toStringArray(specsRecord.applications),
    hasPrice,
    commentsEnabled: product.commentsEnabled ?? true,
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const locale = resolveLocale(searchParams?.lang, { warn: true });
  const messages: MessagesByLocale<typeof locale> = getAllMessages(locale);
  const cspNonce = headers().get('x-csp-nonce') ?? undefined;
  const [products, commentsAvailability] = await Promise.all([
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, deletedAt: null },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
    }),
    (async () => {
      try {
        return await getCommentsAvailability();
      } catch (error) {
        console.warn('comments.availability.failed', error);
        return { enabled: false, reason: messages.products.comments.disabled };
      }
    })(),
  ]);

  const commentsDisabledReason =
    commentsAvailability.enabled
      ? null
      : commentsAvailability.reason === 'COMMENTS_DISABLED_BY_ADMIN'
        ? messages.products.comments.disabled
        : commentsAvailability.reason === 'COMMENTS_DB_READ_ONLY_ENVIRONMENT'
          ? messages.products.comments.disabled
          : commentsAvailability.reason ?? messages.products.comments.disabled;
  const productsByLocale = {
    fa: products.map((product) => mapProductToUi(product, 'fa', getAllMessages('fa'))),
    en: products.map((product) => mapProductToUi(product, 'en', getAllMessages('en'))),
  } as const;
  const categoriesByLocale = {
    fa: buildCategoriesByLocale('fa', getAllMessages('fa'), products),
    en: buildCategoriesByLocale('en', getAllMessages('en'), products),
  } as const;
  const productSchemas = getProductSchemas(locale as 'fa' | 'en', productsByLocale[locale]);
  const breadcrumbSchema = getBreadcrumbSchema(locale as 'fa' | 'en', [
    { name: messages.common.nav.home, path: '' },
    { name: messages.common.nav.products, path: 'products' },
  ]);

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
        productsByLocale={productsByLocale}
        categoriesByLocale={categoriesByLocale}
        commentsEnabled={commentsAvailability.enabled}
        commentsDisabledReason={commentsDisabledReason}
      />
    </>
  );
}
