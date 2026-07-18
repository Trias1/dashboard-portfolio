import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const { data } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role')
      .or(`name.ilike.${username},email.ilike.${username}`)
      .limit(1)
      .maybeSingle();
    if (!data) return errorResponse('User not found', 404);
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}