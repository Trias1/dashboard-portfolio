import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isCronAuthorized } from '@/lib/cleanup-rules';
import { runCleanup } from '@/lib/cleanup';

// Daily housekeeping, called by Vercel Cron (vercel.json) with `Authorization: Bearer <CRON_SECRET>`.
// `?dry=1` reports what would be removed without removing anything.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const dryRun = request.nextUrl.searchParams.get('dry') === '1';
  const report = await runCleanup(getSupabaseAdmin(), { bucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads', dryRun });
  // One line in the Vercel logs per run: counts only, no file names or row data.
  console.log('[cron cleanup]', JSON.stringify(report));
  const failed = [report.rateLimits, report.sessions, report.resetTokens, report.files].some((step) => step.error);
  return Response.json(report, { status: failed ? 500 : 200, headers: { 'Cache-Control': 'no-store' } });
}
