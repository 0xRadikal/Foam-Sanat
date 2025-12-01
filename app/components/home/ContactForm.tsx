'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { HomeMessages, Locale } from '@/app/lib/i18n';
import { useContactValidation } from '@/app/lib/hooks/useFormHelpers';
import { getThemeToken, type Theme } from '@/app/lib/theme-tokens';
import { TurnstileWidget } from '@/app/components/TurnstileWidget';
import { trackEvent } from '@/app/lib/analytics';

type HomeContactMessages = HomeMessages['contact'];

type ContactFormProps = {
  contact: HomeContactMessages;
  isRTL: boolean;
  isDark: boolean;
  locale: Locale;
};

export default function ContactForm({ contact, isRTL, isDark, locale }: ContactFormProps) {
  const theme: Theme = isDark ? 'dark' : 'light';
  const statusMessageId = useId();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>(''); // ✅ NEW: Specific error messages
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);
  const labelAlignment = isRTL ? 'text-right' : 'text-left';
  const hasError = status === 'error';
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const captchaEnabled = useMemo(() => Boolean(turnstileSiteKey), [turnstileSiteKey]);
  const normalizeErrorKey = useCallback((message: string) => message.trim().replace(/[.!]*$/, ''), []);
  const validateContactForm = useContactValidation(contact);

  const errorMessageMap = useMemo(
    () => ({
      'CAPTCHA token is required': contact.form.captchaRequired,
      'CAPTCHA verification failed': contact.form.captchaFailed,
      'CAPTCHA verification is unavailable due to server configuration':
        contact.form.captchaUnavailable,
      'Unable to verify CAPTCHA at this time. Please try again later':
        contact.form.captchaTemporarilyUnavailable,
      'Invalid request origin': contact.form.invalidOrigin,
    }),
    [contact.form],
  );

  const translateApiError = useCallback(
    (message?: string | null) => {
      const normalizedKey = message ? normalizeErrorKey(message) : null;
      if (normalizedKey && normalizedKey in errorMessageMap) {
        return errorMessageMap[normalizedKey as keyof typeof errorMessageMap];
      }
      return null;
    },
    [errorMessageMap, normalizeErrorKey],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setCaptchaError(null);

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    const validationResult = validateContactForm(formState, { captchaEnabled, captchaToken });
    if (!validationResult.sanitized) {
      const message = validationResult.error ?? contact.form.errorGeneric;
      setStatus('error');
      setErrorMessage(message);
      if (message === contact.form.captchaRequired) {
        setCaptchaError(message);
      }
      return;
    }

    const { name, email, phone, message: bodyMessage } = validationResult.sanitized;

    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: bodyMessage,
          turnstileToken: captchaToken,
        }),
      });

      if (!response.ok) {
        let errorMessage: string | null = null;
        try {
          const errorData = (await response.json()) as { message?: string; error?: string };
          const rawMessage = errorData.message || errorData.error;
          const translatedError = translateApiError(rawMessage);
          errorMessage = translatedError ?? rawMessage ?? null;
        } catch {
          // Fallback to generic error
        }

        throw new Error(errorMessage ?? contact.form.errorGeneric);
      }

      await response.json();

      setStatus('success');
      setFormState({ name: '', email: '', phone: '', message: '' });
      setCaptchaToken('');
      errorTimerRef.current = null;
      setCaptchaRefresh((current) => current + 1);

      trackEvent('contact_form_submitted', {
        locale,
        hasPhone: Boolean(phone),
      });

      // Auto-clear success message after 10 seconds
      setTimeout(() => setStatus('idle'), 10000);
    } catch (error) {
      console.error('Contact form submission error:', error);

      const rawErrorMessage = error instanceof Error ? error.message : null;
      const mappedError = error instanceof Error ? translateApiError(error.message) : null;

      const message = mappedError ?? (rawErrorMessage ?? contact.form.errorGeneric);
      const captchaMessages: string[] = [
        contact.form.captchaRequired,
        contact.form.captchaExpired,
        contact.form.captchaError,
        contact.form.captchaUnavailable,
        contact.form.captchaFailed,
        contact.form.captchaTemporarilyUnavailable,
        contact.form.invalidOrigin,
      ];

      setErrorMessage(message);
      const isCaptchaMessage = captchaMessages.includes(message);

      if (isCaptchaMessage) {
        setCaptchaError(message);
      }
      setStatus('error');
      setCaptchaRefresh((current) => current + 1);

      // Auto-clear error after 10 seconds
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }

      if (!isCaptchaMessage) {
        errorTimerRef.current = setTimeout(() => {
          setStatus('idle');
          setErrorMessage('');
          setCaptchaError(null);
          errorTimerRef.current = null;
        }, 10000);
      }
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
    getThemeToken(theme, 'surface')
  } ${getThemeToken(theme, 'border')} ${getThemeToken(theme, 'pageText')} ${getThemeToken(theme, 'placeholder')}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-busy={status === 'sending'}
      aria-describedby={hasError ? statusMessageId : undefined}
    >
      <div>
        <label className={`block mb-2 font-semibold ${labelAlignment}`} htmlFor="name">
          {contact.form.name}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formState.name}
          onChange={(e) => {
            setFormState({ ...formState, name: e.target.value });
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          className={inputClasses}
          autoComplete="name"
          aria-invalid={hasError}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className={`block mb-2 font-semibold ${labelAlignment}`} htmlFor="email">
          {contact.form.email}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formState.email}
          onChange={(e) => {
            setFormState({ ...formState, email: e.target.value });
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          className={inputClasses}
          autoComplete="email"
          inputMode="email"
          aria-invalid={hasError}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className={`block mb-2 font-semibold ${labelAlignment}`} htmlFor="phone">
          {contact.form.phone}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formState.phone}
          onChange={(e) => {
            setFormState({ ...formState, phone: e.target.value });
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          className={inputClasses}
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={hasError}
          disabled={status === 'sending'}
        />
      </div>

      <div>
        <label className={`block mb-2 font-semibold ${labelAlignment}`} htmlFor="message">
          {contact.form.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formState.message}
          onChange={(e) => {
            setFormState({ ...formState, message: e.target.value });
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          className={inputClasses}
          autoComplete="off"
          aria-invalid={hasError}
          disabled={status === 'sending'}
        />
      </div>

      <div className="space-y-2">
        <p className={`font-semibold ${labelAlignment}`}>{contact.form.captcha}</p>
        {captchaEnabled ? (
          <TurnstileWidget
            siteKey={turnstileSiteKey!}
            locale={isRTL ? 'fa' : 'en'}
            refreshKey={captchaRefresh}
            onToken={(token) => {
              setCaptchaToken(token);
              setCaptchaError(null);
            }}
            onExpire={() => {
              setCaptchaToken('');
              setCaptchaError(contact.form.captchaExpired);
            }}
            onError={(message) => {
              setCaptchaToken('');
              setCaptchaError(message || contact.form.captchaError);
            }}
          />
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-100 rounded-lg px-3 py-2">
            {contact.form.captchaUnavailable}
          </p>
        )}
        {captchaError && (
          <p className="text-sm text-red-600 dark:text-red-300" role="alert">
            {captchaError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`w-full py-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-orange-300 ${
          status === 'sending'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {status === 'sending' ? contact.form.sending : contact.form.submit}
      </button>

      {status === 'success' && (
        <div
          id={statusMessageId}
          role="status"
          aria-live="polite"
          className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg flex items-start justify-between gap-4"
        >
          <span>{contact.form.success}</span>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-sm font-semibold text-green-800 underline dark:text-green-100"
            aria-label={contact.form.dismissSuccess}
          >
            {contact.form.dismiss}
          </button>
        </div>
      )}

      {status === 'error' && (
        <div
          id={statusMessageId}
          role="alert"
          aria-live="assertive"
          className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg"
        >
          {/* ✅ FIXED: Show specific error message */}
          <p className="font-semibold mb-1">{contact.form.error}</p>
          {errorMessage && <p className="text-sm">{errorMessage}</p>}
        </div>
      )}
    </form>
  );
}