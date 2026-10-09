import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { issuePasswordChallenge, isBcryptHash, normalizeEmail } from '@/lib/auth';
import { checkRateLimit, getClientId, isUnderLimit } from '@/lib/rate-limit';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';

// Used to keep response timing similar when the user does not exist.
const DUMMY_HASH = '$2b$10$35ISAoEVyvlDq89yCb07D.jDTaStzT5GyHTirLdKnpOVRUKuPGjKO';

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) return errorResponse('Email and password required', 400);

    const ipRl = await checkRateLimit(getClientId(request), 'auth');
    if (!ipRl.allowed) return errorResponse('Too many requests', 429);
    // Per-account limit counts only wrong passwords, so other people can't lock you out just by trying to log in as you.
    if (!(await isUnderLimit(`login-fail:${email}`, 'loginfail'))) return errorResponse('Too many failed attempts. Please try again later or reset your password.', 429);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, email, password, is_verified, is_active')
      .eq('email', email)
      .maybeSingle();

    const hash = user && isBcryptHash(user.password) ? user.password : DUMMY_HASH;
    const match = await bcrypt.compare(password, hash);
    if (!user || hash === DUMMY_HASH || !match) {
      await checkRateLimit(`login-fail:${email}`, 'loginfail');
      return errorResponse('Invalid credentials', 400);
    }
    if (!user.is_verified) return errorResponse('Please verify your email first', 403);
    if (!user.is_active) return errorResponse('Account is inactive', 403);

    await issuePasswordChallenge(email);
    return successResponse({ message: 'Credentials valid' });
  } catch {
    return errorResponse('Unable to process request', 500);
  }
}
