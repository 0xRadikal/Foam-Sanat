'use client';

import { ChevronDown } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';

type FaqSectionProps = {
  faq: HomeNamespaceSchema['faq'];
  isDark: boolean;
  cardBg: string;
  hoverBg: string;
};

export default function FaqSection({ faq, isDark, cardBg, hoverBg }: FaqSectionProps) {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">{faq.title}</h2>
        <div className="space-y-4">
          {faq.items.map((item, index) => (
            <details key={index} className={`group rounded-xl shadow-md overflow-hidden ${cardBg}`}>
              <summary
                className={`flex justify-between items-center cursor-pointer list-none p-6 font-semibold text-lg transition-colors ${hoverBg} focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                <span>{item.q}</span>
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className={`px-6 pb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
