export interface Translation {
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
  trust: {
    iso: string;
    ce: string;
    experience: string;
    projects: string;
  };
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
  footer: {
    about: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    copyright: string;
  };
}

export const translations: Record<'fa' | 'en', Translation> = {
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
    cta: {
      title: 'آماده تحول در تولید خود هستید؟',
      subtitle: 'با کارشناسان ما مشاوره کنید',
      button: 'تماس فوری'
    },
    footer: {
      about: 'گروه صنعتی فوم صنعت از ۱۳۸۹ پیشرو در ماشین‌آلات تزریق فوم PU',
      contact: 'اطلاعات تماس',
      phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '۰۲۱-۱۲۳۴۵۶۷۸',
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@foamsanat.com',
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
    cta: {
      title: 'Ready to Transform Your Production?',
      subtitle: 'Consult with our experts',
      button: 'Contact Now'
    },
    footer: {
      about: 'Foam Sanat pioneering PU foam machinery since 2010',
      contact: 'Contact Info',
      phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+98 21 12345678',
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@foamsanat.com',
      address: 'Tehran, Iran',
      copyright: '© 2024 Foam Sanat. All rights reserved.'
    }
  }
};