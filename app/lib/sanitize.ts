import DOMPurify from 'isomorphic-dompurify';

export function sanitizeForInnerHTML(value: string): string {
  return DOMPurify.sanitize(value);
}
