import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendVerificationEmail } from '@/lib/mailer';
import { hashToken, isBcryptHash, normalizeEmail, DUMMY_PASSWORD_HASH } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
// Same answer whatever the outcome, so this can't be used to look up accounts.
const DONE = { message: "If that account still needs verifying, a new link is on its way. Check your inbox and spam folder." };

/**
 * Sends a new verification link to an account that hasn't been verified yet. Needs the password too, so
 * nobody can make the app mail an address they don't control; limited per IP and per address.
 */
export async function POST(request: NextRequest) {
  try {
    const ipRl = await checkRateLimit(getClientId(request), 'auth');
    if (!ipRl.allowed) return errorResponse('Too many requests', 429);

    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) return errorResponse('Email and password required', 400);

    const emailRl = await checkRateLimit(`resend-verify:${email}`, 'otp');
    if (!emailRl.allowed) return successResponse(DONE);

    const db = getSupabaseAdmin();
    const { data: user } = await db.from('users').select('id, name, password, is_verified').eq('email', email).maybeSingle();
    const hash = user && isBcryptHash(user.password) ? user.password : DUMMY_PASSWORD_HASH;
    const match = await bcrypt.compare(password, hash);
    if (!user || hash === DUMMY_PASSWORD_HASH || !match || user.is_verified) return successResponse(DONE);

    const token = crypto.randomBytes(32).toString('hex');
    await db.from('users').update({ verification_token: hashToken(token), verification_expires: new Date(Date.now() + VERIFY_TTL_MS).toISOString() }).eq('id', user.id);
    await sendVerificationEmail(email, user.name || '', token);
    return successResponse(DONE);
  } catch {
    return errorResponse('Unable to process request', 500);
  }
}
