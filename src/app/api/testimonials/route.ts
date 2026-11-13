import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';
import { putInlineImages, takeInlineImages } from '@/lib/supabase/inline-images';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { data } = await getSupabaseAdmin().from('testimonials').select('*').eq('owner_id', auth.id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    // Old rows hold base64 photos: check them now, store them once the rest of the body is valid
    const inline = takeInlineImages(body, ['photo_url']);
    if ('error' in inline) return errorResponse(inline.error, 400);
    const invalid = checkSectionBody(body, { links: ['photo_url'] });
    if (invalid) return errorResponse(invalid, 400);
    const stored = await putInlineImages(body, inline.images, auth.id, 'testimonials');
    if ('error' in stored) return errorResponse(stored.error, 429);
    const { name, position, message, photo_url } = body;
    const { data } = await getSupabaseAdmin().from('testimonials').insert({ name, position, message, photo_url, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
