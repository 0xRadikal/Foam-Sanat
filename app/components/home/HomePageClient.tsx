'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, CheckCircle, Shield, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import HeroSection from '@/app/components/home/HeroSection';
import ServicesSection from '@/app/components/home/ServicesSection';
import WhyUsSection from '@/app/components/home/WhyUsSection';
import FaqSection from '@/app/components/home/FaqSection';
import ContactSection from '@/app/components/home/ContactSection';
import { createNavigation } from '@/app/lib/navigation-config';
import { getAllMessages, type Locale, type MessagesByLocale } from '@/app/lib/i18n';
import { useSiteChrome } from '@/app/lib/useSiteChrome';

const ConsentBanner = dynamic(() => import('@/app/components/home/ConsentBanner'), {
  ssr: false
});

export interface HomePageClientProps {
  initialLocale: Locale;
  initialMessages: MessagesByLocale<Locale>;
}

export default function HomePageClient({ initialLocale, initialMessages }: HomePageClientProps) {
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
    closeMobileMenu,
    setLang
  } = useSiteChrome();
  const [scrolled, setScrolled] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  const hasSyncedInitialLocale = useRef(false);

  useEffect(() => {
    if (!hasSyncedInitialLocale.current) {
      hasSyncedInitialLocale.current = true;
      if (lang !== initialLocale) {
        setLang(initialLocale);
      }
    }
  }, [initialLocale, lang, setLang]);

  useEffect(() => {
    if (lang !== activeLocale) {
      setActiveLocale(lang);
      setMessages(getAllMessages(lang));
    }
  }, [lang, activeLocale]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [activeLocale, closeMobileMenu]);

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
    about: aboutNavLabel,
    products: productsNavLabel,
    whyUs: whyUsNavLabel,
    faq: faqNavLabel,
    contact: contactNavLabel
  } = messages.common.nav;
  const headerNavItems = useMemo(
    () =>
      createNavigation('home', {
        home: homeNavLabel,
        about: aboutNavLabel,
        products: productsNavLabel,
        whyUs: whyUsNavLabel,
        faq: faqNavLabel,
        contact: contactNavLabel
      }),
    [aboutNavLabel, contactNavLabel, faqNavLabel, homeNavLabel, productsNavLabel, whyUsNavLabel]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${pageBackground} ${pageText}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={activeLocale}
      style={{ fontFamily }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
        style={{ left: isRTL ? 'auto' : '1rem', right: isRTL ? '1rem' : 'auto' }}
      >
        {isRTL ? 'پرش به محتوا' : 'Skip to content'}
      </a>

      <Header
        lang={activeLocale}
        isDark={isDark}
        isRTL={isRTL}
        companyName={messages.common.companyName}
        tagline={messages.common.tagline}
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
        <HeroSection
          hero={messages.home.hero}
          slider={messages.home.slider}
          isDark={isDark}
          isRTL={isRTL}
          locale={activeLocale}
        />

        <section className={`py-12 ${sectionBg}`} aria-label="Certifications and achievements">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { id: 'iso', icon: Shield, text: messages.home.trust.iso, color: 'text-blue-600' },
                { id: 'ce', icon: Award, text: messages.home.trust.ce, color: 'text-green-600' },
                { id: 'experience', icon: Users, text: messages.home.trust.experience, color: 'text-purple-600' },
                { id: 'projects', icon: CheckCircle, text: messages.home.trust.projects, color: 'text-orange-600' }
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicesSection services={messages.home.services} isDark={isDark} isRTL={isRTL} cardBg={cardBg} />

        <WhyUsSection whyUs={messages.home.whyUs} isDark={isDark} sectionBg={sectionBg} />

        <FaqSection faq={messages.home.faq} isDark={isDark} />

        <ContactSection
          contact={messages.home.contact}
          locale={activeLocale}
          isRTL={isRTL}
          isDark={isDark}
          cardBg={cardBg}
          sectionBg={sectionBg}
        />
      </main>

      <Footer
        variant="detailed"
        companyName={messages.common.companyName}
        about={messages.common.footer.about}
        contactLabel={messages.common.footer.contact}
        phoneLabel={messages.common.footer.phone}
        emailLabel={messages.common.footer.email}
        address={messages.common.footer.address}
        copyright={messages.common.footer.copyright}
        email={messages.common.footer.email}
      />

      <ConsentBanner consent={messages.home.consent} isRTL={isRTL} />
    </div>
  );
}
