import { NextRequest } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/utils';

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

async function isSafePublicUrl(raw: unknown): Promise<URL | null> {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== '443') return null;

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) return null;
  if (isIP(hostname)) return isPrivateIP(hostname) ? null : url;

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some((a) => isPrivateIP(a.address))) return null;
  } catch { return null; }
  return url;
}

async function readLimitedText(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      // og:image lives in <head>; keep what we have and stop downloading
      chunks.push(value.subarray(0, value.byteLength - (total - MAX_RESPONSE_BYTES)));
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rl = await checkRateLimit(`ogimage:${auth.id}`, 'ogimage');
    if (!rl.allowed) return errorResponse('Too many requests. Please try again later.', 429);

    const { url } = await request.json();
    if (!url) return Response.json({ image: null });

    const target = await isSafePublicUrl(url);
    if (!target) return errorResponse('Only public https:// URLs are allowed', 400);

    const res = await fetch(target, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
    });
    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      return Response.json({ image: null });
    }
    const declaredLength = Number(res.headers.get('content-length') || 0);
    if (declaredLength > MAX_RESPONSE_BYTES * 5) {
      await res.body?.cancel().catch(() => {});
      return Response.json({ image: null });
    }
    const html = await readLimitedText(res);

    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    let image: string | null = null;
    if (match) {
      try {
        const resolved = new URL(match[1], target);
        if (resolved.protocol === 'https:' || resolved.protocol === 'http:') image = resolved.toString();
      } catch {}
    }

    return Response.json({ image });
  } catch (err: any) {
    if (err?.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return Response.json({ image: null });
  }
}
