export type TurnstileTheme = 'light' | 'dark' | 'auto';
export type TurnstileSize = 'normal' | 'compact' | 'invisible';
export type TurnstileAppearance = 'always' | 'execute' | 'interaction-only';

export interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  'timeout-callback'?: () => void;
  'unsupported-callback'?: () => void;
  action?: string;
  cData?: string;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  appearance?: TurnstileAppearance;
}

export interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
  score?: number;
}
