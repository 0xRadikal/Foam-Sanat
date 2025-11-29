// app/components/home/ContactForm.tsx - FIXED: Lines 27-49
'use client';

import { useId, useMemo, useState } from 'react';
import type { HomeMessages, Locale } from '@/app/lib/i18n';
import { validateEmail, validatePhone, VALIDATION_RULES } from '@/app/lib/validation';
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
  const labelAlignment = isRTL ? 'text-right' : 'text-left';
  const hasError = status === 'error';
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const captchaEnabled = useMemo(() => Boolean(turnstileSiteKey), [turnstileSiteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setCaptchaError(null);

    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim();
    const trimmedPhone = formState.phone.trim();
    const trimmedMessage = formState.message.trim();

    const setFieldError = (message: string) => {
      setStatus('error');
      setErrorMessage(message);
    };

    if (
      trimmedName.length < VALIDATION_RULES.name.minLength ||
      trimmedName.length > VALIDATION_RULES.name.maxLength
    ) {
      setFieldError(contact.form.errorName);
      return;
    }

    if (
      trimmedEmail.length < VALIDATION_RULES.email.minLength ||
      trimmedEmail.length > VALIDATION_RULES.email.maxLength ||
      !validateEmail(trimmedEmail)
    ) {
      setFieldError(contact.form.errorEmail);
      return;
    }

    if (
      trimmedPhone &&
      (trimmedPhone.length < VALIDATION_RULES.phone.minLength ||
        trimmedPhone.length > VALIDATION_RULES.phone.maxLength ||
        !validatePhone(trimmedPhone))
    ) {
      setFieldError(contact.form.errorPhone);
      return;
    }

    if (trimmedMessage.length < 10) {
      setFieldError(contact.form.errorMessage);
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setFieldError(contact.form.captchaRequired);
      setCaptchaError(contact.form.captchaRequired);
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          message: trimmedMessage,
          turnstileToken: captchaToken || undefined
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: contact.form.errorGeneric };
        }

        throw new Error(errorData.message || contact.form.errorGeneric);
      }

      await response.json();

      setStatus('success');
      setFormState({ name: '', email: '', phone: '', message: '' });
      setCaptchaToken('');
      setCaptchaRefresh((current) => current + 1);

      trackEvent('contact_form_submitted', {
        locale,
        hasPhone: Boolean(trimmedPhone),
      });

      // Auto-clear success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact form submission error:', error);

      setErrorMessage(contact.form.errorGeneric);
      setCaptchaError(contact.form.errorGeneric);
      setStatus('error');
      setCaptchaRefresh((current) => current + 1);

      // Auto-clear error after 10 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
        setCaptchaError(null);
      }, 10000);
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
          className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg"
        >
          {contact.form.success}
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