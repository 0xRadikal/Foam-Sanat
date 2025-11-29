'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, PauseCircle, PlayCircle } from 'lucide-react';
import type { HomeNamespaceSchema } from '@/app/lib/i18n';

export type HeroSliderProps = {
  slides: HomeNamespaceSchema['slider']['slides'];
  isRTL: boolean;
  isDark: boolean;
};

export default function HeroSlider({ slides, isRTL, isDark }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    resetTimeout();
    if (isAutoPlaying) {
      timeoutRef.current = setTimeout(
        () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
        5000
      );
    }

    return () => resetTimeout();
  }, [current, isAutoPlaying, slides.length, resetTimeout]);

  const goToSlide = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  return (
    <div className="relative h-full group">
      <div className="relative h-full overflow-hidden rounded-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === current
                ? 'opacity-100 translate-x-0'
                : `opacity-0 ${isRTL ? '-translate-x-full' : 'translate-x-full'}`
            }`}
            style={{
              transform: index === current ? 'translateX(0)' : isRTL ? 'translateX(-100%)' : 'translateX(100%)'
            }}
          >
            <div
              className={`h-full ${
                isDark ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-blue-800 to-blue-600'
              } flex items-center justify-center p-8`}
            >
              <div className="text-white text-center max-w-2xl">
                {slide.badge && (
                  <span className="inline-block bg-orange-500 px-4 py-1 rounded-full text-xs font-bold mb-4 animate-pulse">
                    {slide.badge}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-lg opacity-90">{slide.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrev}
        className={`absolute ${
          isRTL ? 'right-4' : 'left-4'
        } top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white`}
        aria-label="Previous slide"
      >
        {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </button>
      <button
        onClick={goToNext}
        className={`absolute ${
          isRTL ? 'left-4' : 'right-4'
        } top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white`}
        aria-label="Next slide"
      >
        {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={`${slide.title}-dot`}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
              index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1} of ${slides.length}`}
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
          <div className={`w-3 h-3 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          {isAutoPlaying ? 'Auto play' : 'Paused'}
        </div>
        <button
          type="button"
          onClick={toggleAutoPlay}
          className="bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isAutoPlaying ? 'Pause slider auto play' : 'Resume slider auto play'}
          aria-pressed={isAutoPlaying}
        >
          {isAutoPlaying ? <PauseCircle className="w-7 h-7" /> : <PlayCircle className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
}
