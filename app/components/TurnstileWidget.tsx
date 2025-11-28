'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TurnstileWidgetProps = {
  siteKey: string;
  locale?: string;
  refreshKey?: number;
  onToken: (token: string) => void;
  onError?: (message: string) => void;
  onExpire?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown> & {
          sitekey: string;
          callback: (token: string) => void;
        },
      ) => string;
      reset: (id?: string) => void;
      remove?: (id?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

function loadTurnstileScript(onLoad: () => void, onError?: () => void) {
  if (typeof document === 'undefined') return;

  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existingScript) {
    if (window.turnstile) {
      onLoad();
      return;
    }

    existingScript.addEventListener('load', onLoad, { once: true });
    if (onError) existingScript.addEventListener('error', onError, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = TURNSTILE_SCRIPT_ID;
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  script.addEventListener('load', onLoad, { once: true });
  if (onError) script.addEventListener('error', onError, { once: true });

  document.head.appendChild(script);
}

export function TurnstileWidget({ siteKey, locale, refreshKey = 0, onToken, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | undefined>();
  const [scriptReady, setScriptReady] = useState(() => typeof window !== 'undefined' && Boolean(window.turnstile));

  const resetWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }

    if (widgetIdRef.current && window.turnstile?.remove) {
      window.turnstile.remove(widgetIdRef.current);
    }

    widgetIdRef.current = undefined;
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.turnstile) {
      setScriptReady(true);
      return;
    }

    loadTurnstileScript(
      () => setScriptReady(true),
      () => {
        onError?.('Security challenge failed to load. Please refresh and try again.');
      },
    );
  }, [onError]);

  useEffect(() => {
    if (!scriptReady || typeof window === 'undefined' || !containerRef.current || !window.turnstile) {
      return undefined;
    }

    resetWidget();

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onToken(token);
      },
      'expired-callback': () => {
        onExpire?.();
      },
      'timeout-callback': () => {
        onExpire?.();
      },
      'error-callback': () => {
        onError?.('Security verification failed. Please retry.');
      },
      language: locale,
    });

    return () => {
      resetWidget();
    };
  }, [locale, onError, onExpire, onToken, refreshKey, resetWidget, scriptReady, siteKey]);

  const ariaLabel = useMemo(() => (locale === 'fa' ? 'اعتبارسنجی امنیتی' : 'Security verification'), [locale]);

  return <div ref={containerRef} className="cf-turnstile" aria-label={ariaLabel} />;
}

export default TurnstileWidget;
