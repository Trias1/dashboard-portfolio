/**
 * Portfolio slugs (the /portfolio/<slug> part). "demo" is served from built-in sample data by
 * /api/public/demo, so a user who claimed it would never see their own page; the other names would
 * let a portfolio pass for a page of the app itself.
 */
const RESERVED = new Set(['demo', 'example', 'admin', 'api', 'dashboard', 'login', 'register', 'settings', 'portfolio', 'portfoliokit', 'www']);

export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

export const normalizeSlug = (raw: string) =>
  raw.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

/** The cleaned slug, or an error message to show the user. */
export function checkSlug(raw: unknown): { slug: string } | { error: string } {
  if (typeof raw !== 'string') return { error: 'Invalid slug' };
  const slug = normalizeSlug(raw);
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) return { error: `Slug must be ${SLUG_MIN}-${SLUG_MAX} letters, numbers or dashes` };
  if (RESERVED.has(slug)) return { error: `"${slug}" is reserved. Pick another slug.` };
  return { slug };
}
