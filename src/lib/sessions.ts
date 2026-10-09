import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase/admin';
import { signRefreshToken, verifyRefreshToken } from './auth';

/**
 * Revocable login sessions (table auth_sessions, migration 005).
 * The refresh JWT carries its session id (jti) and family id (fam). Refreshing revokes the row and creates
 * the next one in the same family; replaying a revoked token revokes the family (a copied token was used).
 * Until the migration has run, everything falls back to the old stateless refresh tokens.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // matches the refresh cookie lifetime
// Two tabs refreshing at the same moment both present the same token; the second one gets the successor.
const REUSE_GRACE_MS = 30 * 1000;

type Db = ReturnType<typeof getSupabaseAdmin>;

/** The table is missing (migration not applied yet). */
const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === '42P01' || error.code === 'PGRST205' || /auth_sessions/.test(error.message || '') && /does not exist|schema cache/i.test(error.message || ''));

async function insertSession(db: Db, userId: number, familyId: string, userAgent?: string | null) {
  const id = crypto.randomUUID();
  const { error } = await db.from('auth_sessions').insert({
    id, user_id: userId, family_id: familyId,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    user_agent: userAgent ? userAgent.slice(0, 300) : null,
  });
  return { id, error };
}

/** Start a new session after a successful login; returns the refresh token to put in the cookie. */
export async function startSession(userId: number, userAgent?: string | null): Promise<string> {
  const db = getSupabaseAdmin();
  const familyId = crypto.randomUUID();
  const { id, error } = await insertSession(db, userId, familyId, userAgent);
  if (error) {
    if (isMissingTable(error)) return signRefreshToken({ id: userId });
    throw new Error('Could not start session');
  }
  return signRefreshToken({ id: userId, jti: id, fam: familyId });
}

async function revokeFamily(db: Db, familyId: string) {
  await db.from('auth_sessions').update({ revoked_at: new Date().toISOString() }).eq('family_id', familyId).is('revoked_at', null);
}

/**
 * Exchange a refresh token for the next one. Returns the user id and the new refresh token,
 * or null when the session is unknown, expired, revoked, or the token was replayed.
 */
export async function rotateSession(token: string, userAgent?: string | null): Promise<{ userId: number; refreshToken: string } | null> {
  const decoded = await verifyRefreshToken(token);
  if (!decoded) return null;
  const db = getSupabaseAdmin();

  if (!decoded.jti || !decoded.fam) {
    // A token from before sessions existed. Accept it only while the table doesn't exist yet.
    // (Not a HEAD request: those come back without the error code that tells us the table is missing.)
    const { error } = await db.from('auth_sessions').select('id').limit(1);
    if (isMissingTable(error)) return { userId: decoded.id, refreshToken: await signRefreshToken({ id: decoded.id }) };
    return null;
  }

  const { data: row, error } = await db.from('auth_sessions')
    .select('id, user_id, family_id, expires_at, revoked_at, replaced_by')
    .eq('id', decoded.jti).maybeSingle();
  if (error || !row || Number(row.user_id) !== Number(decoded.id) || row.family_id !== decoded.fam) return null;

  if (row.revoked_at) {
    const revokedAgo = Date.now() - new Date(row.revoked_at).getTime();
    if (row.replaced_by && revokedAgo < REUSE_GRACE_MS) {
      // Follow the chain to its current head: another tab may have refreshed more than once meanwhile.
      let nextId: string | null = row.replaced_by;
      for (let hop = 0; nextId && hop < 5; hop++) {
        const { data: next } = await db.from('auth_sessions').select('id, expires_at, revoked_at, replaced_by').eq('id', nextId).maybeSingle();
        if (!next) break;
        if (!next.revoked_at) {
          if (new Date(next.expires_at).getTime() <= Date.now()) break;
          return { userId: decoded.id, refreshToken: await signRefreshToken({ id: decoded.id, jti: next.id, fam: row.family_id }) };
        }
        if (Date.now() - new Date(next.revoked_at).getTime() >= REUSE_GRACE_MS) break;
        nextId = next.replaced_by;
      }
    }
    // Replay of an old token: someone else has a copy. End every session in this chain.
    await revokeFamily(db, row.family_id);
    return null;
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  const { id: nextId, error: insertError } = await insertSession(db, decoded.id, row.family_id, userAgent);
  if (insertError) return null;
  // Only one concurrent request may retire the row; the other one is handed the winner's successor.
  const { data: retired } = await db.from('auth_sessions')
    .update({ revoked_at: new Date().toISOString(), replaced_by: nextId })
    .eq('id', row.id).is('revoked_at', null).select('id');
  if (!retired?.length) {
    await db.from('auth_sessions').delete().eq('id', nextId);
    const { data: now } = await db.from('auth_sessions').select('replaced_by').eq('id', row.id).maybeSingle();
    if (!now?.replaced_by) return null;
    return { userId: decoded.id, refreshToken: await signRefreshToken({ id: decoded.id, jti: now.replaced_by, fam: row.family_id }) };
  }
  return { userId: decoded.id, refreshToken: await signRefreshToken({ id: decoded.id, jti: nextId, fam: row.family_id }) };
}

/** Logout: end the session chain this refresh token belongs to. */
export async function endSession(token: string | undefined) {
  if (!token) return;
  const decoded = await verifyRefreshToken(token).catch(() => null);
  if (!decoded?.fam) return;
  const db = getSupabaseAdmin();
  const { error } = await db.from('auth_sessions').update({ revoked_at: new Date().toISOString() })
    .eq('family_id', decoded.fam).eq('user_id', decoded.id).is('revoked_at', null);
  if (error && !isMissingTable(error)) console.error('[sessions] logout revoke failed', error.code);
}

/** Password reset/change, deactivation: sign the user out everywhere. */
export async function revokeAllSessions(userId: number) {
  const { error } = await getSupabaseAdmin().from('auth_sessions').update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId).is('revoked_at', null);
  if (error && !isMissingTable(error)) console.error('[sessions] revoke-all failed', error.code);
}
