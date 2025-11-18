// app/components/home/ContactForm.tsx - FIXED: Lines 27-49
'use client';

import { useState } from 'react';
import type { HomeMessages } from '@/app/lib/i18n';

type HomeContactMessages = HomeMessages['contact'];

type ContactFormProps = {
  contact: HomeContactMessages;
  isRTL: boolean;
  isDark: boolean;
};

export default function ContactForm({ contact, isRTL, isDark }: ContactFormProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>(''); // ✅ NEW: Specific error messages
  const labelAlignment = isRTL ? 'text-right' : 'text-left';

  // ✅ FIX #10: Improved error handling with specific messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      // ✅ FIXED: Properly handle non-OK responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Server error occurred' };
        }
        
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      setStatus('success');
      setFormState({ name: '', email: '', phone: '', message: '' });
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
      
    } catch (error) {
      // ✅ FIXED: Better error logging and user feedback
      console.error('Contact form submission error:', error);
      
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to submit form. Please try again.';
      
      setErrorMessage(message);
      setStatus('error');
      
      // Auto-clear error after 10 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 10000);
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
          required
          value={formState.phone}
          onChange={(e) => {
            setFormState({ ...formState, phone: e.target.value });
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          className={inputClasses}
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
          disabled={status === 'sending'}
        />
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
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg">
          {contact.form.success}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg">
          {/* ✅ FIXED: Show specific error message */}
          <p className="font-semibold mb-1">{contact.form.error}</p>
          {errorMessage && <p className="text-sm">{errorMessage}</p>}
        </div>
      )}
    </form>
  );
}