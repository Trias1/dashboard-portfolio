import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const owner_id = request.nextUrl.searchParams.get('owner_id') || auth.id;
    const { data } = await getSupabaseAdmin().from('experience').select('*').eq('owner_id', owner_id).order('start_date', { ascending: false });
    return successResponse(data || []);
  } catch (err: any) { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { company, position, start_date, end_date, description } = await request.json();
    const { data } = await getSupabaseAdmin().from('experience').insert({ company, position, start_date, end_date, description, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message, 401); }
}
