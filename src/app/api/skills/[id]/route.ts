import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

const authStatus = (err: unknown) => {
  const message = err instanceof Error ? err.message : '';
  return message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const { title, skills } = await request.json();
    const updates = { title, skills };
    const { data, error } = await getSupabaseAdmin().from('skills').update(updates).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    if (error) return errorResponse(error.message, 500);
    if (!data) return errorResponse('Not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    await getSupabaseAdmin().from('skills').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}