import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { fetchAllRows } from '@/lib/supabase/paged';

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { data: portfolio } = await getSupabaseAdmin().from('portfolios').select('id').eq('owner_id', auth.id).limit(1).maybeSingle();
    if (!portfolio) return successResponse({ total: 0, today: 0, week: 0, chart: [] });

    const pid = portfolio.id;
    const { from, to } = Object.fromEntries(request.nextUrl.searchParams);

    const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = to ? new Date(to) : new Date();
    if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) return errorResponse('Invalid date range', 400);
    if (dateFrom.getTime() > dateTo.getTime()) return errorResponse('Invalid date range', 400);
    dateTo.setHours(23, 59, 59, 999);

    if (dateTo.getTime() - dateFrom.getTime() > MAX_RANGE_MS) return errorResponse('Pick a range of one year or less', 400);

    const db = getSupabaseAdmin();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count: total }, { count: today }, { count: week }, visits] = await Promise.all([
      db.from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid),
      db.from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid).gte('visited_at', oneDayAgo),
      db.from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid).gte('visited_at', sevenDaysAgo),
      // Daily chart: every visit in the range, read in pages (a single select stops at 1,000 rows)
      fetchAllRows<{ visited_at: string }>((from, to) => db
        .from('portfolio_visits')
        .select('visited_at')
        .eq('portfolio_id', pid)
        .gte('visited_at', dateFrom.toISOString())
        .lte('visited_at', dateTo.toISOString())
        .order('visited_at', { ascending: true })
        .range(from, to)),
    ]);

    const chart: Record<string, number> = {};
    visits.forEach(v => {
      const d = new Date(v.visited_at).toISOString().split('T')[0];
      chart[d] = (chart[d] || 0) + 1;
    });
    const chartData = Object.entries(chart).map(([date, count]) => ({ date, count }));

    return successResponse({ total: total || 0, today: today || 0, week: week || 0, chart: chartData, from: dateFrom, to: dateTo });
  } catch (err) { return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Unauthorized' ? 401 : 500); }
}
