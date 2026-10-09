import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendResetPassword } from '@/lib/mailer';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { hashToken, normalizeEmail } from '@/lib/auth';

const GENERIC_MESSAGE = 'If that email has an account, a reset link is on its way.';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const email = normalizeEmail(body.email);
    if (!email) return errorResponse('Email required', 400);
    // Per-email cap to prevent mail-bombing; answer generically either way.
    const emailRl = await checkRateLimit(`forgot:${email}`, 'otp');
    if (!emailRl.allowed) return successResponse({ message: GENERIC_MESSAGE });

    const supabase = getSupabaseAdmin();
    const { data: user, error: lookupError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      console.error('[forgot password] user lookup failed', { code: lookupError.code, message: lookupError.message });
      return errorResponse('Unable to process request', 500);
    }

    if (!user) return successResponse({ message: GENERIC_MESSAGE });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { error: updateError } = await supabase
      .from('users')
      .update({ reset_token: hashToken(token), reset_token_expires: expires })
      .eq('id', user.id);

    if (updateError) {
      console.error('[forgot password] token update failed', { code: updateError.code, message: updateError.message });
      return errorResponse('Unable to process request', 500);
    }

    try {
      await sendResetPassword(user.email, user.name, token);
    } catch (error) {
      // Don't reveal (via a different status) that the account exists.
      console.error('[forgot password] email delivery failed', error instanceof Error ? { name: error.name, message: error.message } : error);
    }

    return successResponse({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('[forgot password] unexpected error', error instanceof Error ? { name: error.name, message: error.message } : error);
    return errorResponse('Unable to process request', 500);
  }
}
