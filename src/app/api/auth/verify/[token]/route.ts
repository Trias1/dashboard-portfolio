import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('verification_token', token)
      .gte('verification_expires', new Date().toISOString())
      .maybeSingle();

    if (!user) {
      return Response.redirect(new URL('/login?verified=failed', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    }

    await getSupabaseAdmin()
      .from('users')
      .update({ is_verified: true, verification_token: null, verification_expires: null })
      .eq('id', user.id);

    return Response.redirect(new URL('/login?verified=true', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch {
    return Response.redirect(new URL('/login?verified=failed', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
}
