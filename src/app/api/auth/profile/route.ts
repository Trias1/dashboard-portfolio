import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth, isBcryptHash, normalizeEmail, MIN_PASSWORD_LENGTH, BCRYPT_COST, signAccessToken, setAuthCookies, signEmailChangeToken } from '@/lib/auth';
import { sendEmailChangeConfirmation, sendEmailChangeNotice } from '@/lib/mailer';
import type { UserRole } from '@/types';
import { revokeAllSessions, startSession } from '@/lib/sessions';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const { name, email, password, photo_url, currentPassword } = body;

    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase.from('users').select('id, email, password').eq('id', auth.id).maybeSingle();
    if (!current) return errorResponse('User not found', 404);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.length > 100) return errorResponse('Name must be 1-100 characters', 400);
      updates.name = name.trim();
    }
    if (photo_url !== undefined) {
      if (photo_url !== null && photo_url !== '' && (typeof photo_url !== 'string' || photo_url.length > 1000 || !photo_url.toLowerCase().startsWith('https://'))) return errorResponse('Invalid photo URL', 400);
      updates.photo_url = photo_url || null;
    }

    const newEmail = email !== undefined ? normalizeEmail(email) : '';
    const emailChanged = email !== undefined && newEmail !== normalizeEmail(current.email);
    if (emailChanged) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return errorResponse('Invalid email address', 400);
      // Not applied here: the new address must be confirmed first (see the confirmation mail below).
    }

    if (password) {
      if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
      }
      updates.password = await bcrypt.hash(password, BCRYPT_COST);
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

    let data: { id: number; name: string; email: string; role: UserRole; photo_url: string | null } | null = null;
    if (Object.keys(updates).length) {
      const res = await supabase.from('users').update(updates).eq('id', auth.id).select('id, name, email, role, photo_url').single();
      if (res.error) return errorResponse('Unable to update profile', 500);
      data = res.data;
    } else {
      const res = await supabase.from('users').select('id, name, email, role, photo_url').eq('id', auth.id).single();
      if (res.error) return errorResponse('Unable to update profile', 500);
      data = res.data;
    }
    if (!data) return errorResponse('Unable to update profile', 500);

    // New login email: mail a confirmation link to the new address and a heads-up to the current one.
    let pendingEmail: string | null = null;
    if (emailChanged) {
      const rl = await checkRateLimit(`email-change:${auth.id}`, 'otp');
      if (!rl.allowed) return errorResponse('Too many email change requests. Please try again later.', 429);
      try {
        // Same answer whether or not another account has that address, so this can't be used to look up users;
        // no link is sent in that case (the confirm page would refuse it anyway).
        const { data: taken } = await supabase.from('users').select('id').eq('email', newEmail).neq('id', auth.id).maybeSingle();
        if (!taken) {
          const token = await signEmailChangeToken({ id: data.id, from: normalizeEmail(current.email), to: newEmail });
          await sendEmailChangeConfirmation(newEmail, data.name || '', token);
          await sendEmailChangeNotice(current.email, data.name || '', newEmail).catch(() => {});
        }
        pendingEmail = newEmail;
      } catch (err) {
        console.error('[profile] email change mail failed', err instanceof Error ? err.message : err);
        return errorResponse("We couldn't send the confirmation email. Please try again.", 502);
      }
    }

    // New password: sign out every other device, keep this one logged in with a fresh session.
    if (updates.password) {
      await revokeAllSessions(auth.id);
      const accessToken = await signAccessToken({ id: data.id, email: data.email, role: data.role });
      await setAuthCookies(accessToken, await startSession(data.id, request.headers.get('user-agent')));
    }
    return successResponse({ ...data, pendingEmail });
  } catch (err) {
    return getErrorMessage(err) === 'Unauthorized' ? errorResponse('Unauthorized', 401) : errorResponse('Unable to update profile', 500);
  }
}
