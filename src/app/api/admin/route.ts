import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const [users, portfolios, published, messages] = await Promise.all([
      getSupabaseAdmin().from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      getSupabaseAdmin().from('portfolios').select('*', { count: 'exact', head: true }),
      getSupabaseAdmin().from('portfolios').select('*', { count: 'exact', head: true }).eq('is_published', true),
      getSupabaseAdmin().from('contact_messages').select('*', { count: 'exact', head: true }),
    ]);

    return successResponse({
      users: users.count || 0,
      portfolios: portfolios.count || 0,
      published: published.count || 0,
      messages: messages.count || 0,
    });
  } catch (err) {
    // Default path maps Unauthorized/Forbidden to 401/403 and hides other errors behind a 500
    return errorResponse(getErrorMessage(err));
  }
}
