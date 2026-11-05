import { cleanLinkFields } from './upload-validation';
import { GENERIC_CUSTOM_TYPES, buildGenericContent, genericType } from './custom-content';

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

// Link fields typed custom sections use (certifications: credential and image links).
const CUSTOM_LINK_FIELDS = ['credential_url', 'credentialUrl', 'imageUrl', 'image_url', 'url'];
const MAX_CUSTOM_CONTENT = 50000;

/**
 * Checks the nested `content` of a custom section, which checkSectionBody (top-level strings only) can't see.
 * Free-form types are rebuilt with only their own field and web links; typed sections get their link fields
 * cleaned like every other route. Returns the content to store, or an error for the client.
 */
export function checkCustomContent(type: unknown, content: unknown): { content: Record<string, unknown> } | { error: string } {
  const raw = content && typeof content === 'object' && !Array.isArray(content) ? (content as Record<string, unknown>) : {};
  let cleaned: Record<string, unknown>;
  if ((GENERIC_CUSTOM_TYPES as readonly string[]).includes(type as string)) {
    cleaned = buildGenericContent(genericType(type), raw) as Record<string, unknown>;
  } else {
    cleaned = { ...raw };
    const bad = cleanLinkFields(cleaned, CUSTOM_LINK_FIELDS.filter((key) => key in cleaned));
    if (bad) return { error: `${bad.replace(/_/g, ' ')} must be a web link (https://…)` };
  }
  if (JSON.stringify(cleaned).length > MAX_CUSTOM_CONTENT) return { error: 'This section is too long' };
  return { content: cleaned };
}
