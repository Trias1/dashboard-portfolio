import { getSupabaseAdmin } from './supabase/admin';
import { fetchAllRows } from './supabase/paged';
import { storagePathsIn } from './portfolio-visibility';

/** Every table with rows that belong to one account (`owner_id`). Add new per-owner tables here. */
export const OWNER_TABLES = [
  'hero', 'about', 'experience', 'projects', 'skills', 'services', 'gallery', 'testimonials',
  'custom_sections', 'contact_info', 'contact_messages', 'notification_emails',
] as const;

/**
 * Delete an account and everything it owns: portfolio content, messages, visits, sessions and its uploaded files.
 * Rows are deleted table by table instead of relying on foreign-key cascades (not all are known to cascade);
 * the first failure stops it with an error naming the table, before the account row itself goes.
 * Uploaded files are removed last and best-effort: anything left behind is removed by the daily cleanup.
 */
export async function deleteAccount(userId: number): Promise<{ files: number }> {
  const db = getSupabaseAdmin();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

  const { data: user, error: userError } = await db.from('users').select('*').eq('id', userId).maybeSingle();
  if (userError) throw new Error(`Could not read the account (${userError.code || 'db'})`);
  if (!user) throw new Error('User not found');
  const { data: portfolios, error: portfolioError } = await db.from('portfolios').select('*').eq('owner_id', userId);
  if (portfolioError) throw new Error(`Could not read the portfolio (${portfolioError.code || 'db'})`);

  // Collect the files this account's rows point at before the rows are gone.
  const texts: string[] = [JSON.stringify(user), JSON.stringify(portfolios || [])];
  for (const table of OWNER_TABLES) {
    if (table === 'contact_messages' || table === 'notification_emails') continue;
    const rows = await fetchAllRows((from, to) => db.from(table).select('*').eq('owner_id', userId).order('id', { ascending: true }).range(from, to));
    texts.push(JSON.stringify(rows));
  }
  const files = storagePathsIn(texts.join('\n'), bucket);

  const step = async (label: string, run: () => PromiseLike<{ error: { code?: string; message?: string } | null }>) => {
    const { error } = await run();
    if (error) throw new Error(`Could not delete ${label} (${error.code || error.message || 'db'})`);
  };
  const portfolioIds = (portfolios || []).map((p) => p.id);
  if (portfolioIds.length) await step('portfolio_visits', () => db.from('portfolio_visits').delete().in('portfolio_id', portfolioIds));
  for (const table of OWNER_TABLES) await step(table, () => db.from(table).delete().eq('owner_id', userId));
  await step('portfolios', () => db.from('portfolios').delete().eq('owner_id', userId));
  await step('auth_sessions', () => db.from('auth_sessions').delete().eq('user_id', userId));
  await step('the account', () => db.from('users').delete().eq('id', userId));

  if (files.length) {
    const { error } = await db.storage.from(bucket).remove(files);
    if (error) console.error('[delete account] files left for the daily cleanup', error.message);
  }
  return { files: files.length };
}
