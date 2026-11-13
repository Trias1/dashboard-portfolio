import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyMailer } from '@/lib/mailer';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Supabase free plan limits the meters are drawn against. */
const FREE_DB_BYTES = 500 * 1024 * 1024;
const FREE_STORAGE_BYTES = 1024 * 1024 * 1024;

const withTimeout = <T,>(work: Promise<T>, ms: number) =>
  Promise.race([work, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timed out')), ms))]);

async function timed<T>(work: () => Promise<T>) {
  const start = Date.now();
  try {
    await work();
    return { ok: true, ms: Date.now() - start, error: null as string | null };
  } catch (error) {
    return { ok: false, ms: Date.now() - start, error: getErrorMessage(error).slice(0, 160) };
  }
}

/**
 * One look at whether the services the app leans on are fine: database and storage use against the free plan,
 * the AI provider, the mail server, and the last daily cleanup. Read-only; sends no mail and spends no AI tokens.
 */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const db = getSupabaseAdmin();

    const aiKey = process.env.NINE_ROUTER_API_KEY;
    const aiBase = (process.env.NINE_ROUTER_BASE_URL || 'https://router.zeen.my.id/v1').replace(/\/$/, '');
    const [usage, ai, mail, lastCleanup, openReports] = await Promise.all([
      db.rpc('admin_usage'),
      aiKey
        // Lists models only: proves the router is up and the key works, without running a model.
        ? timed(async () => {
          const res = await withTimeout(fetch(`${aiBase}/models`, { headers: { Authorization: `Bearer ${aiKey}` }, cache: 'no-store' }), 6000);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        })
        : Promise.resolve(null),
      process.env.GMAIL_USER ? timed(() => withTimeout(verifyMailer(), 8000)) : Promise.resolve(null),
      db.from('admin_actions').select('created_at, details').eq('action', 'cleanup').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('portfolio_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    const u = usage.error ? null : (usage.data as { db_bytes: number; storage_bytes: number; storage_objects: number } | null);
    return successResponse({
      checkedAt: new Date().toISOString(),
      usage: u ? {
        db: { used: Number(u.db_bytes), limit: FREE_DB_BYTES },
        storage: { used: Number(u.storage_bytes), limit: FREE_STORAGE_BYTES, files: Number(u.storage_objects) },
      } : null,
      usageMissing: !!usage.error,
      ai: ai ? { ...ai, enabled: process.env.NEXT_PUBLIC_AI_ENABLED === 'true' } : null,
      mail,
      lastCleanup: lastCleanup.data ? { at: lastCleanup.data.created_at, report: lastCleanup.data.details } : null,
      openReports: openReports.error ? null : openReports.count || 0,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    return errorResponse(message, message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500);
  }
}
