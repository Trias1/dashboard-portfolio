import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  signAccessToken, setAuthCookies, clearChallengeCookies, hasOtpChallenge, normalizeEmail, verifyOtpChallenge,
} from '@/lib/auth';
import { startSession } from '@/lib/sessions';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const email = normalizeEmail(body.email);
    const otp = typeof body.otp === 'string' ? body.otp.trim() : String(body.otp ?? '').trim();
    if (!email || !otp) return errorResponse('Email and OTP required', 400);

    const ipRl = await checkRateLimit(`otp-verify-ip:${getClientId(request)}`, 'auth');
    if (!ipRl.allowed) return errorResponse('Too many attempts. Please try again later.', 429);

    // Only count per-email attempts once the caller holds a challenge for this email (password step passed),
    // so strangers can't burn the victim's attempt budget and lock them out.
    if (!(await hasOtpChallenge(email))) return errorResponse('Invalid or expired OTP', 400);
    const emailRl = await checkRateLimit(`otp-verify:${email}`, 'otp');
    if (!emailRl.allowed) return errorResponse('Too many attempts. Please try again later.', 429);

    if (!(await verifyOtpChallenge(email, otp))) return errorResponse('Invalid or expired OTP', 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role, is_verified, is_active')
      .eq('email', email)
      .maybeSingle();

    if (!user || !user.is_verified || !user.is_active) return errorResponse('Invalid or expired OTP', 400);

    await clearChallengeCookies();
    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await startSession(user.id, request.headers.get('user-agent'));
    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      message: 'OTP verified successfully',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return errorResponse('Unable to verify OTP', 500);
  }
}
