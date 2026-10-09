// JWT Auth Helpers
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { JWTPayload, UserRole } from '@/types';

function readSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[name];
  if (!value || value.length < 32) throw new Error(`${name} is missing or shorter than 32 characters`);
  return value;
}

const getSecret = () => new TextEncoder().encode(readSecret('JWT_SECRET'));
const getRefreshSecret = () => new TextEncoder().encode(readSecret('JWT_REFRESH_SECRET'));

export const MIN_PASSWORD_LENGTH = 8;
export const BCRYPT_COST = 12;
/** One-time tokens (email verification, password reset) are stored hashed, so a leaked table can't be used to reset accounts. */
export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export const normalizeEmail = (email: unknown) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
export const isBcryptHash = (hash: unknown): hash is string => typeof hash === 'string' && /^\$2[aby]\$\d{2}\$/.test(hash);

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ id: payload.id, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('access')
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
    .sign(getSecret());
}

/** Refresh token claims: user id, plus the session id (jti) and session family (fam) once sessions exist. */
export interface RefreshClaims { id: number; jti?: string; fam?: string }

export async function signRefreshToken(payload: RefreshClaims): Promise<string> {
  return new SignJWT({ id: payload.id, ...(payload.jti ? { jti: payload.jti, fam: payload.fam } : {}) })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('refresh')
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    .sign(getRefreshSecret());
}

// Secrets are read outside try/catch so a misconfiguration surfaces as an error, not as "invalid token".
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  const key = getSecret();
  try {
    const { payload } = await jwtVerify(token, key, { audience: 'access', algorithms: ['HS256'] });
    return payload as unknown as JWTPayload;
  } catch { return null; }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims | null> {
  const key = getRefreshSecret();
  try {
    const { payload } = await jwtVerify(token, key, { audience: 'refresh', algorithms: ['HS256'] });
    if (typeof payload.id !== 'number') return null;
    return {
      id: payload.id,
      jti: typeof payload.jti === 'string' ? payload.jti : undefined,
      fam: typeof payload.fam === 'string' ? payload.fam : undefined,
    };
  } catch { return null; }
}

// --- Email change confirmation (stateless, signed, 1 hour) ---
// The token names the address it changes *from*, so it stops working once the email has changed (used, or
// replaced by a newer change); no table needed.
export interface EmailChangeClaims { id: number; from: string; to: string }

export async function signEmailChangeToken(claims: EmailChangeClaims): Promise<string> {
  return new SignJWT({ id: claims.id, from: claims.from, to: claims.to })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('email-change')
    .setExpirationTime('1h')
    .sign(getSecret());
}

export async function verifyEmailChangeToken(token: string): Promise<EmailChangeClaims | null> {
  const key = getSecret();
  try {
    const { payload } = await jwtVerify(token, key, { audience: 'email-change', algorithms: ['HS256'] });
    if (typeof payload.id !== 'number' || typeof payload.from !== 'string' || typeof payload.to !== 'string') return null;
    return { id: payload.id, from: payload.from, to: payload.to };
  } catch { return null; }
}

export const GOOGLE_STATE_COOKIE = 'googleOauthState';

/** Only same-site relative paths ("/x", not "//x" or "/\x") are allowed as post-login redirects. */
export function safeRedirectPath(value: unknown): string {
  // Reject whitespace/control chars too: URL parsers strip tabs/newlines, so "/\t/evil.com" would become "//evil.com".
  return typeof value === 'string' && /^\/(?![/\\])[^\s\x00-\x1f\x7f]*$/.test(value) ? value : '';
}

// --- Login challenges (stateless, signed, stored in httpOnly cookies) ---
export const PW_CHALLENGE_COOKIE = 'pwChallenge';
export const OTP_CHALLENGE_COOKIE = 'otpChallenge';

const otpHash = (email: string, otp: string) =>
  crypto.createHmac('sha256', readSecret('JWT_SECRET')).update(`${email}:${otp}`).digest('hex');

async function setChallengeCookie(name: string, value: string, maxAge: number) {
  (await cookies()).set(name, value, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge, path: '/',
  });
}

export async function clearChallengeCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(PW_CHALLENGE_COOKIE);
  cookieStore.delete(OTP_CHALLENGE_COOKIE);
}

/** Issued after a successful password check; allows requesting an OTP for 10 minutes. */
export async function issuePasswordChallenge(email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' }).setAudience('pw-ok').setIssuedAt().setExpirationTime('10m')
    .sign(getSecret());
  await setChallengeCookie(PW_CHALLENGE_COOKIE, token, 10 * 60);
}

export async function verifyPasswordChallenge(email: string): Promise<boolean> {
  const token = (await cookies()).get(PW_CHALLENGE_COOKIE)?.value;
  if (!token || !email) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { audience: 'pw-ok', algorithms: ['HS256'] });
    return payload.email === email;
  } catch { return false; }
}

/** Stores only an HMAC of the OTP in a signed cookie valid for 5 minutes. */
export async function issueOtpChallenge(email: string, otp: string) {
  const token = await new SignJWT({ email, h: otpHash(email, otp) })
    .setProtectedHeader({ alg: 'HS256' }).setAudience('otp').setIssuedAt().setExpirationTime('5m')
    .sign(getSecret());
  await setChallengeCookie(OTP_CHALLENGE_COOKIE, token, 5 * 60);
}

async function readOtpChallenge(email: string): Promise<string | null> {
  const token = (await cookies()).get(OTP_CHALLENGE_COOKIE)?.value;
  if (!token || !email) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { audience: 'otp', algorithms: ['HS256'] });
    return payload.email === email && typeof payload.h === 'string' ? payload.h : null;
  } catch { return null; }
}

/** True when the request carries a live OTP challenge for this email (i.e. the password step passed). */
export async function hasOtpChallenge(email: string): Promise<boolean> {
  return (await readOtpChallenge(email)) !== null;
}

export async function verifyOtpChallenge(email: string, otp: string): Promise<boolean> {
  if (!/^\d{6}$/.test(otp)) return false;
  const h = await readOtpChallenge(email);
  if (!h) return false;
  try {
    const expected = Buffer.from(h, 'hex');
    const actual = Buffer.from(otpHash(email, otp), 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch { return false; }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

// Get authenticated user from request (server-side)
export async function getAuthUser(request?: Request): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get('accessToken')?.value;

  if (!token && request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return null;
  return verifyAccessToken(token);
}

// Require auth middleware helper
export async function requireAuth(request?: Request): Promise<JWTPayload> {
  const user = await getAuthUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}

// Require admin role
export async function requireAdmin(request?: Request): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('Forbidden');
  }
  return user;
}

// Require superadmin role
export async function requireSuperAdmin(request?: Request): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (user.role !== 'superadmin') throw new Error('Forbidden');
  // The role in the access token can be up to 15 minutes old: confirm against the database for admin powers.
  const { getSupabaseAdmin } = await import('./supabase/admin');
  const { data } = await getSupabaseAdmin().from('users').select('role, is_active').eq('id', user.id).maybeSingle();
  if (!data || data.role !== 'superadmin' || data.is_active === false) throw new Error('Forbidden');
  return user;
}
