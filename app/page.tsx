// app/page.tsx
import { organizationSchema, faqSchema, productSchema } from './lib/schema';
import FoamSanatClient from './components/FoamSanatClient';

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      <FoamSanatClient />
    </>
  );
}

// ============================================
// app/components/FoamSanatClient.tsx
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Menu, X, Globe, Sun, Moon, ChevronDown, Phone, Mail, MapPin, 
  Award, Shield, Users, Wrench, CheckCircle, ArrowRight, Factory, Zap, Target 
} from 'lucide-react';

// Types
interface Translation {
  companyName: string;
  tagline: string;
  nav: Record<string, string>;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  trust: Record<string, string>;
  services: {
    title: string;
    subtitle: string;
    hp: { title: string; desc: string };
    lp: { title: string; desc: string };
    custom: { title: string; desc: string };
    cta: string;
  };
  whyUs: {
    title: string;
    subtitle: string;
    features: Array<{ title: string; desc: string }>;
  };
  faq: {
    title: string;
    items: Array<{ q: string; a: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: Record<string, string>;
}

// Translations
const translations: Record<'fa' | 'en', Translation> = {
  fa: {
    companyName: 'گروه صنعتی فوم صنعت',
    tagline: 'پیشرو در مهندسی فوم پلی‌یورتان',
    nav: {
      home: 'خانه',
      products: 'محصولات',
      whyUs: 'چرا ما؟',
      faq: 'سوالات متداول',
      contact: 'تماس'
    },
    hero: {
      badge: '۱۵+ سال تخصص | تاسیس ۱۳۸۹',
      title: 'مهندسی تولید فوم پلی‌یورتان در سطح جهانی',
      subtitle: 'ما خطوط تولید کامل و اتوماسیون پیشرفته را برای صنایع مبلمان، خودرو، عایق‌کاری و فیلترسازی طراحی و اجرا می‌کنیم.',
      cta1: 'مشاوره رایگان',
      cta2: 'کاتالوگ محصولات'
    },
    trust: {
      iso: 'گواهینامه ISO 9001:2015',
      ce: 'استاندارد CE اروپا',
      experience: 'بیش از ۱۵ سال تجربه',
      projects: '+۱۲۰ پروژه موفق'
    },
    services: {
      title: 'راه‌حل‌های مهندسی ما',
      subtitle: 'تخصص ما در طراحی و ساخت خطوط کامل تزریق فوم PU',
      hp: {
        title: 'ماشین‌های هایپرشر',
        desc: 'فشار بالا (۱۵۰+ بار) برای تولید انبوه | فوم انتگرال | قطعات خودرو'
      },
      lp: {
        title: 'ماشین‌های لوپرشر',
        desc: 'فوم نرم و سخت | مبلمان و تشک | فیلتر هوا | صرفه اقتصادی'
      },
      custom: {
        title: 'اتوماسیون سفارشی',
        desc: 'طراحی کامل خط تولید Turnkey | نصب و راه‌اندازی | آموزش پرسنل'
      },
      cta: 'دریافت مشخصات فنی'
    },
    whyUs: {
      title: 'چرا تولیدکنندگان پیشرو ما را انتخاب می‌کنند؟',
      subtitle: 'تفاوت ما در تخصص ۱۵ ساله، مهندسی سفارشی و پشتیبانی واقعی است',
      features: [
        {
          title: 'تخصص ۱۰۰٪ در پلی‌یورتان',
          desc: 'تمام تحقیق و توسعه ما متمرکز بر فناوری فوم PU است. این یعنی درک عمیق‌تر از چالش‌های شما.'
        },
        {
          title: 'پشتیبانی مادام‌العمر',
          desc: 'از نصب اولیه تا تامین قطعات یدکی و آموزش مداوم - تیم فنی ما همیشه کنار شماست.'
        },
        {
          title: 'مهندسی بر اساس نیاز شما',
          desc: 'هر خط تولید متناسب با فضای کارخانه، نوع محصول و اهداف شما طراحی می‌شود.'
        }
      ]
    },
    faq: {
      title: 'سوالات متداول',
      items: [
        {
          q: 'تفاوت اصلی ماشین‌های هایپرشر و لوپرشر چیست؟',
          a: 'ماشین‌های هایپرشر با فشار بالای ۱۵۰ بار کار می‌کنند و برای تولید انبوه ایده‌آل هستند. ماشین‌های لوپرشر با همزن مکانیکی کار می‌کنند و برای تولیدات متنوع اقتصادی‌تر هستند.'
        },
        {
          q: 'آیا نصب و راه‌اندازی را انجام می‌دهید؟',
          a: 'بله. تیم فنی ما نصب کامل، کالیبراسیون، تست و آموزش عملی پرسنل را در محل کارخانه انجام می‌دهد.'
        },
        {
          q: 'زمان تحویل چقدر است؟',
          a: 'بسته به پیچیدگی پروژه، معمولاً ۳-۶ ماه پس از تایید نهایی طراحی.'
        }
      ]
    },
    cta: {
      title: 'آماده تحول در خط تولید خود هستید؟',
      subtitle: 'با کارشناسان ما مشاوره رایگان بگیرید',
      button: 'تماس فوری'
    },
    footer: {
      about: 'گروه صنعتی فوم صنعت از سال ۱۳۸۹ پیشرو در مهندسی و ساخت ماشین‌آلات تزریق فوم پلی‌یورتان',
      contact: 'اطلاعات تماس',
      phone: '۰۹۱۹۷۳۰۲۰۶۴',
      email: 'info@foamsanat.com',
      address: 'تهران، ایران',
      copyright: '© ۱۴۰۴ فوم صنعت. تمامی حقوق محفوظ است.'
    }
  },
  en: {
    companyName: 'Foam Sanat Industrial Group',
    tagline: 'Leading PU Foam Engineering',
    nav: {
      home: 'Home',
      products: 'Products',
      whyUs: 'Why Us',
      faq: 'FAQ',
      contact: 'Contact'
    },
    hero: {
      badge: '15+ Years Expertise | Est. 2010',
      title: 'World-Class Polyurethane Foam Production Engineering',
      subtitle: 'We design complete production lines and advanced automation for furniture, automotive, insulation, and filtration industries.',
      cta1: 'Free Consultation',
      cta2: 'Product Catalog'
    },
    trust: {
      iso: 'ISO 9001:2015 Certified',
      ce: 'CE European Standard',
      experience: 'Over 15 Years Experience',
      projects: '+120 Successful Projects'
    },
    services: {
      title: 'Our Engineering Solutions',
      subtitle: 'Expertise in complete PU foam injection lines',
      hp: {
        title: 'High-Pressure Machines',
        desc: 'High pressure (150+ bar) for mass production | Integral foam | Auto parts'
      },
      lp: {
        title: 'Low-Pressure Machines',
        desc: 'Flexible & rigid foam | Furniture & mattress | Air filters | Cost-effective'
      },
      custom: {
        title: 'Custom Automation',
        desc: 'Complete turnkey line design | Installation & commissioning | Staff training'
      },
      cta: 'Get Technical Specs'
    },
    whyUs: {
      title: 'Why Leading Manufacturers Choose Us?',
      subtitle: '15 years expertise, custom engineering, and genuine support',
      features: [
        {
          title: '100% PU Specialization',
          desc: 'All our R&D is focused on PU foam technology for deeper understanding of your needs.'
        },
        {
          title: 'Lifetime Support',
          desc: 'From initial installation to spare parts supply and continuous training - always with you.'
        },
        {
          title: 'Engineering Based on Your Needs',
          desc: 'Every production line is designed according to your factory space, product type, and goals.'
        }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'What\'s the main difference between High-Pressure and Low-Pressure machines?',
          a: 'High-Pressure machines operate at 150+ bar, ideal for mass production. Low-Pressure machines use mechanical mixing, more economical for varied production.'
        },
        {
          q: 'Do you provide installation and commissioning?',
          a: 'Yes. Our technical team handles complete installation, calibration, testing, and hands-on staff training at your factory.'
        },
        {
          q: 'What\'s the delivery timeline?',
          a: 'Depending on project complexity, typically 3-6 months after design finalization.'
        }
      ]
    },
    cta: {
      title: 'Ready to Transform Your Production Line?',
      subtitle: 'Get free consultation with our technical experts',
      button: 'Contact Now'
    },
    footer: {
      about: 'Foam Sanat Industrial Group pioneering PU foam injection machinery engineering since 2010',
      contact: 'Contact Info',
      phone: '+98 919 730 2064',
      email: 'info@foamsanat.com',
      address: 'Tehran, Iran',
      copyright: '© 2024 Foam Sanat. All rights reserved.'
    }
  }
};

// Analytics
const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Main Component
export default function FoamSanatClient() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    setMounted(true);
    const savedLang = (localStorage.getItem('foam-sanat-lang') || 'fa') as 'fa' | 'en';
    const savedTheme = (localStorage.getItem('foam-sanat-theme') || 'light') as 'light' | 'dark';
    setLang(savedLang);
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = useCallback(() => {
    const newLang: 'fa' | 'en' = lang === 'fa' ? 'en' : 'fa';
    setLang(newLang);
    localStorage.setItem('foam-sanat-lang', newLang);
    trackEvent('language_change', 'engagement', newLang);
  }, [lang]);

