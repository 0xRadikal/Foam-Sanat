'use client';

import { useEffect, useState } from 'react';
import type { HomeMessages } from '@/app/lib/i18n';

type HomeConsentMessages = HomeMessages['consent'];

type ConsentBannerProps = {
  consent: HomeConsentMessages;
  isRTL: boolean;
};

export default function ConsentBanner({ consent, isRTL }: ConsentBannerProps) {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('foam-sanat-analytics-consent');
    if (!stored) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('foam-sanat-analytics-consent', 'accepted');
    setShowConsent(false);
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('foam-sanat-analytics-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-gray-900 text-white p-6 rounded-lg shadow-2xl animate-slide-up ${
        isRTL ? 'text-right' : 'text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <p className="mb-4">{consent.message}</p>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {consent.accept}
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {consent.decline}
        </button>
      </div>
    </div>
  );
}
