import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAllRows } from './supabase/paged';
import { UPLOAD_FOLDERS } from './supabase/storage';
import { FILE_REFERENCE_TABLES, RATE_LIMIT_KEEP_MS, SESSION_KEEP_MS, pickOrphans, type StoredFile } from './cleanup-rules';

/**
 * Daily housekeeping (Vercel Cron → /api/cron/cleanup). Visits are kept on purpose: the dashboard's
 * "Total" is all-time. Contact messages and accounts are never touched.
 */

type Step = { removed?: number; cleared?: number; unused?: number; skipped?: string; error?: string };
export type CleanupReport = { dryRun: boolean; rateLimits: Step; sessions: Step; resetTokens: Step; files: Step };

const message = (error: unknown) =>
  error && typeof error === 'object' && 'message' in error ? String((error as { message: unknown }).message) : String(error);

async function countOrDelete(db: SupabaseClient, table: string, column: string, before: string, dryRun: boolean): Promise<Step> {
  if (dryRun) {
    const { count, error } = await db.from(table).select('*', { count: 'exact', head: true }).lt(column, before);
    return error ? { error: error.code || error.message } : { removed: count || 0 };
  }
  const { count, error } = await db.from(table).delete({ count: 'exact' }).lt(column, before);
  return error ? { error: error.code || error.message } : { removed: count || 0 };
}

async function listBucket(db: SupabaseClient, bucket: string): Promise<StoredFile[]> {
  const files: StoredFile[] = [];
  for (const folder of UPLOAD_FOLDERS) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.storage.from(bucket).list(folder, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      // Entries without an id are sub-folders; uploads never create those.
      for (const f of data || []) if (f.id) files.push({ path: `${folder}/${f.name}`, createdAt: f.created_at || null });
      if (!data || data.length < 1000) break;
    }
  }
  return files;
}

async function cleanFiles(db: SupabaseClient, bucket: string, dryRun: boolean): Promise<Step> {
  // Every row of every table that can hold an upload, as one string to search. A failed read stops the step.
  const parts: string[] = [];
  for (const table of FILE_REFERENCE_TABLES) {
    const rows = await fetchAllRows((from, to) => db.from(table).select('*').order('id', { ascending: true }).range(from, to));
    parts.push(JSON.stringify(rows));
  }
  const { remove, unused, skipped } = pickOrphans(await listBucket(db, bucket), parts.join('\n'));
  if (skipped) return { unused, skipped };
  if (!dryRun && remove.length) {
    const { error } = await db.storage.from(bucket).remove(remove);
    if (error) return { unused, error: error.message };
  }
  return { unused, removed: remove.length };
}

export async function runCleanup(db: SupabaseClient, options: { bucket: string; dryRun?: boolean; now?: number }): Promise<CleanupReport> {
  const now = options.now ?? Date.now();
  const dryRun = !!options.dryRun;
  const iso = (ms: number) => new Date(now - ms).toISOString();
  // Each step runs on its own: one failing doesn't stop the others.
  const guard = async (step: () => Promise<Step>): Promise<Step> => {
    try { return await step(); } catch (error) { return { error: message(error) }; }
  };

  const rateLimits = await guard(() => countOrDelete(db, 'rate_limits', 'created_at', iso(RATE_LIMIT_KEEP_MS), dryRun));
  const sessions = await guard(() => countOrDelete(db, 'auth_sessions', 'expires_at', iso(SESSION_KEEP_MS), dryRun));
  // Expired reset links can't be used anyway; drop the stored hashes.
  const resetTokens = await guard(async () => {
    const expired = () => db.from('users').select('id', { count: 'exact', head: true }).not('reset_token', 'is', null).lt('reset_token_expires', iso(0));
    if (dryRun) {
      const { count, error } = await expired();
      return error ? { error: error.code || error.message } : { cleared: count || 0 };
    }
    const { count, error } = await db.from('users').update({ reset_token: null, reset_token_expires: null }, { count: 'exact' })
      .not('reset_token', 'is', null).lt('reset_token_expires', iso(0));
    return error ? { error: error.code || error.message } : { cleared: count || 0 };
  });
  const files = await guard(() => cleanFiles(db, options.bucket, dryRun));
  return { dryRun, rateLimits, sessions, resetTokens, files };
}
