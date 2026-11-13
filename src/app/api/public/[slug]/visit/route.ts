import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { findPublicPortfolio } from '@/lib/public-access';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Link-preview fetchers and crawlers that run scripts: not people, so not visits.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pagespeed/i;

/**
 * Counts one visit to a published portfolio. The page sends this from the browser once it has loaded, so the
 * server render (also fetched by crawlers and link previews) never counts. Always answers 204: the page has
 * nothing to do with the result, and it doesn't tell callers which slugs exist.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ua = (request.headers.get('user-agent') || '').slice(0, 300);
    if (slug === 'demo' || !ua || BOT_UA.test(ua)) return new Response(null, { status: 204 });

    const db = getSupabaseAdmin();
    const portfolio = await findPublicPortfolio(slug);
    if (!portfolio) return new Response(null, { status: 204 });

    const ip = getClientId(request);
    // At most a few visits per visitor and portfolio per 15 minutes, so refreshing or scripting can't inflate stats.
    const rl = await checkRateLimit(`visit:${portfolio.id}:${ip}`, 'visit');
    if (rl.allowed) await db.from('portfolio_visits').insert({ portfolio_id: portfolio.id, ip_address: ip, user_agent: ua });
  } catch { /* stats are best-effort */ }
  return new Response(null, { status: 204 });
}
