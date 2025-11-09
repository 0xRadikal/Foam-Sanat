'use client';

import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import {
  getNamespace,
  t,
  type Locale,
  type NamespaceTranslations
} from '@/app/lib/translations';

interface HeaderProps {
  lang: Locale;
  theme: 'light' | 'dark';
  scrolled: boolean;
  mobileMenuOpen: boolean;
  onLangToggle: () => void;
  onThemeToggle: () => void;
  onMobileMenuToggle: () => void;
  commonCopy?: NamespaceTranslations<'common', Locale>;
}

export default function Header({
  lang,
  theme,
  scrolled,
  mobileMenuOpen,
  onLangToggle,
  onThemeToggle,
  onMobileMenuToggle,
  commonCopy
}: HeaderProps) {
  const isRTL = lang === 'fa';
  const isDark = theme === 'dark';
  const headerBg = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const brand = (commonCopy ?? getNamespace(lang, 'common')).brand;
  const navigation = t(lang, 'common', 'navigation');

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? `${headerBg} backdrop-blur-md shadow-lg` : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">FS</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-tight">{brand.companyName}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{brand.tagline}</div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            {Object.entries(navigation).slice(0, 4).map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                className="hover:text-orange-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
              >
                {value}
              </a>
            ))}
            <a
              href="#contact"
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
            >
              {navigation.contact}
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onLangToggle}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
              aria-label={isRTL ? 'تغییر زبان به انگلیسی' : 'Switch to Persian'}
              title={lang === 'fa' ? 'English' : 'فارسی'}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button 
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
              aria-label={isDark ? (isRTL ? 'تغییر به حالت روشن' : 'Switch to light mode') : (isRTL ? 'تغییر به حالت تاریک' : 'Switch to dark mode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onMobileMenuToggle}
              className={`md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
              aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
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
            {Object.entries(navigation).map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                className={`block px-4 py-3 rounded-lg transition-colors ${hoverBg}`}
                onClick={onMobileMenuToggle}
                role="menuitem"
              >
                {value}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
