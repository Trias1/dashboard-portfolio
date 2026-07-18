import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deleteFile } from '@/lib/supabase/storage';
import { errorResponse, successResponse } from '@/lib/utils';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;

    const { data: item } = await getSupabaseAdmin().from('gallery').select('file_url, image_url').eq('id', id).eq('owner_id', auth.id).maybeSingle();
    if (item?.file_url) deleteFile(item.file_url).catch(() => {});
    if (item?.image_url && item.image_url !== item.file_url) deleteFile(item.image_url).catch(() => {});

    await getSupabaseAdmin().from('gallery').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err: any) { return errorResponse(err.message); }
}