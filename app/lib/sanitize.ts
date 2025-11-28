const HTML_ESCAPE_PATTERN = /[&<>]/g;

const HTML_ESCAPE_REPLACEMENTS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

export function sanitizeForInnerHTML(value: string): string {
  return value.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ESCAPE_REPLACEMENTS[char] ?? char);
}
