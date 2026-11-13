import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase/admin';
import { hashToken } from './auth';
import { sendResetPassword, sendVerificationEmail } from './mailer';

/** How long the links mailed by these helpers stay valid. */
export const RESET_TTL_MS = 60 * 60 * 1000;
export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

type Account = { id: number; email: string; name?: string | null };

/** Store a new reset token (only its hash) and mail the link. Throws when the token can't be stored or sent. */
export async function mailResetLink(user: Account) {
  const token = crypto.randomBytes(32).toString('hex');
  const { error } = await getSupabaseAdmin().from('users')
    .update({ reset_token: hashToken(token), reset_token_expires: new Date(Date.now() + RESET_TTL_MS).toISOString() })
    .eq('id', user.id);
  if (error) throw new Error(`Could not store the reset token (${error.code || 'db'})`);
  await sendResetPassword(user.email, user.name || '', token);
}

/** Store a new verification token (only its hash) and mail the link. */
export async function mailVerificationLink(user: Account) {
  const token = crypto.randomBytes(32).toString('hex');
  const { error } = await getSupabaseAdmin().from('users')
    .update({ verification_token: hashToken(token), verification_expires: new Date(Date.now() + VERIFY_TTL_MS).toISOString() })
    .eq('id', user.id);
  if (error) throw new Error(`Could not store the verification token (${error.code || 'db'})`);
  await sendVerificationEmail(user.email, user.name || '', token);
}
