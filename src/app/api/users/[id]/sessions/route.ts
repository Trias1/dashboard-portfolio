import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

/**
 * An account's signed-in devices: one per session family (a login), newest activity first.
 * A family's live row is the one not yet revoked and not expired.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(request);
    const rawId = (await params).id;
    if (!/^\d+$/.test(rawId)) return errorResponse('User not found', 404);
    const { data, error } = await getSupabaseAdmin().from('auth_sessions')
      .select('family_id, user_agent, created_at, expires_at')
      .eq('user_id', Number(rawId))
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return successResponse({ sessions: [] });
    const seen = new Set<string>();
    const sessions = (data || []).filter((row) => !seen.has(row.family_id) && seen.add(row.family_id))
      .map((row) => ({ device: row.user_agent || 'Unknown device', last_active: row.created_at, expires_at: row.expires_at }));
    return successResponse({ sessions });
  } catch (err) {
    const message = getErrorMessage(err);
    return errorResponse(message, message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500);
  }
}
