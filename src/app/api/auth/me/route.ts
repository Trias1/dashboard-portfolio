import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role, photo_url')
      .eq('id', auth.id)
      .maybeSingle();

    if (!user) return errorResponse('User not found', 404);
    return successResponse(user);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
