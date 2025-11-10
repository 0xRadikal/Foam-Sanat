import type { TurnstileRenderOptions } from '@/lib/captcha/types';

// Storage API Types
interface StorageValue {
  key: string;
  value: string;
  shared: boolean;
}

export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    storage?: {
      get(key: string, shared?: boolean): Promise<StorageValue | null>;
      set(key: string, value: string, shared?: boolean): Promise<StorageValue | null>;
      delete(
        key: string,
        shared?: boolean
      ): Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list(
        prefix?: string,
        shared?: boolean
      ): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}
