import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signAccessToken, setAuthCookies, GOOGLE_STATE_COOKIE, safeRedirectPath } from '@/lib/auth';
import { startSession, revokeAllSessions } from '@/lib/sessions';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { generateSlug } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CLIENTE_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const GOOGLE_OAUTH_PASSWORD = ['google', 'oauth'].join('-');

function redirectToLogin(error: string) {
  return Response.redirect(new URL(`/login?error=${error}`, BASE_URL));
}

export async function GET(request: NextRequest) {
  // Which step failed, so an unexpected error can be told apart in the login URL (no details, just the step name).
  let step = 'start';
  try {
    const rl = await checkRateLimit(`google-callback:${getClientId(request)}`, 'auth');
    if (!rl.allowed) return redirectToLogin('rate_limited');

    step = 'state';
    const code = request.nextUrl.searchParams.get('code');
    const returnedState = request.nextUrl.searchParams.get('state') || '';

    // CSRF protection: state must match the value stored in the httpOnly cookie by /api/auth/google.
    const cookieStore = await cookies();
    const rawState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
    cookieStore.delete({ name: GOOGLE_STATE_COOKIE, path: '/api/auth/google' });
    let saved: { state?: unknown; from?: unknown } = {};
    try { saved = rawState ? JSON.parse(rawState) : {}; } catch { saved = {}; }
    const expected = typeof saved.state === 'string' ? Buffer.from(saved.state) : null;
    const actual = Buffer.from(returnedState);
    if (!expected || expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      return redirectToLogin('invalid_state');
    }
    const from = safeRedirectPath(saved.from);

    if (!code) return redirectToLogin('no_code');

    step = 'token';
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: CLIENTE_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('[google oauth] token exchange failed', { status: tokenRes.status, error: tokens.error });
      return redirectToLogin('token_failed');
    }

    step = 'profile';
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();
    const email = typeof profile.email === 'string' ? profile.email.trim().toLowerCase() : '';
    const name = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : email;

    if (!userRes.ok || !email) {
      console.error('[google oauth] profile lookup failed', { status: userRes.status, error: profile.error });
      return redirectToLogin('profile_failed');
    }
    // Never link/create an account from an email address Google hasn't verified.
    if (profile.verified_email !== true && profile.email_verified !== true) return redirectToLogin('email_not_verified');

    step = 'lookup';
    const supabase = getSupabaseAdmin();
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      console.error('[google oauth] user lookup failed', { code: lookupError.code, message: lookupError.message });
      return redirectToLogin('user_lookup_failed');
    }

    let user = existingUser;
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: GOOGLE_OAUTH_PASSWORD,
          role: 'admin',
          is_active: true,
          is_verified: true,
        })
        .select('*')
        .single();

      if (insertError || !newUser) {
        console.error('[google oauth] user creation failed', {
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint,
          message: insertError?.message,
        });
        return redirectToLogin('user_creation_failed');
      }

      user = newUser;
      const slug = generateSlug(name, user.id);
      const setupResults = await Promise.all([
        supabase.from('portfolios').insert({ owner_id: user.id, title: `${name}'s Portfolio`, slug }),
        supabase.from('about').insert({ owner_id: user.id, name, title: '', bio: '' }),
        supabase.from('hero').insert({ owner_id: user.id, headline: `Hi, I'm ${name}`, subheadline: '', cta_text: 'View My Work' }),
        supabase.from('contact_info').insert({ owner_id: user.id, email }),
      ]);
      const setupError = setupResults.find(result => result.error)?.error;
      if (setupError) {
        console.error('[google oauth] profile setup failed', {
          code: setupError.code,
          message: setupError.message,
        });
      }
    }

    if (!user) return redirectToLogin('user_creation_failed');
    if (user.is_active === false) return redirectToLogin('account_inactive');

    // An existing account whose email was never confirmed: Google has now proven the address belongs to this person.
    // Its password was set by whoever registered it — possibly not them — so it is dropped (they can set one later).
    step = 'verify';
    if (!user.is_verified) {
      const { error: verifyError } = await supabase.from('users')
        .update({ is_verified: true, verification_token: null, verification_expires: null, password: GOOGLE_OAUTH_PASSWORD })
        .eq('id', user.id);
      if (verifyError) return redirectToLogin('user_lookup_failed');
      await revokeAllSessions(user.id);
    }

    step = 'access_token';
    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    step = 'session';
    const refreshToken = await startSession(user.id, request.headers.get('user-agent'));
    step = 'cookies';
    await setAuthCookies(accessToken, refreshToken);

    step = 'redirect';
    const fallback = new URL(user.role === 'admin' || user.role === 'superadmin' ? '/dashboard' : '/', BASE_URL);
    const target = from ? new URL(from, BASE_URL) : fallback;
    return Response.redirect(target.origin === fallback.origin ? target : fallback);
  } catch (error) {
    console.error('[google oauth] unexpected error', step, error instanceof Error ? { name: error.name, message: error.message } : error);
    return redirectToLogin(`oauth_failed&at=${step}`);
  }
}


