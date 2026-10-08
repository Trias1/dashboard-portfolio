import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const { token, password } = await request.json();
    if (typeof token !== 'string' || typeof password !== 'string' || !token || !password) return errorResponse('Token and password required', 400);
    if (password.length < MIN_PASSWORD_LENGTH) return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('reset_token', token)
      .gte('reset_token_expires', new Date().toISOString())
      .maybeSingle();

    if (!user) return errorResponse('This link is invalid or has expired.', 400);

    const hashed = await bcrypt.hash(password, 10);
    await getSupabaseAdmin()
      .from('users')
      .update({ password: hashed, reset_token: null, reset_token_expires: null })
      .eq('id', user.id);

    return successResponse({ message: 'Your password has been reset.' });
  } catch {
    return errorResponse("Couldn't reset the password", 500);
  }
}
