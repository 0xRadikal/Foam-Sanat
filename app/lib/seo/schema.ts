import { contactConfig, getContactAddress } from '@/app/config/contact';
import { commonMessages } from '@/app/lib/i18n/translations/common';
import { homeMessages } from '@/app/lib/i18n/translations/home';
import {
  productsMessages,
  type ProductsNamespaceSchema,
} from '@/app/lib/i18n/translations/products';
import type { Locale } from '@/app/lib/i18n';

type SupportedSchemaLocale = Extract<Locale, 'fa' | 'en'>;

const SITE_URL = 'https://foamsanat.com';

export function getOrganizationSchema(locale: SupportedSchemaLocale) {
  const name = commonMessages[locale].companyName;
  const alternateName = commonMessages[locale === 'fa' ? 'en' : 'fa'].companyName;
  const address = getContactAddress(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    alternateName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: commonMessages[locale].tagline,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactConfig.phones[0]?.value ?? '',
      contactType: 'customer service',
      email: contactConfig.emails[0]?.value ?? 'info@foamsanat.com',
      areaServed: ['IR', 'TR', 'AE', 'EU'],
      availableLanguage: ['fa', 'en', 'ar', 'tr'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: locale === 'fa' ? 'تهران' : 'Tehran',
      addressRegion: locale === 'fa' ? 'البرز' : 'Alborz',
      addressCountry: 'IR',
    },
  };
}

export function getFaqSchema(locale: SupportedSchemaLocale) {
  const faqItems = homeMessages[locale].faq.items;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function getProductSchemas(locale: SupportedSchemaLocale) {
  const { products } = productsMessages[locale];
  const brandName = commonMessages[locale].companyName;

  return products.map((product: ProductsNamespaceSchema['products'][number]) => {
    const images = (product.images ?? [])
      .map((img) => {
        if (img.type === 'emoji') return img.value;
        return img.value.startsWith('http') ? img.value : `${SITE_URL}${img.value}`;
      })
      .filter(Boolean);

    const offer = product.hasPrice
      ? {
          '@type': 'Offer',
          priceCurrency: 'IRR',
          price: product.price.replace(/[^\d.]/g, ''),
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/products`,
        }
      : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: images,
      description: product.shortDesc || product.description,
      category: product.category,
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      ...(offer ? { offers: offer } : {}),
      additionalProperty: product.features?.map((feature) => ({
        '@type': 'PropertyValue',
        name: feature,
        value: feature,
      })),
    };
  });
}

type BreadcrumbSegment =
  | string
  | { name: string; path?: string; href?: string };

export function getBreadcrumbSchema(
  _locale: SupportedSchemaLocale,
  segments: BreadcrumbSegment[],
) {
  const normalized = segments.map((segment) => {
    if (typeof segment === 'string') {
      return { name: segment, path: segment };
    }

    return segment;
  });

  const itemListElements = normalized.map((segment, index) => {
    const name = segment.name;
    const href = segment.href;
    const pathSegments = normalized
      .slice(0, index + 1)
      .map((s) => s.path ?? s.name)
      .filter(Boolean);
    const item = href
      ? href
      : pathSegments.length === 0
        ? SITE_URL
        : `${SITE_URL}/${pathSegments.join('/')}`;

    return {
      '@type': 'ListItem',
      position: index + 1,
      name,
      item,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemListElements,
  };
}
