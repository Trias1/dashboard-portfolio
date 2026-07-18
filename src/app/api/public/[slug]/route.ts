import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const isPreview = request.nextUrl.searchParams.get('preview') === 'true';

    if (slug === 'demo') {
      const template = request.nextUrl.searchParams.get('template') || 'modern';
      return successResponse({
        portfolio: {
          id: 0,
          slug: 'demo',
          title: 'Demo Portfolio',
          template,
          sections_order: [],
          theme: request.nextUrl.searchParams.get('theme') || 'dark-space',
          is_published: true,
          custom_domain: null,
        },
        hero: {
          headline: "Hi, I'm Alex Rivera",
          subheadline: 'Full-stack developer building polished web products',
          cta_text: 'View My Work',
        },
        about: {
          name: 'Alex Rivera',
          title: 'Full-stack Developer',
          bio: 'I build fast, accessible, and scalable web applications with React, Next.js, Node.js, and PostgreSQL. I enjoy turning complex problems into clean user experiences.',
          photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        },
        experience: [
          { company: 'Nova Labs', position: 'Senior Frontend Engineer', start_date: '2023-01-01', end_date: null, description: 'Led design system adoption and shipped customer-facing dashboards.' },
          { company: 'Orbit Studio', position: 'Full-stack Developer', start_date: '2020-06-01', end_date: '2022-12-01', description: 'Built APIs, admin panels, and deployment workflows for SaaS clients.' },
        ],
        projects: [
          { title: 'Analytics Dashboard', description: 'Realtime dashboard with charts, filters, and team reports.', tech_stack: 'Next.js, PostgreSQL, Recharts', demo_url: '#', github_url: '#' },
          { title: 'Portfolio Builder', description: 'No-code portfolio generator with multiple templates.', tech_stack: 'React, Node.js, Supabase', demo_url: '#', github_url: '#' },
        ],
        services: [
          { title: 'Web App Development', description: 'Custom full-stack applications from idea to launch.', icon: '' },
          { title: 'UI Engineering', description: 'Responsive, accessible, and delightful interfaces.', icon: '' },
        ],
        contact: { email: 'alex@example.com', phone: '+1 555 0100', location: 'Remote' },
        skills: [
          { title: 'Frontend', skills: 'React, Next.js, TypeScript, Tailwind CSS' },
          { title: 'Backend', skills: 'Node.js, PostgreSQL, Supabase, REST API' },
        ],
        testimonials: [
          { name: 'Maya Chen', position: 'Product Manager', message: 'Alex ships quickly and keeps quality high.' },
        ],
        gallery: [],
        custom: [],
      });
    }

    const query = getSupabaseAdmin().from('portfolios').select('*').eq('slug', slug);
    if (!isPreview) query.eq('is_published', true);

    const { data: portfolio } = await query.maybeSingle();
    if (!portfolio) return errorResponse('Portfolio not found or not published', 404);

    const ownerId = portfolio.owner_id;

    const [hero, about, experience, projects, services, contact, skills, testimonials, gallery, custom] = await Promise.all([
      getSupabaseAdmin().from('hero').select('*').eq('owner_id', ownerId).maybeSingle(),
      getSupabaseAdmin().from('about').select('*').eq('owner_id', ownerId).maybeSingle(),
      getSupabaseAdmin().from('experience').select('*').eq('owner_id', ownerId).order('start_date', { ascending: false }),
      getSupabaseAdmin().from('projects').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      getSupabaseAdmin().from('services').select('*').eq('owner_id', ownerId),
      getSupabaseAdmin().from('contact_info').select('*').eq('owner_id', ownerId).maybeSingle(),
      getSupabaseAdmin().from('skills').select('*').eq('owner_id', ownerId),
      getSupabaseAdmin().from('testimonials').select('*').eq('owner_id', ownerId),
      getSupabaseAdmin().from('gallery').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      getSupabaseAdmin().from('custom_sections').select('*').eq('owner_id', ownerId).order('sort_order', { ascending: true }),
    ]);

    // Track visit
    if (!isPreview) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      const ua = request.headers.get('user-agent') || '';
      // Track visit quietly
      try { await getSupabaseAdmin().from('portfolio_visits').insert({ portfolio_id: portfolio.id, ip_address: ip, user_agent: ua }) } catch {};
    }

    const parseSectionsOrder = (value: any) => {
      if (Array.isArray(value)) return value;
      if (typeof value !== 'string') return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };
    const sectionsConfig = parseSectionsOrder(portfolio.sections_order);
    const isEnabled = (type: string) => {
      if (!Array.isArray(sectionsConfig) || !sectionsConfig.length) return true;
      const section = sectionsConfig.find((s: any) => s.type?.split('-')[0] === type);
      return section ? section.enabled !== false : true;
    };

    const rawCustomData = (custom.data || []).map((section: any) => {
      let content = section.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch {
          content = { body: content };
        }
      }
      return { ...section, content: content || {} };
    });
    const typedCustomTypes = new Set(['education', 'certification', 'specialization', 'language', 'award', 'organization']);
    const formatCustomItem = (section: any) => {
      const c = section.content || {};
      if (section.type === 'education') {
        const title = [c.institution, c.degree, c.field].filter(Boolean).join(' - ');
        const meta = [c.start_date, c.end_date].filter(Boolean).join(' - ');
        return [title, meta, c.gpa ? `GPA: ${c.gpa}` : ''].filter(Boolean).join(' | ');
      }
      if (section.type === 'certification') {
        return c;
      }
      if (section.type === 'specialization') {
        return c.body || [c.area, c.description].filter(Boolean).join(': ');
      }
      if (section.type === 'language') {
        return [c.language, c.proficiency].filter(Boolean).join(' | ');
      }
      if (section.type === 'award') {
        return [c.title, c.issuer, c.date].filter(Boolean).join(' | ');
      }
      if (section.type === 'organization') {
        return [c.name, c.role, c.description].filter(Boolean).join(' | ');
      }
      return c.body || c.title || section.title;
    };
    const groupedCustomData = rawCustomData.reduce((items: any[], section: any) => {
      if (!typedCustomTypes.has(section.type)) {
        items.push(section);
        return items;
      }
      const existing = items.find((item: any) => item.title === section.title && item.original_type === section.type);
      const isCert = section.type === 'certification';
      const listItem = formatCustomItem(section);
      const sectionType = isCert ? 'certification' : 'list';
      if (existing) {
        if (listItem) existing.content.items.push(listItem);
      } else {
        items.push({
          id: `custom-${section.title}-${section.type}`,
          title: section.title,
          type: sectionType,
          original_type: section.type,
          content: { items: listItem ? [listItem] : [] },
        });
      }
      return items;
    }, []);

    return successResponse({
      portfolio: {
        id: portfolio.id, slug: portfolio.slug, title: portfolio.title,
         template: portfolio.template, sections_order: sectionsConfig,
        theme: portfolio.theme, is_published: portfolio.is_published,
        custom_domain: portfolio.custom_domain,
      },
      hero: isEnabled('hero') ? (hero.data || null) : null,
      about: isEnabled('about') ? (about.data || null) : null,
      experience: isEnabled('experience') ? (experience.data || []) : [],
      projects: isEnabled('projects') ? (projects.data || []) : [],
      services: isEnabled('services') ? (services.data || []) : [],
      contact: isEnabled('contact') ? (contact.data || null) : null,
      skills: isEnabled('skills') ? (skills.data || []) : [],
      testimonials: isEnabled('testimonials') ? (testimonials.data || []) : [],
      gallery: isEnabled('gallery') ? (gallery.data || []) : [],
      custom: isEnabled('custom') ? groupedCustomData : [],
    });
  } catch (err: any) { return errorResponse(err.message); }
}
