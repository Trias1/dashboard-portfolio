import { NextRequest } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { saveOwnerRow } from '@/lib/supabase/owner-row';
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
    const { data } = await getSupabaseAdmin().from('contact_info').select('*').eq('owner_id', owner_id).maybeSingle();
    return successResponse(data || {});
  } catch { return successResponse({}); }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const invalid = checkSectionBody(body, { links: ['linkedin_url', 'github_url'], maxText: 500 });
    if (invalid) return errorResponse(invalid, 400);
    const { email, phone, location, linkedin_url, github_url } = body;
    const fields = { email, phone, location, linkedin_url, github_url };
    for (const [key, value] of Object.entries(fields)) {
      if (value != null && (typeof value !== 'string' || value.length > 500)) return errorResponse(`Invalid ${key}`, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return errorResponse('Invalid email format', 400);
    const saved = await saveOwnerRow('contact_info', auth.id, fields);
    return successResponse(saved);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
