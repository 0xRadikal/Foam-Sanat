export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: any[]) => void;
  }
}

const isBrowser = typeof window !== 'undefined';

export function trackPageView(url: string) {
  if (!GA_ID || !isBrowser) return;
  window.gtag?.('config', GA_ID, { page_path: url });
  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', page_path: url });
  }
}

export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (!GA_ID || !isBrowser) return;
  window.gtag?.('event', action, params);
  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: action, ...params });
  }
}
