import { getSupabaseAdmin } from './supabase/admin';
import { isPubliclyVisible } from './portfolio-visibility';

/**
 * The one place that decides whether the public may see a portfolio: published, not taken down, owner active.
 * Every public route (page, share card, contact form, chat, visit counter, sitemap, counts) goes through here.
 * Selects `*` on purpose: taken_down_at only exists once migration 008 has run, and naming it would fail before.
 */

type Row = Record<string, unknown> & { id: number; owner_id: number; slug: string; is_published?: boolean | null; taken_down_at?: string | null };

async function ownerIsActive(ownerId: number): Promise<boolean> {
  const { data } = await getSupabaseAdmin().from('users').select('is_active').eq('id', ownerId).maybeSingle();
  return !!data && data.is_active !== false;
}

/** The portfolio row at `slug` when the public may see it, else null. */
export async function findPublicPortfolio(slug: string): Promise<Row | null> {
  if (!slug) return null;
  const { data } = await getSupabaseAdmin().from('portfolios').select('*').eq('slug', slug).maybeSingle();
  const row = data as Row | null;
  if (!row || !row.is_published || row.taken_down_at) return null;
  return isPubliclyVisible(row, await ownerIsActive(row.owner_id)) ? row : null;
}

/** Whether the public may see this already loaded portfolio row. */
export async function isRowPublic(row: Row | null | undefined): Promise<boolean> {
  if (!row || !row.is_published || row.taken_down_at) return false;
  return isPubliclyVisible(row, await ownerIsActive(row.owner_id));
}

/** Every portfolio the public may see, for the sitemap and the home page count. */
export async function listPublicPortfolios(): Promise<Row[]> {
  const db = getSupabaseAdmin();
  const [{ data: published, error }, { data: inactive }] = await Promise.all([
    db.from('portfolios').select('*').eq('is_published', true),
    db.from('users').select('id').eq('is_active', false),
  ]);
  if (error) throw error;
  const off = new Set((inactive || []).map((u) => Number(u.id)));
  return ((published || []) as Row[]).filter((row) => isPubliclyVisible(row, !off.has(Number(row.owner_id))));
}