  const toggleTheme = useCallback(() => {
    const newTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('foam-sanat-theme', newTheme);
    trackEvent('theme_change', 'engagement', newTheme);
  }, [theme]);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
      {/* Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-orange-500 text-white px-4 py-2 rounded-lg">
        {isRTL ? 'پرش به محتوا' : 'Skip to content'}
      </a>

      {/* Header */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? `${isDark ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md shadow-lg` : 'bg-transparent'}`}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="#home" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg leading-tight">{t.companyName}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.tagline}</div>
              </div>
            </a>

            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(t.nav).slice(0, 4).map(([key, value]) => (
                <a key={key} href={`#${key}`} className="hover:text-orange-500 transition-colors font-medium">
                  {value}
                </a>
              ))}
              <a href="#contact" className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md">
                {t.nav.contact}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleLang} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className={`md:hidden mt-4 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {Object.entries(t.nav).map(([key, value]) => (
                <a key={key} href={`#${key}`} className={`block px-4 py-3 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} onClick={() => setMobileMenuOpen(false)}>
                  {value}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className={`absolute inset-0 opacity-50 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'}`} />
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-md">
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.hero.title}
                </h1>
                <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#contact" className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg">
                    {t.hero.cta1}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </a>
                  <a href="#products" className={`inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 ${isDark ? 'border-white text-white hover:bg-white hover:text-gray-900' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}>
                    {t.hero.cta2}
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className={`aspect-video rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-blue-800 to-blue-600'} flex items-center justify-center`}>
                  <Factory className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, text: t.trust.iso },
              { icon: Award, text: t.trust.ce },
              { icon: Users, text: t.trust.experience },
              { icon: CheckCircle, text: t.trust.projects }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${isDark ? 'bg-gray-700' : 'bg-white'} rounded-full flex items-center justify-center mb-3 shadow-md`}>
                  <item.icon className="w-8 h-8 text-orange-600" />
                </div>
                <span className="font-semibold text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="products" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t.services.title}</h2>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.services.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { service: t.services.hp, icon: Zap, gradient: 'from-blue-600 to-blue-800' },
                { service: t.services.lp, icon: Factory, gradient: 'from-purple-600 to-purple-800' },
                { service: t.services.custom, icon: Target, gradient: 'from-orange-600 to-orange-800' }
              ].map((item, i) => (
                <article key={i} className={`rounded-2xl overflow-hidden shadow-xl transition-all hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <item.icon className="w-20 h-20 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{item.service.title}</h3>
                    <p className={`mb-5 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.service.desc}</p>
                    <a href="#contact" className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                      {t.services.cta}
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section id="whyUs" className={`py-20 px-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{t.whyUs.title}</h2>
              <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.whyUs.subtitle}</p>
              <div className="space-y-6">
                {t.whyUs.features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-12 h-12 ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`aspect-square rounded-2xl shadow-2xl ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'} flex items-center justify-center`}>
              <Users className={`w-32 h-32 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">{t.faq.title}</h2>
            <div className="space-y-4">
              {t.faq.items.map((item, i) => (
                <details key={i} className={`group rounded-xl shadow-md overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <summary className={`flex justify-between items-center cursor-pointer list-none p-6 font-semibold text-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <span>{item.q}</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className={`px-6 pb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700" />
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{t.cta.title}</h2>
            <p className="text-lg text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed">{t.cta.subtitle}</p>
            <a href={`tel:${t.footer.phone.replace(/[\s-]/g, '')}`} className="inline-flex items-center gap-3 bg-orange-500 text-white px-10 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg">
              <Phone className="w-5 h-5" />
              {t.cta.button}
            </a>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white">
              <a href={`mailto:${t.footer.email}`} className="inline-flex items-center gap-2 hover:text-orange-300 transition-colors">
                <Mail className="w-5 h-5" />
                {t.footer.email}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FS</span>
                </div>
                <h3 className="text-white font-bold text-xl">{t.companyName}</h3>
              </div>
              <p className="leading-relaxed max-w-md mb-6">{t.footer.about}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.footer.contact}</h4>
              <address className="not-italic space-y-3">
                <a href={`tel:${t.footer.phone.replace(/[\s-]/g, '')}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{t.footer.phone}</span>
                </a>
                <a href={`mailto:${t.footer.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  {t.footer.email}
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>{t.footer.address}</span>
                </div>
              </address>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}