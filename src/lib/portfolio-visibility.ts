/**
 * Who may see a portfolio. No imports so the tests can load it directly; the database lookups that feed it
 * live in src/lib/public-access.ts.
 */

export type VisibilityFields = { is_published?: boolean | null; taken_down_at?: string | null };

/** Published, not taken down by a superadmin, and its owner's account is active. */
export function isPubliclyVisible(portfolio: VisibilityFields | null | undefined, ownerActive: boolean | null | undefined): boolean {
  return !!portfolio?.is_published && !portfolio.taken_down_at && ownerActive !== false;
}

/** Why the public can't see it, for the owner's dashboard and the admin list. */
export function visibilityStatus(portfolio: VisibilityFields | null | undefined, ownerActive: boolean | null | undefined) {
  if (!portfolio) return 'none' as const;
  if (portfolio.taken_down_at) return 'taken-down' as const;
  if (ownerActive === false) return 'owner-inactive' as const;
  return portfolio.is_published ? 'live' as const : 'draft' as const;
}

/** Storage paths (`folder/name`) of our own uploads mentioned anywhere in `text`. */
export function storagePathsIn(text: string, bucket: string): string[] {
  const escaped = bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`/storage/v1/object/public/${escaped}/([a-z]+/[A-Za-z0-9_.-]+)`, 'g');
  return [...new Set([...text.matchAll(re)].map((m) => m[1]).filter((p) => !p.includes('..')))];
}
