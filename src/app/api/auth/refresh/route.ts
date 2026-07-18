import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;
    if (!token) return errorResponse('Refresh token required', 401);

    const decoded = await verifyRefreshToken(token);
    if (!decoded) return errorResponse('Invalid refresh token', 401);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .maybeSingle();

    if (!user) return errorResponse('User not found', 401);

    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await signRefreshToken({ id: user.id });
    await setAuthCookies(accessToken, refreshToken);

    return successResponse({ accessToken, user });
  } catch (err: any) {
    return errorResponse(err.message, 401);
  }
}
