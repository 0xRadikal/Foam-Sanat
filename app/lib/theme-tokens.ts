// app/lib/theme-tokens.ts
// ✅ REFACTOR #1: Centralized theme tokens to eliminate duplication

export type Theme = 'light' | 'dark';

export interface ChromeThemeTokens {
  pageBackground: string;
  pageText: string;
  mutedText: string;
  surface: string;
  inputSurface: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  section: string;
  hover: string;
  header: string;
  border: string;
  heroGradient: string;
}

/**
 * Centralized theme token definitions
 * Use these instead of inline theme classes throughout the app
 */
export const THEME_TOKENS: Record<Theme, ChromeThemeTokens> = {
  light: {
    pageBackground: 'bg-white',
    pageText: 'text-gray-900',
    mutedText: 'text-gray-600',
    surface: 'bg-white',
    inputSurface: 'bg-white',
    inputBorder: 'border-gray-300',
    inputText: 'text-gray-900',
    inputPlaceholder: 'placeholder-gray-500',
    section: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    header: 'bg-white/95',
    border: 'border-gray-200',
    heroGradient: 'bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50'
  },
  dark: {
    pageBackground: 'bg-gray-900',
    pageText: 'text-gray-100',
    mutedText: 'text-gray-300',
    surface: 'bg-gray-800',
    inputSurface: 'bg-gray-800',
    inputBorder: 'border-gray-700',
    inputText: 'text-white',
    inputPlaceholder: 'placeholder-gray-400',
    section: 'bg-gray-800',
    hover: 'hover:bg-gray-700',
    header: 'bg-gray-800/95',
    border: 'border-gray-700',
    heroGradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
  }
} as const;

/**
 * Get theme tokens for a specific theme
 * @param theme - 'light' or 'dark'
 * @returns Theme token object
 */
export function getThemeTokens(theme: Theme): ChromeThemeTokens {
  return THEME_TOKENS[theme];
}

/**
 * Utility: Get a specific token for current theme
 * @param theme - Current theme
 * @param token - Token name
 * @returns CSS class string
 */
export function getThemeToken(theme: Theme, token: keyof ChromeThemeTokens): string {
  return THEME_TOKENS[theme][token];
}

/**
 * Utility: Combine multiple theme tokens
 * @param theme - Current theme
 * @param tokens - Array of token names
 * @returns Combined CSS class string
 */
export function combineThemeTokens(theme: Theme, ...tokens: (keyof ChromeThemeTokens)[]): string {
  return tokens.map(token => THEME_TOKENS[theme][token]).join(' ');
}