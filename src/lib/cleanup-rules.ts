import { createHash, timingSafeEqual } from 'node:crypto';

/** Rules for the daily cleanup (src/lib/cleanup.ts). No imports beyond node: so the tests can load it directly. */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Rate-limit windows are 15 minutes; anything an hour old no longer counts toward a limit. */
export const RATE_LIMIT_KEEP_MS = HOUR;
/** Expired sessions are kept a day (their refresh JWTs are expired by then too), as in startSession. */
export const SESSION_KEEP_MS = DAY;
/** A file is uploaded before its form is saved; give an unsaved edit a week before calling the file unused. */
export const ORPHAN_MIN_AGE_MS = 7 * DAY;
export const ORPHAN_MAX_DELETES = 100;

/** Tables whose rows may point at an uploaded file. Any new table holding uploads must be added here. */
export const FILE_REFERENCE_TABLES = [
  'users', 'portfolios', 'about', 'hero', 'projects', 'experience', 'skills', 'services',
  'gallery', 'testimonials', 'custom_sections', 'contact_info',
] as const;

/** Vercel sends `Authorization: Bearer <CRON_SECRET>`. No secret configured means nobody gets in. */
export function isCronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !header) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

export type StoredFile = { path: string; createdAt: string | null };

/**
 * Which files no row mentions and are old enough to go. Returns `skipped` instead when the result
 * looks wrong (most of the bucket unused usually means the reference scan missed a table), so a bug
 * here can never empty the bucket.
 */
export function pickOrphans(files: StoredFile[], referenced: string, now = Date.now()) {
  const unused = files.filter((f) => !referenced.includes(f.path));
  const old = unused.filter((f) => {
    const created = f.createdAt ? Date.parse(f.createdAt) : NaN;
    return Number.isFinite(created) && now - created >= ORPHAN_MIN_AGE_MS;
  });
  if (unused.length > Math.max(10, files.length / 2)) {
    return { remove: [] as string[], unused: unused.length, skipped: 'too many unused files; check FILE_REFERENCE_TABLES' };
  }
  return { remove: old.slice(0, ORPHAN_MAX_DELETES).map((f) => f.path), unused: unused.length, skipped: null as string | null };
}
