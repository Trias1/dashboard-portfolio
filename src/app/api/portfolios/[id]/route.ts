import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    const { title, theme, sections_order, is_published, template } = await request.json();
    const { data } = await getSupabaseAdmin().from('portfolios').update({
      title, theme, sections_order, is_published, template: template || 'modern', updated_at: new Date().toISOString(),
    }).eq('id', id).eq('owner_id', auth.id).select().single();
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };

    // Slug update
    if (body.slug) {
      const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (cleanSlug.length < 3) return errorResponse('Slug minimal 3 karakter', 400);
      const { data: existing } = await getSupabaseAdmin().from('portfolios').select('id').eq('slug', cleanSlug).neq('id', id).maybeSingle();
      if (existing) return errorResponse('Slug sudah digunakan', 400);
      updates.slug = cleanSlug;
    }
    // Domain update
    if (body.custom_domain !== undefined) {
      if (body.custom_domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(body.custom_domain)) return errorResponse('Format domain tidak valid', 400);
        const { data: existingDomain } = await getSupabaseAdmin().from('portfolios').select('id').eq('custom_domain', body.custom_domain).neq('id', id).maybeSingle();
        if (existingDomain) return errorResponse('Domain sudah dipakai portfolio lain', 400);
      }
      updates.custom_domain = body.custom_domain || null;
    }
    // Publish toggle
    if (body.publish !== undefined) {
      updates.is_published = body.publish;
    }

    const { data } = await getSupabaseAdmin().from('portfolios').update(updates).eq('id', id).eq('owner_id', auth.id).select().single();
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { id } = await params;
    await getSupabaseAdmin().from('portfolios').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Portfolio deleted' });
  } catch (err: any) { return errorResponse(err.message); }
}
