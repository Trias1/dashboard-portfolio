import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deleteFile } from '@/lib/supabase/storage';
import { sanitizeExternalUrl } from '@/lib/upload-validation';
import { errorResponse, successResponse } from '@/lib/utils';

const authStatus = (err: unknown) => {
  const message = err instanceof Error ? err.message : '';
  return message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    const { title, description, issued_date, image_url, file_url } = await request.json();
    const updates: Record<string, unknown> = { title, description, issued_date: issued_date || null };
    if (image_url !== undefined) {
      updates.image_url = image_url ? sanitizeExternalUrl(image_url) : null;
      if (image_url && !updates.image_url) return errorResponse('Invalid image URL', 400);
    }
    if (file_url !== undefined) {
      updates.file_url = file_url ? sanitizeExternalUrl(file_url) : null;
      if (file_url && !updates.file_url) return errorResponse('Invalid file URL', 400);
    }
    const { data, error } = await getSupabaseAdmin().from('gallery').update(updates).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    if (error) return errorResponse(error.message, 500);
    if (!data) return errorResponse('Not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;

    const { data: item } = await getSupabaseAdmin().from('gallery').select('file_url, image_url').eq('id', id).eq('owner_id', auth.id).maybeSingle();
    if (item?.file_url) deleteFile(item.file_url, auth.id).catch(() => {});
    if (item?.image_url && item.image_url !== item.file_url) deleteFile(item.image_url, auth.id).catch(() => {});

    await getSupabaseAdmin().from('gallery').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err: any) { return errorResponse(err.message); }
}