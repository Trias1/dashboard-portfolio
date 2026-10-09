import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { decryptMessage } from '@/lib/field-crypto';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const { data } = await getSupabaseAdmin()
      .from('contact_messages')
      .select('*, portfolios!inner(slug)')
      .order('created_at', { ascending: false })
      .limit(10);
    return successResponse((data || []).map(decryptMessage));
  } catch (err) {
    return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Forbidden' ? 403 : 401);
  }
}
