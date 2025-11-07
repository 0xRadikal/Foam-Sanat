// app/lib/analytics.ts
type GtagEventParams = Record<string, any>;

export const gtagSafe = (...args: any[]) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
};

export const trackPageview = (url: string) => {
  gtagSafe("config", process.env.NEXT_PUBLIC_GA_ID, { page_path: url });
};

export const trackEvent = (action: string, params?: GtagEventParams) => {
  gtagSafe("event", action, params ?? {});
};
