import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const { email, password } = await request.json();
    if (!email || !password) return errorResponse('Email and password required', 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) return errorResponse('Invalid credentials', 400);
    if (!user.is_verified) return errorResponse('Please verify your email first', 403);
    if (!user.is_active) return errorResponse('Account is inactive', 403);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return errorResponse('Invalid credentials', 400);

    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await signRefreshToken({ id: user.id });

    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
