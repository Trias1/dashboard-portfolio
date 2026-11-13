import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';
import { dropInlineImages, putInlineImages, takeInlineImages } from '@/lib/supabase/inline-images';

const authStatus = (err: unknown) => {
  const message = err instanceof Error ? err.message : '';
  return message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    // Old rows hold base64 photos: check them now, store them once the rest of the body is valid
    const inline = takeInlineImages(body, ['photo_url']);
    if ('error' in inline) return errorResponse(inline.error, 400);
    const invalid = checkSectionBody(body, { links: ['photo_url'] });
    if (invalid) return errorResponse(invalid, 400);
    const stored = await putInlineImages(body, inline.images, auth.id, 'testimonials');
    if ('error' in stored) return errorResponse(stored.error, 429);
    const { name, position, message, photo_url } = body;
    const updates = { name, position, message, photo_url };
    const { data, error } = await getSupabaseAdmin().from('testimonials').update(updates).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    if (error) return errorResponse(error.message, 500);
    if (!data) {
      await dropInlineImages(stored.urls, auth.id);
      return errorResponse('Not found', 404);
    }
    return successResponse(data);
  } catch (err) { return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    await getSupabaseAdmin().from('testimonials').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}