'use client';

export const ANALYTICS_CONSENT_STORAGE_KEY = 'foam-sanat-analytics-consent';
export const ANALYTICS_CONSENT_EVENT = 'foam-sanat-consent';

export type AnalyticsConsentState = 'accepted' | 'declined';

export function getStoredConsent(): AnalyticsConsentState | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'declined') return stored;
  return null;
}

export function persistConsent(state: AnalyticsConsentState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, state);
  window.dispatchEvent(new CustomEvent<AnalyticsConsentState>(ANALYTICS_CONSENT_EVENT, { detail: state }));
}
