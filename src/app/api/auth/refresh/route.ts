import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signAccessToken, setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { rotateSession } from '@/lib/sessions';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(`refresh:${getClientId(request)}`, 'global');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;
    if (!token) return errorResponse('Refresh token required', 401);

    const rotated = await rotateSession(token, request.headers.get('user-agent'));
    if (!rotated) {
      await clearAuthCookies();
      return errorResponse('Session is no longer valid', 401);
    }

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role, is_active, is_verified')
      .eq('id', rotated.userId)
      .maybeSingle();

    if (!user || !user.is_active || !user.is_verified) {
      await clearAuthCookies();
      return errorResponse('Session is no longer valid', 401);
    }

    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    await setAuthCookies(accessToken, rotated.refreshToken);

    return successResponse({ accessToken, user });
  } catch (err) {
    // Don't echo internals (e.g. a missing secret) to the client.
    console.error('[auth refresh]', err instanceof Error ? err.message : err);
    return errorResponse('Session is no longer valid', 401);
  }
}
