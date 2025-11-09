export const products = {
  en: {
    categories: [
      {
        id: 'highPressureMachinery',
        name: 'High-Pressure PU Machines',
        description: 'Precision metering units with self-cleaning mix heads for automotive and integral skin applications.',
        features: [
          '160 bar axial piston pumps with closed-loop control',
          'Automatic formula management for up to 120 recipes',
          'Remote diagnostics with predictive maintenance alerts'
        ]
      },
      {
        id: 'lowPressureMachinery',
        name: 'Low-Pressure PU Machines',
        description: 'Flexible and rigid foam dosing units optimized for furniture, insulation panels, and appliance parts.',
        features: [
          'Servo-driven gear pumps for precise ratio control',
          'Integrated vacuum and degassing modules',
          'Modular tank capacities from 60L to 600L'
        ]
      },
      {
        id: 'automationCells',
        name: 'Automation Cells',
        description: 'Robotic pouring gantries, conveyors, and curing systems for smart factory deployment.',
        features: [
          'Six-axis robots with heated hoses and vision alignment',
          'IoT-enabled production dashboards',
          'Safety-rated PLC architecture with SIL2 compliance'
        ]
      }
    ],
    cta: {
      title: 'Need a custom PU production line?',
      subtitle: 'Our engineering team configures dosing, mixing, and automation to your exact throughput and quality goals.',
      button: 'Request Engineering Proposal'
    }
  },
  fa: {
    categories: [
      {
        id: 'highPressureMachinery',
        name: 'ماشین‌های پلی‌یورتان هایپرشر',
        description: 'یونیت‌های دوزینگ دقیق با هد میکس خودپاک‌شونده برای صنایع خودرو و قطعات انتگرال.',
        features: [
          'پمپ‌های پیستونی محوری ۱۶۰ بار با کنترل حلقه بسته',
          'مدیریت فرمولاسیون خودکار تا ۱۲۰ دستور کار',
          'عیب‌یابی از راه دور با هشدارهای نگهداری پیش‌بین'
        ]
      },
      {
        id: 'lowPressureMachinery',
        name: 'ماشین‌های پلی‌یورتان لوپرشر',
        description: 'واحدهای دوزینگ فوم نرم و سخت برای مبلمان، پانل‌های عایق و قطعات لوازم خانگی.',
        features: [
          'پمپ‌های دنده‌ای سروومدار برای کنترل دقیق نسبت',
          'ماژول‌های خلأ و گاززدایی یکپارچه',
          'مخازن ماژولار با ظرفیت ۶۰ تا ۶۰۰ لیتر'
        ]
      },
      {
        id: 'automationCells',
        name: 'سلول‌های اتوماسیون',
        description: 'گنتری‌های رباتیک، نوار نقاله‌ها و سیستم‌های کیورینگ برای پیاده‌سازی کارخانه هوشمند.',
        features: [
          'ربات‌های شش‌محوره با شیلنگ گرم و تراز دیداری',
          'داشبوردهای تولید متصل به اینترنت اشیا',
          'معماری PLC ایمن با انطباق SIL2'
        ]
      }
    ],
    cta: {
      title: 'به خط تولید اختصاصی PU نیاز دارید؟',
      subtitle: 'تیم مهندسی ما دوزینگ، میکس و اتوماسیون را دقیقاً مطابق ظرفیت و کیفیت هدف شما پیکربندی می‌کند.',
      button: 'درخواست طرح مهندسی'
    }
  }
} as const;
