import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { sendOTP } from '@/lib/mailer';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { issueOtpChallenge, normalizeEmail, verifyPasswordChallenge } from '@/lib/auth';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'otp');
    if (!rl.allowed) return errorResponse('Too many OTP requests', 429);

    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const email = normalizeEmail(body.email);
    // A password check must have succeeded for this email (pwChallenge cookie) before an OTP is issued.
    if (!email || !(await verifyPasswordChallenge(email))) return errorResponse('Unable to send OTP. Please log in again.', 400);

    const otp = crypto.randomInt(100000, 1000000).toString();
    await issueOtpChallenge(email, otp);
    await sendOTP(email, otp);
    return successResponse({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('[otp send] failed', err instanceof Error ? { name: err.name, message: err.message } : err);
    return errorResponse('Unable to send OTP', 500);
  }
}
