import type { LocaleRecord } from '../locales';

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
  categories: Array<{ id: string; name: string }>;
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
    items: Array<{ title: string; desc: string }>;
  };
  comments: {
    noComments: string;
    addComment: string;
    rating: string;
    yourName: string;
    yourEmail: string;
    yourComment: string;
    submit: string;
    submitting: string;
    replies: string;
    reply: string;
    admin: string;
    delete: string;
    deleteFailed: string;
    replyPlaceholder: string;
    send: string;
    sendingReply: string;
    cancel: string;
    validationError: string;
    invalidEmail: string;
    tooShort: string;
    submitError: string;
    moderationNotice: string;
    adminControls: string;
    tokenPlaceholder: string;
    saveToken: string;
    clearToken: string;
    adminTokenRequired: string;
    emptyReply: string;
    replyFailed: string;
    loadFailed: string;
    loading: string;
    disabled: string;
    status: {
      pending: string;
      approved: string;
      rejected: string;
    };
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  ui: {
    call: string;
    email: string;
    price: string;
    currentPrice: string;
    priceIncludes: string;
    variablePrice: string;
    variablePriceDescription: string;
    clickForInfo: string;
    searchPlaceholder: string;
    resultsSuffix: string;
    close: string;
    description: string;
    specifications: string;
    applications: string;
    reviews: string;
    details: string;
    noProducts: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
  };
  whyUs: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; desc: string }>;
  };
  footer: {
    rights: string;
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
      { id: 'all', name: 'همه' },
      { id: 'hp', name: 'هایپرشر' },
      { id: 'lp', name: 'لوپرشر' },
      { id: 'rigid', name: 'ریجید' },
      { id: 'custom', name: 'سفارشی' }
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
• قابلیت تزیق با گازهای مختلف
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
        badge: 'جدید',
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
        { title: 'استانداردهای جهانی', desc: 'ISO 9001:2015 و CE اروپا' },
        { title: 'صرفه‌جویی انرژی', desc: '۲۰-۳۰٪ کاهش مصرف' },
        { title: 'کیفیت برتر', desc: '۰٪ نقص و ضمانت۲۴ ماه' },
        { title: 'تیم متخصص', desc: 'آموزش و پشتیبانی ۲۴/۷' }
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
      submitting: 'در حال ارسال...',
      replies: 'پاسخ‌ها',
      reply: 'پاسخ',
      admin: 'مدیر سایت',
      delete: 'حذف',
      deleteFailed: 'حذف نظر انجام نشد.',
      replyPlaceholder: 'پاسخ',
      send: 'ارسال',
      sendingReply: 'در حال ارسال...',
      cancel: 'لغو',
      validationError: 'لطفاً همه فیلدها را تکمیل کنید.',
      invalidEmail: 'آدرس ایمیل معتبر نیست.',
      tooShort: 'متن نظر باید حداقل ۲۰ کاراکتر باشد.',
      submitError: 'ارسال نظر انجام نشد. دوباره تلاش کنید.',
      moderationNotice: 'تمامی نظرات پس از بررسی مدیر منتشر می‌شوند.',
      adminControls: 'مدیریت نظرات (ویژه مدیر)',
      tokenPlaceholder: 'توکن مدیریت را وارد کنید',
      saveToken: 'ثبت توکن',
      clearToken: 'حذف توکن',
      adminTokenRequired: 'برای اعمال تغییرات به توکن مدیریت نیاز است.',
      emptyReply: 'متن پاسخ نمی‌تواند خالی باشد.',
      replyFailed: 'ارسال پاسخ انجام نشد.',
      loadFailed: 'امکان بارگذاری نظرات نبود.',
      loading: 'در حال بارگذاری نظرات...',
      disabled: 'ثبت نظرات در حال حاضر غیرفعال است.',
      status: {
        pending: 'در انتظار تایید',
        approved: 'تایید شده',
        rejected: 'رد شده'
      }
    },
    cta: {
      title: 'محصول مناسب خود را پیدا کردید؟',
      subtitle: 'تیم ما برای کمک و مشاوره آماده است',
      button: 'درخواست مشاوره'
    },
    ui: {
      call: 'تماس',
      email: 'ایمیل',
      price: 'قیمت',
      currentPrice: 'قیمت فعلی',
      priceIncludes: 'قیمت شامل نصب و راه‌اندازی',
      variablePrice: 'قیمت متغیر',
      variablePriceDescription: 'برای دریافت قیمت دقیق لطفا با تیم تماس بگیرید',
      clickForInfo: 'کلیک برای اطلاع',
      searchPlaceholder: 'جستجو...',
      resultsSuffix: 'محصول',
      close: 'بستن',
      description: 'توضیحات',
      specifications: 'مشخصات',
      applications: 'کاربردها',
      reviews: 'نظرات',
      details: 'جزئیات',
      noProducts: 'محصولی یافت نشد',
      phoneLabel: 'تماس',
      emailLabel: 'ایمیل',
      addressLabel: 'آدرس'
    },
    whyUs: {
      title: 'چرا ما؟',
      subtitle: 'بهترین انتخاب برای کسب‌وکار شما',
      items: [
        { title: 'کیفیت', desc: 'استانداردهای جهانی' },
        { title: 'انرژی', desc: '۲۰-۳۰٪ کمتر' },
        { title: 'پشتیبانی', desc: '۲۴/۷' },
        { title: 'دقت', desc: '۱۰۰٪ تست' }
      ]
    },
    footer: {
      rights: 'تمامی حقوق محفوظ'
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
      { id: 'all', name: 'All' },
      { id: 'hp', name: 'High-Pressure' },
      { id: 'lp', name: 'Low-Pressure' },
      { id: 'rigid', name: 'Rigid' },
      { id: 'custom', name: 'Custom' }
    ],
    products: [
      {
        id: 'lp-soft',
        category: 'lp',
        name: 'Soft Foam Injection Machine',
        images: ['🛋️', '🛏️', '🪑'],
        price: 'Contact for pricing',
        badge: 'Best Seller',
        shortDesc: 'For mattresses and furniture',
        description: 'Low pressure foam injection machine for furniture, mattresses and comfort products.',
        fullDescription: `Soft foam is one of the most popular polyurethane foams widely used in furniture, bedding and cushions.

Our low-pressure injection machine is designed for efficient soft foam production.

Highlights:
• Working pressure: 3-10 bar
• Output: 50-300 pieces/day
• Automatic casting system
• Saves up to 20% raw materials
• 30% lower power consumption`,
        features: [
          'Low pressure (3-10 bar)',
          'Ideal for soft foams',
          'Automatic casting system',
          'Precise temperature control',
          'Material saving'
        ],
        specs: {
          pressure: '3-10 bar',
          capacity: '50-300 pcs/day',
          temp: '20-60 °C',
          power: '15-30 kW',
          dimensions: '2500 × 2000 × 2400 mm'
        },
        applications: ['Mattresses', 'Furniture cushions', 'Seat cushions', 'Comfort products'],
        hasPrice: false
      },
      {
        id: 'rigid-panel',
        category: 'rigid',
        name: 'Rigid Foam Injection Machine',
        images: ['🏭', '🏗️', '❄️'],
        price: 'Contact for pricing',
        badge: 'New',
        shortDesc: 'For sandwich panels',
        description: 'Rigid foam injection system for industrial panels, refrigerators and security doors.',
        fullDescription: `Rigid foam provides outstanding thermal and acoustic insulation with broad industrial applications.

Highlights:
• Superior thermal & acoustic insulation
• Compatible with various blowing agents
• Dual injection system
• Precise density control`,
        features: [
          'Outstanding thermal insulation',
          'High acoustic insulation',
          'Dual-stage injection',
          'Precise density control',
          'Supports multiple panel types'
        ],
        specs: {
          pressure: '2-12 bar',
          capacity: '500-2000 m²/day',
          temp: '22-65 °C',
          power: '10-25 kW',
          dimensions: '2800 × 2200 × 2600 mm'
        },
        applications: ['Industrial sandwich panels', 'Refrigeration', 'Security doors', 'Office partitions'],
        hasPrice: false
      },
      {
        id: 'hp-integral',
        category: 'hp',
        name: 'Integral Foam Injection Machine',
        images: ['⚙️', '🔧', '🏭'],
        price: 'Contact for pricing',
        badge: 'Premium',
        shortDesc: 'For automotive parts',
        description: 'Advanced integral foam system ideal for automotive and premium furniture.',
        fullDescription: `Integral foam creates a rigid skin with a soft core in one shot.

Ideal applications:
• Automotive interior parts
• Premium furniture
• Sports equipment
• Specialized industrial parts`,
        features: [
          'Dual injection system',
          'Precise temperature & pressure control',
          'Smart PLC control',
          'Custom tooling',
          'Premium part production'
        ],
        specs: {
          pressure: '180-220 bar',
          capacity: '200-800 pcs/day',
          temp: '15-75 °C',
          power: '40-65 kW',
          dimensions: '3500 × 2800 × 3000 mm'
        },
        applications: ['Automotive parts', 'Premium furniture', 'Industrial equipment'],
        hasPrice: false
      },
      {
        id: 'hp-standard',
        category: 'hp',
        name: 'High-Pressure Foam Machine',
        images: ['🏭', '🔩', '⚡'],
        price: '$75,000',
        badge: 'Best Seller',
        shortDesc: 'For mass production',
        description: '150+ bar high-pressure system for high volume manufacturing.',
        fullDescription: `High-pressure foam machines are the industry standard for volume production.

Highlights:
• Pressure up to 200 bar
• Very high output capacity
• Advanced PLC control
• 24/7 production ready
• Minimal material waste`,
        features: [
          'Pressure up to 200 bar',
          'High throughput',
          'PLC control system',
          '24/7 production',
          'Consistent quality'
        ],
        specs: {
          pressure: '150-200 bar',
          capacity: '1000-2000 pcs/day',
          temp: '20-80 °C',
          power: '30-50 kW',
          dimensions: '3000 × 2500 × 2800 mm'
        },
        applications: ['Automotive parts', 'Seat cushions', 'Integral foams'],
        hasPrice: true
      },
      {
        id: 'filter-line',
        category: 'hp',
        name: 'Foam Air Filter Line',
        images: ['💨', '🔧', '🏭'],
        price: 'Contact for pricing',
        badge: 'New',
        shortDesc: 'For automotive industry',
        description: 'Automated foam air filter line for industrial and HVAC applications.',
        fullDescription: `Complete and automated foam air filter production line.

Foam filter benefits:
• Long service life
• High filtration efficiency
• Easy to adjust
• Competitive cost
• Lightweight`,
        features: [
          'Automated line',
          'High quality',
          'High capacity',
          'Adaptable setup',
          'Material savings'
        ],
        specs: {
          pressure: '6-12 bar',
          capacity: '500-2000 filters/day',
          temp: '20-70 °C',
          power: '25-45 kW',
          dimensions: '4000 × 3000 × 2800 mm'
        },
        applications: ['HVAC filters', 'Compressor filters', 'Industrial filters'],
        hasPrice: false
      }
    ],
    features: {
      title: 'All Products Features',
      items: [
        { title: 'Global Standards', desc: 'ISO 9001:2015 & CE' },
        { title: 'Energy Efficient', desc: '20-30% reduction' },
        { title: 'Superior Quality', desc: '0% defect & warranty' },
        { title: 'Expert Team', desc: 'Training & support' }
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
      submitting: 'Submitting...',
      replies: 'Replies',
      reply: 'Reply',
      admin: 'Site Admin',
      delete: 'Delete',
      deleteFailed: 'Unable to delete the comment.',
      replyPlaceholder: 'Reply',
      send: 'Send',
      sendingReply: 'Sending...',
      cancel: 'Cancel',
      validationError: 'Please complete all fields before submitting.',
      invalidEmail: 'Please provide a valid email address.',
      tooShort: 'Comments must be at least 20 characters long.',
      submitError: 'Unable to submit your comment. Please try again.',
      moderationNotice: 'All comments are published after moderator review.',
      adminControls: 'Moderation controls (admin only)',
      tokenPlaceholder: 'Enter moderation token',
      saveToken: 'Save token',
      clearToken: 'Clear token',
      adminTokenRequired: 'A moderation token is required for this action.',
      emptyReply: 'Reply text cannot be empty.',
      replyFailed: 'Unable to send your reply.',
      loadFailed: 'Unable to load comments.',
      loading: 'Loading comments...',
      disabled: 'Comments are currently disabled.',
      status: {
        pending: 'Pending review',
        approved: 'Approved',
        rejected: 'Rejected'
      }
    },
    cta: {
      title: 'Found your ideal product?',
      subtitle: 'Our team is ready',
      button: 'Request Consultation'
    },
    ui: {
      call: 'Call',
      email: 'Email',
      price: 'Price',
      currentPrice: 'Current Price',
      priceIncludes: 'Includes installation',
      variablePrice: 'Variable Price',
      variablePriceDescription: 'Please contact for exact pricing',
      clickForInfo: 'Click for info',
      searchPlaceholder: 'Search...',
      resultsSuffix: 'products',
      close: 'Close',
      description: 'Description',
      specifications: 'Specifications',
      applications: 'Applications',
      reviews: 'Reviews',
      details: 'Details',
      noProducts: 'No products found',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressLabel: 'Address'
    },
    whyUs: {
      title: 'Why Us?',
      subtitle: 'Best choice for your business',
      items: [
        { title: 'Quality', desc: 'Global standards' },
        { title: 'Energy', desc: '20-30% less' },
        { title: 'Support', desc: '24/7' },
        { title: 'Precision', desc: '100% tested' }
      ]
    },
    footer: {
      rights: 'All rights reserved'
    }
  }
} as const satisfies LocaleRecord<ProductsNamespaceSchema>;

export type ProductsMessages = (typeof productsMessages)[keyof typeof productsMessages];
