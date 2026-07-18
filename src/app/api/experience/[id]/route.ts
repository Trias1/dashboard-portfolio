import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const { company, position, start_date, end_date, description } = await request.json();
    const { data } = await getSupabaseAdmin().from('experience').update({ company, position, start_date, end_date, description }).eq('id', id).eq('owner_id', auth.id).select().single();
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message, 401); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    await getSupabaseAdmin().from('experience').delete().eq('id', id).eq('owner_id', auth.id);
    return successResponse({ message: 'Deleted' });
  } catch (err: any) { return errorResponse(err.message, 401); }
}