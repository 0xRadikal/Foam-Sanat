import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Building2,
  CheckCircle,
  Gauge,
  Heart,
  Leaf,
  Lightbulb,
  Shield,
  Star,
  Trophy,
  Users,
  Zap,
  Clock
} from 'lucide-react';

import type { Locale, LocaleRecord } from '../locales';

export type AboutNamespaceSchema = {
  companyName: string;
  nav: {
    home: string;
    about: string;
    products: string;
    contact: string;
  };
  hero: {
    badge: string;
    title: string[];
    subtitle: string;
    cta: string;
    scroll: string;
  };
  stats: Array<{
    number: number;
    label: string;
    icon: LucideIcon;
    color: string;
  }>;
  timeline: {
    title: string;
    subtitle: string;
    items: Array<{
      year: string;
      title: string;
      desc: string;
      highlight: string;
    }>;
  };
  story: {
    title: string;
    subtitle: string;
    intro: string;
    paragraphs: Array<{
      title: string;
      text: string;
      stat: string;
    }>;
  };
  mission: {
    title: string;
    subtitle: string;
    content: string;
    points: Array<{
      icon: LucideIcon;
      text: string;
    }>;
  };
  vision: {
    title: string;
    subtitle: string;
    content: string;
    goals: Array<{
      year: string;
      title: string;
      desc: string;
    }>;
  };
  values: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: LucideIcon;
      title: string;
      desc: string;
      color: string;
      metrics: string[];
    }>;
  };
  team: {
    title: string;
    subtitle: string;
    intro: string;
    departments: Array<{
      name: string;
      count: number;
      icon: LucideIcon;
      color: string;
      roles: string[];
    }>;
  };
  achievements: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: LucideIcon;
      title: string;
      year: string;
      desc: string;
      color: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    buttons: string[];
  };
};

