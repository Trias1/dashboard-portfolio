import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { loadShareCard } from '@/lib/public-portfolio';
import { getThemeById } from '@/lib/sections';
import { MAIN_URL, shareCardColors } from '@/lib/portfolio-seo';

export const dynamic = 'force-dynamic';
export const alt = 'Portfolio preview card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PHOTO_TIMEOUT_MS = 4000;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const clip = (value: unknown, max: number) => {
  const s = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
};

/**
 * The owner's photo as a data URL, or null. Only photos in our own Supabase storage are fetched: the URL is
 * owner-supplied, and fetching any address from the server would let it probe internal hosts. PNG and JPEG
 * only (what the card renderer reads); WebP and others fall back to initials.
 */
async function loadPhoto(url: unknown): Promise<string | null> {
  const storage = process.env.SUPABASE_URL;
  if (typeof url !== 'string' || !storage) return null;
  let target: URL;
  try {
    target = new URL(url);
    if (target.protocol !== 'https:' || target.origin !== new URL(storage).origin || !target.pathname.startsWith('/storage/v1/object/public/')) return null;
  } catch { return null; }
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS), redirect: 'error' });
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!res.ok || !['image/png', 'image/jpeg'].includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_PHOTO_BYTES) return null;
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

/** The share card (1200×630) shown when a portfolio link is posted on WhatsApp, LinkedIn, X and the like. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await loadShareCard(slug);
  if (!card) notFound();

  const theme = getThemeById(card.theme);
  const c = shareCardColors(theme.bg, theme.accent);
  const name = clip(card.about?.name || card.title || card.slug, 48);
  const role = clip(card.about?.title || card.hero?.headline, 70);
  const blurb = clip(card.about?.bio || card.hero?.subheadline, 150);
  const photo = await loadPhoto(card.about?.photo_url);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  const address = `${MAIN_URL.replace(/^https?:\/\//, '')}/portfolio/${card.slug}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: c.bg, color: c.ink }}>
        <div style={{ width: 14, height: '100%', background: c.accent, display: 'flex' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '72px 80px 56px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 44, flex: 1 }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- rendered to PNG by next/og, not a page image
              <img src={photo} alt="" width={220} height={220} style={{ borderRadius: 9999, objectFit: 'cover', border: `4px solid ${c.rule}` }} />
            ) : (
              <div style={{ width: 220, height: 220, borderRadius: 9999, background: c.accent, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 88, fontWeight: 700 }}>
                {initials}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', fontSize: name.length > 28 ? 56 : 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>{name}</div>
              {role && <div style={{ display: 'flex', marginTop: 16, fontSize: 32, color: c.accent, fontWeight: 600 }}>{role}</div>}
              {blurb && <div style={{ display: 'flex', marginTop: 22, fontSize: 26, lineHeight: 1.4, color: c.soft }}>{blurb}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${c.rule}`, paddingTop: 26, fontSize: 24, color: c.soft }}>
            <span>{address}</span>
            <span style={{ fontWeight: 600 }}>PortfolioKit</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Social sites keep their own copy; this only spares the database when a link is shared widely.
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
