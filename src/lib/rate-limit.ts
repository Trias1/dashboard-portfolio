import { getSupabaseAdmin } from './supabase/admin';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS: Record<string, number> = {
  global: 200, auth: 30, otp: 5, message: 3,
};

export type RateLimitType = keyof typeof MAX_REQUESTS;

export async function checkRateLimit(identifier: string, type: RateLimitType = 'global') {
  const max = MAX_REQUESTS[type] || 200;
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
  try {
    await getSupabaseAdmin().from('rate_limits').delete().lt('created_at', windowStart);
    const { count } = await getSupabaseAdmin()
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('type', type)
      .gte('created_at', windowStart);
    const currentCount = count || 0;
    if (currentCount >= max) return { allowed: false, remaining: 0, resetIn: WINDOW_MS };
    await getSupabaseAdmin().from('rate_limits').insert({ identifier, type, created_at: new Date().toISOString() });
    return { allowed: true, remaining: max - currentCount - 1, resetIn: WINDOW_MS };
  } catch { return { allowed: false, remaining: 0, resetIn: WINDOW_MS }; }
}

export function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent') || '';
  return `${ip}:${ua.slice(0, 30)}`;
}