import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeEmail, verifyEmailChangeToken } from '@/lib/auth';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

const RESULTS = {
  changed: { title: 'Email changed', body: 'From now on, log in with your new email address.' },
  taken: { title: 'Email already in use', body: 'Another account uses this address now, so your email was not changed.' },
  invalid: { title: 'Link not valid', body: 'This link has expired, was already used, or your email changed since. Request the change again from your profile.' },
} as const;

/** Small standalone page: the link is often opened on a phone where the user isn't logged in. */
function page(result: keyof typeof RESULTS, request: NextRequest) {
  const { title, body } = RESULTS[result];
  const login = new URL('/login', request.url).toString();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} - PortfolioKit</title></head>
<body style="margin:0;background:#fafaf7;color:#141414;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.55">
<main style="max-width:440px;margin:12vh auto 0;padding:0 20px">
<p style="margin:0 0 28px;font-weight:700">PortfolioKit</p>
<h1 style="margin:0 0 10px;font-size:26px">${title}</h1>
<p style="margin:0 0 24px;color:#55555a">${body}</p>
<a href="${login}" style="display:inline-block;background:#1f45c9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Go to login</a>
</main></body></html>`;
  return new Response(html, {
    status: result === 'changed' ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

/** The link in the "confirm your new email" mail. */
export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(`confirm-email:${getClientId(request)}`, 'auth');
    if (!rl.allowed) return page('invalid', request);
    const token = request.nextUrl.searchParams.get('token') || '';
    const claims = token.length <= 1000 ? await verifyEmailChangeToken(token) : null;
    if (!claims) return page('invalid', request);

    const db = getSupabaseAdmin();
    const { data: user } = await db.from('users').select('id, email').eq('id', claims.id).maybeSingle();
    // The account must still have the address the change was requested from (one-time use, newest request wins).
    if (!user || normalizeEmail(user.email) !== claims.from) return page('invalid', request);

    const { data: taken } = await db.from('users').select('id').eq('email', claims.to).neq('id', claims.id).maybeSingle();
    if (taken) return page('taken', request);

    const { error } = await db.from('users').update({ email: claims.to }).eq('id', claims.id).eq('email', user.email);
    if (error) return page(error.code === '23505' ? 'taken' : 'invalid', request);
    return page('changed', request);
  } catch {
    return page('invalid', request);
  }
}
