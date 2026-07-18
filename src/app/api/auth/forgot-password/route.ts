import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendResetPassword } from '@/lib/mailer';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return errorResponse('Email required', 400);

    const { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (!user) return successResponse({ message: 'Jika email terdaftar, link reset akan dikirim.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await getSupabaseAdmin()
      .from('users')
      .update({ reset_token: token, reset_token_expires: expires })
      .eq('id', user.id);

    await sendResetPassword(user.email, user.name, token);

    return successResponse({ message: 'Jika email terdaftar, link reset akan dikirim.' });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
