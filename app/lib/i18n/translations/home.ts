import type { LocaleRecord } from '../locales';

export type HomeNamespaceSchema = {
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
      errorName: string;
      errorEmail: string;
      errorPhone: string;
      errorMessage: string;
      errorGeneric: string;
      captcha: string;
      captchaRequired: string;
      captchaExpired: string;
      captchaError: string;
      captchaUnavailable: string;
      captchaFailed: string;
      captchaTemporarilyUnavailable: string;
      invalidOrigin: string;
    };
    info: {
      title: string;
      labels: {
        address: string;
        phone: string;
        email: string;
        viewMap: string;
      };
    };
  };
  consent: {
    message: string;
    accept: string;
    decline: string;
  };
};

export const homeMessages = {
  fa: {
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
          desc: 'سیستم‌های کاملا اتوماتیک با کنترل PLC و هوشمندسازی'
        },
        {
          title: 'پشتیبانی ۲۴/۷ و خدمات پس از فروش',
          desc: 'تیم متخصص ما همیشه در کنار شماست'
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
        error: 'خطا در ارسال پیام',
        errorName: 'لطفاً یک نام معتبر وارد کنید.',
        errorEmail: 'لطفاً یک ایمیل معتبر وارد کنید.',
        errorPhone: 'لطفاً یک شماره تماس معتبر وارد کنید.',
        errorMessage: 'پیام شما خیلی کوتاه است. لطفاً جزئیات بیشتری اضافه کنید.',
        errorGeneric: 'مشکلی رخ داد. لطفاً دوباره تلاش کنید.',
        captcha: 'اعتبارسنجی امنیتی',
        captchaRequired: 'لطفاً بررسی امنیتی را تکمیل کنید.',
        captchaExpired: 'کد امنیتی منقضی شد، لطفاً دوباره تلاش کنید.',
        captchaError: 'دریافت پاسخ کپچا ممکن نیست، لطفاً دوباره تلاش کنید.',
        captchaUnavailable: 'کپچا فعال نیست؛ ارسال در محیط تولید ممکن است با خطا مواجه شود.',
        captchaFailed: 'تأیید کپچا انجام نشد، لطفاً دوباره تلاش کنید.',
        captchaTemporarilyUnavailable: 'بررسی کپچا در حال حاضر ممکن نیست؛ بعداً دوباره تلاش کنید.',
        invalidOrigin: 'مبدا درخواست معتبر نیست. لطفاً صفحه را تازه‌سازی کنید.'
      },
      info: {
        title: 'اطلاعات تماس',
        labels: {
          address: 'آدرس',
          phone: 'تلفن',
          email: 'ایمیل',
          viewMap: 'مشاهده در نقشه'
        }
      }
    },
    consent: {
      message: 'ما از کوکی‌ها برای بهبود تجربه شما استفاده می‌کنیم',
      accept: 'قبول',
      decline: 'رد'
    }
  },
  en: {
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
          desc: 'Fully automated systems with PLC control and smart technology'
        },
        {
          title: '24/7 Support & After-Sales Service',
          desc: 'Our expert team is always with you'
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
        error: 'Error sending message',
        errorName: 'Please enter a valid name.',
        errorEmail: 'Please enter a valid email address.',
        errorPhone: 'Please enter a valid phone number.',
        errorMessage: 'Your message is too short. Please add more details.',
        errorGeneric: 'Something went wrong. Please try again.',
        captcha: 'Security check',
        captchaRequired: 'Please complete the security check.',
        captchaExpired: 'Security token expired. Please try again.',
        captchaError: 'Unable to verify CAPTCHA. Please retry.',
        captchaUnavailable: 'Security check is unavailable; submissions may fail in production.',
        captchaFailed: 'CAPTCHA verification failed. Please retry.',
        captchaTemporarilyUnavailable: 'CAPTCHA verification is temporarily unavailable; please try again later.',
        invalidOrigin: 'The request origin is not allowed. Please refresh and try again.'
      },
      info: {
        title: 'Contact Information',
        labels: {
          address: 'Address',
          phone: 'Phone',
          email: 'Email',
          viewMap: 'View on Map'
        }
      }
    },
    consent: {
      message: 'We use cookies to improve your experience',
      accept: 'Accept',
      decline: 'Decline'
    }
  }
} as const satisfies LocaleRecord<HomeNamespaceSchema>;

export type HomeMessages = (typeof homeMessages)[keyof typeof homeMessages];
