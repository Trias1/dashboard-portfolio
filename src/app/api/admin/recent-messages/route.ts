import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const { data } = await getSupabaseAdmin()
      .from('contact_messages')
      .select('*, portfolios!inner(slug)')
      .order('created_at', { ascending: false })
      .limit(10);
    return successResponse(data || []);
  } catch (err: any) {
    return errorResponse(err.message, err.message === 'Forbidden' ? 403 : 401);
  }
}
