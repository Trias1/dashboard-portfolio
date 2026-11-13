import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/paged';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

type PortfolioRow = { id: number; owner_id: number; slug: string; is_published: boolean | null; taken_down_at?: string | null; takedown_reason?: string | null };

/** Every account with its portfolio, for the superadmin Users panel. */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const db = getSupabaseAdmin();
    const [users, portfolios] = await Promise.all([
      fetchAllRows<Record<string, unknown>>((from, to) => db.from('users')
        .select('id, name, email, role, is_verified, is_active, created_at, last_seen_at')
        .order('created_at', { ascending: false }).range(from, to)),
      // `*`: the takedown columns only exist once migration 008 has run
      fetchAllRows<PortfolioRow>((from, to) => db.from('portfolios').select('*').order('id').range(from, to)),
    ]);
    const byOwner = new Map(portfolios.map((p) => [Number(p.owner_id), p]));
    return successResponse(users.map((user) => {
      const p = byOwner.get(Number(user.id));
      return {
        ...user,
        portfolio: p ? {
          id: p.id, slug: p.slug, is_published: !!p.is_published,
          taken_down_at: p.taken_down_at ?? null, takedown_reason: p.takedown_reason ?? null,
        } : null,
      };
    }));
  } catch (err) {
    // Default path maps Unauthorized/Forbidden to 401/403 and hides other errors behind a 500
    return errorResponse(getErrorMessage(err));
  }
}
