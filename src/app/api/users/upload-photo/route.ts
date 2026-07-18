import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile } from '@/lib/supabase/storage';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('photo')) as File | null;
    if (!file) return errorResponse('No file uploaded', 400);

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `photo-${auth.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const photo_url = await uploadFile(buffer, fileName, file.type, 'photos');

    await getSupabaseAdmin().from('users').update({ photo_url }).eq('id', auth.id);
    return successResponse({ photo_url });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
