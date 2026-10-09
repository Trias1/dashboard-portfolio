import { NextRequest } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import https from 'node:https';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { errorResponse, getErrorMessage, readJsonBody } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 1024 * 1024;

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 ||                              // "this" network
    a === 10 ||                             // private
    a === 127 ||                            // loopback
    (a === 100 && b >= 64 && b <= 127) ||   // CGNAT
    (a === 169 && b === 254) ||             // link-local / cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||    // private
    (a === 192 && b === 0 && parts[2] === 0) ||
    (a === 192 && b === 168) ||             // private
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    a >= 224                                // multicast / reserved / broadcast
  );
}

function isPrivateIP(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version !== 6) return true;
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (lower === '::' || lower === '::1') return true;
  // IPv4-mapped / IPv4-compatible / NAT64 addresses
  const v4 = lower.match(/(?:^::ffff:|^::|^64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) return isPrivateIPv4(v4[1]);
  if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(lower)) return true;
  const first = parseInt(lower.split(':')[0] || '0', 16);
  return (
    (first & 0xfe00) === 0xfc00 || // unique local fc00::/7
    (first & 0xffc0) === 0xfe80 || // link-local fe80::/10
    (first & 0xff00) === 0xff00    // multicast ff00::/8
  );
}

interface SafeTarget { url: URL; address: string; family: 4 | 6 }

/** A public https URL plus the one address it resolved to; the fetch below connects to exactly that address. */
async function isSafePublicUrl(raw: unknown): Promise<SafeTarget | null> {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== '443') return null;

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) return null;
  const literal = isIP(hostname);
  if (literal) return isPrivateIP(hostname) ? null : { url, address: hostname, family: literal as 4 | 6 };

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some((a) => isPrivateIP(a.address))) return null;
    return { url, address: addresses[0].address, family: addresses[0].family as 4 | 6 };
  } catch { return null; }
}

/**
 * GET over https pinned to the address that was checked (DNS rebinding: resolving the name a second time at
 * connect time could return an internal IP). TLS still verifies the certificate for the real host name.
 * No redirects; at most MAX_RESPONSE_BYTES are read.
 */
function fetchPinned(target: SafeTarget): Promise<{ ok: boolean; html: string }> {
  return new Promise((resolve) => {
    const req = https.request(target.url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)', Accept: 'text/html' },
      // Newer Node asks for every address ({ all: true }) and expects an array back.
      lookup: ((_host: string, opts: { all?: boolean }, cb: (...args: unknown[]) => void) => (opts?.all
        ? cb(null, [{ address: target.address, family: target.family }])
        : cb(null, target.address, target.family))) as unknown as https.RequestOptions['lookup'],
      timeout: FETCH_TIMEOUT_MS,
    }, (res) => {
      const status = res.statusCode || 0;
      const declared = Number(res.headers['content-length'] || 0);
      if (status < 200 || status >= 300 || declared > MAX_RESPONSE_BYTES * 5) { res.destroy(); resolve({ ok: false, html: '' }); return; }
      const chunks: Buffer[] = [];
      let total = 0;
      res.on('data', (chunk: Buffer) => {
        total += chunk.length;
        if (total > MAX_RESPONSE_BYTES) {
          // og:image lives in <head>; keep what we have and stop downloading
          chunks.push(chunk.subarray(0, chunk.length - (total - MAX_RESPONSE_BYTES)));
          res.destroy();
          resolve({ ok: true, html: Buffer.concat(chunks).toString('utf8') });
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => resolve({ ok: true, html: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', () => resolve({ ok: false, html: '' }));
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve({ ok: false, html: '' }));
    req.end();
  });
}

/**
 * og:image from the page's <meta> tags, in either attribute order. Linear-time on purpose: the old single
 * regex backtracked quadratically on hostile HTML (thousands of "<meta " with no ">").
 */
function findOgImage(html: string): string | null {
  const headEnd = html.search(/<\/head\s*>/i);
  const head = html.slice(0, headEnd > 0 ? headEnd : 256 * 1024);
  const tagRe = /<meta\b([^<>]{0,2000})>/gi;
  for (let m = tagRe.exec(head); m; m = tagRe.exec(head)) {
    const attrs: Record<string, string> = {};
    const attrRe = /([a-z:-]{1,40})\s*=\s*(?:"([^"]{0,2000})"|'([^']{0,2000})')/gi;
    for (let a = attrRe.exec(m[1]); a; a = attrRe.exec(m[1])) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? '';
    const key = (attrs.property || attrs.name || '').toLowerCase();
    if ((key === 'og:image' || key === 'og:image:url' || key === 'og:image:secure_url') && attrs.content) return attrs.content.trim();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rl = await checkRateLimit(`ogimage:${auth.id}`, 'ogimage');
    if (!rl.allowed) return errorResponse('Too many requests. Please try again later.', 429);

    const body = await readJsonBody(request);
    const url = body?.url;
    if (!url) return Response.json({ image: null });

    const target = await isSafePublicUrl(url);
    if (!target) return errorResponse('Only public https:// URLs are allowed', 400);

    const { ok, html } = await fetchPinned(target);
    if (!ok) return Response.json({ image: null });

    const ogImage = findOgImage(html);
    let image: string | null = null;
    if (ogImage) {
      try {
        const resolved = new URL(ogImage, target.url);
        if (resolved.protocol === 'https:' || resolved.protocol === 'http:') image = resolved.toString();
      } catch {}
    }

    return Response.json({ image });
  } catch (err) {
    if (getErrorMessage(err) === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return Response.json({ image: null });
  }
}