export const aboutMessages = {
  fa: {
    companyName: 'گروه صنعتی فوم صنعت',
    nav: { home: 'خانه', about: 'درباره ما', products: 'محصولات', contact: 'تماس' },
    hero: {
      badge: '🚀 تاسیس ۱۳۸۹ - پیشرو در خاورمیانه',
      title: ['داستان', 'موفقیت', 'فوم صنعت'],
      subtitle: 'سفری الهام‌بخش از نوآوری تا رهبری در صنعت ماشین‌آلات تزریق فوم پلی‌یورتان',
      cta: 'تماشای ویدیو معرفی',
      scroll: 'اسکرول کنید'
    },
    stats: [
      { number: 15, label: 'سال تجربه', icon: Clock, color: 'from-blue-500 to-blue-700' },
      { number: 120, label: 'پروژه موفق', icon: Trophy, color: 'from-orange-500 to-orange-700' },
      { number: 80, label: 'مشتری راضی', icon: Users, color: 'from-green-500 to-green-700' },
      { number: 25, label: 'متخصص', icon: Award, color: 'from-purple-500 to-purple-700' }
    ],
    timeline: {
      title: 'سفر ما در طول زمان',
      subtitle: '۱۵ سال نوآوری و پیشرفت',
      items: [
        {
          year: '۱۳۸۹',
          title: 'آغاز یک رویا',
          desc: 'تاسیس شرکت با ۳ نفر و کارگاهی ۱۰۰ متری در کرج',
          highlight: 'اولین قدم'
        },
        {
          year: '۱۳۹۲',
          title: 'تایید کیفیت جهانی',
          desc: 'دریافت ISO 9001 و تحویل اولین خط تولید کامل',
          highlight: 'ISO 9001'
        },
        {
          year: '۱۳۹۵',
          title: 'رشد چشمگیر',
          desc: 'رسیدن به ۱۵ نفر تیم و ۵۰+ پروژه موفق',
          highlight: '۵۰ پروژه'
        },
        {
          year: '۱۳۹۸',
          title: 'ورود به بازارهای جهانی',
          desc: 'اخذ CE اروپا و صادرات به ۵ کشور',
          highlight: 'CE Europe'
        },
        {
          year: '۱۴۰۰',
          title: 'توسعه بین‌المللی',
          desc: 'همکاری با ۱۰+ کشور و راه‌اندازی R&D',
          highlight: '۱۰+ کشور'
        },
        {
          year: '۱۴۰۴',
          title: 'رهبری منطقه‌ای',
          desc: '۱۲۰ پروژه، ۸۰ مشتری، ۲۵ متخصص',
          highlight: 'رهبر بازار'
        }
      ]
    },
    story: {
      title: 'داستان ما',
      subtitle: 'از رویا تا واقعیت',
      intro: 'چگونه یک کارگاه کوچک به رهبر صنعت تبدیل شد',
      paragraphs: [
        {
          title: '🌟 آغاز یک رویا',
          text: 'سال ۱۳۸۹، سه مهندس جوان با رویای بزرگ، در کارگاهی ۱۰۰ متری در کرج، اولین قدم را برای ساخت بهترین ماشین‌آلات فوم ایران برداشتند. با تمام محدودیت‌ها، ولی با انگیزه‌ای بی‌پایان.',
          stat: 'شروع با ۳ نفر'
        },
        {
          title: '💪 مسیر پرفراز و نشیب',
          text: 'سال‌های ابتدایی پر از چالش بود. اما هر مشکل، فرصتی برای یادگیری و نوآوری بود. در سال ۱۳۹۲، با دریافت ISO 9001، اولین گام بزرگ برداشته شد و اعتماد مشتریان جلب شد.',
          stat: 'ISO 9001 در سال ۳'
        },
        {
          title: '🚀 رشد و شکوفایی',
          text: 'با افزودن هر عضو جدید به تیم، هر پروژه موفق، هر مشتری راضی، قدم‌های بلندتری برداشته شد. امروز با ۲۵ متخصص، خطوط تولید کامل را طراحی و اجرا می‌کنیم.',
          stat: '۱۲۰+ پروژه موفق'
        },
        {
          title: '🌍 حضور جهانی',
          text: 'از کرج تا ترکیه، عراق، افغانستان و فراتر. امروز محصولات ما در ده‌ها کارخانه در سراسر منطقه کار می‌کند و نام فوم صنعت، نماد کیفیت و اعتماد شده است.',
          stat: 'صادرات به ۱۰+ کشور'
        }
      ]
    },
    mission: {
      title: 'ماموریت ما',
      subtitle: 'چرا وجود داریم',
      content:
        'ارائه راه‌حل‌های مهندسی برتر و خطوط تولید با کیفیت جهانی که مشتریان را قادر می‌سازد تا بهره‌وری خود را ۵۰٪ افزایش دهند و در بازار رقابتی پیشرو باشند.',
      points: [
        { icon: CheckCircle, text: 'کیفیت جهانی با پشتیبانی محلی' },
        { icon: Zap, text: 'نوآوری مداوم در محصولات' },
        { icon: Heart, text: 'رضایت ۱۰۰٪ مشتریان' },
        { icon: Shield, text: 'ضمانت مادام‌العمر' }
      ]
    },
    vision: {
      title: 'چشم‌انداز ۱۴۱۰',
      subtitle: 'آینده‌ای که می‌سازیم',
      content:
        'تبدیل شدن به معتبرترین و نوآورترین برند ماشین‌آلات فوم در خاورمیانه با حضور فعال در ۲۰+ کشور و آموزش ۱۰۰۰+ نیروی متخصص.',
      goals: [
        { year: '۱۴۰۵', title: 'توسعه محصول', desc: 'راه‌اندازی ۵ خط تولید جدید' },
        { year: '۱۴۰۷', title: 'گسترش جغرافیایی', desc: 'حضور در ۱۵ کشور جدید' },
        { year: '۱۴۱۰', title: 'رهبری منطقه', desc: 'بزرگترین تولیدکننده خاورمیانه' }
      ]
    },
    values: {
      title: 'ارزش‌های بنیادین ما',
      subtitle: 'اصولی که هرگز تغییر نمی‌کنند',
      items: [
        {
          icon: Shield,
          title: 'کیفیت بی‌نظیر',
          desc: 'هر دستگاه، شاهکاری در دقت و کارایی. تست ۱۰۰٪ قبل از تحویل.',
          color: 'from-blue-500 to-blue-700',
          metrics: ['ISO 9001:2015', 'CE Europe', '۰٪ نقص']
        },
        {
          icon: Lightbulb,
          title: 'نوآوری مداوم',
          desc: '۱۵٪ درآمد صرف R&D. همیشه یک قدم جلوتر از رقبا.',
          color: 'from-orange-500 to-orange-700',
          metrics: ['۵ مهندس R&D', '۳ پتنت', 'آخرین فناوری']
        },
        {
          icon: Heart,
          title: 'تمرکز بر مشتری',
          desc: 'پشتیبانی ۲۴/۷ و حضور در محل تا رضایت کامل شما.',
          color: 'from-red-500 to-red-700',
          metrics: ['۹۵٪ رضایت', 'پشتیبانی ۲۴/۷', 'مشاوره رایگان']
        },
        {
          icon: Leaf,
          title: 'مسئولیت سبز',
          desc: 'ماشین‌های ما ۳۰٪ انرژی کمتر مصرف می‌کنند.',
          color: 'from-green-500 to-green-700',
          metrics: ['۳۰٪ کاهش انرژی', 'کاهش پسماند', 'دوستدار محیط زیست']
        }
      ]
    },
    team: {
      title: 'تیم ما',
      subtitle: 'قلب تپنده فوم صنعت',
      intro: '۲۵ نفر، یک خانواده، یک هدف',
      departments: [
        {
          name: 'مدیریت',
          count: 5,
          icon: Building2,
          color: 'from-purple-500 to-purple-700',
          roles: ['مدیرعامل', 'مدیر فنی', 'مدیر تولید', 'مدیر فروش', 'مدیر مالی']
        },
        {
          name: 'مهندسی',
          count: 12,
          icon: Zap,
          color: 'from-blue-500 to-blue-700',
          roles: ['مکانیک', 'برق', 'کنترل', 'شیمی', 'R&D']
        },
        {
          name: 'تکنسین‌ها',
          count: 8,
          icon: Gauge,
          color: 'from-orange-500 to-orange-700',
          roles: ['نصب', 'نگهداری', 'PLC', 'هیدرولیک']
        },
        {
          name: 'پشتیبانی',
          count: 5,
          icon: Users,
          color: 'from-green-500 to-green-700',
          roles: ['مشاوره', 'فروش', 'خدمات', 'کیفیت']
        }
      ]
    },
    achievements: {
      title: 'افتخارات ما',
      subtitle: 'گواهی بر تعهد و کیفیت',
      items: [
        {
          icon: Shield,
          title: 'ISO 9001:2015',
          year: '۱۳۹۲',
          desc: 'سیستم مدیریت کیفیت بین‌المللی',
          color: 'from-blue-500 to-blue-700'
        },
        {
          icon: Award,
          title: 'CE Europe',
          year: '۱۳۹۸',
          desc: 'استاندارد ایمنی اروپا',
          color: 'from-green-500 to-green-700'
        },
        {
          icon: Trophy,
          title: 'برترین تولیدکننده',
          year: '۱۴۰۱',
          desc: 'جایزه ملی برترین سازنده',
          color: 'from-orange-500 to-orange-700'
        },
        {
          icon: Star,
          title: 'صادرکننده نمونه',
          year: '۱۴۰۲',
          desc: 'تقدیرنامه وزارت صنعت',
          color: 'from-purple-500 to-purple-700'
        }
      ]
    },
    cta: {
      title: 'همین حالا شروع کنیم؟',
      subtitle: 'تیم ما آماده است تا رویای شما را به واقعیت تبدیل کند',
      buttons: ['مشاوره رایگان', 'تماس فوری', 'مشاهده محصولات']
    }
  },
  en: {
    companyName: 'Foam Sanat Industrial Group',
    nav: { home: 'Home', about: 'About', products: 'Products', contact: 'Contact' },
    hero: {
      badge: '🚀 Est. 2010 - Leading in Middle East',
      title: ['The Success', 'Story of', 'Foam Sanat'],
      subtitle: 'An inspiring journey from innovation to leadership in PU foam injection machinery',
      cta: 'Watch Introduction',
      scroll: 'Scroll Down'
    },
    stats: [
      { number: 15, label: 'Years Experience', icon: Clock, color: 'from-blue-500 to-blue-700' },
      { number: 120, label: 'Successful Projects', icon: Trophy, color: 'from-orange-500 to-orange-700' },
      { number: 80, label: 'Happy Clients', icon: Users, color: 'from-green-500 to-green-700' },
      { number: 25, label: 'Experts', icon: Award, color: 'from-purple-500 to-purple-700' }
    ],
    timeline: {
      title: 'Our Journey Through Time',
      subtitle: '15 Years of Innovation & Progress',
      items: [
        { year: '2010', title: 'The Beginning', desc: 'Founded with 3 people in 100 sq.m workshop', highlight: 'First Step' },
        { year: '2013', title: 'Global Quality', desc: 'ISO 9001 certification and first complete line', highlight: 'ISO 9001' },
        { year: '2016', title: 'Rapid Growth', desc: 'Team of 15 and 50+ successful projects', highlight: '50 Projects' },
        { year: '2019', title: 'Global Markets', desc: 'CE Europe and exports to 5 countries', highlight: 'CE Europe' },
        { year: '2021', title: 'International Development', desc: '10+ countries and R&D launch', highlight: '10+ Countries' },
        { year: '2024', title: 'Regional Leadership', desc: '120 projects, 80 clients, 25 experts', highlight: 'Market Leader' }
      ]
    },
    story: {
      title: 'Our Story',
      subtitle: 'From Dream to Reality',
      intro: 'How a small workshop became the industry leader',
      paragraphs: [
        {
          title: '🌟 The Beginning',
          text: "In 2010, three young engineers with a big dream started in a 100 sq.m workshop in Karaj, taking the first step to build Iran's best foam machinery. Despite all limitations, with endless motivation.",
          stat: 'Started with 3 people'
        },
        {
          title: '💪 The Challenging Path',
          text: 'Early years were full of challenges. But every problem was an opportunity for learning and innovation. In 2013, with ISO 9001 certification, the first big step was taken and customer trust was gained.',
          stat: 'ISO 9001 in Year 3'
        },
        {
          title: '🚀 Growth & Prosperity',
          text: 'With each new team member, each successful project, each satisfied customer, bigger steps were taken. Today with 25 specialists, we design and implement complete production lines.',
          stat: '120+ Successful Projects'
        },
        {
          title: '🌍 Global Presence',
          text: 'From Karaj to Turkey, Iraq, Afghanistan and beyond. Today our products work in dozens of factories across the region and Foam Sanat name has become a symbol of quality and trust.',
          stat: 'Export to 10+ Countries'
        }
      ]
    },
    mission: {
      title: 'Our Mission',
      subtitle: 'Why we exist',
      content:
        'To provide superior engineering solutions and world-class production lines that enable customers to increase productivity by 50% and lead in competitive markets.',
      points: [
        { icon: CheckCircle, text: 'World-class quality with local support' },
        { icon: Zap, text: 'Continuous product innovation' },
        { icon: Heart, text: '100% customer satisfaction' },
        { icon: Shield, text: 'Lifetime warranty' }
      ]
    },
    vision: {
      title: 'Vision 2031',
      subtitle: 'The future we build',
      content:
        'To become the most trusted and innovative foam machinery brand in Middle East with active presence in 20+ countries and training 1000+ specialists.',
      goals: [
        { year: '2026', title: 'Product Development', desc: 'Launch 5 new production lines' },
        { year: '2028', title: 'Geographic Expansion', desc: 'Presence in 15 new countries' },
        { year: '2031', title: 'Regional Leadership', desc: 'Largest manufacturer in Middle East' }
      ]
    },
    values: {
      title: 'Our Core Values',
      subtitle: 'Principles that never change',
      items: [
        {
          icon: Shield,
          title: 'Unmatched Quality',
          desc: 'Every machine, a masterpiece in precision and efficiency. 100% testing before delivery.',
          color: 'from-blue-500 to-blue-700',
          metrics: ['ISO 9001:2015', 'CE Europe', '0% Defect']
        },
        {
          icon: Lightbulb,
          title: 'Continuous Innovation',
          desc: '15% revenue for R&D. Always one step ahead of competitors.',
          color: 'from-orange-500 to-orange-700',
          metrics: ['5 R&D Engineers', '3 Patents', 'Latest Tech']
        },
        {
          icon: Heart,
          title: 'Customer Focus',
          desc: '24/7 support and on-site presence until your complete satisfaction.',
          color: 'from-red-500 to-red-700',
          metrics: ['95% Satisfaction', '24/7 Support', 'Free Consultation']
        },
        {
          icon: Leaf,
          title: 'Green Responsibility',
          desc: 'Our machines consume 30% less energy.',
          color: 'from-green-500 to-green-700',
          metrics: ['-30% Energy', 'Reduced Waste', 'Eco-Friendly']
        }
      ]
    },
    team: {
      title: 'Our Team',
      subtitle: 'The beating heart of Foam Sanat',
      intro: '25 people, one family, one goal',
      departments: [
        {
          name: 'Management',
          count: 5,
          icon: Building2,
          color: 'from-purple-500 to-purple-700',
          roles: ['CEO', 'Technical Director', 'Production Manager', 'Sales Manager', 'Financial Manager']
        },
        {
          name: 'Engineering',
          count: 12,
          icon: Zap,
          color: 'from-blue-500 to-blue-700',
          roles: ['Mechanical', 'Electrical', 'Control', 'Chemical', 'R&D']
        },
        {
          name: 'Technicians',
          count: 8,
          icon: Gauge,
          color: 'from-orange-500 to-orange-700',
          roles: ['Installation', 'Maintenance', 'PLC', 'Hydraulic']
        },
        {
          name: 'Support',
          count: 5,
          icon: Users,
          color: 'from-green-500 to-green-700',
          roles: ['Consulting', 'Sales', 'Service', 'Quality']
        }
      ]
    },
    achievements: {
      title: 'Our Achievements',
      subtitle: 'Proof of commitment and quality',
      items: [
        {
          icon: Shield,
          title: 'ISO 9001:2015',
          year: '2013',
          desc: 'International Quality Management System',
          color: 'from-blue-500 to-blue-700'
        },
        {
          icon: Award,
          title: 'CE Europe',
          year: '2019',
          desc: 'European Safety Standard',
          color: 'from-green-500 to-green-700'
        },
        {
          icon: Trophy,
          title: 'Best Manufacturer',
          year: '2022',
          desc: 'National Best Producer Award',
          color: 'from-orange-500 to-orange-700'
        },
        {
          icon: Star,
          title: 'Top Exporter',
          year: '2023',
          desc: 'Ministry of Industry Certificate',
          color: 'from-purple-500 to-purple-700'
        }
      ]
    },
    cta: {
      title: "Let's Start Right Now?",
      subtitle: 'Our team is ready to turn your dream into reality',
      buttons: ['Free Consultation', 'Contact Now', 'View Products']
    }
  }
} as const satisfies LocaleRecord<AboutNamespaceSchema>;

export type AboutMessages = (typeof aboutMessages)[Locale];
