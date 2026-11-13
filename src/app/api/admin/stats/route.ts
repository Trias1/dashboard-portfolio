import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { fetchAllRows } from '@/lib/supabase/paged';
import { visibilityStatus } from '@/lib/portfolio-visibility';
import { dayBuckets, weekBuckets } from '@/lib/admin-growth';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const supabase = getSupabaseAdmin();
    const onlineSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [users, onlineUsers, presenceUsers, portfolios, published, messages, recent, allTemplates] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('last_seen_at', onlineSince),
      supabase.from('users').select('id, name, email, created_at, last_seen_at, last_device, is_active').eq('is_active', true).order('last_seen_at', { ascending: false, nullsFirst: false }),
      supabase.from('portfolios').select('*', { count: 'exact', head: true }),
      supabase.from('portfolios').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('portfolios').select('id, title, slug, template, is_published, updated_at, owner_id').order('updated_at', { ascending: false }).limit(10),
      // Template usage across every portfolio, not just the 10 most recent
      fetchAllRows<{ template: string | null }>((from, to) => supabase.from('portfolios').select('template').order('id').range(from, to)),
    ]);

    if (recent.error) throw recent.error;

    // Growth: sign-ups per week (12 weeks), visits per day across every portfolio (30 days), and which
    // portfolios those visits went to. Contact messages are only counted; their content stays with the owner.
    const now = Date.now();
    const since30 = new Date(now - 30 * 864e5).toISOString();
    const [allUsers, allPortfolios, visits30, messages30] = await Promise.all([
      fetchAllRows<{ id: number; created_at: string | null; is_active: boolean | null }>((from, to) => supabase.from('users').select('id, created_at, is_active').order('id').range(from, to)),
      fetchAllRows<{ id: number; owner_id: number; slug: string; title: string | null; is_published: boolean | null; taken_down_at?: string | null }>((from, to) => supabase.from('portfolios').select('*').order('id').range(from, to)),
      fetchAllRows<{ portfolio_id: number; visited_at: string }>((from, to) => supabase.from('portfolio_visits').select('portfolio_id, visited_at').gte('visited_at', since30).order('id').range(from, to)),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).gte('created_at', since30),
    ]);
    const inactive = new Set(allUsers.filter((u) => u.is_active === false).map((u) => Number(u.id)));
    const statusShare = { live: 0, draft: 0, 'taken-down': 0, 'owner-inactive': 0 };
    for (const p of allPortfolios) {
      const s = visibilityStatus(p, !inactive.has(Number(p.owner_id)));
      if (s !== 'none') statusShare[s] += 1;
    }
    const visitsByPortfolio = new Map<number, number>();
    for (const v of visits30) visitsByPortfolio.set(v.portfolio_id, (visitsByPortfolio.get(v.portfolio_id) || 0) + 1);
    const portfolioById = new Map(allPortfolios.map((p) => [p.id, p]));
    const topPortfolios = [...visitsByPortfolio.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, visits]) => ({ slug: portfolioById.get(id)?.slug || `#${id}`, title: portfolioById.get(id)?.title || null, visits }));
    const templateCounts = allTemplates.reduce<Record<string, number>>((counts, portfolio) => {
      const template = portfolio.template || 'modern';
      counts[template] = (counts[template] || 0) + 1;
      return counts;
    }, {});

    return successResponse({
      users: users.count || 0,
      usersOnline: onlineUsers.count || 0,
      usersOffline: Math.max((users.count || 0) - (onlineUsers.count || 0), 0),
      portfolios: portfolios.count || 0,
      published: published.count || 0,
      draft: Math.max((portfolios.count || 0) - (published.count || 0), 0),
      messages: messages.count || 0,
      templateCounts,
      recentPortfolios: recent.data || [],
      onlineUsers: (presenceUsers.data || []).filter((user) => user.last_seen_at && user.last_seen_at >= onlineSince),
      offlineUsers: (presenceUsers.data || []).filter((user) => !user.last_seen_at || user.last_seen_at < onlineSince),
      signupsByWeek: weekBuckets(allUsers.map((u) => u.created_at), 12, now),
      visitsByDay: dayBuckets(visits30.map((v) => v.visited_at), 30, now),
      visits30: visits30.length,
      topPortfolios,
      statusShare,
      messages30: messages30.count || 0,
    });
  } catch (error) {
    return errorResponse(getErrorMessage(error, 'Unable to load admin stats'), getErrorMessage(error) === 'Forbidden' ? 403 : 500);
  }
}
