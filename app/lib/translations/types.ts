import type { namespaces } from './index';

export type TranslationMap = typeof namespaces;
export type Namespace = keyof TranslationMap;
export type Locale = keyof TranslationMap[Namespace];

export type NamespaceTranslations<
  N extends Namespace,
  L extends Locale
> = TranslationMap[N][L];

export type TranslationKey<
  N extends Namespace,
  L extends Locale
> = keyof NamespaceTranslations<N, L>;
