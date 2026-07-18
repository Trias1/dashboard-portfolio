// JWT Auth Helpers
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload, UserRole } from '@/types';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);
const getRefreshSecret = () => new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
    .sign(getSecret());
}

export async function signRefreshToken(payload: { id: number }): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch { return null; }
}

export async function verifyRefreshToken(token: string): Promise<{ id: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as unknown as { id: number };
  } catch { return null; }
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
  return user;
}
