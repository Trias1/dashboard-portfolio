import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { saveOwnerRow } from '@/lib/supabase/owner-row';
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
    const checked = await validateUpload(formData.get('cv'), ['pdf', 'doc']);
    if (!checked.ok) return errorResponse(checked.error === 'Unsupported file type' ? 'Only PDF, DOC, DOCX allowed' : checked.error, 400);

    const fileName = `cv-${auth.id}.${checked.type.ext}`;
    const cv_url = await uploadFile(checked.buffer, fileName, checked.type.mime, 'cv');

    await saveOwnerRow('about', auth.id, { cv_url }, { touch: true });

    return successResponse({ cv_url });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
