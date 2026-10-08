import { getSupabaseAdmin } from './supabase/admin';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS: Record<string, number> = {
  global: 200, auth: 30, otp: 5, message: 3, chat: 30, ai: 20, upload: 30, ogimage: 30, loginfail: 20, visit: 3,
};

export type RateLimitType = keyof typeof MAX_REQUESTS;

/**
 * Record one hit and say whether it is still within the limit.
 * Uses the atomic rate_limit_hit() function (migration 005) so parallel requests can't all slip under the limit;
 * falls back to count-then-insert if the function isn't there yet. Fails closed on errors.
 */
export async function checkRateLimit(identifier: string, type: RateLimitType = 'global') {
  const max = MAX_REQUESTS[type] || 200;
  const db = getSupabaseAdmin();
  try {
    const { data, error } = await db.rpc('rate_limit_hit', {
      p_identifier: identifier, p_type: type, p_window_seconds: WINDOW_MS / 1000, p_max: max,
    });
    if (!error && typeof data === 'boolean') {
      // Housekeeping now and then instead of on every request.
      if (Math.random() < 0.02) void db.from('rate_limits').delete().lt('created_at', new Date(Date.now() - WINDOW_MS).toISOString());
      return { allowed: data, remaining: data ? 1 : 0, resetIn: WINDOW_MS };
    }
  } catch { /* fall through to the non-atomic path */ }

  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
  try {
    await db.from('rate_limits').delete().lt('created_at', windowStart);
    const { count } = await db
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('type', type)
      .gte('created_at', windowStart);
    const currentCount = count || 0;
    if (currentCount >= max) return { allowed: false, remaining: 0, resetIn: WINDOW_MS };
    await db.from('rate_limits').insert({ identifier, type, created_at: new Date().toISOString() });
    return { allowed: true, remaining: max - currentCount - 1, resetIn: WINDOW_MS };
  } catch { return { allowed: false, remaining: 0, resetIn: WINDOW_MS }; }
}

/** Whether `identifier` is still under its limit, without recording a hit (e.g. failed logins so far). */
export async function isUnderLimit(identifier: string, type: RateLimitType): Promise<boolean> {
  const max = MAX_REQUESTS[type] || 200;
  try {
    const { count, error } = await getSupabaseAdmin()
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('type', type)
      .gte('created_at', new Date(Date.now() - WINDOW_MS).toISOString());
    if (error) return false;
    return (count || 0) < max;
  } catch { return false; }
}

export function getClientId(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}
