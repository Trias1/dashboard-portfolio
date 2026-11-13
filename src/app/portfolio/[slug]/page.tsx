import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPortfolioView from '@/components/PublicPortfolioView';
import { loadPublicPortfolioCached } from '@/lib/public-portfolio';
import { buildPersonJsonLd, buildPortfolioSeo, jsonLdScript } from '@/lib/portfolio-seo';

// Drafts depend on the viewer's session, and edits should show up right away.
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : null);

async function load({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return loadPublicPortfolioCached(slug, one(query.preview) === 'true', one(query.template), one(query.theme));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  if (!data) return { title: 'Portfolio Not Found', robots: { index: false, follow: false } };

  const { portfolio } = data;
  if (!portfolio.is_published || portfolio.slug === 'demo') {
    // The owner's draft preview, and the sample data: a real title, but kept out of search results
    return { title: `${portfolio.slug === 'demo' ? 'Demo' : 'Draft preview'} · ${portfolio.title || portfolio.slug}`, robots: { index: false, follow: false } };
  }

  const about = data.about as { name?: string; bio?: string } | null;
  const hero = data.hero as { subheadline?: string } | null;
  const seo = buildPortfolioSeo({ slug: portfolio.slug, title: portfolio.title, name: about?.name, bio: about?.bio, subheadline: hero?.subheadline });
  // The share image comes from opengraph-image.tsx / twitter-image.tsx next to this page.
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.url },
    openGraph: { title: seo.title, description: seo.description, url: seo.url, type: 'profile' },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
  };
}

export default async function PublicPortfolioPage(props: Props) {
  const data = await load(props);
  if (!data) notFound();

  const indexable = data.portfolio.is_published && data.portfolio.slug !== 'demo' && !data.preview;
  return (
    <>
      {indexable && (
        <script
          type="application/ld+json"
          // Escaped by jsonLdScript: the owner's text can't end the script element.
          dangerouslySetInnerHTML={{ __html: jsonLdScript(buildPersonJsonLd({
            slug: data.portfolio.slug,
            title: data.portfolio.title,
            about: data.about,
            hero: data.hero,
            contact: data.contact,
            skills: data.skills as { skills?: unknown }[],
          })) }}
        />
      )}
      {/* Shown as-is when scripts don't run; otherwise OrderSections reveals it once the sections are ordered */}
      <noscript><style>{'[data-order-pending]{visibility:visible!important}'}</style></noscript>
      <PublicPortfolioView initial={data} />
    </>
  );
}
