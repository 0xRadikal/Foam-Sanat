'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  TurnstileAppearance,
  TurnstileRenderOptions,
  TurnstileSize,
  TurnstileTheme,
} from '@/lib/captcha/types';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileLoader: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileLoader) {
    return turnstileLoader;
  }

  turnstileLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src^="${TURNSTILE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' || existingScript.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }

      const handleLoad = () => {
        existingScript.dataset.loaded = 'true';
        resolve();
      };

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Turnstile script')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.loaded = 'false';

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));

    document.head.appendChild(script);
  }).catch((error) => {
    turnstileLoader = null;
    throw error;
  });

  return turnstileLoader!;
}

const baseOptions: Partial<TurnstileRenderOptions> = {
  appearance: 'always',
  size: 'normal',
  theme: 'auto',
};

export interface TurnstileWidgetProps {
  siteKey?: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: (reason: string) => void;
  action?: string;
  cData?: string;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  appearance?: TurnstileAppearance;
  className?: string;
  disabled?: boolean;
  refreshKey?: string | number | null;
}

export function TurnstileWidget({
  siteKey,
  onToken,
  onExpire,
  onError,
  action,
  cData,
  theme,
  size,
  appearance,
  className,
  disabled = false,
  refreshKey,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string>();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const latestOnToken = useRef(onToken);
  const latestOnExpire = useRef(onExpire);
  const latestOnError = useRef(onError);

  useEffect(() => {
    latestOnToken.current = onToken;
  }, [onToken]);

  useEffect(() => {
    latestOnExpire.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    latestOnError.current = onError;
  }, [onError]);

  const resetWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      window.turnstile.remove?.(widgetIdRef.current);
      widgetIdRef.current = undefined;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (!siteKey) {
      setError('Turnstile site key is not configured.');
      return;
    }

    if (disabled) {
      resetWidget();
      return;
    }

    let isCancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (isCancelled || !containerRef.current || !window.turnstile) {
          return;
        }

        resetWidget();
        const widgetId = window.turnstile.render(containerRef.current, {
          ...baseOptions,
          sitekey: siteKey,
          action,
          cData,
          theme,
          size,
          appearance,
          callback: (token: string) => {
            latestOnToken.current?.(token);
            setError(null);
          },
          'expired-callback': () => {
            latestOnExpire.current?.();
            latestOnToken.current?.('');
          },
          'error-callback': () => {
            const message = 'Turnstile failed to load. Please try again later.';
            setError(message);
            latestOnError.current?.(message);
          },
        } satisfies TurnstileRenderOptions);
        widgetIdRef.current = widgetId;
        setIsReady(true);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Unable to initialize Turnstile.';
        setError(message);
        latestOnError.current?.(message);
      });

    return () => {
      isCancelled = true;
      resetWidget();
    };
  }, [siteKey, disabled, action, cData, theme, size, appearance, refreshKey, resetWidget]);

  return (
    <div className={className} aria-live="polite">
      <div ref={containerRef} aria-busy={!isReady && !error} />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
