import type { MetadataRoute } from 'next';
import { MAIN_URL } from '@/lib/portfolio-seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/login', '/register', '/forgot-password', '/reset-password'],
    },
    sitemap: `${MAIN_URL}/sitemap.xml`,
    host: MAIN_URL,
  };
}
