'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Globe, Sun, Moon, Menu, X, ArrowRight, Phone, Mail, MapPin,
  Factory, Zap, Gauge, Wrench, Shield, Award, TrendingUp,
  ChevronDown, Filter, Search, ExternalLink, Download, Check,
  Sparkles, Users, Target, Eye, Heart, Leaf, ChevronLeft, ChevronRight,
  Star, Send, Reply, MessageCircle
} from 'lucide-react';
import React from 'react';
import assert from 'assert';


export default function ProductsPage() {
  const [lang, setLang] = useState('fa');
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Record<string, any>>({});
  const [newComment, setNewComment] = useState({ rating: 5, text: '', author: '', email: '' });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceProduct, setPriceProduct] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('foam-sanat-lang');
    if (stored) setLang(JSON.parse(stored));
    const storedTheme = localStorage.getItem('foam-sanat-theme');
    if (storedTheme) setTheme(JSON.parse(storedTheme));
    
    // بارگذاری نظرات از localStorage
    const savedComments = localStorage.getItem('product-comments');
    if (savedComments) setComments(JSON.parse(savedComments));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveComments = (updatedComments: Record<string, any>) => {
    setComments(updatedComments);
    localStorage.setItem('product-comments', JSON.stringify(updatedComments));
  };

  const toggleLang = () => {
    const newLang = lang === 'fa' ? 'en' : 'fa';
    setLang(newLang);
    localStorage.setItem('foam-sanat-lang', JSON.stringify(newLang));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('foam-sanat-theme', JSON.stringify(newTheme));
  };

  const isRTL = lang === 'fa';
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const headerBg = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const content = {
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
        { id: 'all', name: 'همه محصولات', icon: Factory },
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
          description: 'ماشین تزریق فوم نرم با فشار کم برای تولید مبلمان، تشک، کوسن و محصولات راحتی. سیستم ریختگری با دقت بالا و کنترل سهل.',
          fullDescription: `فوم نرم (Soft Foam) یکی از محبوب‌ترین انواع فوم‌های پلی‌اورتان است که به‌طور گسترده‌ای در صنایع تولید مبلمان، تشک‌های خواب و کوسن‌ها استفاده می‌شود. این نوع فوم با ویژگی‌های عایق صوتی و حرارتی خوب، سبکی و انعطاف‌پذیری بالا، محصولات راحتی و متن‌ی را برای مصرف‌کنندگان فراهم می‌کند.

ماشین تزریق فوم نرم (لوپرشر) ماشینسازی سامکو و فوم صنعت بر اساس تکنولوژی لوپرشر (کم‌فشار) طراحی و ساخته شده است. این دستگاه‌ها از سیستم‌های کنترل PLC هوشمند و سنسورهای دما و رطوبت پیشرفته برخوردار هستند و امکان تولید فوم‌های نرم با دانسیته و کیفیت‌های مختلف را فراهم می‌کنند.

ویژگی‌های برجسته:
• فشار کار: 3-10 بار
• ظرفیت تولید: 50-300 قطعه در روز
• سیستم اتوماتیک ریختگری و کنترل دما
• مناسب برای تمام انواع فوم‌های نرم
• صرفه‌جویی در مصرف مواد خام تا 20%
• کاهش مصرف برق 30% نسبت به دستگاه‌های قدیمی`,
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
          name: 'ماشین تزریق فوم ریجید پانلی',
          images: ['🏭', '🏗️', '❄️'],
          price: 'نیاز به مشاوره',
          badge: 'جدید',
          shortDesc: 'برای ساندویچ پانل و یخچال',
          description: 'دستگاه تزریق فوم ریجید برای ساندویچ پانل صنعتی، یخچال و درب ضد سرقت. کیفیت عایق بندی حرارتی و صوتی عالی.',
          fullDescription: `فوم ریجید (Rigid Foam) یکی از مهم‌ترین انواع فوم‌های پلی‌اورتان است که به‌دلیل خصوصیات عایق‌کاری فوق‌العاده‌ی حرارتی و صوتی، کاربردهای گسترده‌ای در صنایع ساختمانی، یخچالی و تولید پانل‌های صنعتی دارد.

فوم ریجید یخچالی و ساندویچ پانل بر خلاف فوم‌های نرم، به‌دلیل سختی و جامدیت خود، قابلیت تحمل فشارهای بیشتری را دارا است و برای کاربردهایی که نیاز به عایق‌کاری حرارتی بالا (مانند یخچال‌های صنعتی و خانگی) یا صوتی (مانند درب‌های پارتیشن) وجود دارد، بسیار مناسب است.

ماشین تزریق فوم ریجید ماشینسازی سامکو و فوم صنعت برای تولید انواع ساندویچ پانل‌های صنعتی، پانل‌های یخچالی، درب‌های ضد سرقت و پارتیشن‌های اداری طراحی شده است. این دستگاه‌ها قابلیت تزریق فوم‌های ریجید با دانسیته‌های مختلف و گازهای تولید‌کننده‌ی مختلف (مانند R11 و R141b) را دارند.

ویژگی‌های برجسته:
• عایق‌کاری حرارتی و صوتی بسیار بالا
• قابلیت تزریق با گازهای مختلف
• سیستم دو تزریق‌کننده برای تراکم‌های متفاوت
• دقت در کنترل چگالی فوم
• مناسب برای تمام ابعاد پانل‌ها`,
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
          shortDesc: 'برای قطعات خودرو فاخر',
          description: 'سیستم تزریق پیشرفته برای فوم انتگرال (پوسته سخت + هسته نرم). مناسب برای قطعات خودرو و مبلمان سنگین.',
          fullDescription: `فوم انتگرال (Integral Foam یا Reaction Injection Molding - RIM) نوعی فوم پلی‌اورتان است که در یک تزریق واحد، یک پوسته سخت و مقاوم در سطح خارجی و یک هسته نرم و سبک در داخل ایجاد می‌کند. این فناوری به‌ویژه برای تولید قطعاتی که نیاز به استحکام سطحی و سبکی وزن داشتن دارند، بسیار مناسب است.

کاربردهای اصلی فوم انتگرال:
• قطعات داخلی خودرو (فرودادگاه، آرنجی، بالشتک‌های ایمنی)
• مبلمان پریمیوم و لوکس
• اسپورتس و تجهیزات ورزشی
• قطعات صنعتی خاص

ماشین تزریق فوم انتگرال ماشینسازی سامکو و فوم صنعت دارای دو سیستم تزریق مجزا است که به‌صورت هم‌زمان یا متوالی عمل می‌کنند. این دستگاه‌ها قابلیت کنترل دقیق دما، فشار و تایم تزریق را دارند و تولید قطعاتی با کیفیت بسیار بالا را فراهم می‌کنند.

ویژگی‌های برجسته:
• دو سیستم تزریق مجزا (Shell + Core)
• دقت بالا در کنترل فشار و دما
• قالب‌های قابل تبدیل
• سیستم PLC هوشمند
• مناسب برای تولیدات محدود تا ۲۰۰۰ قطعه روزانه`,
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
          shortDesc: 'برای تولید انبوه و صنایع',
          description: 'ماشین تزریق فوم با فشار ۱۵۰+ بار برای تولیدات انبوه‌ای. مناسب برای قطعات خودرو و صنایع مختلف.',
          fullDescription: `ماشین تزریق فوم هایپرشر (High-Pressure Injection Machine) یکی از پرکاربردترین دستگاه‌های تولید فوم در صنایع است. این دستگاه‌ها از فشار بالای 150+ بار استفاده می‌کنند و برای تولیدات انبوه‌ای پیوسته طراحی شده‌اند.

کاربردهای اصلی:
• قطعات خودروسازی (دریافت‌های صندلی، پد ایمنی، عایق صوتی)
• فوم‌های انتگرال
• قطعات صنعتی دقیق
• محصولات مصرفی بزرگ‌حجم

ماشین تزریق فوم هایپرشر ماشینسازی سامکو و فوم صنعت دارای سیستم‌های کنترل PLC پیشرفته و سنسورهای دما و فشار تاب‌آور است. این دستگاه‌ها قابلیت کار مداوم 24/7 و تولید میلیون‌ها قطعه در طول عمر خود را دارند.

ویژگی‌های برجسته:
• فشار تا 200 بار
• ظرفیت تولید بسیار بالا
• سیستم کنترل دقیق
• عمر طولانی و قابل اعتماد
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
          badge: 'تخصصی',
          shortDesc: 'برای صنایع خودرو',
          description: 'خط خودکار تولید فیلتر هوای فوم برای موتورخانه‌ها و دستگاه‌های صنعتی.',
          fullDescription: `خط تولید فیلتر هوای فوم (Foam Air Filter Production Line) سیستمی کامل و اتوماتیک برای تولید فیلتر‌های هوای فوم است. این فیلتر‌ها در موتورخانه‌ها، کمپرسورها و دستگاه‌های صنعتی مختلف استفاده می‌شوند.

مزایای فیلتر فوم:
• عمر طولانی
• کارایی فیلتراسیون بالا
• تغییر دور آسان
• قیمت مناسب
• وزن سبک

خط تولید فیلتر فوم ماشینسازی سامکو و فوم صنعت از سیستم‌های کنترل اتوماتیک و سنسورهای کیفیت برخوردار است. این خط قابلیت تولید فیلتر‌های مختلف اندازه را دارد.

ویژگی‌های برجسته:
• خط اتوماتیک کامل
• کنترل کیفیت PLC
• ظرفیت تولید بالا
• قابلیت تغییر سایز
• کاهش هدر مواد خام`,
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
        admin: 'مدیر سایت'
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
        badge: '🏭 PU Foam Machinery & Production Lines',
        title: 'Products',
        subtitle: 'World-Class Polyurethane Foam Injection Machines',
        description: 'All products designed with cutting-edge technology and international standards'
      },
      categories: [
        { id: 'all', name: 'All Products', icon: Factory },
        { id: 'hp', name: 'High-Pressure', icon: Zap },
        { id: 'lp', name: 'Low-Pressure', icon: Gauge },
        { id: 'rigid', name: 'Rigid Foam', icon: Shield },
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
          description: 'Low-pressure soft foam injection machine for producing mattresses, furniture, cushions and comfort products.',
          fullDescription: `Soft foam is one of the most popular types of polyurethane foam widely used in furniture, bedding and cushion manufacturing. With excellent acoustic and thermal insulation properties, lightness and high flexibility, soft foam provides comfortable products for consumers.

Low-pressure soft foam injection machines from Samko and Foam Sanat are designed using low-pressure technology. These machines feature advanced PLC control systems and sophisticated temperature and humidity sensors, allowing production of soft foams with various densities and qualities.

Key Features:
• Working pressure: 3-10 bar
• Production capacity: 50-300 pieces per day
• Automatic casting system and temperature control
• Suitable for all types of soft foams
• Material efficiency up to 20% savings
• 30% power consumption reduction compared to older machines`,
          features: [
            'Low pressure (3-10 bar)',
            'Soft foam suitable',
            'Auto casting system',
            'Precise temperature control',
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
          name: 'Rigid Foam Panel Injection Machine',
          images: ['🏭', '🏗️', '❄️'],
          price: 'Contact for quote',
          badge: 'New',
          shortDesc: 'For sandwich panels & refrigeration',
          description: 'Rigid foam injection equipment for sandwich panels, refrigerators and security doors with excellent thermal and acoustic insulation.',
          fullDescription: `Rigid foam is one of the most important types of polyurethane foam widely used in construction, refrigeration and industrial panel manufacturing due to its superior thermal and acoustic insulation properties.

Unlike soft foams, rigid foam offers greater pressure resistance and is ideal for applications requiring high thermal insulation (such as industrial refrigerators) or acoustic properties (such as partition doors).

Rigid foam injection machines from Samko and Foam Sanat are designed for producing industrial sandwich panels, refrigerator panels, security doors and office partitions. These machines can inject rigid foams with different densities and various production gases (such as R11 and R141b).

Key Features:
• Exceptional thermal and acoustic insulation
• Multi-density injection capability
• Dual injection system for varied density
• Precise foam density control
• Suitable for all panel sizes`,
          features: [
            'Excellent thermal insulation',
            'High acoustic insulation',
            'Dual injection stage',
            'Precise density control',
            'Multi-size panel compatible'
          ],
          specs: {
            pressure: '2-12 bar',
            capacity: '500-2000 m²/day',
            temp: '22-65°C',
            power: '10-25 kW',
            dimensions: '2800 × 2200 × 2600 mm'
          },
          applications: ['Industrial sandwich panels', 'Refrigerator & freezer', 'Security doors', 'Office partitions'],
          hasPrice: false
        },
        {
          id: 'hp-integral',
          category: 'hp',
          name: 'Integral Foam Injection Machine',
          images: ['⚙️', '🔧', '🏭'],
          price: 'Contact for quote',
          badge: 'Premium',
          shortDesc: 'For luxury automotive parts',
          description: 'Advanced injection system for integral foam (hard shell + soft core). Perfect for automotive and furniture.',
          fullDescription: `Integral foam (Integral Foam or Reaction Injection Molding - RIM) is a polyurethane foam that in a single injection creates a hard and durable outer shell and a soft, lightweight inner core. This technology is especially suitable for producing parts that require surface strength and lightweight characteristics.

Main applications of integral foam:
• Automotive interior parts (dashboards, armrests, safety pads)
• Premium and luxury furniture
• Sports and athletic equipment
• Special industrial components

Integral foam injection machines from Samko and Foam Sanat feature two separate injection systems that work simultaneously or sequentially. These machines offer precise control of temperature, pressure and injection timing, producing parts of very high quality.

Key Features:
• Dual separate injection systems (Shell + Core)
• High precision pressure and temperature control
• Customizable molds
• Smart PLC system
• Suitable for 200-2000 pieces per day production`,
          features: [
            'Dual injection system',
            'Precise control',
            'Smart PLC system',
            'Custom molds',
            'Premium part production'
          ],
          specs: {
            pressure: '180-220 bar',
            capacity: '200-800 pieces/day',
            temp: '15-75°C',
            power: '40-65 kW',
            dimensions: '3500 × 2800 × 3000 mm'
          },
          applications: ['Premium automotive parts', 'Luxury furniture', 'Industrial equipment'],
          hasPrice: false
        },
        {
          id: 'hp-standard',
          category: 'hp',
          name: 'High-Pressure Foam Injection Machine',
          images: ['🏭', '🔩', '⚡'],
          price: '1,200,000 USD',
          badge: 'Best Seller',
          shortDesc: 'For mass production',
          description: 'High-pressure foam injection machine at 150+ bar for continuous mass production. Perfect for automotive parts.',
          fullDescription: `High-pressure foam injection machines are among the most widely used foam production equipment in various industries. These machines use pressure above 150 bar and are designed for continuous high-volume production.

Main applications:
• Automotive parts (seat inserts, safety pads, acoustic insulation)
• Integral foams
• Precise industrial components
• Large-scale consumer products

High-pressure foam injection machines from Samko and Foam Sanat feature advanced PLC control systems and robust temperature and pressure sensors. These machines have the capability for 24/7 continuous operation and can produce millions of parts during their lifetime.

Key Features:
• Pressure up to 200 bar
• Very high production capacity
• Precise control system
• Long lifespan and reliability
• Minimal material waste`,
          features: [
            'Pressure up to 200 bar',
            'High capacity',
            'PLC control system',
            '24/7 operation',
            'Consistent quality'
          ],
          specs: {
            pressure: '150-200 bar',
            capacity: '1000-2000 pieces/day',
            temp: '20-80°C',
            power: '30-50 kW',
            dimensions: '3000 × 2500 × 2800 mm'
          },
          applications: ['Automotive parts', 'Seat cushions', 'Integral foams'],
          hasPrice: true
        },
        {
          id: 'filter-line',
          category: 'hp',
          name: 'Foam Air Filter Production Line',
          images: ['💨', '🔧', '🏭'],
          price: 'Contact for quote',
          badge: 'Specialized',
          shortDesc: 'For automotive industries',
          description: 'Automatic foam air filter production line for engine compartments and industrial equipment.',
          fullDescription: `Foam air filter production line is a complete and automatic system for producing foam air filters. These filters are used in engine compartments, compressors and various industrial equipment.

Advantages of foam filters:
• Long lifespan
• High filtration efficiency
• Easy replacement
• Affordable price
• Lightweight

Foam filter production line from Samko and Foam Sanat features automatic control systems and quality sensors. This production line can produce filters of various sizes.

Key Features:
• Fully automatic production line
• PLC quality control
• High production capacity
• Size adjustable
• Material waste reduction`,
          features: [
            'Automatic line',
            'High quality',
            'High capacity',
            'Adjustable sizes',
            'Material efficiency'
          ],
          specs: {
            pressure: '6-12 bar',
            capacity: '500-2000 filters/day',
            temp: '20-70°C',
            power: '25-45 kW',
            dimensions: '4000 × 3000 × 2800 mm'
          },
          applications: ['Engine filters', 'Compressor filters', 'Industrial filters'],
          hasPrice: false
        }
      ],
      features: {
        title: 'All Products Features',
        items: [
          { icon: Shield, title: 'Global Standards', desc: 'ISO 9001:2015 & CE certified' },
          { icon: Zap, title: 'Energy Efficient', desc: '20-30% power reduction' },
          { icon: Award, title: 'Superior Quality', desc: '0% defect & 24-month warranty' },
          { icon: Users, title: 'Expert Team', desc: 'Training & 24/7 support' }
        ]
      },
      comments: {
        noComments: 'No comments yet',
        addComment: 'Add Comment',
        rating: 'Rating',
        yourName: 'Your Name',
        yourEmail: 'Your Email',
        yourComment: 'Your Comment',
        submit: 'Submit Review',
        replies: 'Replies',
        reply: 'Reply',
        admin: 'Site Admin'
      },
      cta: {
        title: 'Found your ideal product?',
        subtitle: 'Our team is ready to help',
        button: 'Request Consultation'
      }
    }
  };

  const t = content[lang as keyof typeof content];

  const products = t.products;

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter((p: any) => p.category === selectedCategory);

  const searchedProducts = searchTerm === '' 
    ? filteredProducts 
    : filteredProducts.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.applications.some((app: string) => app.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  if (!mounted) return null;

  const handleAddComment = (productId: string) => {
    if (!newComment.text.trim() || !newComment.author.trim()) return;
    
    const updated: Record<string, any> = { ...comments };
    if (!updated[productId]) updated[productId] = [];
    
    updated[productId].push({
      id: Date.now(),
      rating: newComment.rating,
      author: newComment.author,
      email: newComment.email,
      text: newComment.text,
      date: new Date().toLocaleDateString(isRTL ? 'fa-IR' : 'en-US'),
      replies: []
    });
    
    saveComments(updated);
    setNewComment({ rating: 5, text: '', author: '', email: '' });
  };

  const handleReply = (productId: string, commentId: number, replyText: string) => {
    const updated: Record<string, any> = { ...comments };
    const comment = updated[productId]?.find((c: any) => c.id === commentId);
    if (comment) {
      comment.replies.push({
        id: Date.now(),
        author: 'مدیر سایت',
        text: replyText,
        date: new Date().toLocaleDateString(isRTL ? 'fa-IR' : 'en-US'),
        isAdmin: true
      });
      saveComments(updated);
    }
  };

  // Modal عرض قیمت
  const PriceModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
    if (!product) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardBg} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black">{product.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {product.hasPrice ? (
            <div className="mb-6">
              <p className={`text-sm font-bold text-orange-500 mb-2`}>
                {isRTL ? 'قیمت فعلی' : 'Current Price'}
              </p>
              <p className="text-4xl font-black text-orange-600 mb-2">{product.price}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isRTL ? 'قیمت شامل نصب و راه‌اندازی است' : 'Price includes installation and setup'}
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-xl">
              <p className={`text-lg font-bold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {isRTL ? 'قیمت متغیر است' : 'Price is variable'}
              </p>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isRTL 
                  ? 'با توجه به تغییرات بازار، هر ماه قیمت‌ها ممکن است تغییر کند. برای دریافت قیمت دقیق و پیشنهاد بهترین قیمت، لطفا با تیم فروش تماس بگیرید.'
                  : 'Due to market fluctuations, prices may change monthly. Please contact our sales team for exact pricing and best offers.'}
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <a
              href="tel:+989128336085"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5" />
              {isRTL ? 'تماس با فروش' : 'Call Sales'}
            </a>
            <a
              href="mailto:info@foamsanat.com"
              className={`flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all`}
            >
              <Mail className="w-5 h-5" />
              {isRTL ? 'پیام برای پیشنهاد' : 'Email for Quote'}
            </a>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {isRTL ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    );
  };
  const initialComments = {};
  const [rating, setRating] = useState(0);
  // Modal جزئیات محصول
    const ProductDetailModal = React.memo(({ product, onClose }: { product: any; onClose: () => void }) => {
    if (!product) return null;

    const productComments: any[] = comments[product.id] || [];
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
      useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

    return (
<div
  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
  onMouseDown={onClose}
>
        

  <div
    ref={modalRef}
    tabIndex={-1}
    className={`${cardBg} rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8`}
    onMouseDown={(e) => e.stopPropagation()}
  >

        
        <div className={`${cardBg} rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8`}>
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Slider */}
          <div className="relative mb-8 group">
            <div className="aspect-video bg-gradient-to-br from-orange-400 to-purple-600 rounded-2xl flex items-center justify-center text-9xl overflow-hidden">
              {product.images[currentSlide]}
            </div>
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {product.images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i === currentSlide ? 'bg-orange-500 w-8' : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
</div>
          {/* Product Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-4xl font-black mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {product.name}
                </h2>
                <p className="text-lg text-orange-500 font-bold">{product.shortDesc}</p>
              </div>
              {product.badge && (
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Price Section */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className="text-sm font-bold text-orange-600 mb-2">{isRTL ? 'قیمت' : 'Price'}</p>
              <p className="text-3xl font-black text-orange-600 mb-2">{product.price}</p>
              {product.hasPrice ? (
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isRTL ? 'شامل نصب و آموزش' : 'Includes installation & training'}
                </p>
              ) : (
                <button
                  onClick={() => {
                    setPriceProduct(product);
                    setShowPriceModal(true);
                  }}
                  className="text-sm text-orange-600 font-bold hover:underline"
                >
                  {isRTL ? 'کلیک کنید برای اطلاعات بیشتر' : 'Click for more info'}
                </button>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'توضیحات کامل' : 'Full Description'}
              </h3>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} whitespace-pre-wrap leading-relaxed text-sm md:text-base`}>
                {String(product.fullDescription)}
              </div>
            </div>

            {/* Specs */}
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'مشخصات فنی' : 'Technical Specifications'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]: [string, any]) => (
                  <div key={key} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-bold text-orange-600 mb-1 capitalize">{key}</p>
                    <p className="font-bold text-lg">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'کاربردها' : 'Applications'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.applications.map((app: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full font-bold text-sm">
                    ✓ {app}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 mb-8 flex-col sm:flex-row">
              <a
                href="tel:+989128336085"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
              >
                <Phone className="w-6 h-6" />
                {isRTL ? 'تماس برای پیشنهاد قیمت' : 'Call for Quote'}
              </a>
              <a
                href="mailto:info@foamsanat.com"
                className={`flex-1 flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg`}
              >
                <Mail className="w-6 h-6" />
                {isRTL ? 'پیام برای مشاوره' : 'Email for Consultation'}
              </a>
            </div>
          </div>
            
          {/* Comments Section */}
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-8`}>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
              <MessageCircle className="w-6 h-6" />
              {isRTL ? 'نظرات کاربران' : 'User Reviews'}
              <span className="text-sm font-normal text-gray-500">({productComments.length})</span>
            </h3>

            {/* Add Comment Form */}
            <div className={`${isDark ? 'bg-gray-700' : 'bg-orange-50'} p-6 rounded-2xl mb-8`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewComment({ ...newComment, rating: star })}
                      className={`text-2xl transition-all ${
                        star <= newComment.rating ? 'text-yellow-400 scale-110' : 'text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="font-bold text-sm">({newComment.rating}/5)</span>
              </div>

              <input
                type="text"
                placeholder={isRTL ? 'نام شما' : 'Your name'}
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              
              <input
                type="email"
                placeholder={isRTL ? 'ایمیل شما' : 'Your email'}
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />

              <textarea
                placeholder={isRTL ? 'نظر شما...' : 'Your review...'}
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none`}
              />

              <button
                onClick={() => handleAddComment(product.id)}
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isRTL ? 'ارسال نظر' : 'Submit Review'}
              </button>
              
            </div>

            {/* Comments List */}
            {productComments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isRTL ? 'هنوز نظری ثبت نشده است' : 'No reviews yet'}
              </p>
            ) : (
              <div className="space-y-6">
                {productComments.map((comment: any) => (
                  <div key={comment.id} className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{String(comment.author)}</p>
                        <p className="text-xs text-gray-500">{String(comment.date)}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_: number, i: number) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mb-4">{String(comment.text)}</p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-300">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className={`pl-4 py-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            <p className="font-bold text-sm text-orange-600">{String(reply.author)}</p>
                            <p className="text-xs text-gray-500 mb-1">{String(reply.date)}</p>
                            <p className="text-sm">{String(reply.text)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Button */}
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-orange-500 font-bold hover:underline mt-3 flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      {isRTL ? 'پاسخ' : 'Reply'}
                    </button>

                    {replyingTo === comment.id && (
                      <div className="mt-4 space-y-2">
                        <textarea
                          placeholder={isRTL ? 'پاسخ شما...' : 'Your reply...'}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleReply(product.id, comment.id, replyText);
                              setReplyText('');
                              setReplyingTo(null);
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-all"
                          >
                            {isRTL ? 'ارسال' : 'Send'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                          >
                            {isRTL ? 'لغو' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>)}
  return (
    <div 
      className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
    >
      {/* Header */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? `${headerBg} backdrop-blur-lg shadow-2xl` : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {t.companyName}
              </span>
            </a>

            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(t.nav).map(([key, value]) => (
                <a 
                  key={key}
                  href={key === 'home' ? '/' : `/${key === 'products' ? 'products' : key}`}
                  className={`hover:text-orange-500 transition-colors font-bold ${
                    key === 'products' ? 'text-orange-500' : ''
                  }`}
                  style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                >
                  {value}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleLang} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${hoverBg}`}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${hoverBg}`}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className={`md:hidden mt-4 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {Object.entries(t.nav).map(([key, value]) => (
                <a key={key} href={key === 'home' ? '/' : `/${key}`} className={`block px-4 py-3 rounded-lg transition-colors ${hoverBg}`} onClick={() => setMobileMenuOpen(false)}>
                  {value}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 overflow-hidden">
          <div className={`absolute inset-0 opacity-50 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'}`} />
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 animate-bounce shadow-2xl">
                <Sparkles className="w-5 h-5" />
                {t.hero.badge}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                <span className="bg-gradient-to-r from-blue-600 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-orange-500 font-bold">{t.hero.subtitle}</p>
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.hero.description}
              </p>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className={`py-12 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {t.features.items.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold mb-1" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>{feature.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className={`flex-1 relative ${cardBg} rounded-xl shadow-lg overflow-hidden border-2 border-orange-500/30 focus-within:border-orange-500`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  placeholder={isRTL ? 'جستجوی محصول، مشخصات یا کاربرد...' : 'Search products, specs or applications...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none ${textColor} text-sm md:text-base`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                {t.categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 md:px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 text-xs md:text-sm whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg scale-105'
                          : `${cardBg} ${hoverBg} border border-orange-500/20`
                      }`}
                      style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Count */}
            <div className={`mb-6 text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isRTL ? `${searchedProducts.length} محصول یافت شد` : `${searchedProducts.length} products found`}
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {searchedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${cardBg} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group border border-orange-500/20 cursor-pointer`}
                >
                  {/* Product Image Slider Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.images[0]}
                    </div>
                    {product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                      {product.badge}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-black mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-orange-500 font-bold mb-3">{product.shortDesc}</p>
                    
                    <p className={`text-sm mb-4 leading-relaxed line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {product.description}
                    </p>

                    {/* Key Features */}
                    <div className="mb-4 space-y-1.5">
                      {product.features.slice(0, 3).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price Section */}
                    <div className={`text-center mb-4 p-3 rounded-lg border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-purple-600/5`}>
                      <p className="text-xs font-bold text-orange-600 mb-1">{isRTL ? 'قیمت' : 'Price'}</p>
                      <p className="text-lg md:text-xl font-black text-orange-600">{product.price}</p>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all text-sm"
                        style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                      >
                        {isRTL ? 'جزئیات' : 'Details'}
                      </button>
                      <a
                        href="tel:+989128336085"
                        className={`w-full ${cardBg} border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all text-sm text-center`}
                        style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                      >
                        {isRTL ? 'تماس' : 'Call'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isRTL ? 'محصولی یافت نشد' : 'No products found'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Our Products */}
        <section className={`py-20 px-4 ${sectionBg}`}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'چرا محصولات ما؟' : 'Why Our Products?'}
              </h2>
              <p className="text-xl text-orange-500 font-bold">
                {isRTL ? 'رهبری صنعت فوم در خاورمیانه' : 'Industry Leader in Middle East'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Shield, title: isRTL ? 'کیفیت تضمین‌شده' : 'Guaranteed Quality', desc: isRTL ? 'تمام دستگاه‌ها ۱۰۰٪ تست شده' : 'All machines 100% tested' },
                { icon: Zap, title: isRTL ? 'صرفه‌جویی انرژی' : 'Energy Efficient', desc: isRTL ? '۲۰-۳۰٪ کمتر' : '20-30% less' },
                { icon: Users, title: isRTL ? 'پشتیبانی ۲۴/۷' : '24/7 Support', desc: isRTL ? 'تیم متخصص' : 'Expert team' },
                { icon: Target, title: isRTL ? 'نصب و راه‌اندازی' : 'Installation', desc: isRTL ? 'خدمات کامل' : 'Complete service' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`${cardBg} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-orange-500/20`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>{item.title}</h3>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className={`container mx-auto max-w-4xl ${cardBg} rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden border-2 border-orange-500/30`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {t.cta.title}
              </h2>
              <p className={`text-xl md:text-2xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+989128336085"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
                  style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                >
                  <Phone className="w-6 h-6" />
                  {isRTL ? 'تماس فوری' : 'Call Now'}
                </a>
                <a
                  href="/"
                  className={`inline-flex items-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl`}
                  style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
                >
                  {t.cta.button}
                  <ArrowRight className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className={`py-20 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className={`${cardBg} rounded-2xl p-8 shadow-xl border border-orange-500/20`}>
                <Phone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {isRTL ? 'تماس تلفنی' : 'Phone'}
                </h3>
                <a href="tel:+989128336085" className="text-orange-500 hover:text-orange-600 font-bold text-lg">
                  +98 912 833 6085
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-8 shadow-xl border border-orange-500/20`}>
                <Mail className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {isRTL ? 'ایمیل' : 'Email'}
                </h3>
                <a href="mailto:info@foamsanat.com" className="text-orange-500 hover:text-orange-600 font-bold">
                  info@foamsanat.com
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-8 shadow-xl border border-orange-500/20`}>
                <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {isRTL ? 'آدرس' : 'Address'}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isRTL ? 'تهران، کرج، جاده ماهدشت' : 'Tehran, Karaj, Iran'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-16 px-4">
        <div className="container mx-auto">
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
          <p className="text-lg font-bold text-white mb-2 text-center" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
            {t.companyName}
          </p>
          <p className="text-sm text-center">© 2024 {isRTL ? 'تمامی حقوق محفوظ است' : 'All rights reserved'}</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showPriceModal && (
        <PriceModal 
          product={priceProduct} 
          onClose={() => setShowPriceModal(false)}
        />
      )}

      {lang === 'fa' && (
        <link href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css" rel="stylesheet" />
      )}
    </div>
  );
}