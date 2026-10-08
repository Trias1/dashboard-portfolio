import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { hashNotifyToken } from '@/lib/notify-email';

const RESULTS = {
  verified: { title: 'Email confirmed', body: 'Messages from your portfolio’s contact form will now be delivered to this address.' },
  expired: { title: 'Link expired', body: 'This confirmation link has expired. Open the Contact section in your dashboard and send a new one.' },
  invalid: { title: 'Link not valid', body: 'This confirmation link isn’t valid anymore. Open the Contact section in your dashboard and send a new one.' },
} as const;

/** A small standalone page: the link is often opened on a phone where the owner isn't logged in. */
function page(result: keyof typeof RESULTS, request: NextRequest) {
  const { title, body } = RESULTS[result];
  const dashboard = new URL('/dashboard', request.url).toString();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} - PortfolioKit</title></head>
<body style="margin:0;background:#fafaf7;color:#141414;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.55">
<main style="max-width:440px;margin:12vh auto 0;padding:0 20px">
<p style="margin:0 0 28px;font-weight:700">PortfolioKit</p>
<h1 style="margin:0 0 10px;font-size:26px">${title}</h1>
<p style="margin:0 0 24px;color:#55555a">${body}</p>
<a href="${dashboard}" style="display:inline-block;background:#1f45c9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Go to dashboard</a>
</main></body></html>`;
  return new Response(html, {
    status: result === 'verified' ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

/** The link in the confirmation email: marks the notification address as confirmed. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!token || token.length > 200) return page('invalid', request);
  try {
    const db = getSupabaseAdmin();
    const { data: row } = await db.from('notification_emails').select('owner_id, token_expires').eq('token_hash', hashNotifyToken(token)).maybeSingle();
    if (!row) return page('invalid', request);
    if (!row.token_expires || new Date(row.token_expires).getTime() < Date.now()) return page('expired', request);
    const now = new Date().toISOString();
    const { error } = await db.from('notification_emails')
      .update({ verified_at: now, token_hash: null, token_expires: null, updated_at: now })
      .eq('owner_id', row.owner_id);
    return page(error ? 'invalid' : 'verified', request);
  } catch {
    return page('invalid', request);
  }
}
