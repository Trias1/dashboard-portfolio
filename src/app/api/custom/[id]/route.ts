import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkSectionBody } from '@/lib/validate';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const invalid = checkSectionBody(body, { maxText: 50000 });
    if (invalid) return errorResponse(invalid, 400);
    const { title, type, content } = body;
    const { data } = await getSupabaseAdmin().from('custom_sections').update({ title, type, content: JSON.stringify(content || {}) }).eq('id', id).eq('owner_id', auth.id).select().maybeSingle();
    if (!data) return errorResponse('Not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const { data } = await getSupabaseAdmin().from('custom_sections').delete().eq('id', id).eq('owner_id', auth.id).select('id');
    if (!data || data.length === 0) return errorResponse('Not found', 404);
    return successResponse({ message: 'Deleted' });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
