'use client';

import { ExternalLink } from 'lucide-react';
import ContactInfo from '@/app/components/ContactInfo';
import ContactForm from './ContactForm';
import type { HomeMessages, Locale } from '@/app/lib/i18n';
import { contactConfig } from '@/app/config/contact';

type ContactSectionProps = {
  contact: HomeMessages['contact'];
  locale: Locale;
  isRTL: boolean;
  isDark: boolean;
  cardBg: string;
  sectionBg: string;
};

export default function ContactSection({ contact, locale, isRTL, isDark, cardBg, sectionBg }: ContactSectionProps) {
  const MAP_URL = contactConfig.mapUrl;
  return (
    <section id="contact" className={`py-20 px-4 ${sectionBg}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{contact.title}</h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className={`rounded-2xl shadow-xl p-8 ${cardBg}`}>
            <ContactForm
              contact={contact}
              isRTL={isRTL}
              isDark={isDark}
              locale={locale}
            />
          </div>

          <div className="space-y-8">
            <div className={`rounded-2xl shadow-xl p-8 ${cardBg}`}>
              <h3 className="text-2xl font-bold mb-6">{contact.info.title}</h3>
              <ContactInfo
                locale={locale}
                labels={contact.info.labels}
                variant="list"
                layout="stack"
                className="space-y-6"
                itemClassName="flex items-start gap-4"
                labelClassName="font-semibold mb-1"
                valueClassName={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                linkClassName={`block font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-orange-500`}
                mapLinkClassName="inline-flex items-center gap-2 mt-2 text-orange-500 hover:text-orange-600 font-semibold"
                mapLinkContent={
                  <span className="inline-flex items-center gap-2">
                    {contact.info.labels.viewMap}
                    <ExternalLink className="w-4 h-4" />
                  </span>
                }
                align="start"
                useDefaultLinkColor={false}
              />
            </div>

            <div className="rounded-2xl shadow-xl overflow-hidden aspect-video min-h-[260px]">
              <iframe
                src={MAP_URL}
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
  );
}
