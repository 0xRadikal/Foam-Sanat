'use client';

import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';
import ContactForm from './ContactForm';

type ContactSectionProps = {
  contact: HomeNamespaceSchema['contact'];
  isRTL: boolean;
  isDark: boolean;
  cardBg: string;
  sectionBg: string;
};

export default function ContactSection({ contact, isRTL, isDark, cardBg, sectionBg }: ContactSectionProps) {
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
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">{isRTL ? 'آدرس' : 'Address'}</p>
                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{contact.info.address}</p>
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
                        {contact.info.phone1}
                      </a>
                      <a
                        href="tel:+989197302064"
                        className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        dir="ltr"
                      >
                        {contact.info.phone2}
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
                        href={`mailto:${contact.info.email1}`}
                        className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {contact.info.email1}
                      </a>
                      <a
                        href={`mailto:${contact.info.email2}`}
                        className={`block hover:text-orange-500 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {contact.info.email2}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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
