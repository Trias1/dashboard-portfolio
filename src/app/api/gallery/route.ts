import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { uploadFile, deleteFile } from '@/lib/supabase/storage';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const owner_id = request.nextUrl.searchParams.get('owner_id') || auth.id;
    if (!owner_id) return successResponse([]);
    const { data } = await getSupabaseAdmin().from('gallery').select('*').eq('owner_id', owner_id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch (err: any) { return errorResponse(err.message); }
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

    if (file) {
      const ext = file.name.split('.').pop() || 'pdf';
      const fileName = `gallery-${auth.id}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      file_url = await uploadFile(buffer, fileName, file.type, 'gallery');
      image_url = (file.type === 'application/pdf' || ext.toLowerCase() === 'pdf') ? null : file_url;
    } else {
      file_url = formData.get('file_url') as string || null;
      image_url = file_url;
    }

    const { data } = await getSupabaseAdmin().from('gallery').insert({
      title, description, image_url, file_url, issued_date: issued_date || null, owner_id: auth.id,
    }).select().single();
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message); }
}