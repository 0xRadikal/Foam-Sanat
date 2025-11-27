'use client';

import { ArrowRight, HeartHandshake, Wrench, Zap } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';

type ServicesSectionProps = {
  services: HomeNamespaceSchema['services'];
  isDark: boolean;
  isRTL: boolean;
  cardBg: string;
};

export default function ServicesSection({ services, isDark, isRTL, cardBg }: ServicesSectionProps) {
  const serviceCards = [
    { service: services.hp, icon: Zap, gradient: 'from-blue-600 to-blue-800' },
    { service: services.lp, icon: HeartHandshake, gradient: 'from-purple-600 to-purple-800' },
    { service: services.custom, icon: Wrench, gradient: 'from-orange-600 to-orange-800' }
  ];

  return (
    <section id="products" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{services.title}</h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{services.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {serviceCards.map((item) => (
            <article
              key={item.service.title}
              className={`rounded-2xl overflow-hidden shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${cardBg}`}
            >
              <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                <item.icon className="w-20 h-20 text-white" aria-hidden="true" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{item.service.title}</h3>
                <p className={`mb-5 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.service.desc}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                >
                  {services.cta}
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
