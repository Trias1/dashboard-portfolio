import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile } from '@/lib/supabase/storage';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get('cv') as File | null;
    if (!file) return errorResponse('No file uploaded', 400);

    const ext = file.name.split('.').pop() || 'pdf';
    const allowed = ['pdf', 'doc', 'docx'];
    if (!allowed.includes(ext.toLowerCase())) return errorResponse('Only PDF, DOC, DOCX allowed', 400);

    const fileName = `cv-${auth.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const cv_url = await uploadFile(buffer, fileName, file.type, 'cv');

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
