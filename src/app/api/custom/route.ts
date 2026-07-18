import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const owner_id = request.nextUrl.searchParams.get('owner_id') || auth.id;
    if (!owner_id) return successResponse([]);
    const { data } = await getSupabaseAdmin().from('custom_sections').select('*').eq('owner_id', owner_id).order('sort_order', { ascending: true });
    return successResponse(data || []);
  } catch { return successResponse([]); }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { title, type, content } = await request.json();
    const { data } = await getSupabaseAdmin().from('custom_sections').insert({ title, type: type || 'text', content: JSON.stringify(content || {}), owner_id: auth.id }).select().single();
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
