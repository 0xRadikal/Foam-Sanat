import { defaultLocale, isLocale, locales, localeSettings, type Locale, type LocaleRecord } from './locales';
import { commonMessages, type CommonMessages } from './translations/common';
import { homeMessages, type HomeMessages, type HomeNamespaceSchema } from './translations/home';
import { aboutMessages, type AboutMessages, type AboutNamespaceSchema } from './translations/about';
import {
  productsMessages,
  type ProductsMessages,
  type ProductsNamespaceSchema
} from './translations/products';

export { defaultLocale, isLocale, locales, localeSettings };
export type {
  Locale,
  CommonMessages,
  HomeMessages,
  HomeNamespaceSchema,
  AboutMessages,
  AboutNamespaceSchema,
  ProductsMessages,
  ProductsNamespaceSchema
};

export const namespaces = ['common', 'home', 'about', 'products'] as const;
export type Namespace = (typeof namespaces)[number];

const namespaceRegistry = {
  common: commonMessages,
  home: homeMessages,
  about: aboutMessages,
  products: productsMessages
} as const;

export const staticResources = {
  fa: {
    common: namespaceRegistry.common.fa,
    home: namespaceRegistry.home.fa,
    about: namespaceRegistry.about.fa,
    products: namespaceRegistry.products.fa
  },
  en: {
    common: namespaceRegistry.common.en,
    home: namespaceRegistry.home.en,
    about: namespaceRegistry.about.en,
    products: namespaceRegistry.products.en
  }
} as const;

export type Resources = typeof staticResources;
export type NamespaceMessages<N extends Namespace> = Resources[Locale][N];
export type MessagesByLocale<L extends Locale = Locale> = Resources[L];

export const getAllMessages = <L extends Locale>(locale: L): MessagesByLocale<L> =>
  staticResources[locale];

export const getNamespaceMessages = <L extends Locale, N extends Namespace>(
  locale: L,
  namespace: N
): Resources[L][N] => staticResources[locale][namespace];

const namespaceLoaders = {
  common: () => import('./translations/common'),
  home: () => import('./translations/home'),
  about: () => import('./translations/about'),
  products: () => import('./translations/products')
} as const;

export async function loadMessages(
  locale: Locale,
  namespace: Namespace
): Promise<CommonMessages | HomeMessages | AboutMessages | ProductsMessages> {
  if (process.env.NODE_ENV !== 'production') {
    return staticResources[locale][namespace];
  }

  if (namespace === 'common') {
    const mod = await namespaceLoaders.common();
    return mod.commonMessages[locale];
  }

  if (namespace === 'home') {
    const mod = await namespaceLoaders.home();
    return mod.homeMessages[locale];
  }

  if (namespace === 'about') {
    const mod = await namespaceLoaders.about();
    return mod.aboutMessages[locale];
  }

  const mod = await namespaceLoaders.products();
  return mod.productsMessages[locale];
}

type Primitive = string | number | boolean;

type DotJoin<A extends string, B extends string> = A extends ''
  ? B
  : `${A}.${B}`;

type PathImpl<T, Prefix extends string = ''> =
  T extends Primitive
    ? Prefix
    : T extends readonly (infer U)[]
      ? PathImpl<U, DotJoin<Prefix, `${number}`>>
      : T extends Record<string, unknown>
        ? {
            [K in keyof T & string]: PathImpl<T[K], DotJoin<Prefix, K>>;
          }[keyof T & string]
        : never;

export type MessagePath<T> = Extract<PathImpl<T>, string>;

type ValueAtPath<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? T extends readonly unknown[]
      ? Key extends `${number}`
        ? ValueAtPath<T[number], Rest>
        : never
      : Key extends keyof T
        ? ValueAtPath<T[Key], Rest>
        : never
    : T extends readonly unknown[]
      ? Path extends `${number}`
        ? Extract<T[number], Primitive>
        : never
      : Path extends keyof T
        ? Extract<T[Path], Primitive>
        : never;

export function createTranslator<L extends Locale, N extends Namespace>(
  locale: L,
  namespace: N,
  source?: MessagesByLocale<L>[N]
) {
  type NamespaceMessageType = MessagesByLocale<L>[N];
  const messages = (source ?? getNamespaceMessages(locale, namespace)) as NamespaceMessageType;

  return <Path extends MessagePath<NamespaceMessageType>>(
    path: Path
  ): ValueAtPath<NamespaceMessageType, Path> => {
    const value = path
      .split('.')
      .reduce<unknown>((acc, segment) => {
        if (acc == null) {
          return acc;
        }

        if (Array.isArray(acc)) {
          const index = Number(segment);
          return Number.isNaN(index) ? undefined : acc[index];
        }

        return (acc as Record<string, unknown>)[segment];
      }, messages);

    return value as ValueAtPath<NamespaceMessageType, Path>;
  };
}

export type Translator<L extends Locale, N extends Namespace> = ReturnType<typeof createTranslator<L, N>>;

export type LocaleWithNamespaces = {
  locale: Locale;
  namespaces: Namespace[];
};

export const availableNamespaces: LocaleRecord<Namespace[]> = {
  fa: [...namespaces],
  en: [...namespaces]
};
