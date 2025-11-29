'use client';

export const ANALYTICS_CONSENT_STORAGE_KEY = 'foam-sanat-analytics-consent';
export const ANALYTICS_CONSENT_EVENT = 'foam-sanat-consent';

export type AnalyticsConsentState = 'accepted' | 'declined';

export function getStoredConsent(): AnalyticsConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (stored === 'accepted' || stored === 'declined') return stored;
  } catch (error) {
    console.warn('Failed to read analytics consent from storage:', error);
  }
  return null;
}

export function persistConsent(state: AnalyticsConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, state);
    window.dispatchEvent(new CustomEvent<AnalyticsConsentState>(ANALYTICS_CONSENT_EVENT, { detail: state }));
  } catch (error) {
    console.warn('Failed to persist analytics consent to storage:', error);
  }
}
