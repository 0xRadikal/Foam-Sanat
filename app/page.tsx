// ============================================
// ENHANCED FOAM SANAT WEBSITE
// Next.js 14+ with Full SEO, Security, i18n
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, X, Globe, Sun, Moon, ChevronDown, Phone, Mail, MapPin, 
  Award, Shield, Users, Wrench, CheckCircle, ArrowRight, Factory,
  Zap, HeartHandshake, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import Script from 'next/script';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface Translation {
  companyName: string;
  tagline: string;
  nav: {
    home: string;
    products: string;
    whyUs: string;
    faq: string;
    contact: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  slider: {
    slides: Array<{
      title: string;
      desc: string;
      badge?: string;
    }>;
  };
  trust: {
    iso: string;
    ce: string;
    experience: string;
    projects: string;
  };
  services: {
    title: string;
    subtitle: string;
    hp: ServiceItem;
    lp: ServiceItem;
    custom: ServiceItem;
    cta: string;
  };
  whyUs: {
    title: string;
    subtitle: string;
    features: Feature[];
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
    };
    info: {
      title: string;
      address: string;
      phone1: string;
      phone2: string;
      email1: string;
      email2: string;
    };
  };
  footer: {
    about: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    copyright: string;
  };
  consent: {
    message: string;
    accept: string;
    decline: string;
  };
}

interface ServiceItem {
  title: string;
  desc: string;
}

interface Feature {
  title: string;
  desc: string;
}

interface FAQItem {
  q: string;
  a: string;
}

type Theme = 'light' | 'dark';
type Lang = 'fa' | 'en';

