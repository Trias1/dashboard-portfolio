import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile } from '@/lib/supabase/storage';
import { validateUpload } from '@/lib/upload-validation';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rl = await checkRateLimit(`upload:${auth.id}`, 'upload');
    if (!rl.allowed) return errorResponse('Too many uploads. Please try again later.', 429);
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('photo');
    const checked = await validateUpload(file, ['image']);
    if (!checked.ok) return errorResponse(checked.error, 400);

    const fileName = `photo-${auth.id}.${checked.type.ext}`;
    const photo_url = await uploadFile(checked.buffer, fileName, checked.type.mime, 'photos');

    await getSupabaseAdmin().from('users').update({ photo_url }).eq('id', auth.id);
    return successResponse({ photo_url });
  } catch (err) {
    return errorResponse(getErrorMessage(err));
  }
}
