import { NextRequest } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    // Unauthenticated callers get nothing (public pages use /api/public/[slug]);
    // only superadmin may read another user's data via ?owner_id=
    if (!auth) return successResponse({});
    const requestedOwner = request.nextUrl.searchParams.get('owner_id');
    const owner_id = auth.role === 'superadmin' && requestedOwner ? requestedOwner : auth.id;
    if (!owner_id) return successResponse({});
    const { data } = await getSupabaseAdmin().from('contact_info').select('*').eq('owner_id', owner_id).maybeSingle();
    return successResponse(data || {});
  } catch { return successResponse({}); }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { email, phone, location, linkedin_url, github_url } = await request.json();
    const fields = { email, phone, location, linkedin_url, github_url };
    for (const [key, value] of Object.entries(fields)) {
      if (value != null && (typeof value !== 'string' || value.length > 500)) return errorResponse(`Invalid ${key}`, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return errorResponse('Invalid email format', 400);
    const { data: existing } = await getSupabaseAdmin().from('contact_info').select('id').eq('owner_id', auth.id).maybeSingle();
    let result;
    if (existing) {
      result = await getSupabaseAdmin().from('contact_info').update({ email, phone, location, linkedin_url, github_url }).eq('owner_id', auth.id).select().single();
    } else {
      result = await getSupabaseAdmin().from('contact_info').insert({ email, phone, location, linkedin_url, github_url, owner_id: auth.id }).select().single();
    }
    return successResponse(result.data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
