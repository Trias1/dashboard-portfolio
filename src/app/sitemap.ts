import type { MetadataRoute } from 'next';
import { listPublicPortfolios } from '@/lib/public-access';
import { MAIN_URL } from '@/lib/portfolio-seo';

// Rebuilt hourly so newly published portfolios show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: MAIN_URL, changeFrequency: 'weekly', priority: 1 }];

  // A missing/unreachable DB (e.g. a preview deploy without Supabase env) must not fail the whole build.
  let data: { slug: string; updated_at?: unknown }[] | null = null;
  try {
    // Only what the public can see: no drafts, taken-down portfolios or deactivated owners.
    data = await listPublicPortfolios();
  } catch (err) {
    console.error('[sitemap] could not load portfolios', err);
    return home;
  }

  return [
    ...home,
    ...(data || []).map((portfolio) => ({
      url: `${MAIN_URL}/portfolio/${portfolio.slug}`,
      lastModified: typeof portfolio.updated_at === 'string' ? portfolio.updated_at : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
