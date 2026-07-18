import { NextRequest, NextResponse } from 'next/server';
import { isInternalHostname, normalizeCustomDomain } from '@/lib/custom-domain';

export async function proxy(request: NextRequest) {
  const hostname = normalizeCustomDomain(request.headers.get('x-forwarded-host') || request.headers.get('host'));
  if (isInternalHostname(hostname)) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') return NextResponse.next();

  if (pathname === '/login' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const mainUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://portfolio.tzm.web.id');
    mainUrl.pathname = pathname;
    mainUrl.search = request.nextUrl.search;
    return NextResponse.redirect(mainUrl);
  }

  if (pathname.startsWith('/api')) return NextResponse.next();

  try {
    const resolver = new URL('/api/public/domain/' + encodeURIComponent(hostname), request.url);
    const response = await fetch(resolver, { cache: 'no-store' });
    if (!response.ok) return NextResponse.next();
    const payload = await response.json();
    const slug = payload?.data?.slug;
    if (!slug) return NextResponse.next();

    const rewrite = request.nextUrl.clone();
    rewrite.pathname = '/portfolio/' + slug;
    return NextResponse.rewrite(rewrite);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
