'use client';

import Link from 'next/link';
import { memo } from 'react';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import type { Locale } from '@/app/lib/i18n';
import type { NavigationItem } from '@/app/lib/navigation';

function NavLink({
  item,
  isMobile,
  isActive,
  hoverClass,
  onClick
}: {
  item: NavigationItem;
  isMobile: boolean;
  isActive: boolean;
  hoverClass: string;
  onClick?: () => void;
}) {
  const isHashLink = (() => {
    if (item.href.startsWith('#')) return true;

    try {
      const parsed = new URL(item.href, 'http://localhost');
      return parsed.hash.length > 0 && parsed.pathname === '/';
    } catch {
      return false;
    }
  })();
  const mobileClasses = `block px-4 py-3 rounded-lg transition-colors ${hoverClass}`;
  const desktopClasses = `hover:text-orange-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1${
    isActive ? ' text-orange-500 font-semibold' : ''
  }`;

  const className = isMobile ? mobileClasses : desktopClasses;

  if (isHashLink) {
    return (
      <a
        key={item.key}
        href={item.href}
        className={className}
        onClick={onClick}
        role={isMobile ? 'menuitem' : undefined}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      key={item.key}
      href={item.href}
      className={className}
      onClick={onClick}
      role={isMobile ? 'menuitem' : undefined}
    >
      {item.label}
    </Link>
  );
}

const MemoizedNavLink = memo(NavLink);

interface HeaderProps {
  lang: Locale;
  isDark: boolean;
  isRTL: boolean;
  companyName: string;
  tagline?: string;
  navItems: NavigationItem[];
  activeNavKey?: string;
  logoHref?: string;
  scrolled: boolean;
  mobileMenuOpen: boolean;
  hoverClass: string;
  headerBackgroundClass: string;
  onLangToggle: () => void;
  onThemeToggle: () => void;
  onMobileMenuToggle: () => void;
}

export default function Header({
  lang,
  isDark,
  isRTL,
  companyName,
  tagline,
  navItems,
  activeNavKey,
  logoHref,
  scrolled,
  mobileMenuOpen,
  hoverClass,
  headerBackgroundClass,
  onLangToggle,
  onThemeToggle,
  onMobileMenuToggle
}: HeaderProps) {
  const regularNavItems = navItems.filter((item) => item.variant !== 'button');
  const ctaItem = navItems.find((item) => item.variant === 'button');
  const logoLink = logoHref ?? '#home';

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? `${headerBackgroundClass} backdrop-blur-md shadow-lg` : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a
            href={logoLink}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">FS</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-tight">{companyName}</div>
              {tagline ? (
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tagline}</div>
              ) : null}
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            {regularNavItems.map((item) => (
              <MemoizedNavLink
                key={item.key}
                item={item}
                isMobile={false}
                isActive={activeNavKey === item.key}
                hoverClass={hoverClass}
                onClick={undefined}
              />
            ))}
            {ctaItem
              ? ctaItem.href.startsWith('#')
                ? (
                    <a
                      href={ctaItem.href}
                      className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                    >
                      {ctaItem.label}
                    </a>
                  )
                : (
                    <Link
                      href={ctaItem.href}
                      className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                    >
                      {ctaItem.label}
                    </Link>
                  )
              : null}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLangToggle}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverClass}`}
              aria-label={isRTL ? 'تغییر زبان به انگلیسی' : 'Switch to Persian'}
              title={lang === 'fa' ? 'English' : 'فارسی'}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverClass}`}
              aria-label={isDark ? (isRTL ? 'تغییر به حالت روشن' : 'Switch to light mode') : (isRTL ? 'تغییر به حالت تاریک' : 'Switch to dark mode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onMobileMenuToggle}
              className={`md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverClass}`}
              aria-label={
                mobileMenuOpen
                  ? isRTL
                    ? 'بستن منو'
                    : 'Close menu'
                  : isRTL
                  ? 'باز کردن منو'
                  : 'Open menu'
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className={`md:hidden mt-4 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              role="menu"
            >
              {[...regularNavItems, ...(ctaItem ? [ctaItem] : [])].map((item) => (
                <MemoizedNavLink
                  key={item.key}
                  item={item}
                  isMobile
                  isActive={activeNavKey === item.key}
                  hoverClass={hoverClass}
                  onClick={onMobileMenuToggle}
                />
              ))}
            </div>
          )}
        </nav>
      </header>
  );
}
