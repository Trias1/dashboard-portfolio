import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile } from '@/lib/supabase/storage';
import { validateUpload } from '@/lib/upload-validation';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const checked = await validateUpload(formData.get('cv'), ['pdf', 'doc']);
    if (!checked.ok) return errorResponse(checked.error === 'Unsupported file type' ? 'Only PDF, DOC, DOCX allowed' : checked.error, 400);

    const fileName = `cv-${auth.id}.${checked.type.ext}`;
    const cv_url = await uploadFile(checked.buffer, fileName, checked.type.mime, 'cv');

    const { data: existing } = await getSupabaseAdmin().from('about').select('id').eq('owner_id', auth.id).maybeSingle();

    if (existing) {
      await getSupabaseAdmin()
        .from('about')
        .update({ cv_url, updated_at: new Date().toISOString() })
        .eq('owner_id', auth.id);
    } else {
      await getSupabaseAdmin().from('about').insert({ owner_id: auth.id, cv_url });
    }

    return successResponse({ cv_url });
  } catch (err: any) { return errorResponse(err.message); }
}
