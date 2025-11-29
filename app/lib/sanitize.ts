import DOMPurify from 'isomorphic-dompurify';

/**
 * All HTML rendered via dangerouslySetInnerHTML must be sanitized through this helper.
 * isomorphic-dompurify keeps DOMPurify SSR-safe, so calls here are safe on both
 * the server and the client.
 */
export function sanitizeForInnerHTML(value: string): string {
  return DOMPurify.sanitize(value);
}
