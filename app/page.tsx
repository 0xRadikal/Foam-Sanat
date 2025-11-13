// ============================================
// ENHANCED FOAM SANAT WEBSITE
// Next.js 14+ with Full SEO, Security, i18n
// ============================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Award, CheckCircle, Mail, MapPin, Phone, Shield, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Header from '@/app/components/Header';
import HeroSection from '@/app/components/home/HeroSection';
import ServicesSection from '@/app/components/home/ServicesSection';
import WhyUsSection from '@/app/components/home/WhyUsSection';
import FaqSection from '@/app/components/home/FaqSection';
import ContactSection from '@/app/components/home/ContactSection';
import { contactConfig, getContactAddress } from '@/app/config/contact';
import { createNavigationItems } from '@/app/lib/navigation';
import { getAllMessages } from '@/app/lib/i18n';
import { useSiteChrome } from '@/app/lib/useSiteChrome';

const ConsentBanner = dynamic(() => import('@/app/components/home/ConsentBanner'), {
  ssr: false
});

// ============================================
// TYPE DEFINITIONS
// ============================================
export default function FoamSanatWebsite() {
  const {
    lang,
    mobileMenuOpen,
    isRTL,
    isDark,
    fontFamily,
    themeClasses,
    toggleLang,
    toggleTheme,
    toggleMobileMenu,
    closeMobileMenu
  } = useSiteChrome();
  const [scrolled, setScrolled] = useState(false);

  const messages = getAllMessages(lang);
  const common = messages.common;
  const home = messages.home;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [lang, closeMobileMenu]);

  const {
    pageBackground,
    pageText,
    surface: cardBg,
    section: sectionBg,
    hover: hoverBg,
    header: headerBackground
  } = themeClasses;
  const {
    home: homeNavLabel,
    products: productsNavLabel,
    whyUs: whyUsNavLabel,
    faq: faqNavLabel,
    contact: contactNavLabel
  } = common.nav;
  const headerNavItems = useMemo(
    () =>
      createNavigationItems(
        {
          home: homeNavLabel,
          products: productsNavLabel,
          whyUs: whyUsNavLabel,
          faq: faqNavLabel,
          contact: contactNavLabel
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
      ),
    [contactNavLabel, faqNavLabel, homeNavLabel, productsNavLabel, whyUsNavLabel]
  );
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Foam Sanat Industrial Group',
    alternateName: 'گروه صنعتی فوم صنعت',
    url: 'https://foamsanat.com',
    logo: 'https://foamsanat.com/logo.png',
    description: 'Leading manufacturer of PU foam injection machinery',
    foundingDate: '2010',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactConfig.phones[0].value,
      contactType: 'customer service',
      email: contactConfig.emails[0].value,
      areaServed: ['IR', 'TR', 'AE', 'EU'],
      availableLanguage: ['fa', 'en', 'ar', 'tr']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: getContactAddress('en'),
      addressLocality: 'Karaj',
      addressRegion: 'Tehran',
      addressCountry: 'IR'
    }
  } as const;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${pageBackground} ${pageText}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{ fontFamily }}
    >
      {/* JSON-LD Schema */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
        style={{ left: isRTL ? 'auto' : '1rem', right: isRTL ? '1rem' : 'auto' }}
      >
        {isRTL ? 'پرش به محتوا' : 'Skip to content'}
      </a>

      <Header
        lang={lang}
        isDark={isDark}
        isRTL={isRTL}
        companyName={common.companyName}
        tagline={common.tagline}
        navItems={headerNavItems}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        hoverClass={hoverBg}
        headerBackgroundClass={headerBackground}
        onLangToggle={toggleLang}
        onThemeToggle={toggleTheme}
        onMobileMenuToggle={toggleMobileMenu}
      />

      <main id="main-content" role="main">
        <HeroSection hero={home.hero} slider={home.slider} isDark={isDark} isRTL={isRTL} />

        {/* Trust Bar */}
        <section className={`py-12 ${sectionBg}`} aria-label="Certifications and achievements">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, text: home.trust.iso, color: 'text-blue-600' },
                { icon: Award, text: home.trust.ce, color: 'text-green-600' },
                { icon: Users, text: home.trust.experience, color: 'text-purple-600' },
                { icon: CheckCircle, text: home.trust.projects, color: 'text-orange-600' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicesSection services={home.services} isDark={isDark} isRTL={isRTL} cardBg={cardBg} />

        <WhyUsSection whyUs={home.whyUs} isDark={isDark} sectionBg={sectionBg} />

        <FaqSection faq={home.faq} isDark={isDark} cardBg={cardBg} hoverBg={hoverBg} />

        <ContactSection
          contact={home.contact}
          locale={lang}
          isRTL={isRTL}
          isDark={isDark}
          cardBg={cardBg}
          sectionBg={sectionBg}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4" role="contentinfo">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FS</span>
                </div>
                <h3 className="text-white font-bold text-xl">{common.companyName}</h3>
              </div>
              <p className="leading-relaxed max-w-md mb-6">{common.footer.about}</p>
              <div className="flex gap-4">
                {[Shield, Award, CheckCircle].map((Icon, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                    role="img"
                    aria-label={i === 0 ? 'ISO Certified' : i === 1 ? 'CE Compliant' : 'Verified'}
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{common.footer.contact}</h4>
              <address className="not-italic space-y-3">
                <a
                  href={`tel:${contactConfig.phones[0].value}`}
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{common.footer.phone}</span>
                </a>
                <a 
                  href={`mailto:${common.footer.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Mail className="w-4 h-4" />
                  {common.footer.email}
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{common.footer.address}</span>
                </div>
              </address>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            {common.footer.copyright}
          </div>
        </div>
      </footer>

      {/* Consent Banner */}
      <ConsentBanner consent={home.consent} isRTL={isRTL} />

    </div>
  );
}
