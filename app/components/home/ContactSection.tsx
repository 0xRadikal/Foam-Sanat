'use client';

import { ExternalLink } from 'lucide-react';
import ContactInfo from '@/app/components/ContactInfo';
import type { HomeMessages, Locale } from '@/app/lib/i18n';
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('./ContactForm'));

type ContactSectionProps = {
  contact: HomeMessages['contact'];
  locale: Locale;
  isRTL: boolean;
  isDark: boolean;
  cardBg: string;
  sectionBg: string;
};

export default function ContactSection({ contact, locale, isRTL, isDark, cardBg, sectionBg }: ContactSectionProps) {
  return (
    <section id="contact" className={`py-20 px-4 ${sectionBg}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{contact.title}</h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className={`rounded-2xl shadow-xl p-8 ${cardBg}`}>
            <ContactForm contact={contact} isRTL={isRTL} isDark={isDark} />
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
  );
}
