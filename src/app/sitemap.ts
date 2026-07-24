import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { MAIN_URL } from '@/lib/portfolio-seo';
import { normalizeCustomDomain } from '@/lib/custom-domain';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getSupabaseAdmin()
    .from('portfolios')
    .select('slug, custom_domain, updated_at')
    .eq('is_published', true);

  return [
    { url: MAIN_URL, changeFrequency: 'weekly', priority: 1 },
    ...(data || []).map((portfolio) => {
      const domain = normalizeCustomDomain(portfolio.custom_domain);
      return {
        url: domain ? `https://${domain}` : `${MAIN_URL}/portfolio/${portfolio.slug}`,
        lastModified: portfolio.updated_at || undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    }),
  ];
}
