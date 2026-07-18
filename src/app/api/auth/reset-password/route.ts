import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return errorResponse('Token and password required', 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('reset_token', token)
      .gte('reset_token_expires', new Date().toISOString())
      .maybeSingle();

    if (!user) return errorResponse('Token tidak valid atau sudah expired.', 400);

    const hashed = await bcrypt.hash(password, 10);
    await getSupabaseAdmin()
      .from('users')
      .update({ password: hashed, reset_token: null, reset_token_expires: null })
      .eq('id', user.id);

    return successResponse({ message: 'Password berhasil direset!' });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
