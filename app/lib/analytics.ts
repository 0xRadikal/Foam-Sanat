// app/lib/analytics.ts
type GtagEventParams = Record<string, any>;

type GtagFunction = Window['gtag'];
type GtagArgs = GtagFunction extends (...args: infer T) => unknown ? T : never;

export const gtagSafe = (...args: GtagArgs) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

export const trackPageview = (url: string) => {
  const trackingId = process.env.NEXT_PUBLIC_GA_ID;
  if (!trackingId) {
    return;
  }

  gtagSafe('config', trackingId, { page_path: url });
};

export const trackEvent = (action: string, params?: GtagEventParams) => {
  gtagSafe('event', action, params ?? {});
};
