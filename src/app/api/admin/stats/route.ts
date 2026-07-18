import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const supabase = getSupabaseAdmin();
    const onlineSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [users, onlineUsers, presenceUsers, portfolios, published, messages, recent] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('last_seen_at', onlineSince),
      supabase.from('users').select('id, name, email, created_at, last_seen_at, last_device, is_active').eq('is_active', true).order('last_seen_at', { ascending: false, nullsFirst: false }),
      supabase.from('portfolios').select('*', { count: 'exact', head: true }),
      supabase.from('portfolios').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('portfolios').select('id, title, slug, template, is_published, updated_at, owner_id').order('updated_at', { ascending: false }).limit(10),
    ]);

    if (recent.error) throw recent.error;
    const templateCounts = (recent.data || []).reduce<Record<string, number>>((counts, portfolio) => {
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
    });
  } catch (error: any) {
    return errorResponse(error?.message || 'Unable to load admin stats', error?.message === 'Forbidden' ? 403 : 500);
  }
}
