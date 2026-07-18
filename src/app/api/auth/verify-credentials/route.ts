import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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

    return successResponse({ message: 'Credentials valid' });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
