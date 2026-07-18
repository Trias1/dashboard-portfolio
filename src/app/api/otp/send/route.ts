import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendOTP } from '@/lib/mailer';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils';
import otpStore from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'otp');
    if (!rl.allowed) return errorResponse('Too many OTP requests', 429);

    const { email } = await request.json();
    if (!email) return errorResponse('Email required', 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!user) return errorResponse('Email not found', 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    await sendOTP(email, otp);
    return successResponse({ message: 'OTP sent successfully' });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
