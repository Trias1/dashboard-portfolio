import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

/** The latest superadmin actions (migration 008), newest first, with the name of who did each. ?limit= (max 500), ?action= */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const db = getSupabaseAdmin();
    const params = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(Number(params.get('limit')) || 50, 1), 500);
    const action = params.get('action');
    let query = db.from('admin_actions')
      .select('id, actor_id, action, target_user_id, target_label, details, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (action && /^[a-z-]{1,40}$/.test(action)) query = query.eq('action', action);
    const { data, error } = await query;
    // Table not created yet: say so instead of failing the panel.
    if (error) return successResponse({ entries: [], missingTable: error.code === '42P01' || error.code === 'PGRST205' });
    const actorIds = [...new Set((data || []).map((row) => row.actor_id).filter((value) => value != null))];
    const { data: actors } = actorIds.length
      ? await db.from('users').select('id, name, email').in('id', actorIds)
      : { data: [] as { id: number; name: string | null; email: string }[] };
    const actorName = new Map((actors || []).map((a) => [a.id, a.name || a.email]));
    return successResponse({
      entries: (data || []).map((row) => ({ ...row, actor: row.action === 'cleanup' ? 'Daily cleanup' : row.actor_id != null ? actorName.get(row.actor_id) || 'Deleted account' : 'Deleted account' })),
      missingTable: false,
    });
  } catch (err) {
    return errorResponse(getErrorMessage(err));
  }
}
