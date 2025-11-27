// app/lib/navigation-config.ts
// ✅ REFACTOR #5: Centralized navigation configuration

import {
  createNavigationItems,
  type NavigationItem,
  type NavigationItemOverride
} from './navigation';
import type { Locale } from './i18n';

/**
 * Navigation configuration for all pages
 * Eliminates duplication across PageClient components
 */

type BaseNavigationLabels = {
  home: string;
  products: string;
  about: string;
  contact: string;
};

export type NavigationLabels = BaseNavigationLabels & {
  whyUs: string;
  faq: string;
};

type NavigationLabelSets = {
  home: NavigationLabels;
  products: BaseNavigationLabels;
  about: BaseNavigationLabels;
};

export type NavigationPage = keyof NavigationLabelSets;

type NavigationRouteMap<L extends Record<string, string>> = Partial<
  Record<keyof L, string | ((key: string, label: string) => string)>
> &
  Record<string, string | ((key: string, label: string) => string)>;

type NavigationFactoryConfig<L extends Record<string, string>> = {
  routes: NavigationRouteMap<L>;
  overrides?: Record<string, NavigationItemOverride | undefined>;
  defaultHref?: (key: string, label: string) => string;
};

function createNavigationFactory<L extends Record<string, string>>({
  routes,
  overrides,
  defaultHref
}: NavigationFactoryConfig<L>) {
  const hrefResolver = (key: string, label: string) => {
    const route = routes[key];

    if (typeof route === 'function') return route(key, label);
    if (typeof route === 'string') return route;

    return defaultHref ? defaultHref(key, label) : `/${key}`;
  };

  return (labels: L): NavigationItem[] =>
    createNavigationItems(labels as Record<string, string>, {
      hrefResolver,
      overrides
    });
}

const createHomeNavigationFactory = createNavigationFactory<NavigationLabels>({
  routes: {
    home: '#home',
    about: '/about',
    products: '/products',
    whyUs: '#why-us',
    faq: '#faq',
    contact: '#contact'
  },
  overrides: {
    contact: { variant: 'button' }
  },
  defaultHref: (key) => `#${key}`
});

const staticNavigationFactory = createNavigationFactory<BaseNavigationLabels>({
  routes: {
    home: '/',
    products: '/products',
    about: '/about',
    contact: '/#contact'
  }
});

const navigationResolvers: { [K in NavigationPage]: (labels: NavigationLabelSets[K]) => NavigationItem[] } = {
  home: (labels) =>
    createHomeNavigationFactory({
      home: labels.home,
      about: labels.about,
      products: labels.products,
      whyUs: labels.whyUs,
      faq: labels.faq,
      contact: labels.contact,
    }),
  products: (labels) => staticNavigationFactory(labels),
  about: (labels) => staticNavigationFactory(labels),
};

export function createNavigation<K extends NavigationPage>(
  page: K,
  labels: NavigationLabelSets[K],
): NavigationItem[] {
  return navigationResolvers[page](labels);
}

/**
 * Get all navigation routes for sitemap generation
 */
export function getAllRoutes(locale: Locale = 'en'): string[] {
  const routes = ['/', '/products', '/about'];
  
  if (locale !== 'en') {
    return routes.map(route => `/${locale}${route}`);
  }
  
  return routes;
}

/**
 * Breadcrumb configuration
 */
export type BreadcrumbItem = {
  label: string;
  href: string;
};

export function getBreadcrumbs(
  pathname: string,
  labels: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: labels.home || 'Home', href: '/' }
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = labels[segment] || segment;
    breadcrumbs.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: currentPath
    });
  }

  return breadcrumbs;
}