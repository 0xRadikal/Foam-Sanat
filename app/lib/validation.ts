export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
  phone: /^[+()\d\s-]{7,}$/,
  url: /^https?:\/\/.+/i,
} as const;

export const VALIDATION_RULES = {
  comment: { minLength: 20, maxLength: 2000 },
  name: { minLength: 2, maxLength: 120 },
  email: { minLength: 5, maxLength: 254 },
  phone: { minLength: 7, maxLength: 30 },
} as const;

export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email);
}

export function validatePhone(phone: string): boolean {
  return VALIDATION_PATTERNS.phone.test(phone);
}

export function validateUrl(url: string): boolean {
  return VALIDATION_PATTERNS.url.test(url);
}
