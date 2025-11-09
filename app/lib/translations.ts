import {
  availableNamespaces,
  createTranslator,
  defaultLocale,
  getAllMessages,
  getNamespaceMessages,
  isLocale,
  loadMessages,
  localeSettings,
  locales,
  namespaces,
  staticResources,
  type Locale,
  type LocaleWithNamespaces,
  type MessagePath,
  type MessagesByLocale,
  type Namespace,
  type NamespaceMessages,
  type Resources,
  type Translator
} from './i18n';

export { availableNamespaces, defaultLocale, isLocale, localeSettings, locales, namespaces };

export type {
  Locale,
  LocaleWithNamespaces,
  MessagePath,
  MessagesByLocale,
  Namespace,
  NamespaceMessages,
  Resources,
  Translator
};

/**
 * Canonical translation catalog keyed by locale and namespace. This retains
 * backward compatibility with earlier imports that relied on `translations`
 * being the source of truth while delegating to the modular i18n registry.
 */
export const translations = staticResources;

export type TranslationCatalog = typeof translations;
export type TranslationNamespaces = typeof namespaces[number];
export type TranslationLocales = typeof locales[number];
export type TranslationBundle<L extends Locale = Locale> = MessagesByLocale<L>;

export { createTranslator, getAllMessages, getNamespaceMessages, loadMessages };
