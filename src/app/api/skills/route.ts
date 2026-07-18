import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const owner_id = request.nextUrl.searchParams.get('owner_id') || auth.id;
    if (!owner_id) return successResponse([]);
    const { data } = await getSupabaseAdmin().from('skills').select('*').eq('owner_id', owner_id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { title, skills } = await request.json();
    const { data } = await getSupabaseAdmin().from('skills').insert({ title, skills, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
