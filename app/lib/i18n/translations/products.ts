import type { Locale, LocaleRecord } from '../locales';
import type { LucideIcon } from 'lucide-react';
import { Award, Factory, Gauge, Shield, Users, Wrench, Zap } from 'lucide-react';

export type ProductsNamespaceSchema = {
  companyName: string;
  nav: {
    home: string;
    products: string;
    about: string;
    contact: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  categories: Array<{
    id: string;
    name: string;
    icon: LucideIcon;
  }>;
  products: Array<{
    id: string;
    category: string;
    name: string;
    images: string[];
    price: string;
    badge?: string;
    shortDesc: string;
    description: string;
    fullDescription: string;
    features: string[];
    specs: {
      pressure: string;
      capacity: string;
      temp: string;
      power: string;
      dimensions: string;
    };
    applications: string[];
    hasPrice: boolean;
  }>;
  features: {
    title: string;
    items: Array<{
      icon: LucideIcon;
      title: string;
      desc: string;
    }>;
  };
  comments: {
    noComments: string;
    addComment: string;
    rating: string;
    yourName: string;
    yourEmail: string;
    yourComment: string;
    submit: string;
    replies: string;
    reply: string;
    admin: string;
    delete: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
};

export const productsMessages = {
  fa: {
    companyName: 'گروه صنعتی فوم صنعت',
    nav: { home: 'خانه', products: 'محصولات', about: 'درباره ما', contact: 'تماس' },
    hero: {
      badge: '🏭 ماشین‌آلات و خطوط تولید فوم',
      title: 'محصولات',
      subtitle: 'ماشین‌آلات تزریق فوم پلی‌یورتان با کیفیت جهانی',
      description: 'تمامی محصولات ما با بهترین فناوری روز و استانداردهای بین‌المللی طراحی و ساخته شده‌اند'
    },
    categories: [
      { id: 'all', name: 'همه', icon: Factory },
      { id: 'hp', name: 'هایپرشر', icon: Zap },
      { id: 'lp', name: 'لوپرشر', icon: Gauge },
      { id: 'rigid', name: 'ریجید', icon: Shield },
      { id: 'custom', name: 'سفارشی', icon: Wrench }
    ],
    products: [
      {
        id: 'lp-soft',
        category: 'lp',
        name: 'ماشین تزریق فوم نرم',
        images: ['🛋️', '🛏️', '🪑'],
        price: 'نیاز به مشاوره',
        badge: 'پرفروش',
        shortDesc: 'برای تشک‌ها و مبلمان',
        description: 'ماشین تزریق فوم نرم با فشار کم برای تولید مبلمان، تشک، کوسن و محصولات راحتی.',
        fullDescription: `فوم نرم (Soft Foam) یکی از محبوب‌ترین انواع فوم‌های پلی‌اورتان است که به‌طور گسترده‌ای در صنایع تولید مبلمان، تشک‌های خواب و کوسن‌ها استفاده می‌شود.

ماشین تزریق فوم نرم (لوپرشر) ماشینسازی سامکو و فوم صنعت بر اساس تکنولوژی لوپرشر (کم‌فشار) طراحی و ساخته شده است.

ویژگی‌های برجسته:
• فشار کار: 3-10 بار
• ظرفیت تولید: 50-300 قطعه در روز
• سیستم اتوماتیک ریختگری
• صرفه‌جویی در مصرف مواد خام تا 20%
• کاهش مصرف برق 30%`,
        features: [
          'فشار کم (3-10 بار)',
          'مناسب برای فوم‌های نرم',
          'سیستم اتوماتیک ریختگری',
          'کنترل دما دقیق',
          'صرفه‌جویی مواد خام'
        ],
        specs: {
          pressure: '۳-۱۰ bar',
          capacity: '۵۰-۳۰۰ قطعه/روز',
          temp: '۲۰-۶۰ درجه سانتی‌گراد',
          power: '۱۵-۳۰ کیلووات',
          dimensions: '۲۵۰۰ × ۲۰۰۰ × ۲۴۰۰ میلی‌متر'
        },
        applications: ['تشک‌های خواب', 'کوسن‌های مبلمان', 'کوسن‌های صندلی', 'محصولات راحتی'],
        hasPrice: false
      },
      {
        id: 'rigid-panel',
        category: 'rigid',
        name: 'ماشین تزریق فوم ریجید',
        images: ['🏭', '🏗️', '❄️'],
        price: 'نیاز به مشاوره',
        badge: 'جدید',
        shortDesc: 'برای ساندویچ پانل',
        description: 'دستگاه تزریق فوم ریجید برای ساندویچ پانل صنعتی، یخچال و درب ضد سرقت.',
        fullDescription: `فوم ریجید (Rigid Foam) نوعی فوم پلی‌اورتان است که به‌دلیل خصوصیات عایق‌کاری فوق‌العاده‌ی حرارتی و صوتی کاربردهای گسترده‌ای دارد.

ویژگی‌های برجسته:
• عایق‌کاری حرارتی و صوتی بسیار بالا
• قابلیت تزریق با گازهای مختلف
• سیستم دو تزریق‌کننده
• کنترل چگالی دقیق`,
        features: [
          'عایق حرارتی فوق‌العاده',
          'عایق صوتی بالا',
          'تزریق دو مرحله‌ای',
          'کنترل چگالی دقیق',
          'مناسب برای پانل‌های مختلف'
        ],
        specs: {
          pressure: '۲-۱۲ bar',
          capacity: '۵۰۰-۲۰۰۰ متر مربع/روز',
          temp: '۲۲-۶۵ درجه سانتی‌گراد',
          power: '۱۰-۲۵ کیلووات',
          dimensions: '۲۸۰۰ × ۲۲۰۰ × ۲۶۰۰ میلی‌متر'
        },
        applications: ['ساندویچ پانل صنعتی', 'یخچال و فریزر', 'درب ضد سرقت', 'پارتیشن اداری'],
        hasPrice: false
      },
      {
        id: 'hp-integral',
        category: 'hp',
        name: 'ماشین تزریق فوم انتگرال',
        images: ['⚙️', '🔧', '🏭'],
        price: 'نیاز به مشاوره',
        badge: 'فاخر',
        shortDesc: 'برای قطعات خودرو',
        description: 'سیستم تزریق پیشرفته برای فوم انتگرال مناسب برای قطعات خودرو و مبلمان.',
        fullDescription: `فوم انتگرال (Integral Foam) نوعی فوم است که در یک تزریق واحد، یک پوسته سخت و یک هسته نرم ایجاد می‌کند.

کاربردهای اصلی:
• قطعات داخلی خودرو
• مبلمان پریمیوم و لوکس
• اسپورتس و تجهیزات ورزشی
• قطعات صنعتی خاص`,
        features: [
          'دو سیستم تزریق',
          'کنترل دما و فشار دقیق',
          'سیستم PLC هوشمند',
          'قالب‌های سفارشی',
          'تولید قطعات فاخر'
        ],
        specs: {
          pressure: '۱۸۰-۲۲۰ bar',
          capacity: '۲۰۰-۸۰۰ قطعه/روز',
          temp: '۱۵-۷۵ درجه سانتی‌گراد',
          power: '۴۰-۶۵ کیلووات',
          dimensions: '۳۵۰۰ × ۲۸۰۰ × ۳۰۰۰ میلی‌متر'
        },
        applications: ['قطعات خودرو فاخر', 'مبلمان پریمیوم', 'تجهیزات صنعتی'],
        hasPrice: false
      },
      {
        id: 'hp-standard',
        category: 'hp',
        name: 'ماشین تزریق فوم هایپرشر',
        images: ['🏭', '🔩', '⚡'],
        price: '۳۵,۰۰۰,۰۰۰ تومان',
        badge: 'پرفروش',
        shortDesc: 'برای تولید انبوه',
        description: 'ماشین تزریق فوم با فشار ۱۵۰+ بار برای تولیدات انبوه‌ای.',
        fullDescription: `ماشین تزریق فوم هایپرشر (High-Pressure) یکی از پرکاربردترین دستگاه‌های تولید فوم است.

ویژگی‌های برجسته:
• فشار تا 200 بار
• ظرفیت تولید بسیار بالا
• سیستم کنترل PLC پیشرفته
• تولید 24/7
• کاهش خسارت مواد خام`,
        features: [
          'فشار تا 200 بار',
          'ظرفیت تولید بالا',
          'سیستم کنترل PLC',
          'تولید 24/7',
          'کیفیت ثابت'
        ],
        specs: {
          pressure: '۱۵۰-۲۰۰ bar',
          capacity: '۱۰۰۰-۲۰۰۰ قطعه/روز',
          temp: '۲۰-۸۰ درجه سانتی‌گراد',
          power: '۳۰-۵۰ کیلووات',
          dimensions: '۳۰۰۰ × ۲۵۰۰ × ۲۸۰۰ میلی‌متر'
        },
        applications: ['قطعات خودرو', 'کوسن‌های صندلی', 'فوم‌های انتگرال'],
        hasPrice: true
      },
      {
        id: 'filter-line',
        category: 'hp',
        name: 'خط تولید فیلتر هوای فوم',
        images: ['💨', '🔧', '🏭'],
        price: 'نیاز به مشاوره',
        shortDesc: 'برای صنایع خودرو',
        description: 'خط خودکار تولید فیلتر هوای فوم برای موتورخانه‌ها و دستگاه‌های صنعتی.',
        fullDescription: `خط تولید فیلتر هوای فوم سیستمی کامل و اتوماتیک است.

مزایای فیلتر فوم:
• عمر طولانی
• کارایی فیلتراسیون بالا
• تغییر دور آسان
• قیمت مناسب
• وزن سبک`,
        features: [
          'خط اتوماتیک',
          'کیفیت بالا',
          'ظرفیت بالا',
          'قابل تطبیق',
          'صرفه‌جویی مواد'
        ],
        specs: {
          pressure: '۶-۱۲ bar',
          capacity: '۵۰۰-۲۰۰۰ فیلتر/روز',
          temp: '۲۰-۷۰ درجه سانتی‌گراد',
          power: '۲۵-۴۵ کیلووات',
          dimensions: '۴۰۰۰ × ۳۰۰۰ × ۲۸۰۰ میلی‌متر'
        },
        applications: ['فیلتر موتورخانه', 'فیلتر کمپرسور', 'فیلتر صنعتی'],
        hasPrice: false
      }
    ],
    features: {
      title: 'ویژگی‌های تمامی محصولات',
      items: [
        { icon: Shield, title: 'استانداردهای جهانی', desc: 'ISO 9001:2015 و CE اروپا' },
        { icon: Zap, title: 'صرفه‌جویی انرژی', desc: '۲۰-۳۰٪ کاهش مصرف' },
        { icon: Award, title: 'کیفیت برتر', desc: '۰٪ نقص و ضمانت۲۴ ماه' },
        { icon: Users, title: 'تیم متخصص', desc: 'آموزش و پشتیبانی ۲۴/۷' }
      ]
    },
    comments: {
      noComments: 'هنوز نظری نیست',
      addComment: 'اضافه کردن نظر',
      rating: 'امتیاز',
      yourName: 'نام شما',
      yourEmail: 'ایمیل شما',
      yourComment: 'نظر شما',
      submit: 'ارسال نظر',
      replies: 'پاسخ‌ها',
      reply: 'پاسخ',
      admin: 'مدیر سایت',
      delete: 'حذف'
    },
    cta: {
      title: 'محصول مناسب خود را پیدا کردید؟',
      subtitle: 'تیم ما برای کمک و مشاوره آماده است',
      button: 'درخواست مشاوره'
    }
  },
  en: {
    companyName: 'Foam Sanat Industrial Group',
    nav: { home: 'Home', products: 'Products', about: 'About', contact: 'Contact' },
    hero: {
      badge: '🏭 PU Foam Machinery',
      title: 'Products',
      subtitle: 'World-Class Foam Injection Machines',
      description: 'All products designed with cutting-edge technology'
    },
    categories: [
      { id: 'all', name: 'All', icon: Factory },
      { id: 'hp', name: 'High-Pressure', icon: Zap },
      { id: 'lp', name: 'Low-Pressure', icon: Gauge },
      { id: 'rigid', name: 'Rigid', icon: Shield },
      { id: 'custom', name: 'Custom', icon: Wrench }
    ],
    products: [
      {
        id: 'lp-soft',
        category: 'lp',
        name: 'Low-Pressure Soft Foam Machine',
        images: ['🛋️', '🛏️', '🪑'],
        price: 'Contact for quote',
        badge: 'Best Seller',
        shortDesc: 'For mattresses & furniture',
        description: 'Low-pressure soft foam injection machine.',
        fullDescription: `Soft foam is one of the most popular types of polyurethane foam.

Key Features:
• Working pressure: 3-10 bar
• Production capacity: 50-300 pieces per day
• Automatic casting system
• Material efficiency up to 20% savings
• 30% power consumption reduction`,
        features: [
          'Low pressure (3-10 bar)',
          'Soft foam suitable',
          'Auto casting system',
          'Precise control',
          'Material efficiency'
        ],
        specs: {
          pressure: '3-10 bar',
          capacity: '50-300 pieces/day',
          temp: '20-60°C',
          power: '15-30 kW',
          dimensions: '2500 × 2000 × 2400 mm'
        },
        applications: ['Bed mattresses', 'Furniture cushions', 'Chair cushions', 'Comfort products'],
        hasPrice: false
      },
      {
        id: 'rigid-panel',
        category: 'rigid',
        name: 'Rigid Foam Panel Machine',
        images: ['🏭', '🏗️', '❄️'],
        price: 'Contact for quote',
        badge: 'New',
        shortDesc: 'For sandwich panels',
        description: 'Rigid foam injection equipment.',
        fullDescription: `Rigid foam for industrial applications.

Key Features:
• Exceptional thermal insulation
• High acoustic insulation
• Dual injection system`,
        features: [
          'Thermal insulation',
          'Acoustic insulation',
          'Dual injection',
          'Density control',
          'Multi-size compatible'
        ],
        specs: {
          pressure: '2-12 bar',
          capacity: '500-2000 m²/day',
          temp: '22-65°C',
          power: '10-25 kW',
          dimensions: '2800 × 2200 × 2600 mm'
        },
        applications: ['Industrial panels', 'Refrigerator', 'Security doors', 'Office partitions'],
        hasPrice: false
      },
      {
        id: 'hp-integral',
        category: 'hp',
        name: 'Integral Foam Machine',
        images: ['⚙️', '🔧', '🏭'],
        price: 'Contact for quote',
        badge: 'Premium',
        shortDesc: 'For automotive parts',
        description: 'Advanced injection system for integral foam.',
        fullDescription: `Integral foam for premium applications.

Key Features:
• Dual injection systems
• Precise control
• Smart PLC system`,
        features: [
          'Dual injection',
          'Precise control',
          'Smart PLC',
          'Custom molds',
          'Premium parts'
        ],
        specs: {
          pressure: '180-220 bar',
          capacity: '200-800 pieces/day',
          temp: '15-75°C',
          power: '40-65 kW',
          dimensions: '3500 × 2800 × 3000 mm'
        },
        applications: ['Automotive parts', 'Luxury furniture', 'Industrial equipment'],
        hasPrice: false
      },
      {
        id: 'hp-standard',
        category: 'hp',
        name: 'High-Pressure Machine',
        images: ['🏭', '🔩', '⚡'],
        price: '1,200,000 USD',
        badge: 'Best Seller',
        shortDesc: 'For mass production',
        description: 'High-pressure foam injection machine.',
        fullDescription: `High-pressure machines for mass production.

Key Features:
• Pressure up to 200 bar
• High capacity
• PLC control system`,
        features: [
          'Pressure 200 bar',
          'High capacity',
          'PLC control',
          '24/7 production',
          'Stable quality'
        ],
        specs: {
          pressure: '150-200 bar',
          capacity: '1000-2000 pieces/day',
          temp: '20-80°C',
          power: '30-50 kW',
          dimensions: '3000 × 2500 × 2800 mm'
        },
        applications: ['Automotive parts', 'Seat cushions', 'Integral foam'],
        hasPrice: true
      },
      {
        id: 'filter-line',
        category: 'hp',
        name: 'Foam Air Filter Line',
        images: ['💨', '🔧', '🏭'],
        price: 'Contact for quote',
        shortDesc: 'For automotive industries',
        description: 'Automated foam air filter production line.',
        fullDescription: `Completely automated foam air filter production line.

Foam filter advantages:
• Long lifespan
• High filtration efficiency
• Easy diameter change
• Competitive cost
• Lightweight`,
        features: [
          'Automated line',
          'High quality',
          'High capacity',
          'Adaptable',
          'Material savings'
        ],
        specs: {
          pressure: '6-12 bar',
          capacity: '500-2000 filters/day',
          temp: '20-70°C',
          power: '25-45 kW',
          dimensions: '4000 × 3000 × 2800 mm'
        },
        applications: ['Boiler filters', 'Compressor filters', 'Industrial filters'],
        hasPrice: false
      }
    ],
    features: {
      title: 'Key Features of All Products',
      items: [
        { icon: Shield, title: 'Global Standards', desc: 'ISO 9001:2015 & CE Europe' },
        { icon: Zap, title: 'Energy Efficient', desc: '20-30% consumption reduction' },
        { icon: Award, title: 'Premium Quality', desc: '0% defects & 24-month warranty' },
        { icon: Users, title: 'Expert Team', desc: 'Training & support 24/7' }
      ]
    },
    comments: {
      noComments: 'No comments yet',
      addComment: 'Add a comment',
      rating: 'Rating',
      yourName: 'Your name',
      yourEmail: 'Your email',
      yourComment: 'Your comment',
      submit: 'Submit',
      replies: 'Replies',
      reply: 'Reply',
      admin: 'Admin',
      delete: 'Delete'
    },
    cta: {
      title: 'Found the right product?',
      subtitle: 'Our team is ready to help and consult',
      button: 'Request a consultation'
    }
  }
} as const satisfies LocaleRecord<ProductsNamespaceSchema>;

export type ProductsMessages = (typeof productsMessages)[Locale];
