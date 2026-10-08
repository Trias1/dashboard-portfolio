import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { hashNotifyToken } from '@/lib/notify-email';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendNotifyEmailVerification } from '@/lib/mailer';

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Where contact-form messages go: the verified notification email, or the account email. */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getSupabaseAdmin();
    const [{ data: row }, { data: user }] = await Promise.all([
      db.from('notification_emails').select('email, verified_at, token_expires').eq('owner_id', auth.id).maybeSingle(),
      db.from('users').select('email').eq('id', auth.id).maybeSingle(),
    ]);
    const pending = !!row && !row.verified_at;
    return successResponse({
      accountEmail: user?.email || '',
      email: row?.email || '',
      verified: !!row?.verified_at,
      pending,
      expired: pending && !!row?.token_expires && new Date(row.token_expires).getTime() < Date.now(),
      deliversTo: row?.verified_at ? row.email : user?.email || '',
    });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}

/** Save a new address and email it a confirmation link. Until it is confirmed, messages go to the account email. */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return errorResponse("That email address doesn't look right", 400);

    const rl = await checkRateLimit(`notify-email:${auth.id}`, 'otp');
    if (!rl.allowed) return errorResponse('Too many confirmation emails. Please try again later.', 429);

    const db = getSupabaseAdmin();
    const { data: existing } = await db.from('notification_emails').select('email, verified_at').eq('owner_id', auth.id).maybeSingle();
    if (existing?.verified_at && existing.email === email) return successResponse({ verified: true, email });

    const token = crypto.randomBytes(32).toString('base64url');
    const { error } = await db.from('notification_emails').upsert({
      owner_id: auth.id,
      email,
      verified_at: null,
      token_hash: hashNotifyToken(token),
      token_expires: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id' });
    if (error) throw new Error(error.message);

    try {
      await sendNotifyEmailVerification(email, token);
    } catch (err) {
      console.error('[SMTP Error] notify-email verification:', err);
      return errorResponse("We couldn't send the confirmation email. Please try again.", 502);
    }
    return successResponse({ pending: true, email }, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}

/** Go back to sending messages to the account email. */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await getSupabaseAdmin().from('notification_emails').delete().eq('owner_id', auth.id);
    return successResponse({ removed: true });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
