import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { data } = await getSupabaseAdmin().from('portfolios').select('*').eq('owner_id', auth.id).order('created_at', { ascending: false });
    return successResponse(data || []);
  } catch (err: any) {
    if (err?.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('[portfolio MY]', err);
    return errorResponse(err.message);
  }
}
