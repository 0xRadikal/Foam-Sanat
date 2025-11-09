import { common } from './common';
import { home } from './home';
import { about } from './about';
import { products } from './products';
import type { Locale } from './types';

export const namespaces = {
  common,
  home,
  about,
  products
} as const;

export type {
  Locale,
  Namespace,
  TranslationMap,
  NamespaceTranslations,
  TranslationKey
} from './types';

export async function loadTranslations<
  N extends keyof typeof namespaces,
  L extends keyof (typeof namespaces)[N]
>(locale: L, ns: N) {
  if (process.env.NODE_ENV === 'production') {
    const mod = (await import(`./${ns}.ts`)) as { [K in N]: (typeof namespaces)[K] };
    return mod[ns][locale];
  }

  return namespaces[ns][locale];
}

export function t<
  N extends keyof typeof namespaces,
  L extends keyof (typeof namespaces)[N],
  K extends keyof (typeof namespaces)[N][L]
>(locale: L, ns: N, key: K) {
  return namespaces[ns][locale][key];
}

export function getNamespace<
  N extends keyof typeof namespaces,
  L extends keyof (typeof namespaces)[N]
>(locale: L, ns: N) {
  return namespaces[ns][locale];
}
