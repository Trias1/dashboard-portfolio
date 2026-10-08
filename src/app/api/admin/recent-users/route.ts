import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const { data } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(10);
    return successResponse(data || []);
  } catch (err) {
    return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Forbidden' ? 403 : 401);
  }
}
