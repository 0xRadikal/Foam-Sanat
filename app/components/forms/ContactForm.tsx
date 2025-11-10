'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { z } from 'zod';

import { TurnstileWidget } from '@/components/security/TurnstileWidget';
import { ApiClientError, postJson } from '@/lib/api-client';
import {
  contactFormSchema,
  type ContactFormInput,
} from '@/lib/validations/contact-schema';
import type { HomeMessages } from '@/app/lib/i18n';

type ContactMessages = HomeMessages['contact'];

type ContactFormStatus = 'idle' | 'sending' | 'success' | 'error';

type FieldErrors = Partial<Record<keyof ContactFormInput, string[]>>;

interface ContactFormProps {
  contact: ContactMessages;
  isRTL: boolean;
  isDark: boolean;
}

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  turnstileToken: string;
}

interface ContactResponse {
  success: boolean;
  id?: number;
}

const initialState: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
  turnstileToken: '',
};

function flattenErrors(error: z.ZodError<ContactFormInput>): FieldErrors {
  const fieldErrors = error.flatten().fieldErrors;
  return fieldErrors as FieldErrors;
}

function normalizeServerErrors(details: unknown): FieldErrors {
  if (!details || typeof details !== 'object') {
    return {};
  }

  const result: FieldErrors = {};

  for (const [field, value] of Object.entries(details)) {
    if (field === '_errors') {
      continue;
    }

    if (!value || typeof value !== 'object' || !('_errors' in value)) {
      continue;
    }

    const messages = (value as { _errors?: unknown[] })._errors?.filter((item): item is string => typeof item === 'string');
    if (messages && messages.length > 0) {
      result[field as keyof ContactFormInput] = messages;
    }
  }

  return result;
}

export function ContactForm({ contact, isRTL, isDark }: ContactFormProps) {
  const [formState, setFormState] = useState<ContactFormState>(initialState);
  const [status, setStatus] = useState<ContactFormStatus>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [widgetRefreshKey, setWidgetRefreshKey] = useState(0);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isSubmitDisabled = status === 'sending' || !siteKey;

  const inputClasses = useMemo(() => {
    const base = 'w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500';
    const themeClass = isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

    return `${base} ${themeClass}`;
  }, [isDark]);

  const handleChange = (field: keyof ContactFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setFieldErrors({});
    setGlobalError(null);

    const validation = contactFormSchema.safeParse(formState);

    if (!validation.success) {
      setFieldErrors(flattenErrors(validation.error));
      setStatus('error');
      return;
    }

    try {
      await postJson<ContactFormInput, ContactResponse>('/api/contact', validation.data);
      setStatus('success');
      setFormState(initialState);
      setWidgetRefreshKey((prev) => prev + 1);
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.status === 400) {
          setFieldErrors(normalizeServerErrors(error.details));
          setGlobalError(contact.form.error);
        } else if (error.status === 401) {
          setGlobalError(contact.form.captchaError);
        } else if (error.status === 429) {
          setGlobalError(contact.form.rateLimitError);
        } else {
          setGlobalError(contact.form.error);
        }
      } else {
        setGlobalError(contact.form.error);
      }

      setStatus('error');
    }
  };

  const handleToken = (token: string) => {
    setFormState((prev) => ({ ...prev, turnstileToken: token }));
    setFieldErrors((prev) => ({ ...prev, turnstileToken: undefined }));
    setGlobalError(null);
  };

  const handleExpire = () => {
    setFormState((prev) => ({ ...prev, turnstileToken: '' }));
    setFieldErrors((prev) => ({ ...prev, turnstileToken: [contact.form.captchaError] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label className="block mb-2 font-semibold" htmlFor="name">
          {contact.form.name}
        </label>
        <input
          type="text"
          id="name"
          required
          value={formState.name}
          onChange={handleChange('name')}
          className={inputClasses}
          disabled={status === 'sending'}
          aria-invalid={fieldErrors.name ? 'true' : 'false'}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.name.join(' ')}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="email">
          {contact.form.email}
        </label>
        <input
          type="email"
          id="email"
          required
          value={formState.email}
          onChange={handleChange('email')}
          className={inputClasses}
          disabled={status === 'sending'}
          aria-invalid={fieldErrors.email ? 'true' : 'false'}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.email.join(' ')}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="phone">
          {contact.form.phone}
        </label>
        <input
          type="tel"
          id="phone"
          value={formState.phone}
          onChange={handleChange('phone')}
          className={inputClasses}
          disabled={status === 'sending'}
          aria-invalid={fieldErrors.phone ? 'true' : 'false'}
          aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
        />
        {fieldErrors.phone && (
          <p id="phone-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.phone.join(' ')}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold" htmlFor="message">
          {contact.form.message}
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formState.message}
          onChange={handleChange('message')}
          className={inputClasses}
          disabled={status === 'sending'}
          aria-invalid={fieldErrors.message ? 'true' : 'false'}
          aria-describedby={fieldErrors.message ? 'message-error' : undefined}
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.message.join(' ')}
          </p>
        )}
      </div>

      <div>
        <TurnstileWidget
          siteKey={siteKey}
          onToken={handleToken}
          onExpire={handleExpire}
          onError={setGlobalError}
          className={isRTL ? 'flex justify-end' : undefined}
          disabled={status === 'sending'}
          refreshKey={widgetRefreshKey}
        />
        {fieldErrors.turnstileToken && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.turnstileToken.join(' ')}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`w-full py-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-orange-300 ${
          isSubmitDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {status === 'sending' ? contact.form.sending : contact.form.submit}
      </button>

      {globalError && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg">
          {globalError}
        </div>
      )}

      {status === 'success' && !globalError && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg">
          {contact.form.success}
        </div>
      )}
    </form>
  );
}
