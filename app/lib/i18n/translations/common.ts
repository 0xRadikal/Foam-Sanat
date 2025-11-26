import { getEnvValue } from '../../env';
import type { Locale, LocaleRecord } from '../locales';

export type CommonNamespaceSchema = {
  companyName: string;
  tagline: string;
  nav: {
    home: string;
    about: string;
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

const defaultContactPhoneFa = getEnvValue(
  ['NEXT_PUBLIC_CONTACT_PHONE_FA', 'CONTACT_PHONE_FA'],
  {
    visibility: 'public',
    fallback: '+98 912 000 0000',
  },
);

const defaultContactPhoneEn = getEnvValue(
  ['NEXT_PUBLIC_CONTACT_PHONE_EN', 'CONTACT_PHONE_EN'],
  {
    visibility: 'public',
    fallback: '+98 21 000 0000',
  },
);

const defaultContactEmail = getEnvValue(
  ['NEXT_PUBLIC_CONTACT_EMAIL', 'CONTACT_EMAIL'],
  {
    visibility: 'public',
    fallback: 'info@example.com',
  },
);

export const commonMessages = {
  fa: {
    companyName: 'گروه صنعتی فوم صنعت',
    tagline: 'پیشرو در مهندسی فوم پلی‌یورتان',
    nav: {
      home: 'خانه',
      about: 'درباره ما',
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
      about: 'About',
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
