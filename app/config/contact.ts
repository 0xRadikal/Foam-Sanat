import type { Locale } from '@/app/lib/i18n';

type LocalizedValue = {
  fa: string;
  en: string;
};

type ContactPhone = {
  value: string;
  labels: LocalizedValue;
};

type ContactEmail = {
  value: string;
};

type ContactConfig = {
  companyName: string;
  addresses: LocalizedValue;
  mapUrl: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
};

const buildContactConfig = (config: ContactConfig): ContactConfig => {
  if (!Array.isArray(config.phones) || config.phones.length === 0) {
    throw new Error('contactConfig.phones must include at least one phone number.');
  }

  return config;
};

export const contactConfig: ContactConfig = buildContactConfig({
  companyName: 'Foam Sanat Industrial Group',
  addresses: {
    fa: 'تهران، کرج، جاده ماهدشت - خیابان زیبادشت',
    en: 'Mahdasht Road - Zibadasht Street, Karaj, Tehran, Iran'
  },
  mapUrl: 'https://maps.app.goo.gl/wXxY2HxHnZ6M971h9',
  phones: [
    {
      value: '+989128336085',
      labels: {
        fa: '۰۹۱۲۸۳۳۶۰۸۵',
        en: '+98 912 833 6085'
      }
    },
    {
      value: '+989197302064',
      labels: {
        fa: '۰۹۱۹۷۳۰۲۰۶۴',
        en: '+98 919 730 2064'
      }
    }
  ],
  emails: [
    { value: 'info@foamsanat.com' },
    { value: 'saeidniazpour@yahoo.com' }
  ]
});

const getLocalizedValue = (value: LocalizedValue, locale: Locale) => value[locale] ?? value.en;

export const getContactAddress = (locale: Locale): string => getLocalizedValue(contactConfig.addresses, locale);

export const getContactPhones = (
  locale: Locale
): Array<{ value: string; label: string }> =>
  contactConfig.phones.map((phone) => ({
    value: phone.value,
    label: getLocalizedValue(phone.labels, locale)
  }));

export const getContactEmails = (): ContactEmail[] => contactConfig.emails;
