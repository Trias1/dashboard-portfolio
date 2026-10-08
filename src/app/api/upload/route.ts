import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isUploadFolder, uploadFile } from '@/lib/supabase/storage';
import { validateUpload } from '@/lib/upload-validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rl = await checkRateLimit(`upload:${auth.id}`, 'upload');
    if (!rl.allowed) return errorResponse('Too many uploads. Please try again later.', 429);
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';
    if (!isUploadFolder(folder) || folder === 'cv') return errorResponse('Invalid folder', 400);

    const checked = await validateUpload(file, ['image']);
    if (!checked.ok) return errorResponse(checked.error, 400);

    const fileName = `${folder}-${auth.id}.${checked.type.ext}`;
    const publicUrl = await uploadFile(checked.buffer, fileName, checked.type.mime, folder);

    return successResponse({ url: publicUrl, fileName: publicUrl.split('/').pop(), size: checked.buffer.length });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
