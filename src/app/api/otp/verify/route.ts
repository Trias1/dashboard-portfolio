import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import otpStore from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) return errorResponse('Email and OTP required', 400);

    const stored = otpStore.get(email);
    if (!stored) return errorResponse('OTP not found or expired', 400);
    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return errorResponse('OTP expired', 400);
    }
    if (stored.otp !== otp) return errorResponse('Invalid OTP', 400);
    otpStore.delete(email);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) return errorResponse('User not found', 404);

    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await signRefreshToken({ id: user.id });
    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      message: 'OTP verified successfully',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
