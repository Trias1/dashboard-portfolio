import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateSlug, errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { title, slug } = await request.json();
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const { data, error } = await getSupabaseAdmin().from('portfolios').insert({ owner_id: auth.id, title, slug: cleanSlug }).select().single();
    if (error?.code === '23505') return errorResponse('Slug already taken', 400);
    return successResponse(data, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
