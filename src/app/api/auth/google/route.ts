import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { GOOGLE_STATE_COOKIE, safeRedirectPath } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  const from = safeRedirectPath(request.nextUrl.searchParams.get('from'));
  const state = crypto.randomBytes(32).toString('base64url');

  // State (CSRF) + post-login redirect are kept server-side in an httpOnly cookie for 10 minutes.
  (await cookies()).set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, from }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/api/auth/google',
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    access_type: 'offline',
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
