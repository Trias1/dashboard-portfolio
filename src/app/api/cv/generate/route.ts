import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, getErrorMessage } from '@/lib/utils';
import { buildCvHtml, resolveTemplate } from '@/lib/cv-document';
import { MAIN_URL } from '@/lib/portfolio-seo';

// Public link to the owner's portfolio for the CV header — only when it is published, so the link works.
function portfolioLink(p: { slug?: string | null; is_published?: boolean | null } | null) {
  return p?.is_published && p.slug ? `${MAIN_URL}/portfolio/${p.slug}` : '';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const template = resolveTemplate(request.nextUrl.searchParams.get('template'));
    const userId = auth.id;
    const db = getSupabaseAdmin();

    const [about, hero, experience, skills, projects, contact, certificates, customSections, portfolio] = await Promise.all([
      db.from('about').select('*').eq('owner_id', userId).maybeSingle(),
      db.from('hero').select('*').eq('owner_id', userId).maybeSingle(),
      // Undated roles last instead of first (Postgres puts NULLs first on DESC).
      db.from('experience').select('*').eq('owner_id', userId).order('start_date', { ascending: false, nullsFirst: false }),
      db.from('skills').select('*').eq('owner_id', userId),
      db.from('projects').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(8),
      db.from('contact_info').select('*').eq('owner_id', userId).maybeSingle(),
      db.from('gallery').select('*').eq('owner_id', userId).order('issued_date', { ascending: false, nullsFirst: false }),
      db.from('custom_sections').select('*').eq('owner_id', userId).order('sort_order', { ascending: true }),
      db.from('portfolios').select('slug, is_published').eq('owner_id', userId).order('created_at', { ascending: true }).limit(1).maybeSingle(),
    ]);

    const failed = [about, hero, experience, skills, projects, contact, certificates, customSections, portfolio].find((r) => r.error);
    if (failed?.error) throw failed.error;

    const { html, name } = buildCvHtml({
      about: about.data,
      hero: hero.data,
      contact: contact.data,
      experience: experience.data || [],
      skills: skills.data || [],
      projects: projects.data || [],
      certificates: certificates.data || [],
      custom: customSections.data || [],
      portfolioUrl: portfolioLink(portfolio.data),
    }, template);

    const filename = `${name.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '') || 'CV'}_CV.html`;
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="CV.html"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // errorResponse maps "Unauthorized" to 401 and hides other internals (was a blanket 401 before).
    return errorResponse(getErrorMessage(err));
  }
}
