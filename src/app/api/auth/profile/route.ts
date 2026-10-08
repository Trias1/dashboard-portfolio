import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth, isBcryptHash, normalizeEmail, MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { name, email, password, photo_url, currentPassword } = await request.json();

    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase.from('users').select('id, email, password').eq('id', auth.id).maybeSingle();
    if (!current) return errorResponse('User not found', 404);

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (photo_url !== undefined) updates.photo_url = photo_url;

    const newEmail = email !== undefined ? normalizeEmail(email) : '';
    const emailChanged = email !== undefined && newEmail !== normalizeEmail(current.email);
    if (emailChanged) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return errorResponse('Invalid email address', 400);
      const { data: taken } = await supabase.from('users').select('id').eq('email', newEmail).neq('id', auth.id).maybeSingle();
      if (taken) return errorResponse('Email already in use', 400);
      updates.email = newEmail;
    }

    if (password) {
      if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    // Sensitive changes require re-authentication with the current password.
    if (emailChanged || updates.password) {
      const hasPassword = isBcryptHash(current.password);
      if (hasPassword) {
        const rl = await checkRateLimit(`profile-pw:${auth.id}`, 'otp');
        if (!rl.allowed) return errorResponse('Too many attempts. Please try again later.', 429);
        if (typeof currentPassword !== 'string' || !currentPassword) return errorResponse('Current password is required', 400);
        if (!(await bcrypt.compare(currentPassword, current.password))) return errorResponse('Current password is incorrect', 400);
      } else if (emailChanged) {
        // Google-only account (no password yet): set a password first before changing email.
        return errorResponse('Set a password before changing your email', 400);
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', auth.id)
      .select('id, name, email, role, photo_url')
      .single();

    if (error) return errorResponse('Unable to update profile', 500);
    return successResponse(data);
  } catch (err: any) {
    return err.message === 'Unauthorized' ? errorResponse('Unauthorized', 401) : errorResponse('Unable to update profile', 500);
  }
}