// ============================================
// TRANSLATION DATA
// ============================================
const translations: Record<Lang, Translation> = {
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
    slider: {
      slides: [
        {
          title: 'ماشین‌آلات هایپرشر پیشرفته',
          desc: 'فناوری تزریق فشار بالا برای تولید صنعتی با ظرفیت بالا',
          badge: 'جدید'
        },
        {
          title: 'خطوط اتوماتیک تولید فوم',
          desc: 'سیستم‌های کاملا اتوماتیک با کنترل PLC و هوشمندسازی',
        },
        {
          title: 'پشتیبانی ۲۴/۷ و خدمات پس از فروش',
          desc: 'تیم متخصص ما همیشه در کنار شماست',
        }
      ]
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
        desc: 'فشار بالا برای تولید انبوه | فوم انتگرال | قطعات خودرو'
      },
      lp: {
        title: 'ماشین‌های لوپرشر',
        desc: 'فوم نرم و سخت | مبلمان و تشک | صرفه اقتصادی'
      },
      custom: {
        title: 'اتوماسیون سفارشی',
        desc: 'طراحی کامل خط تولید | نصب و راه‌اندازی | آموزش'
      },
      cta: 'دریافت مشخصات فنی'
    },
    whyUs: {
      title: 'چرا تولیدکنندگان ما را انتخاب می‌کنند؟',
      subtitle: 'تفاوت ما در تخصص ۱۵ ساله و پشتیبانی واقعی',
      features: [
        {
          title: 'تخصص ۱۰۰٪ در پلی‌یورتان',
          desc: 'تمام R&D ما متمرکز بر فناوری فوم PU است'
        },
        {
          title: 'پشتیبانی مادام‌العمر',
          desc: 'نصب، آموزش، قطعات یدکی - در تمام مراحل کنار شما'
        },
        {
          title: 'مهندسی سفارشی',
          desc: 'هر خط تولید متناسب با نیاز شما طراحی می‌شود'
        }
      ]
    },
    faq: {
      title: 'سوالات متداول',
      items: [
        {
          q: 'تفاوت هایپرشر و لوپرشر چیست؟',
          a: 'هایپرشر با فشار +۱۵۰ بار برای تولید انبوه، لوپرشر اقتصادی‌تر برای تولیدات متنوع'
        },
        {
          q: 'نصب و راه‌اندازی انجام می‌دهید؟',
          a: 'بله. تیم فنی ما نصب، تست و آموزش کامل ارائه می‌دهد'
        },
        {
          q: 'زمان تحویل چقدر است؟',
          a: 'بسته به پیچیدگی پروژه، معمولاً ۳-۶ ماه پس از تایید نهایی'
        }
      ]
    },
    contact: {
      title: 'با ما در تماس باشید',
      subtitle: 'تیم ما آماده پاسخگویی به سوالات شماست',
      form: {
        name: 'نام و نام خانوادگی',
        email: 'ایمیل',
        phone: 'شماره تماس',
        message: 'پیام شما',
        submit: 'ارسال پیام',
        sending: 'در حال ارسال...',
        success: 'پیام شما با موفقیت ارسال شد',
        error: 'خطا در ارسال پیام'
      },
      info: {
        title: 'اطلاعات تماس',
        address: 'تهران، کرج، جاده ماهدشت - خیابان زیبادشت',
        phone1: '۰۹۱۲۸۳۳۶۰۸۵',
        phone2: '۰۹۱۹۷۳۰۲۰۶۴',
        email1: 'info@foamsanat.com',
        email2: 'saeidniazpour@yahoo.com'
      }
    },
    footer: {
      about: 'گروه صنعتی فوم صنعت از ۱۳۸۹ پیشرو در ماشین‌آلات تزریق فوم PU',
      contact: 'اطلاعات تماس',
      phone: '۰۹۱۲۸۳۳۶۰۸۵',
      email: 'info@foamsanat.com',
      address: 'تهران، کرج، جاده ماهدشت - خیابان زیبادشت',
      copyright: '© ۱۴۰۴ فوم صنعت. تمامی حقوق محفوظ است.'
    },
    consent: {
      message: 'ما از کوکی‌ها برای بهبود تجربه شما استفاده می‌کنیم',
      accept: 'قبول',
      decline: 'رد'
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
    slider: {
      slides: [
        {
          title: 'Advanced High-Pressure Machinery',
          desc: 'High-pressure injection technology for high-capacity industrial production',
          badge: 'New'
        },
        {
          title: 'Automatic Foam Production Lines',
          desc: 'Fully automated systems with PLC control and smart technology',
        },
        {
          title: '24/7 Support & After-Sales Service',
          desc: 'Our expert team is always with you',
        }
      ]
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
        desc: 'Mass production | Integral foam | Auto parts'
      },
      lp: {
        title: 'Low-Pressure Machines',
        desc: 'Flexible foam | Furniture & mattress | Cost-effective'
      },
      custom: {
        title: 'Custom Automation',
        desc: 'Complete line design | Installation | Training'
      },
      cta: 'Get Technical Specs'
    },
    whyUs: {
      title: 'Why Manufacturers Choose Us?',
      subtitle: '15 years expertise and genuine support',
      features: [
        {
          title: '100% PU Specialization',
          desc: 'All R&D focused on PU foam technology'
        },
        {
          title: 'Lifetime Support',
          desc: 'Installation, training, spare parts - always with you'
        },
        {
          title: 'Custom Engineering',
          desc: 'Every line tailored to your specific needs'
        }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'Difference between High-Pressure and Low-Pressure?',
          a: 'High-Pressure at 150+ bar for mass production, Low-Pressure more economical for varied production'
        },
        {
          q: 'Do you provide installation?',
          a: 'Yes. Our team handles complete installation, testing and training'
        },
        {
          q: 'What is the delivery time?',
          a: 'Depending on project complexity, typically 3-6 months after final approval'
        }
      ]
    },
    contact: {
      title: 'Get in Touch',
      subtitle: 'Our team is ready to answer your questions',
      form: {
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        message: 'Your Message',
        submit: 'Send Message',
        sending: 'Sending...',
        success: 'Your message has been sent successfully',
        error: 'Error sending message'
      },
      info: {
        title: 'Contact Information',
        address: 'Tehran, Karaj, Mahdasht Road - Zibadasht Street',
        phone1: '+98 912 833 6085',
        phone2: '+98 919 730 2064',
        email1: 'info@foamsanat.com',
        email2: 'saeidniazpour@yahoo.com'
      }
    },
    footer: {
      about: 'Foam Sanat pioneering PU foam machinery since 2010',
      contact: 'Contact Info',
      phone: '+98 912 833 6085',
      email: 'info@foamsanat.com',
      address: 'Tehran, Karaj, Mahdasht Road - Zibadasht Street',
      copyright: '© 2024 Foam Sanat. All rights reserved.'
    },
    consent: {
      message: 'We use cookies to improve your experience',
      accept: 'Accept',
      decline: 'Decline'
    }
  }
};

