'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Phone, Mail, MapPin, X,
  Factory, Zap, Gauge, Wrench, Shield, Award, TrendingUp,
  ChevronDown, Filter, Search, ExternalLink, Download, Check,
  Sparkles, Users, Target, Eye, Heart, Leaf, ChevronLeft, ChevronRight,
  Star, Send, Reply, MessageCircle, Trash2
} from 'lucide-react';
import Header from '@/app/components/Header';
import type { Locale } from '@/app/lib/i18n';

export default function ProductsPage() {
  // State Management
  const [lang, setLang] = useState<Locale>('fa');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState<Record<string, any>>({});
  const [newComment, setNewComment] = useState({ rating: 5, text: '', author: '', email: '' });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceProduct, setPriceProduct] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('foam-sanat-lang');
    if (stored) setLang(JSON.parse(stored));
    const storedTheme = localStorage.getItem('foam-sanat-theme');
    if (storedTheme) setTheme(JSON.parse(storedTheme));
    
    const savedComments = localStorage.getItem('product-comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error('Failed to load comments:', e);
      }
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      // Focus modal for accessibility
      setTimeout(() => modalRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  // Scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when modal is scrolling
  const handleModalScroll = useCallback((e: React.WheelEvent) => {
    if (modalRef.current) {
      const isScrollable = modalRef.current.scrollHeight > modalRef.current.clientHeight;
      if (isScrollable) {
        e.stopPropagation();
      }
    }
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedProduct]);

  // Save comments
  const saveComments = useCallback((updatedComments: Record<string, any>) => {
    setComments(updatedComments);
    localStorage.setItem('product-comments', JSON.stringify(updatedComments));
  }, []);

  // Toggle language
  const toggleLang = useCallback(() => {
    const newLang = lang === 'fa' ? 'en' : 'fa';
    setLang(newLang);
    localStorage.setItem('foam-sanat-lang', JSON.stringify(newLang));
  }, [lang]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('foam-sanat-theme', JSON.stringify(newTheme));
  }, [theme]);

  // Add comment handler
  const handleAddComment = useCallback((productId: string) => {
    if (!newComment.text.trim() || !newComment.author.trim()) return;
    
    const updated: Record<string, any> = { ...comments };
    if (!updated[productId]) updated[productId] = [];
    
    updated[productId].push({
      id: Date.now(),
      rating: newComment.rating,
      author: newComment.author,
      email: newComment.email,
      text: newComment.text,
      date: new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US'),
      replies: []
    });
    
    saveComments(updated);
    setNewComment({ rating: 5, text: '', author: '', email: '' });
  }, [newComment, comments, saveComments, lang]);

  // Delete comment handler
  const handleDeleteComment = useCallback((productId: string, commentId: number) => {
    const updated: Record<string, any> = { ...comments };
    if (updated[productId]) {
      updated[productId] = updated[productId].filter((c: any) => c.id !== commentId);
      saveComments(updated);
    }
  }, [comments, saveComments]);

  // Reply handler
  const handleReply = useCallback((productId: string, commentId: number, replyTxt: string) => {
    if (!replyTxt.trim()) return;
    
    const updated: Record<string, any> = { ...comments };
    const comment = updated[productId]?.find((c: any) => c.id === commentId);
    if (comment) {
      if (!comment.replies) comment.replies = [];
      comment.replies.push({
        id: Date.now(),
        author: lang === 'fa' ? 'مدیر سایت' : 'Site Admin',
        text: replyTxt,
        date: new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US'),
        isAdmin: true
      });
      saveComments(updated);
    }
  }, [comments, saveComments, lang]);

  // Styles
  const isRTL = lang === 'fa';
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Content
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
          name: 'Air Filter Line',
          images: ['💨', '🔧', '🏭'],
          price: 'Contact for quote',
          shortDesc: 'For automotive',
          description: 'Automatic foam filter production line.',
          fullDescription: `Foam filter production system.

Key Features:
• Automatic production line
• Quality control
• High capacity`,
          features: [
            'Automatic line',
            'High quality',
            'High capacity',
            'Adjustable',
            'Efficiency'
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
          { icon: Shield, title: 'Global Standards', desc: 'ISO 9001:2015 & CE' },
          { icon: Zap, title: 'Energy Efficient', desc: '20-30% reduction' },
          { icon: Award, title: 'Superior Quality', desc: '0% defect & warranty' },
          { icon: Users, title: 'Expert Team', desc: 'Training & support' }
        ]
      },
      comments: {
        noComments: 'No comments',
        addComment: 'Add Comment',
        rating: 'Rating',
        yourName: 'Your Name',
        yourEmail: 'Your Email',
        yourComment: 'Your Review',
        submit: 'Submit',
        replies: 'Replies',
        reply: 'Reply',
        admin: 'Site Admin',
        delete: 'Delete'
      },
      cta: {
        title: 'Found your ideal product?',
        subtitle: 'Our team is ready',
        button: 'Request Consultation'
      }
    }
  };

  const t = content[lang as keyof typeof content];
  const headerNavItems = useMemo(
    () =>
      Object.entries(t.nav).map(([key, label]) => ({
        key,
        label,
        href: key === 'home' ? '/' : `/${key}`
      })),
    [t.nav]
  );
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);
  const products = t.products;

  // Filtered products
  const filteredProducts = useMemo(() => {
    return selectedCategory === 'all' 
      ? products 
      : products.filter((p: any) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const searchedProducts = useMemo(() => {
    return searchTerm === '' 
      ? filteredProducts 
      : filteredProducts.filter((p: any) => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.applications.some((app: string) => app.toLowerCase().includes(searchTerm.toLowerCase()))
        );
  }, [filteredProducts, searchTerm]);

  // Modal Components
  const PriceModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
    if (!product) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className={`${cardBg} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black">{product.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {product.hasPrice ? (
            <div className="mb-6">
              <p className="text-sm font-bold text-orange-500 mb-2">
                {isRTL ? 'قیمت فعلی' : 'Current Price'}
              </p>
              <p className="text-4xl font-black text-orange-600 mb-2">{product.price}</p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'قیمت شامل نصب و راه‌اندازی' : 'Includes installation'}
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-xl">
              <p className="text-lg font-bold mb-3">
                {isRTL ? 'قیمت متغیر' : 'Variable Price'}
              </p>
              <p className="text-sm">
                {isRTL 
                  ? 'برای دریافت قیمت دقیق لطفا با تیم تماس بگیرید'
                  : 'Please contact for exact pricing'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="tel:+989128336085"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5" />
              {isRTL ? 'تماس' : 'Call'}
            </a>
            <a
              href="mailto:info@foamsanat.com"
              className={`flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all`}
            >
              <Mail className="w-5 h-5" />
              {isRTL ? 'ایمیل' : 'Email'}
            </a>
          </div>
        </div>
      </div>
    );
  };

  const ProductDetailModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
    if (!product) return null;

    const productComments: any[] = comments[product.id] || [];

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`${cardBg} rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl my-8`}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleModalScroll}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="float-right text-gray-500 hover:text-gray-700 p-2 mb-4"
            aria-label={isRTL ? 'بستن' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Slider */}
          <div className="clear-both mb-8">
            <div className="relative mb-4 group">
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-purple-600 rounded-2xl flex items-center justify-center text-6xl md:text-8xl overflow-hidden w-full">
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
                          i === currentSlide ? 'bg-orange-500 w-8' : 'bg-gray-400'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-4xl font-black mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {product.name}
                </h2>
                <p className="text-lg text-orange-500 font-bold">{product.shortDesc}</p>
              </div>
              {product.badge && (
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className="text-sm font-bold text-orange-600 mb-2">{isRTL ? 'قیمت' : 'Price'}</p>
              <p className="text-2xl md:text-3xl font-black text-orange-600">{product.price}</p>
              {!product.hasPrice && (
                <button
                  onClick={() => {
                    setPriceProduct(product);
                    setShowPriceModal(true);
                  }}
                  className="text-sm text-orange-600 font-bold hover:underline mt-2"
                >
                  {isRTL ? 'کلیک برای اطلاع' : 'Click for info'}
                </button>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'توضیحات' : 'Description'}
              </h3>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} whitespace-pre-wrap leading-relaxed text-sm md:text-base`}>
                {product.fullDescription}
              </div>
            </div>

            {/* Specs */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'مشخصات' : 'Specifications'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]: [string, any]) => (
                  <div key={key} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-bold text-orange-600 mb-1 capitalize">{key}</p>
                    <p className="font-bold">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
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

            {/* CTA */}
            <div className="flex gap-4 mb-8 flex-col sm:flex-row">
              <a
                href="tel:+989128336085"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                <Phone className="w-6 h-6" />
                {isRTL ? 'تماس' : 'Call'}
              </a>
              <a
                href="mailto:info@foamsanat.com"
                className={`flex-1 flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all`}
              >
                <Mail className="w-6 h-6" />
                {isRTL ? 'ایمیل' : 'Email'}
              </a>
            </div>
          </div>

          {/* Comments Section */}
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-8`}>
            <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
              <MessageCircle className="w-6 h-6" />
              {isRTL ? 'نظرات' : 'Reviews'} ({productComments.length})
            </h3>

            {/* Add Comment Form */}
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment(product.id);
              }}
              className={`${isDark ? 'bg-gray-700' : 'bg-orange-50'} p-6 rounded-2xl mb-8`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
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
                placeholder={isRTL ? 'نام' : 'Name'}
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              
              <input
                type="email"
                placeholder={isRTL ? 'ایمیل' : 'Email'}
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />

              <textarea
                placeholder={isRTL ? 'نظر شما' : 'Your review'}
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none`}
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isRTL ? 'ارسال' : 'Submit'}
              </button>
            </form>

            {/* Comments List */}
            {productComments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isRTL ? 'نظری نیست' : 'No reviews'}
              </p>
            ) : (
              <div className="space-y-6">
                {productComments.map((comment: any) => (
                  <div key={comment.id} className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-lg">{comment.author}</p>
                        <p className="text-xs text-gray-500">{comment.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(product.id, comment.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </button>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_: number, i: number) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>

                    <p className="mb-4">{comment.text}</p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-300">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className={`pl-4 py-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            <p className="font-bold text-sm text-orange-600">{reply.author}</p>
                            <p className="text-xs text-gray-500 mb-1">{reply.date}</p>
                            <p className="text-sm">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo !== comment.id ? (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-sm text-orange-500 font-bold hover:underline mt-3 flex items-center gap-1"
                      >
                        <Reply className="w-4 h-4" />
                        {isRTL ? 'پاسخ' : 'Reply'}
                      </button>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <textarea
                          placeholder={isRTL ? 'پاسخ' : 'Reply'}
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
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
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
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
    >
      <Header
        lang={lang}
        theme={theme}
        companyName={t.companyName}
        navItems={headerNavItems}
        activeNavKey="products"
        logoHref="/"
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        onLangToggle={toggleLang}
        onThemeToggle={toggleTheme}
        onMobileMenuToggle={toggleMobileMenu}
      />

      <main className="pt-32">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className={`absolute inset-0 opacity-50 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'}`} />
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-2xl">
                <Sparkles className="w-5 h-5" />
                {t.hero.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-4 text-orange-500 font-bold">{t.hero.subtitle}</p>
              <p className={`text-base md:text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group hover:scale-110 transition-transform flex-shrink-0">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold mb-1 text-sm md:text-base">{feature.title}</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4">
              <div className={`relative ${cardBg} rounded-xl shadow-lg overflow-hidden border-2 border-orange-500/30 focus-within:border-orange-500`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={isRTL ? 'جستجو...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none ${textColor} text-sm md:text-base`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {t.categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-xs md:text-sm whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg scale-105'
                          : `${cardBg} ${hoverBg} border border-orange-500/20`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 text-sm font-bold">
              {isRTL ? `${searchedProducts.length} محصول` : `${searchedProducts.length} products`}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {searchedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${cardBg} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group border border-orange-500/20 cursor-pointer flex flex-col`}
                >
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-5xl sm:text-7xl group-hover:scale-110 transition-transform overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.images[0]}
                    </div>
                  </div>

                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg z-10">
                      {product.badge}
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl font-black mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-orange-500 font-bold mb-2">{product.shortDesc}</p>
                    
                    <p className="text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4 space-y-1 text-xs">
                      {product.features.slice(0, 2).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="text-center mb-4 p-3 rounded-lg border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-purple-600/5">
                      <p className="text-xs font-bold text-orange-600 mb-0.5">{isRTL ? 'قیمت' : 'Price'}</p>
                      <p className="text-sm md:text-base font-black text-orange-600 line-clamp-1">{product.price}</p>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setCurrentSlide(0);
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-2 rounded-lg font-bold hover:scale-105 transition-all text-xs md:text-sm"
                      >
                        {isRTL ? 'جزئیات' : 'Details'}
                      </button>
                      <a
                        href="tel:+989128336085"
                        className="w-full text-center border-2 border-orange-500 text-orange-500 px-3 py-2 rounded-lg font-bold hover:scale-105 transition-all text-xs md:text-sm bg-transparent"
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

        {/* Why Us */}
        <section className={`py-16 px-4 ${sectionBg}`}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                {isRTL ? 'چرا ما؟' : 'Why Us?'}
              </h2>
              <p className="text-lg text-orange-500 font-bold">
                {isRTL ? 'بهترین انتخاب برای کسب‌وکار شما' : 'Best choice for your business'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: isRTL ? 'کیفیت' : 'Quality', desc: isRTL ? 'استانداردهای جهانی' : 'Global standards' },
                { icon: Zap, title: isRTL ? 'انرژی' : 'Energy', desc: isRTL ? '۲۰-۳۰٪ کمتر' : '20-30% less' },
                { icon: Users, title: isRTL ? 'پشتیبانی' : 'Support', desc: isRTL ? '۲۴/۷' : '24/7' },
                { icon: Target, title: isRTL ? 'دقت' : 'Precision', desc: isRTL ? '۱۰۰٪ تست' : '100% tested' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`${cardBg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-orange-500/20`}>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className={`container mx-auto max-w-4xl ${cardBg} rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden border-2 border-orange-500/30`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                {t.cta.title}
              </h2>
              <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+989128336085"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base"
                >
                  <Phone className="w-5 h-5" />
                  {isRTL ? 'تماس' : 'Call'}
                </a>
                <a
                  href="mailto:info@foamsanat.com"
                  className={`inline-flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base`}
                >
                  <Mail className="w-5 h-5" />
                  {isRTL ? 'ایمیل' : 'Email'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className={`py-16 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <Phone className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'تماس' : 'Phone'}</h3>
                <a href="tel:+989128336085" className="text-orange-500 hover:text-orange-600 font-bold text-sm md:text-base">
                  +98 912 833 6085
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <Mail className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'ایمیل' : 'Email'}</h3>
                <a href="mailto:info@foamsanat.com" className="text-orange-500 hover:text-orange-600 font-bold text-sm md:text-base break-all">
                  info@foamsanat.com
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <MapPin className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'آدرس' : 'Address'}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isRTL ? 'تهران، ایران' : 'Tehran, Iran'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-6 mb-8">
            <a href="tel:+989128336085" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Phone className="w-6 h-6" />
            </a>
            <a href="mailto:info@foamsanat.com" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Mail className="w-6 h-6" />
            </a>
            <a href="#" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <MapPin className="w-6 h-6" />
            </a>
          </div>
          <p className="text-base font-bold text-white mb-1 text-center">
            {t.companyName}
          </p>
          <p className="text-xs text-center">© 2024 - {isRTL ? 'تمامی حقوق محفوظ' : 'All rights reserved'}</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => {
            setSelectedProduct(null);
            setCurrentSlide(0);
          }}
        />
      )}

      {showPriceModal && (
        <PriceModal 
          product={priceProduct} 
          onClose={() => setShowPriceModal(false)}
        />
      )}
    </div>
  );
}