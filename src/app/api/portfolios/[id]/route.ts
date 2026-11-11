import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkSlug } from '@/lib/slug';

const authStatus = (err: unknown) => {
  const message = err instanceof Error ? err.message : '';
  return message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    const { title, theme, sections_order, is_published, template } = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (theme !== undefined) updates.theme = theme;
    if (sections_order !== undefined) updates.sections_order = sections_order;
    if (is_published !== undefined) updates.is_published = is_published;
    if (template !== undefined) updates.template = template;
    const { data, error } = await getSupabaseAdmin().from('portfolios').update(updates).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    if (error) return errorResponse(error.message, 500);
    if (!data) return errorResponse('Portfolio not found', 404);
    return successResponse(data);
  } catch (err) { console.error('[portfolio PUT]', err); return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Slug update
    if (body.slug !== undefined) {
      const checked = checkSlug(body.slug);
      if ('error' in checked) return errorResponse(checked.error, 400);
      const cleanSlug = checked.slug;
      const { data: existing } = await getSupabaseAdmin().from('portfolios').select('id').eq('slug', cleanSlug).neq('id', id).maybeSingle();
      if (existing) return errorResponse('That slug is already taken', 400);
      updates.slug = cleanSlug;
    }
    // Publish toggle
    if (body.publish !== undefined) {
      if (typeof body.publish !== 'boolean') return errorResponse('Invalid publish value', 400);
      updates.is_published = body.publish;
    }

    const { data, error } = await getSupabaseAdmin().from('portfolios').update(updates).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    // 23505: someone took the slug between the check above and this write
    if (error?.code === '23505') return errorResponse('That slug is already taken', 400);
    if (error) return errorResponse('Could not update the portfolio', 500);
    if (!data) return errorResponse('Portfolio not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    await getSupabaseAdmin().from('portfolios').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Portfolio deleted' });
  } catch (err) { return errorResponse(err instanceof Error ? err.message : 'Request failed', authStatus(err)); }
}
