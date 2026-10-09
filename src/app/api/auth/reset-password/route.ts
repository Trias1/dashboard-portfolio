import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';
import { BCRYPT_COST, MIN_PASSWORD_LENGTH, hashToken } from '@/lib/auth';
import { revokeAllSessions } from '@/lib/sessions';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const { token, password } = body;
    if (typeof token !== 'string' || typeof password !== 'string' || !token || !password || token.length > 200) return errorResponse('Token and password required', 400);
    if (password.length < MIN_PASSWORD_LENGTH) return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('reset_token', hashToken(token))
      .gte('reset_token_expires', new Date().toISOString())
      .maybeSingle();

    if (!user) return errorResponse('This link is invalid or has expired.', 400);

    const hashed = await bcrypt.hash(password, BCRYPT_COST);
    const { error } = await getSupabaseAdmin()
      .from('users')
      .update({ password: hashed, reset_token: null, reset_token_expires: null })
      .eq('id', user.id);
    if (error) return errorResponse("Couldn't reset the password", 500);

    // Whoever had the old password may still hold a session: sign out everywhere.
    await revokeAllSessions(user.id);
    return successResponse({ message: 'Your password has been reset. Please log in again.' });
  } catch {
    return errorResponse("Couldn't reset the password", 500);
  }
}
