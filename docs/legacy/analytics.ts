// Legacy analytics helpers kept for potential future GA wiring. Currently unused; safe to remove after manual review.
type GtagConfig = Record<string, unknown>;

type GtagCommand =
  | ['config', string, GtagConfig?]
  | ['event', string, GtagConfig?]
  | ['consent', 'update', GtagConfig]
  | ['js', Date];

export const gtagSafe = (...args: GtagCommand) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

export const trackPageview = (url: string) => {
  const trackingId = process.env.NEXT_PUBLIC_GA_ID;
  if (!trackingId) {
    console.warn('Google Analytics tracking ID is not configured.');
    return;
  }
  gtagSafe('config', trackingId, { page_path: url });
};

export const trackEvent = (action: string, params?: GtagConfig) => {
  gtagSafe('event', action, params ?? {});
};
