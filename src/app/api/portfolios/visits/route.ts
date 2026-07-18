import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { data: portfolio } = await getSupabaseAdmin().from('portfolios').select('id').eq('owner_id', auth.id).limit(1).maybeSingle();
    if (!portfolio) return successResponse({ total: 0, today: 0, week: 0, chart: [] });

    const pid = portfolio.id;
    const { from, to } = Object.fromEntries(request.nextUrl.searchParams);

    const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = to ? new Date(to) : new Date();
    dateTo.setHours(23, 59, 59, 999);

    // Use raw queries for Supabase aggregations
    const { count: total } = await getSupabaseAdmin().from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: today } = await getSupabaseAdmin().from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid).gte('visited_at', oneDayAgo);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: week } = await getSupabaseAdmin().from('portfolio_visits').select('*', { count: 'exact', head: true }).eq('portfolio_id', pid).gte('visited_at', sevenDaysAgo);

    // Get daily chart data
    const { data: visits } = await getSupabaseAdmin()
      .from('portfolio_visits')
      .select('visited_at')
      .eq('portfolio_id', pid)
      .gte('visited_at', dateFrom.toISOString())
      .lte('visited_at', dateTo.toISOString())
      .order('visited_at', { ascending: true });

    const chart: Record<string, number> = {};
    visits?.forEach(v => {
      const d = new Date(v.visited_at).toISOString().split('T')[0];
      chart[d] = (chart[d] || 0) + 1;
    });
    const chartData = Object.entries(chart).map(([date, count]) => ({ date, count }));

    return successResponse({ total: total || 0, today: today || 0, week: week || 0, chart: chartData, from: dateFrom, to: dateTo });
  } catch (err: any) { return errorResponse(err.message); }
}