// ============================================
// CUSTOM HOOKS
// ============================================
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  return [mounted ? storedValue : initialValue, setValue];
};

// ============================================
// SLIDER COMPONENT
// ============================================
function HeroSlider({ slides, isRTL, isDark }: { slides: Translation['slider']['slides'], isRTL: boolean, isDark: boolean }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    resetTimeout();
    if (isAutoPlaying) {
      timeoutRef.current = setTimeout(
        () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
        5000
      );
    }
    return () => resetTimeout();
  }, [current, isAutoPlaying, slides.length, resetTimeout]);

  const goToSlide = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative h-full group">
      {/* Slides */}
      <div className="relative h-full overflow-hidden rounded-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === current ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            style={{
              transform: index === current ? 'translateX(0)' : isRTL ? 'translateX(-100%)' : 'translateX(100%)'
            }}
          >
            <div className={`h-full ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-blue-800 to-blue-600'} flex items-center justify-center p-8`}>
              <div className="text-white text-center max-w-2xl">
                {slide.badge && (
                  <span className="inline-block bg-orange-500 px-4 py-1 rounded-full text-xs font-bold mb-4 animate-pulse">
                    {slide.badge}
                  </span>
                )}
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{slide.title}</h3>
                <p className="text-lg opacity-90">{slide.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white`}
        aria-label="Previous slide"
      >
        {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </button>
      <button
        onClick={goToNext}
        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white`}
        aria-label="Next slide"
      >
        {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
              index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        {isAutoPlaying ? 'Auto' : 'Paused'}
      </div>
    </div>
  );
}

