const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? '';
const isProduction = process.env.NODE_ENV === 'production';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const isBrowser = typeof window !== 'undefined';
const hasIds = Boolean(GA_ID || GTM_ID);

function hasAnalyticsGlobals() {
  if (!isBrowser) return false;
  const hasGtag = typeof window.gtag === 'function';
  const hasDataLayer = Array.isArray(window.dataLayer);
  return hasGtag || hasDataLayer;
}

export function isAnalyticsRuntimeEnabled() {
  return isProduction && hasIds;
}

export function trackPageView(url: string) {
  if (!isBrowser || !isAnalyticsRuntimeEnabled() || !hasAnalyticsGlobals()) return;

  if (GA_ID) {
    window.gtag?.('config', GA_ID, { page_path: url });
  }

  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', page_path: url });
  }
}

export function trackEvent(
  action: string,
  params: Record<string, unknown> = {},
) {
  if (!isBrowser || !isAnalyticsRuntimeEnabled() || !hasAnalyticsGlobals()) return;

  if (GA_ID) {
    window.gtag?.('event', action, params);
  }

  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: action, ...params });
  }
}

export { GA_ID, GTM_ID };
