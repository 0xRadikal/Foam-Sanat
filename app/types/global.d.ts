// Google Analytics Global Types
type GtagArguments =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['event', string, Record<string, unknown>?]
  | ['set', string, Record<string, unknown>]
  | ['consent', 'update', Record<string, unknown>];

// Storage API Types
interface StorageValue {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageApi {
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
}

export {};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: GtagArguments) => void;
    storage?: StorageApi;
  }
}
