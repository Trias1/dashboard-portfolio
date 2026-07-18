import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAIN_DOMAINS = ['localhost', '127.0.0.1', 'portfolio.tzm.web.id', 'www.tzm.web.id', 'tzm.web.id', 'portfolio-vercel.vercel.app'];

const WILDCARD_PARENT = 'tzm.web.id';

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const domain = hostname.split(':')[0];

  if (MAIN_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next();

  if (pathname === '/login' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const mainUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://portfolio.tzm.web.id');
    mainUrl.pathname = pathname;
    mainUrl.search = request.nextUrl.search;
    return NextResponse.redirect(mainUrl);
  }

  if (pathname.startsWith('/api')) return NextResponse.next();

  const origin = request.nextUrl.origin;
  let slug: string | null = null;

  // 1. Try explicit custom_domain lookup
  try {
    const res = await fetch(`${origin}/api/public/domain/${domain}`);
    if (res.ok) {
      const data = await res.json();
      slug = data.slug;
    }
  } catch {}

  // 2. Try wildcard subdomain: trias-zaen-mutaqin.tzm.web.id -> slug = trias-zaen-mutaqin
  if (!slug && domain.endsWith('.' + WILDCARD_PARENT)) {
    const subdomain = domain.slice(0, -('.' + WILDCARD_PARENT).length);
    if (subdomain && !subdomain.includes('.')) {
      try {
        const res = await fetch(`${origin}/api/public/slug/${subdomain}`);
        if (res.ok) slug = subdomain;
      } catch {}
    }
  }

  if (slug) {
    const url = request.nextUrl.clone();
    url.pathname = `/portfolio/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

