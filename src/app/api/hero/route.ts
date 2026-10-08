import { NextRequest } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    // Unauthenticated callers get nothing (public pages use /api/public/[slug]);
    // only superadmin may read another user's data via ?owner_id=
    if (!auth) return successResponse({});
    const requestedOwner = request.nextUrl.searchParams.get('owner_id');
    const owner_id = auth.role === 'superadmin' && requestedOwner ? requestedOwner : auth.id;
    if (!owner_id) return successResponse({});
    const { data } = await getSupabaseAdmin().from('hero').select('*').eq('owner_id', owner_id).maybeSingle();
    return successResponse(data || {});
  } catch { return successResponse({}); }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const invalid = checkSectionBody(body, { links: ['cta_url', 'cta_secondary_url', 'background_url'], relativeLinks: ['cta_url', 'cta_secondary_url'] });
    if (invalid) return errorResponse(invalid, 400);
    const { greeting, headline, subheadline, cta_text, cta_url, cta_secondary_text, cta_secondary_url, background_url } = body;
    const payload = { greeting, headline, subheadline, cta_text, cta_url, cta_secondary_text, cta_secondary_url, background_url };
    const { data: existing } = await getSupabaseAdmin().from('hero').select('id').eq('owner_id', auth.id).maybeSingle();
    let result;
    if (existing) {
      result = await getSupabaseAdmin().from('hero').update({ ...payload, updated_at: new Date().toISOString() }).eq('owner_id', auth.id).select().single();
    } else {
      result = await getSupabaseAdmin().from('hero').insert({ ...payload, owner_id: auth.id }).select().single();
    }
    return successResponse(result.data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
