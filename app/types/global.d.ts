// Google Analytics Global Types
interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: Record<string, any>
  ) => void;
  dataLayer: any[];
}

// Storage API Types
interface StorageValue {
  key: string;
  value: string;
  shared: boolean;
}

// Extend Window for Storage API
interface Window {
  storage?: {
    get(key: string, shared?: boolean): Promise<StorageValue | null>;
    set(key: string, value: string, shared?: boolean): Promise<StorageValue | null>;
    delete(key: string, shared?: boolean): Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
    list(prefix?: string, shared?: boolean): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
  };
}

export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: any[]) => void;
  }
}