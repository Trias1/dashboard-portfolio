import { cleanLinkFields } from './upload-validation';

const DEFAULT_MAX_TEXT = 20000;

/**
 * Shared checks for section write routes:
 * - link fields are cleaned in place (http/https only; "#section" and "/path" where allowed),
 * - every string field is capped in length.
 * Returns an error message for the client, or null when the body is fine.
 */
export function checkSectionBody(
  body: unknown,
  opts: { links?: string[]; relativeLinks?: string[]; maxText?: number } = {},
): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid request body';
  const record = body as Record<string, unknown>;
  const max = opts.maxText ?? DEFAULT_MAX_TEXT;
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && value.length > max) return `${key} is too long (max ${max} characters)`;
  }
  const bad = cleanLinkFields(record, opts.links || [], opts.relativeLinks || []);
  return bad ? `${bad.replace(/_/g, ' ')} must be a web link (https://…)` : null;
}
