import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

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
    const { title, description, image_url, tech_stack, demo_url, github_url } = await request.json();
    const { data } = await getSupabaseAdmin().from('projects').insert({ title, description, image_url, tech_stack, demo_url, github_url, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
