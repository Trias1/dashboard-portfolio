import { NextRequest } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { saveOwnerRow } from '@/lib/supabase/owner-row';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';
import { putInlineImages, takeInlineImages } from '@/lib/supabase/inline-images';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    // Unauthenticated callers get nothing (public pages use /api/public/[slug]);
    // only superadmin may read another user's data via ?owner_id=
    if (!auth) return successResponse({});
    const requestedOwner = request.nextUrl.searchParams.get('owner_id');
    const owner_id = auth.role === 'superadmin' && requestedOwner ? requestedOwner : auth.id;
    if (!owner_id) return successResponse({});
    const { data } = await getSupabaseAdmin().from('about').select('*').eq('owner_id', owner_id).maybeSingle();
    return successResponse(data || {});
  } catch { return successResponse({}); }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    // Old rows hold base64 photos: check them now, store them once the rest of the body is valid
    const inline = takeInlineImages(body, ['photo_url']);
    if ('error' in inline) return errorResponse(inline.error, 400);
    const invalid = checkSectionBody(body, { links: ['photo_url', 'cv_url'] });
    if (invalid) return errorResponse(invalid, 400);
    const stored = await putInlineImages(body, inline.images, auth.id, 'photos');
    if ('error' in stored) return errorResponse(stored.error, 429);
    const { name, title, bio, photo_url, cv_url } = body;
    const saved = await saveOwnerRow('about', auth.id, { name, title, bio, photo_url, cv_url }, { touch: true });
    return successResponse(saved);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
