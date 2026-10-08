import { NextRequest } from 'next/server';
import { POST as verifyCredentials } from '../verify-credentials/route';
import { successResponse } from '@/lib/utils';

// Password-only login would bypass the email OTP step, so this endpoint now only validates
// credentials (same as /api/auth/verify-credentials) and the client must finish via
// /api/otp/send + /api/otp/verify to receive tokens.
export async function POST(request: NextRequest) {
  const res = await verifyCredentials(request);
  if (!res.ok) return res;
  return successResponse({ message: 'Credentials valid', requiresOtp: true });
}
