import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const { title, type, content } = await request.json();
    const { data } = await getSupabaseAdmin().from('custom_sections').update({ title, type, content: JSON.stringify(content || {}) }).eq('id', id).select().single();
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    await getSupabaseAdmin().from('custom_sections').delete().eq('id', id);
    return successResponse({ message: 'Deleted' });
  } catch (err: any) { return errorResponse(err.message); }
}