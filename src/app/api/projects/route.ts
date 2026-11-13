import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';
import { putInlineImages, takeInlineImages } from '@/lib/supabase/inline-images';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    // Only superadmin may read another user's data via ?owner_id=
    const requestedOwner = request.nextUrl.searchParams.get('owner_id');
    const owner_id = auth.role === 'superadmin' && requestedOwner ? requestedOwner : auth.id;
    const { data } = await getSupabaseAdmin().from('projects').select('*').eq('owner_id', owner_id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    // Old rows hold base64 photos: check them now, store them once the rest of the body is valid
    const inline = takeInlineImages(body, ['image_url']);
    if ('error' in inline) return errorResponse(inline.error, 400);
    const invalid = checkSectionBody(body, { links: ['image_url', 'demo_url', 'github_url'] });
    if (invalid) return errorResponse(invalid, 400);
    const stored = await putInlineImages(body, inline.images, auth.id, 'projects');
    if ('error' in stored) return errorResponse(stored.error, 429);
    const { title, description, image_url, tech_stack, demo_url, github_url } = body;
    const { data } = await getSupabaseAdmin().from('projects').insert({ title, description, image_url, tech_stack, demo_url, github_url, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
