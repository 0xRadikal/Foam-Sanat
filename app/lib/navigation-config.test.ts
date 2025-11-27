import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createAboutNavigation,
  createHomeNavigation,
  createProductsNavigation,
  getAllRoutes,
  getBreadcrumbs
} from './navigation-config';

describe('navigation-config', () => {
  it('creates home navigation with section anchors and contact button variant', () => {
    const navItems = createHomeNavigation({
      home: 'Home',
      about: 'About',
      products: 'Products',
      whyUs: 'Why Us',
      faq: 'FAQ',
      contact: 'Contact'
    });

    assert.equal(navItems.length, 6);
    assert.deepEqual(
      navItems.map((item) => item.href),
      ['#home', '/about', '/products', '#why-us', '#faq', '#contact']
    );
    const contactItem = navItems.find((item) => item.key === 'contact');
    assert(contactItem);
    assert.equal(contactItem.variant, 'button');
  });

  it('creates products navigation with top-level routes', () => {
    const navItems = createProductsNavigation({
      home: 'Home',
      products: 'Products',
      about: 'About',
      contact: 'Contact'
    });

    const hrefByKey = Object.fromEntries(navItems.map((item) => [item.key, item.href]));
    assert.equal(hrefByKey.home, '/');
    assert.equal(hrefByKey.products, '/products');
    assert.equal(hrefByKey.about, '/about');
    assert.equal(hrefByKey.contact, '/#contact');
  });

  it('creates about navigation with shared route map', () => {
    const navItems = createAboutNavigation({
      home: 'Home',
      about: 'About',
      products: 'Products',
      contact: 'Contact'
    });

    const hrefByKey = Object.fromEntries(navItems.map((item) => [item.key, item.href]));
    assert.equal(hrefByKey.home, '/');
    assert.equal(hrefByKey.about, '/about');
    assert.equal(hrefByKey.products, '/products');
    assert.equal(hrefByKey.contact, '/#contact');
  });

  it('generates localized route lists for sitemaps', () => {
    assert.deepEqual(getAllRoutes('en'), ['/', '/products', '/about']);
    assert.deepEqual(getAllRoutes('fa'), ['/fa/', '/fa/products', '/fa/about']);
  });

  it('builds breadcrumbs that accumulate paths', () => {
    const breadcrumbs = getBreadcrumbs('/products/widgets', {
      home: 'Home',
      products: 'Products',
      widgets: 'Widgets'
    });

    assert.deepEqual(breadcrumbs, [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widgets', href: '/products/widgets' }
    ]);
  });
});
