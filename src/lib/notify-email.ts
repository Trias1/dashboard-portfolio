import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase/admin';

export const hashNotifyToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Where an owner's contact-form messages are delivered: their confirmed notification email,
 * otherwise their account email. Never the public contact_info.email, which anyone can type in.
 */
export async function notifyRecipient(ownerId: number | string): Promise<string | null> {
  const db = getSupabaseAdmin();
  const { data: row } = await db.from('notification_emails').select('email, verified_at').eq('owner_id', ownerId).maybeSingle();
  if (row?.verified_at && row.email) return row.email;
  const { data: owner } = await db.from('users').select('email').eq('id', ownerId).maybeSingle();
  return owner?.email || null;
}
