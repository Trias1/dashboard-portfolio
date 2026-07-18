import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { role, is_active } = body;
    const updates: any = {};
    if (role) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (role && !['superadmin', 'admin', 'user'].includes(role)) return errorResponse('Invalid role', 400);
    const { data } = await getSupabaseAdmin().from('users').update(updates).eq('id', id).select('id, name, email, role, is_active, is_verified').single();
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.message === 'Forbidden' ? 403 : 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const { id } = await params;
    if (auth.id === parseInt(id)) return errorResponse('Cannot delete yourself', 400);
    await getSupabaseAdmin().from('users').delete().eq('id', id);
    return successResponse({ message: 'User deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, err.message === 'Forbidden' ? 403 : 500);
  }
}