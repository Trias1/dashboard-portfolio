import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

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
    if (body.slug) {
      const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (cleanSlug.length < 3) return errorResponse('Slug minimal 3 karakter', 400);
      const { data: existing } = await getSupabaseAdmin().from('portfolios').select('id').eq('slug', cleanSlug).neq('id', id).maybeSingle();
      if (existing) return errorResponse('Slug sudah digunakan', 400);
      updates.slug = cleanSlug;
    }
    // Publish toggle
    if (body.publish !== undefined) {
      updates.is_published = body.publish;
    }

    const { data } = await getSupabaseAdmin().from('portfolios').update(updates).eq('id', id).eq('owner_id', auth.id).select().single();
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
