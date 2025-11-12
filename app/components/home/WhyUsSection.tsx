'use client';

import { CheckCircle, Users } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';

type WhyUsSectionProps = {
  whyUs: HomeNamespaceSchema['whyUs'];
  isDark: boolean;
  sectionBg: string;
};

export default function WhyUsSection({ whyUs, isDark, sectionBg }: WhyUsSectionProps) {
  return (
    <section id="why-us" className={`py-20 px-4 ${sectionBg}`}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{whyUs.title}</h2>
            <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{whyUs.subtitle}</p>
            <div className="space-y-6">
              {whyUs.features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`aspect-square rounded-2xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'
            } flex items-center justify-center transition-transform hover:scale-105 duration-300`}
          >
            <Users className={`w-32 h-32 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
