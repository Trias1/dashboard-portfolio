import { NextRequest } from 'next/server';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';
import { uploadFile } from '@/lib/supabase/storage';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    const owner_id = request.nextUrl.searchParams.get('owner_id') || auth?.id;
    if (!owner_id) return successResponse({});
    const { data } = await getSupabaseAdmin().from('about').select('*').eq('owner_id', owner_id).maybeSingle();
    return successResponse(data || {});
  } catch { return successResponse({}); }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { name, title, bio, photo_url, cv_url } = await request.json();
    const { data: existing } = await getSupabaseAdmin().from('about').select('id').eq('owner_id', auth.id).maybeSingle();
    let result;
    if (existing) {
      result = await getSupabaseAdmin().from('about').update({ name, title, bio, photo_url, cv_url, updated_at: new Date().toISOString() }).eq('owner_id', auth.id).select().single();
    } else {
      result = await getSupabaseAdmin().from('about').insert({ name, title, bio, photo_url, cv_url, owner_id: auth.id }).select().single();
    }
    return successResponse(result.data);
  } catch (err: any) { return errorResponse(err.message, 401); }
}
