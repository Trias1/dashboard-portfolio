import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { buildPortfolioSeo } from '@/lib/portfolio-seo';
import { getAuthUser } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: portfolio } = await getSupabaseAdmin()
    .from('portfolios')
    .select('owner_id, title, slug, is_published')
    .eq('slug', slug)
    .maybeSingle();

  const notFound: Metadata = { title: 'Portfolio Not Found', robots: { index: false, follow: false } };
  if (!portfolio) return notFound;
  if (!portfolio.is_published) {
    // Drafts: only the owner (or superadmin) previewing gets a real title; everyone else sees the same 404 title
    const viewer = await getAuthUser();
    const canPreview = !!viewer && (String(viewer.id) === String(portfolio.owner_id) || viewer.role === 'superadmin');
    return canPreview
      ? { title: `Draft preview · ${portfolio.title || portfolio.slug}`, robots: { index: false, follow: false } }
      : notFound;
  }

  const [{ data: about }, { data: hero }] = await Promise.all([
    getSupabaseAdmin().from('about').select('name, bio, photo_url').eq('owner_id', portfolio.owner_id).maybeSingle(),
    getSupabaseAdmin().from('hero').select('subheadline').eq('owner_id', portfolio.owner_id).maybeSingle(),
  ]);
  const seo = buildPortfolioSeo({
    slug: portfolio.slug,
    title: portfolio.title,
    name: about?.name,
    bio: about?.bio,
    subheadline: hero?.subheadline,
    photoUrl: about?.photo_url,
  });

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.url },
    openGraph: { title: seo.title, description: seo.description, url: seo.url, type: 'profile', images: [seo.image] },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: [seo.image] },
  };
}

export default function PortfolioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
