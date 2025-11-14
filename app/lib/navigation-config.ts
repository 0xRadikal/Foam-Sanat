// app/lib/navigation-config.ts
// ✅ REFACTOR #5: Centralized navigation configuration

import { createNavigationItems, type NavigationItem } from './navigation';
import type { Locale } from './i18n';

/**
 * Navigation configuration for all pages
 * Eliminates duplication across PageClient components
 */

export type NavigationLabels = {
  home: string;
  products: string;
  about?: string;
  whyUs: string;
  faq: string;
  contact: string;
};

/**
 * Create navigation items for home page
 */
export function createHomeNavigation(labels: NavigationLabels): NavigationItem[] {
  return createNavigationItems(
    {
      home: labels.home,
      products: labels.products,
      whyUs: labels.whyUs,
      faq: labels.faq,
      contact: labels.contact
    },
    {
      hrefResolver: (key) => {
        switch (key) {
          case 'home':
            return '#home';
          case 'products':
            return '#products';
          case 'whyUs':
            return '#why-us';
          case 'faq':
            return '#faq';
          case 'contact':
            return '#contact';
          default:
            return `#${key}`;
        }
      },
      overrides: {
        contact: { variant: 'button' }
      }
    }
  );
}

/**
 * Create navigation items for products page
 */
export function createProductsNavigation(labels: {
  home: string;
  products: string;
  about: string;
  contact: string;
}): NavigationItem[] {
  return createNavigationItems(
    labels,
    {
      hrefResolver: (key) => {
        switch (key) {
          case 'home':
            return '/';
          case 'products':
            return '/products';
          case 'about':
            return '/about';
          case 'contact':
            return '/#contact';
          default:
            return `/${key}`;
        }
      }
    }
  );
}

/**
 * Create navigation items for about page
 */
export function createAboutNavigation(labels: {
  home: string;
  about: string;
  products: string;
  contact: string;
}): NavigationItem[] {
  return createNavigationItems(
    labels,
    {
      hrefResolver: (key) => {
        switch (key) {
          case 'home':
            return '/';
          case 'about':
            return '/about';
          case 'products':
            return '/products';
          case 'contact':
            return '/#contact';
          default:
            return `/${key}`;
        }
      }
    }
  );
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