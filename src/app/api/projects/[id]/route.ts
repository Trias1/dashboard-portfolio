import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const { title, description, image_url, tech_stack, demo_url, github_url } = await request.json();
    const { data } = await getSupabaseAdmin().from('projects').update({ title, description, image_url, tech_stack, demo_url, github_url }).eq('id', id).eq('owner_id', auth.id).select().single();
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    await getSupabaseAdmin().from('projects').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err: any) { return errorResponse(err.message); }
}