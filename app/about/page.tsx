// app/about/page.tsx - نسخه حرفه‌ای و کامل
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Globe, Sun, Moon, Menu, X, ArrowRight, Phone, Mail, MapPin,
  TrendingUp, Award, Users, Trophy, Rocket, Building2, Star,
  Shield, Lightbulb, Heart, Leaf, Target, Eye, CheckCircle,
  Sparkles, Zap, Factory, Gauge, Clock, Calendar, ChevronDown
} from 'lucide-react';
import { type AboutMessages } from '@/app/lib/i18n';
import { useLocaleTheme, useMessages } from '@/app/lib/i18n/hooks';

// Animated Counter
function Counter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (started) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStarted(true);
        const increment = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 16);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return <div ref={ref}>{count}</div>;
}

// Parallax Section
function ParallaxSection({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div style={{ transform: `translateY(${offset}px)` }} className="transition-transform">
      {children}
    </div>
  );
}
export default function AboutPage() {
  const { locale: lang, theme, dir, isReady, toggleLocale, toggleTheme } = useLocaleTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimeline(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: '/about',
      });
    }
  }, []);
  const isRTL = dir === 'rtl';
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const headerBg = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDark ? 'bg-gray-800' : 'bg-gray-50';

  const messages = useMessages(lang);

  if (!isReady || !messages) {
    return null;
  }

  const t: AboutMessages = messages.about;
  const timelineIcons = [Rocket, Award, TrendingUp, Globe, Users, Trophy];

  return (
    <div
      className={`min-h-screen ${bgColor} ${textColor} transition-all duration-300`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{ fontFamily: lang === 'fa' ? 'Vazirmatn, sans-serif' : 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? `${headerBg} backdrop-blur-lg shadow-2xl` : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">{t.companyName}</span>
            </a>

            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(t.nav).map(([key, value]) => (
                <a 
                  key={key}
                  href={key === 'home' ? '/' : `/${key}`}
                  className={`hover:text-orange-500 transition-colors font-medium ${
                    key === 'about' ? 'text-orange-500 font-bold' : ''
                  }`}
                >
                  {value}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleLocale} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-700/50">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-700 space-y-2">
              {Object.entries(t.nav).map(([key, value]) => (
                <a key={key} href={key === 'home' ? '/' : `/${key}`} className="block px-4 py-3 rounded-lg hover:bg-gray-700/50">
                  {value}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section with Animation */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50'}`}>
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-orange-500 to-purple-600"
                style={{
                  width: Math.random() * 300 + 50 + 'px',
                  height: Math.random() * 300 + 50 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `float ${Math.random() * 20 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  filter: 'blur(60px)'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 animate-bounce shadow-2xl">
              <Sparkles className="w-5 h-5" />
              {t.hero.badge}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              {t.hero.title.map((word, i) => (
                <div 
                  key={i}
                  className="inline-block bg-gradient-to-r from-blue-600 via-orange-500 to-purple-600 bg-clip-text text-transparent animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {word}{' '}
                </div>
              ))}
            </h1>
            
            <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">▶</span>
                {t.hero.cta}
              </button>
              <a
                href="#story"
                className={`inline-flex items-center gap-3 ${cardBg} border-2 border-orange-500 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl`}
              >
                {lang === 'fa' ? 'داستان کامل' : 'Full Story'}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm animate-bounce">
              <ChevronDown className="w-5 h-5" />
              {t.hero.scroll}
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 px-4 ${sectionBg}`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i}
                  className={`${cardBg} rounded-3xl p-8 text-center group hover:scale-110 transition-all shadow-xl hover:shadow-2xl`}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    <Counter end={stat.number} />+
                  </div>
                  <div className="font-semibold text-lg">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">{t.timeline.title}</h2>
            <p className="text-2xl text-orange-500 font-bold">{t.timeline.subtitle}</p>
          </div>

          <div className="relative">
            <div className={`absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-orange-500 to-purple-500 hidden md:block`} />

            {t.timeline.items.map((item, i) => {
              const Icon = timelineIcons[i];
              const isActive = activeTimeline === i;
              
              return (
                <div
                  key={i}
                  className={`relative mb-12 transition-all duration-500 ${isActive ? 'scale-105' : ''}`}
                >
                  <div className={`flex items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`w-full md:w-5/12 ${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all ${
                      isActive ? 'ring-4 ring-orange-500' : ''
                    }`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${isActive ? 'from-orange-500 to-purple-600 scale-110' : 'from-gray-500 to-gray-700'} rounded-2xl flex items-center justify-center transition-all`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-black text-orange-500">{item.year}</div>
                          <div className="text-sm font-bold text-purple-500">{item.highlight}</div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>

                    <div className="hidden md:flex w-2/12 justify-center">
                      <div className={`w-8 h-8 rounded-full ${
                        isActive ? 'bg-orange-500 scale-150 ring-8 ring-orange-500/30' : 'bg-gray-400'
                      } transition-all duration-500`} />
                    </div>

                    <div className="hidden md:block w-5/12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className={`py-20 px-4 ${sectionBg}`}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">{t.story.title}</h2>
            <p className="text-2xl text-orange-500 font-bold mb-2">{t.story.subtitle}</p>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.story.intro}</p>
          </div>

          <div className="space-y-8">
            {t.story.paragraphs.map((para, i) => (
              <div 
                key={i}
                className={`${cardBg} rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all group`}
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-2xl group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">{para.title}</h3>
                    <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {para.text}
                    </p>
                    <div className="inline-block bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                      📊 {para.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className={`${cardBg} rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all group`}>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <Target className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-black mb-2">{t.mission.title}</h3>
              <p className="text-sm text-orange-500 font-bold mb-4">{t.mission.subtitle}</p>
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.mission.content}
              </p>
              <div className="space-y-3">
                {t.mission.points.map((point, i) => {
                  const Icon = point.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="font-semibold">{point.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vision */}
            <div className={`${cardBg} rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all group`}>
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <Eye className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-black mb-2">{t.vision.title}</h3>
              <p className="text-sm text-orange-500 font-bold mb-4">{t.vision.subtitle}</p>
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.vision.content}
              </p>
              <div className="space-y-4">
                {t.vision.goals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {goal.year}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{goal.title}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{goal.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-20 px-4 ${sectionBg}`}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">{t.values.title}</h2>
            <p className="text-xl text-orange-500 font-bold">{t.values.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.values.items.map((value, i) => {
              const Icon = value.icon;
              return (
                <div 
                  key={i}
                  className={`${cardBg} rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group`}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">{value.title}</h3>
                  <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {value.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {value.metrics.map((metric, j) => (
                      <span 
                        key={j}
                        className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">{t.team.title}</h2>
            <p className="text-2xl text-orange-500 font-bold mb-2">{t.team.subtitle}</p>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.team.intro}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.team.departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <div 
                  key={i}
                  className={`${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group`}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl font-black text-center bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    {dept.count}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-4">{dept.name}</h3>
                  <div className="space-y-2">
                    {dept.roles.map((role, j) => (
                      <div key={j} className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {role}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className={`py-20 px-4 ${sectionBg}`}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">{t.achievements.title}</h2>
            <p className="text-xl text-orange-500 font-bold">{t.achievements.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.achievements.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={i}
                  className={`${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}
                >
                  <div className="flex items-center gap-6 mb-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-black">{item.title}</div>
                      <div className="text-sm font-bold text-orange-500">{item.year}</div>
                    </div>
                  </div>
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className={`container mx-auto max-w-4xl ${cardBg} rounded-3xl p-16 text-center shadow-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10" />
          <div className="relative z-10">
            <Star className="w-20 h-20 text-orange-500 mx-auto mb-6 animate-spin" style={{ animationDuration: '3s' }} />
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t.cta.title}</h2>
            <p className={`text-2xl mb-10 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {t.cta.buttons.map((btn, i) => (
                <a
                  key={i}
                  href={i === 0 ? '/contact' : i === 1 ? 'tel:+989128336085' : '/products'}
                  className={`inline-flex items-center gap-2 ${
                    i === 0 
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
                      : `${cardBg} border-2 border-orange-500 text-orange-500`
                  } px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl`}
                >
                  {btn}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8">
            <a href="tel:+989128336085" className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Phone className="w-6 h-6" />
            </a>
            <a href="mailto:info@foamsanat.com" className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Mail className="w-6 h-6" />
            </a>
            <a href="https://maps.app.goo.gl/wXxY2HxHnZ6M971h9" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <MapPin className="w-6 h-6" />
            </a>
          </div>
          <p className="text-lg font-bold text-white mb-2">{t.companyName}</p>
          <p className="text-sm">© 2024 {lang === 'fa' ? 'تمامی حقوق محفوظ است' : 'All rights reserved'}</p>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="max-w-4xl w-full aspect-video bg-gray-800 rounded-2xl flex items-center justify-center">
            <p className="text-white text-2xl">{lang === 'fa' ? 'ویدیو معرفی' : 'Introduction Video'}</p>
          </div>
        </div>
      )}

      {lang === 'fa' && (
        <link href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css" rel="stylesheet" />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
    
  );
  
}
