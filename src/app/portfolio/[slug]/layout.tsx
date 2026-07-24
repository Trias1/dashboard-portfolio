import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { buildPortfolioSeo } from '@/lib/portfolio-seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: portfolio } = await getSupabaseAdmin()
    .from('portfolios')
    .select('owner_id, title, slug, custom_domain')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!portfolio) return { title: 'Portfolio Not Found', robots: { index: false, follow: false } };

  const [{ data: about }, { data: hero }] = await Promise.all([
    getSupabaseAdmin().from('about').select('name, bio, photo_url').eq('owner_id', portfolio.owner_id).maybeSingle(),
    getSupabaseAdmin().from('hero').select('subheadline').eq('owner_id', portfolio.owner_id).maybeSingle(),
  ]);
  const seo = buildPortfolioSeo({
    slug: portfolio.slug,
    title: portfolio.title,
    customDomain: portfolio.custom_domain,
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
