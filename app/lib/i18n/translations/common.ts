import type { Locale, LocaleRecord } from '../locales';

export type CommonNamespaceSchema = {
  companyName: string;
  tagline: string;
  nav: {
    home: string;
    products: string;
    whyUs: string;
    faq: string;
    contact: string;
  };
  footer: {
    about: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    copyright: string;
  };
};

const defaultContactPhoneFa =
  process.env.CONTACT_PHONE_FA ??
  process.env.CONTACT_PHONE ??
  process.env.NEXT_PUBLIC_CONTACT_PHONE_FA ??
  '۰۹۱۲۸۳۳۶۰۸۵';
const defaultContactPhoneEn =
  process.env.CONTACT_PHONE_EN ??
  process.env.CONTACT_PHONE ??
  process.env.NEXT_PUBLIC_CONTACT_PHONE_EN ??
  '+98 912 833 6085';
const defaultContactEmail =
  process.env.CONTACT_EMAIL ??
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
  'info@foamsanat.com';

export const commonMessages = {
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
    footer: {
      about: 'گروه صنعتی فوم صنعت از ۱۳۸۹ پیشرو در ماشین‌آلات تزریق فوم PU',
      contact: 'اطلاعات تماس',
      phone: defaultContactPhoneFa,
      email: defaultContactEmail,
      address: 'تهران، کرج، جاده ماهدشت - خیابان زیبادشت',
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
    footer: {
      about: 'Foam Sanat pioneering PU foam machinery since 2010',
      contact: 'Contact Info',
      phone: defaultContactPhoneEn,
      email: defaultContactEmail,
      address: 'Tehran, Karaj, Mahdasht Road - Zibadasht Street',
      copyright: '© 2024 Foam Sanat. All rights reserved.'
    }
  }
} as const satisfies LocaleRecord<CommonNamespaceSchema>;

export type CommonMessages = (typeof commonMessages)[Locale];
