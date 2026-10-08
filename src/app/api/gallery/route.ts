import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile } from '@/lib/supabase/storage';
import { sanitizeExternalUrl, validateUpload } from '@/lib/upload-validation';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    // Only superadmin may read another user's data via ?owner_id=
    const requestedOwner = request.nextUrl.searchParams.get('owner_id');
    const owner_id = auth.role === 'superadmin' && requestedOwner ? requestedOwner : auth.id;
    if (!owner_id) return successResponse([]);
    const { data } = await getSupabaseAdmin().from('gallery').select('*').eq('owner_id', owner_id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issued_date = formData.get('issued_date') as string;

    let file_url = null;
    let image_url = null;

    if (file && typeof file !== 'string') {
      const checked = await validateUpload(file, ['image', 'pdf']);
      if (!checked.ok) return errorResponse(checked.error, 400);
      const fileName = `gallery-${auth.id}.${checked.type.ext}`;
      file_url = await uploadFile(checked.buffer, fileName, checked.type.mime, 'gallery');
      image_url = checked.type.kind === 'pdf' ? null : file_url;
    } else {
      const rawUrl = formData.get('file_url');
      file_url = rawUrl ? sanitizeExternalUrl(rawUrl) : null;
      if (rawUrl && !file_url) return errorResponse('Invalid file URL', 400);
      image_url = file_url;
    }

    const { data } = await getSupabaseAdmin().from('gallery').insert({
      title, description, image_url, file_url, issued_date: issued_date || null, owner_id: auth.id,
    }).select().single();
    return successResponse(data, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}