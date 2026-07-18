import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { data } = await getSupabaseAdmin().from('testimonials').select('*').eq('owner_id', auth.id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { name, position, message, photo_url } = await request.json();
    const { data } = await getSupabaseAdmin().from('testimonials').insert({ name, position, message, photo_url, owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
