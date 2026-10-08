import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { MAIN_URL } from '@/lib/portfolio-seo';

// Rebuilt hourly so newly published portfolios show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: MAIN_URL, changeFrequency: 'weekly', priority: 1 }];

  // A missing/unreachable DB (e.g. a preview deploy without Supabase env) must not fail the whole build.
  let data: { slug: string; updated_at: string | null }[] | null = null;
  try {
    ({ data } = await getSupabaseAdmin()
      .from('portfolios')
      .select('slug, updated_at')
      .eq('is_published', true));
  } catch (err) {
    console.error('[sitemap] could not load portfolios', err);
    return home;
  }

  return [
    ...home,
    ...(data || []).map((portfolio) => ({
      url: `${MAIN_URL}/portfolio/${portfolio.slug}`,
      lastModified: portfolio.updated_at || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
