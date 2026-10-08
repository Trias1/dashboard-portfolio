import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revokeAllSessions } from '@/lib/sessions';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { role, is_active } = body;
    const updates: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!['superadmin', 'admin', 'user'].includes(role)) return errorResponse('Invalid role', 400);
      updates.role = role;
    }
    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') return errorResponse('Invalid is_active', 400);
      updates.is_active = is_active;
    }
    if (!Object.keys(updates).length) return errorResponse('Nothing to update', 400);
    // Don't lock yourself out of the admin panel.
    if (auth.id === parseInt(id, 10) && (updates.role && updates.role !== 'superadmin' || updates.is_active === false)) {
      return errorResponse("You can't demote or deactivate your own account", 400);
    }
    const { data, error } = await getSupabaseAdmin().from('users').update(updates).eq('id', id).select('id, name, email, role, is_active, is_verified').maybeSingle();
    if (error || !data) return errorResponse('User not found', 404);
    // Deactivated or role changed: end their sessions so it applies right away, not when tokens expire.
    if (updates.is_active === false || updates.role !== undefined) await revokeAllSessions(data.id);
    return successResponse(data);
  } catch (err) {
    return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Forbidden' ? 403 : 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const { id } = await params;
    if (auth.id === parseInt(id)) return errorResponse('Cannot delete yourself', 400);
    await getSupabaseAdmin().from('users').delete().eq('id', id);
    return successResponse({ message: 'User deleted successfully' });
  } catch (err) {
    return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Forbidden' ? 403 : 500);
  }
}