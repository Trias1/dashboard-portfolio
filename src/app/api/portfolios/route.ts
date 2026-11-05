import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateSlug, errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { title, slug } = await request.json();
    if (title !== undefined && (typeof title !== 'string' || title.length > 200)) return errorResponse('Invalid title', 400);
    const checked = checkSlug(slug);
    if ('error' in checked) return errorResponse(checked.error, 400);
    const cleanSlug = checked.slug;
    const { data, error } = await getSupabaseAdmin().from('portfolios').insert({ owner_id: auth.id, title, slug: cleanSlug }).select().single();
    if (error?.code === '23505') return errorResponse('Slug already taken', 400);
    return successResponse(data, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
