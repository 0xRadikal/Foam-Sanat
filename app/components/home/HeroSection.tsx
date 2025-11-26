'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';

const HeroSlider = dynamic(() => import('./HeroSlider'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-800 to-blue-600 animate-pulse" />
  )
});

type HomeHeroMessages = HomeNamespaceSchema['hero'];
type HomeSliderMessages = HomeNamespaceSchema['slider'];

type HeroSectionProps = {
  hero: HomeHeroMessages;
  slider: HomeSliderMessages;
  isDark: boolean;
  isRTL: boolean;
};

export default function HeroSection({ hero, slider, isDark, isRTL }: HeroSectionProps) {
  return (
    <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div
        className={`absolute inset-0 opacity-50 ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'
        }`}
        aria-hidden="true"
      />
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-md animate-pulse">
              {hero.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{hero.title}</h1>
            <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
              >
                {hero.cta1}
                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
              </a>
              <Link
                href="/products"
                className={`inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
                  isDark
                    ? 'border-white text-white hover:bg-white hover:text-gray-900'
                    : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                }`}
              >
                {hero.cta2}
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
                  isDark
                    ? 'text-gray-200 hover:text-white hover:bg-gray-800'
                    : 'text-blue-900 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {isRTL ? 'درباره ما' : 'About us'}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
          <div className="relative aspect-video">
            <HeroSlider slides={slider.slides} isRTL={isRTL} isDark={isDark} />
          </div>
        </div>
      </div>
    </section>
  );
}
