import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/admin-audit';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

const missingTable = (error: { code?: string } | null) => !!error && (error.code === '42P01' || error.code === 'PGRST205');
const status = (err: unknown) => (getErrorMessage(err) === 'Forbidden' ? 403 : getErrorMessage(err) === 'Unauthorized' ? 401 : 500);

/** Visitor reports (migration 009): open ones first, then the last 20 handled. */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const db = getSupabaseAdmin();
    if (request.nextUrl.searchParams.get('count') === '1') {
      const { count, error } = await db.from('portfolio_reports').select('*', { count: 'exact', head: true }).eq('status', 'open');
      return successResponse({ open: error ? 0 : count || 0 });
    }
    const [open, handled] = await Promise.all([
      db.from('portfolio_reports').select('id, portfolio_id, reason, details, reporter_hash, status, created_at, resolved_at')
        .eq('status', 'open').order('created_at', { ascending: false }).limit(100),
      db.from('portfolio_reports').select('id, portfolio_id, reason, details, reporter_hash, status, created_at, resolved_at')
        .neq('status', 'open').order('resolved_at', { ascending: false }).limit(20),
    ]);
    if (missingTable(open.error)) return successResponse({ reports: [], missingTable: true });
    if (open.error) throw open.error;
    const rows = [...(open.data || []), ...(handled.data || [])];
    const ids = [...new Set(rows.map((r) => r.portfolio_id))];
    const { data: portfolios } = ids.length
      ? await db.from('portfolios').select('*').in('id', ids)
      : { data: [] as Record<string, unknown>[] };
    const byId = new Map((portfolios || []).map((p) => [p.id, p]));
    return successResponse({
      missingTable: false,
      reports: rows.map(({ reporter_hash, ...r }) => {
        const p = byId.get(r.portfolio_id) as { slug?: string; owner_id?: number; taken_down_at?: string | null } | undefined;
        // How many open reports came from the same person, so one angry visitor doesn't look like many.
        const fromSame = reporter_hash ? (open.data || []).filter((o) => o.reporter_hash === reporter_hash).length : 1;
        return { ...r, slug: p?.slug ?? null, owner_id: p?.owner_id ?? null, taken_down: !!p?.taken_down_at, from_same_reporter: fromSame };
      }),
    });
  } catch (err) {
    return errorResponse(getErrorMessage(err), status(err));
  }
}

/** `{ id, action: 'dismiss' }`: close a report without acting on the portfolio. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    if (body.action !== 'dismiss' || typeof body.id !== 'number') return errorResponse('Unknown action', 400);
    const db = getSupabaseAdmin();
    const { data, error } = await db.from('portfolio_reports')
      .update({ status: 'dismissed', resolved_at: new Date().toISOString(), resolved_by: auth.id })
      .eq('id', body.id).eq('status', 'open').select('portfolio_id, reason').maybeSingle();
    if (error) return errorResponse('That change could not be saved', 500);
    if (!data) return errorResponse('Report not found or already handled', 404);
    const { data: p } = await db.from('portfolios').select('slug, owner_id').eq('id', data.portfolio_id).maybeSingle();
    await logAdminAction({ actorId: auth.id, action: 'report-dismiss', targetUserId: p?.owner_id ?? null, targetLabel: p?.slug ?? null, details: { reason: data.reason } });
    return successResponse({ message: 'Report dismissed' });
  } catch (err) {
    return errorResponse(getErrorMessage(err), status(err));
  }
}
