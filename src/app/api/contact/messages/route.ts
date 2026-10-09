import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { decryptMessage } from '@/lib/field-crypto';

/** The signed-in owner's contact-form messages, newest first. */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin' && auth.role !== 'superadmin') return errorResponse('Forbidden', 403);
    const { data } = await getSupabaseAdmin()
      .from('contact_messages')
      .select('id, name, email, message, is_read, created_at')
      .eq('owner_id', auth.id)
      .order('created_at', { ascending: false })
      .limit(500);
    return successResponse((data || []).map(decryptMessage));
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