// ============================================
// CONTACT FORM COMPONENT
// ============================================
function ContactForm({ t, isRTL, isDark }: { t: Translation, isRTL: boolean, isDark: boolean }) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      if (response.ok) {
        setStatus('success');
        setFormState({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
    isDark 
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 font-semibold" htmlFor="name">
          {t.contact.form.name}
        </label>
        <input
          type="text"
          id="name"
          required
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          className={inputClasses}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="email">
          {t.contact.form.email}
        </label>
        <input
          type="email"
          id="email"
          required
          value={formState.email}
          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          className={inputClasses}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="phone">
          {t.contact.form.phone}
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={formState.phone}
          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
          className={inputClasses}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="message">
          {t.contact.form.message}
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formState.message}
          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
          className={inputClasses}
          disabled={status === 'sending'}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`w-full py-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-orange-300 ${
          status === 'sending'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {status === 'sending' ? t.contact.form.sending : t.contact.form.submit}
      </button>

      {status === 'success' && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg">
          {t.contact.form.success}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg">
          {t.contact.form.error}
        </div>
      )}
    </form>
  );
}

// ============================================
// CONSENT BANNER COMPONENT
// ============================================
function ConsentBanner({ t, isRTL }: { t: Translation, isRTL: boolean }) {
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('foam-sanat-analytics-consent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'accepted') {
      setHasConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('foam-sanat-analytics-consent', 'accepted');
    setHasConsent(true);
    setShowConsent(false);
    // Initialize GA
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('foam-sanat-analytics-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-gray-900 text-white p-6 rounded-lg shadow-2xl animate-slide-up">
      <p className="mb-4">{t.consent.message}</p>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {t.consent.accept}
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {t.consent.decline}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FoamSanatWebsite() {
  const [lang, setLang] = useLocalStorage<Lang>('foam-sanat-lang', 'fa');
  const [theme, setTheme] = useLocalStorage<Theme>('foam-sanat-theme', 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(lang === 'fa' ? 'en' : 'fa');
  }, [lang, setLang]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  if (!mounted) return null;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const headerBg = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${bgColor} ${textColor}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{ fontFamily: lang === 'fa' ? 'Vazirmatn, sans-serif' : 'system-ui, sans-serif' }}
    >
      {/* JSON-LD Schema */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Foam Sanat Industrial Group",
            "alternateName": "گروه صنعتی فوم صنعت",
            "url": "https://foamsanat.com",
            "logo": "https://foamsanat.com/logo.png",
            "description": "Leading manufacturer of PU foam injection machinery",
            "foundingDate": "2010",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+98-912-833-6085",
              "contactType": "customer service",
              "email": "info@foamsanat.com",
              "areaServed": ["IR", "TR", "AE", "EU"],
              "availableLanguage": ["fa", "en", "ar", "tr"]
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Mahdasht Road - Zibadasht Street",
              "addressLocality": "Karaj",
              "addressRegion": "Tehran",
              "addressCountry": "IR"
            }
          })
        }}
      />

      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
        style={{ left: isRTL ? 'auto' : '1rem', right: isRTL ? '1rem' : 'auto' }}
      >
        {isRTL ? 'پرش به محتوا' : 'Skip to content'}
      </a>

      {/* Header */}
      <header 
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          scrolled ? `${headerBg} backdrop-blur-md shadow-lg` : 'bg-transparent'
        }`}
        role="banner"
      >
        <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
          <div className="flex justify-between items-center">
            <a href="#home" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg leading-tight">{t.companyName}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.tagline}</div>
              </div>
            </a>

            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(t.nav).slice(0, 4).map(([key, value]) => (
                <a 
                  key={key}
                  href={`/about`} 
                  className="hover:text-orange-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                >
                  {value}
                </a>
              ))}
              <a 
                href="#contact" 
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
              >
                {t.nav.contact}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLang}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
                aria-label={isRTL ? 'تغییر زبان به انگلیسی' : 'Switch to Persian'}
                title={lang === 'fa' ? 'English' : 'فارسی'}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
                aria-label={isDark ? (isRTL ? 'تغییر به حالت روشن' : 'Switch to light mode') : (isRTL ? 'تغییر به حالت تاریک' : 'Switch to dark mode')}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${hoverBg}`}
                aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className={`md:hidden mt-4 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              role="menu"
            >
              {Object.entries(t.nav).map(([key, value]) => (
                <a 
                  key={key}
                  href={`/about`} 
                  className={`block px-4 py-3 rounded-lg transition-colors ${hoverBg}`}
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  {value}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main id="main-content" role="main">
        {/* Hero with Slider */}
        <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div 
            className={`absolute inset-0 opacity-50 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'}`}
            aria-hidden="true"
          />
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-md animate-pulse">
                  {t.hero.badge}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.hero.title}
                </h1>
                <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="#contact" 
                    className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                  >
                    {t.hero.cta1}
                    <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                  </a>
                  <a 
                    href="#products" 
                    className={`inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
                      isDark 
                        ? 'border-white text-white hover:bg-white hover:text-gray-900' 
                        : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                    }`}
                  >
                    {t.hero.cta2}
                  </a>
                </div>
              </div>
              <div className="relative aspect-video">
                <HeroSlider slides={t.slider.slides} isRTL={isRTL} isDark={isDark} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className={`py-12 ${sectionBg}`} aria-label="Certifications and achievements">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, text: t.trust.iso, color: 'text-blue-600' },
                { icon: Award, text: t.trust.ce, color: 'text-green-600' },
                { icon: Users, text: t.trust.experience, color: 'text-purple-600' },
                { icon: CheckCircle, text: t.trust.projects, color: 'text-orange-600' }
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
                { service: t.services.lp, icon: HeartHandshake, gradient: 'from-purple-600 to-purple-800' },
                { service: t.services.custom, icon: Wrench, gradient: 'from-orange-600 to-orange-800' }
              ].map((item, i) => (
                <article 
                  key={i} 
                  className={`rounded-2xl overflow-hidden shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${cardBg}`}
                >
                  <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <item.icon className="w-20 h-20 text-white" aria-hidden="true" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{item.service.title}</h3>
                    <p className={`mb-5 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.service.desc}
                    </p>
                    <a 
                      href="#contact" 
                      className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                    >
                      {t.services.cta}
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section id="whyUs" className={`py-20 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{t.whyUs.title}</h2>
                <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.whyUs.subtitle}
                </p>
                <div className="space-y-6">
                  {t.whyUs.features.map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`aspect-square rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'} flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
                <Users className={`w-32 h-32 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">{t.faq.title}</h2>
            <div className="space-y-4">
              {t.faq.items.map((item, i) => (
                <details 
                  key={i} 
                  className={`group rounded-xl shadow-md overflow-hidden ${cardBg}`}
                >
                  <summary className={`flex justify-between items-center cursor-pointer list-none p-6 font-semibold text-lg transition-colors ${hoverBg} focus:outline-none focus:ring-2 focus:ring-orange-500`}>
                    <span>{item.q}</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className={`px-6 pb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-20 px-4 ${sectionBg}`}>
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t.contact.title}</h2>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.contact.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className={`rounded-2xl shadow-xl p-8 ${cardBg}`}>
                <ContactForm t={t} isRTL={isRTL} isDark={isDark} />
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className={`rounded-2xl shadow-xl p-8 ${cardBg}`}>
                  <h3 className="text-2xl font-bold mb-6">{t.contact.info.title}</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">{isRTL ? 'آدرس' : 'Address'}</p>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t.contact.info.address}
                        </p>
                        <a
                          href="https://maps.app.goo.gl/wXxY2HxHnZ6M971h9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mt-2 transition-colors"
                        >
                          {isRTL ? 'مشاهده در نقشه' : 'View on Map'}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">{isRTL ? 'تلفن' : 'Phone'}</p>
                        <div className="space-y-2">
                          <a 
                            href="tel:+989128336085" 
                            className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            dir="ltr"
                          >
                            {t.contact.info.phone1}
                          </a>
                          <a 
                            href="tel:+989197302064" 
                            className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            dir="ltr"
                          >
                            {t.contact.info.phone2}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold mb-1">{isRTL ? 'ایمیل' : 'Email'}</p>
                        <div className="space-y-2">
                          <a 
                            href={`mailto:${t.contact.info.email1}`} 
                            className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            {t.contact.info.email1}
                          </a>
                          <a 
                            href={`mailto:${t.contact.info.email2}`} 
                            className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            {t.contact.info.email2}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Embed */}
                <div className="rounded-2xl shadow-xl overflow-hidden h-64">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.7!2d50.9!3d35.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ4JzAwLjAiTiA1MMKwNTQnMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={isRTL ? 'موقعیت فوم صنعت' : 'Foam Sanat Location'}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
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
                <h3 className="text-white font-bold text-xl">{t.companyName}</h3>
              </div>
              <p className="leading-relaxed max-w-md mb-6">{t.footer.about}</p>
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
              <h4 className="text-white font-semibold mb-4">{t.footer.contact}</h4>
              <address className="not-italic space-y-3">
                <a 
                  href="tel:+989128336085" 
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{t.footer.phone}</span>
                </a>
                <a 
                  href={`mailto:${t.footer.email}`} 
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  <Mail className="w-4 h-4" />
                  {t.footer.email}
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
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

      {/* Consent Banner */}
      <ConsentBanner t={t} isRTL={isRTL} />

      {/* Vazirmatn Font for Persian */}
      {lang === 'fa' && (
        <link
          href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
      )}
    </div>
  );
}