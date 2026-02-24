//Basic HTML sanitization to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

//Sanitize text input (allow line breaks but nothing else)
export function sanitizeText(input: string): string {
  // Remove all HTML tags but preserve newlines
  return input.replace(/<[^>]*>/g, '').trim();
}

//Validate and sanitize email
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}