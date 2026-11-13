// Server only: reads with the service role. Shared by the public page (server-rendered) and GET /api/public/[slug].
import { cache } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { projectImage } from '@/lib/project-screenshot';
import { findPublicPortfolio, isRowPublic } from '@/lib/public-access';
import type { CustomSectionContent, CustomSectionOutput, CustomSectionRow, SectionOrderEntry } from '@/types/api';

/** What the public page and its API get: one portfolio with only the sections its owner has switched on. */
export interface PublicPortfolio {
  /** True when ?template=/?theme=/?order= may restyle the page (the owner or a superadmin previewing, or the demo). */
  preview: boolean;
  portfolio: {
    id: number; slug: string; title?: string; template?: string;
    sections_order: SectionOrderEntry[]; theme?: string; is_published?: boolean;
    /** Set when a superadmin took it down (migration 008); only the owner and superadmins get it, as a preview. */
    taken_down_at?: string | null;
  };
  hero: Record<string, unknown> | null;
  about: Record<string, unknown> | null;
  experience: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  services: Record<string, unknown>[];
  contact: Record<string, unknown> | null;
  skills: Record<string, unknown>[];
  testimonials: Record<string, unknown>[];
  gallery: Record<string, unknown>[];
  custom: CustomSectionOutput[];
}

function demoPortfolio(template: string, theme: string): PublicPortfolio {
  return {
    // Sample data: previews may restyle it freely
    preview: true,
    portfolio: { id: 0, slug: 'demo', title: 'Demo Portfolio', template, sections_order: [], theme, is_published: true },
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
      { id: 1, company: 'Nova Labs', position: 'Senior Frontend Engineer', start_date: '2023-01-01', end_date: null, description: 'Led design system adoption and shipped customer-facing dashboards.' },
      { id: 2, company: 'Orbit Studio', position: 'Full-stack Developer', start_date: '2020-06-01', end_date: '2022-12-01', description: 'Built APIs, admin panels, and deployment workflows for SaaS clients.' },
    ],
    projects: [
      { id: 1, title: 'Analytics Dashboard', description: 'Realtime dashboard with charts, filters, and team reports.', tech_stack: 'Next.js, PostgreSQL, Recharts', demo_url: '#', github_url: '#' },
      { id: 2, title: 'Portfolio Builder', description: 'No-code portfolio generator with multiple templates.', tech_stack: 'React, Node.js, Supabase', demo_url: '#', github_url: '#' },
    ],
    services: [
      { id: 1, title: 'Web App Development', description: 'Custom full-stack applications from idea to launch.', icon: '✦' },
      { id: 2, title: 'UI Engineering', description: 'Responsive, accessible, and delightful interfaces.', icon: '✦' },
    ],
    contact: { email: 'alex@example.com', phone: '+1 555 0100', location: 'Remote' },
    skills: [
      { id: 1, title: 'Frontend', skills: 'React, Next.js, TypeScript, Tailwind CSS' },
      { id: 2, title: 'Backend', skills: 'Node.js, PostgreSQL, Supabase, REST API' },
    ],
    testimonials: [
      { id: 1, name: 'Maya Chen', position: 'Product Manager', message: 'Alex ships quickly and keeps quality high.' },
    ],
    gallery: [],
    custom: [],
  };
}

const parseSectionsOrder = (value: unknown): SectionOrderEntry[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value === 'undefined' || value === 'null') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const TYPED_CUSTOM = new Set(['education', 'certification', 'specialization', 'language', 'award', 'organization']);

function formatCustomItem(section: CustomSectionOutput): unknown {
  const c = section.content || {};
  if (section.type === 'education') {
    const title = [c.institution, c.degree, c.field].filter(Boolean).join(' - ');
    const meta = [c.start_date, c.end_date].filter(Boolean).join(' - ');
    return [title, meta, c.gpa ? `GPA: ${c.gpa}` : ''].filter(Boolean).join(' | ');
  }
  if (section.type === 'certification') return c;
  if (section.type === 'specialization') return c.body || [c.area, c.description].filter(Boolean).join(': ');
  if (section.type === 'language') return [c.language, c.proficiency].filter(Boolean).join(' | ');
  if (section.type === 'award') return [c.title, c.issuer, c.date].filter(Boolean).join(' | ');
  if (section.type === 'organization') return [c.name, c.role, c.description].filter(Boolean).join(' | ');
  return c.body || c.title || section.title;
}

function groupCustomSections(rows: CustomSectionRow[]): CustomSectionOutput[] {
  const parsed = rows.map((section): CustomSectionOutput => {
    let content = section.content;
    if (typeof content === 'string') {
      if (content === 'undefined' || content === 'null') content = {};
      else {
        try {
          content = JSON.parse(content) as CustomSectionContent;
        } catch {
          content = { body: content };
        }
      }
    }
    return { ...section, content: content || {} };
  });
  return parsed.reduce((items: CustomSectionOutput[], section) => {
    if (!TYPED_CUSTOM.has(section.type!)) {
      items.push(section);
      return items;
    }
    const existing = items.find((item) => item.title === section.title && item.original_type === section.type);
    const listItem = formatCustomItem(section);
    if (existing) {
      if (listItem) existing.content.items!.push(listItem);
    } else {
      items.push({
        id: `custom-${section.title}-${section.type}`,
        title: section.title,
        type: section.type === 'certification' ? 'certification' : 'list',
        original_type: section.type,
        content: { items: listItem ? [listItem] : [] },
      });
    }
    return items;
  }, []);
}

/**
 * The portfolio at `slug`, or null when it doesn't exist or is an unpublished draft the viewer may not see.
 * `preview` asks for the owner's draft view; it is only granted to the owner or a superadmin, read from the session
 * cookie or, with `request`, its Bearer token (the dashboard's API calls).
 * `demo` styles the built-in /portfolio/demo sample. Counting visits is not done here (see /api/public/[slug]/visit).
 */
export async function loadPublicPortfolio(
  slug: string,
  options: { preview?: boolean; request?: Request; demo?: { template?: string | null; theme?: string | null } } = {},
): Promise<PublicPortfolio | null> {
  if (slug === 'demo') return demoPortfolio(options.demo?.template || 'modern', options.demo?.theme || 'dark-space');

  const db = getSupabaseAdmin();
  const { data: portfolio } = await db.from('portfolios').select('*').eq('slug', slug).maybeSingle();
  if (!portfolio) return null;

  let isPreview = false;
  if (options.preview) {
    const viewer = await getAuthUser(options.request);
    isPreview = !!viewer && (String(viewer.id) === String(portfolio.owner_id) || viewer.role === 'superadmin');
  }
  // The public needs it published, not taken down, and its owner active; the owner and superadmins may still preview.
  if (!isPreview && !(await isRowPublic(portfolio))) return null;

  const ownerId = portfolio.owner_id;
  const [hero, about, experience, projects, services, contact, skills, testimonials, gallery, custom] = await Promise.all([
    db.from('hero').select('*').eq('owner_id', ownerId).maybeSingle(),
    db.from('about').select('*').eq('owner_id', ownerId).maybeSingle(),
    db.from('experience').select('*').eq('owner_id', ownerId).order('start_date', { ascending: false }),
    db.from('projects').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    db.from('services').select('*').eq('owner_id', ownerId),
    db.from('contact_info').select('*').eq('owner_id', ownerId).maybeSingle(),
    db.from('skills').select('*').eq('owner_id', ownerId),
    db.from('testimonials').select('*').eq('owner_id', ownerId),
    db.from('gallery').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    db.from('custom_sections').select('*').eq('owner_id', ownerId).order('sort_order', { ascending: true }),
  ]);

  const sectionsConfig = parseSectionsOrder(portfolio.sections_order);
  // Optional sections the owner has to add themselves: not in their saved list means not shown
  const OPT_IN = new Set(['services', 'gallery', 'testimonials']);
  const isEnabled = (type: string) => {
    if (!sectionsConfig.length) return !OPT_IN.has(type);
    const section = sectionsConfig.find((s) => s.type?.split('-')[0] === type);
    return section ? section.enabled !== false : !OPT_IN.has(type);
  };
  // Custom sections are toggled one by one: each entry's label matches the title of its rows. Checking
  // the type alone found the first custom entry (Education by default), so hiding it hid them all.
  const customEnabled = (title: string | undefined) => {
    const key = (title || '').trim().toLowerCase();
    const entry = sectionsConfig.find((s) => s.type?.split('-')[0] === 'custom' && String(s.label ?? '').trim().toLowerCase() === key);
    return entry ? entry.enabled !== false : true;
  };

  return {
    preview: isPreview,
    portfolio: {
      id: portfolio.id, slug: portfolio.slug, title: portfolio.title, template: portfolio.template,
      sections_order: sectionsConfig, theme: portfolio.theme, is_published: portfolio.is_published,
      taken_down_at: portfolio.taken_down_at ?? null,
    },
    hero: isEnabled('hero') ? (hero.data || null) : null,
    about: isEnabled('about') ? (about.data || null) : null,
    experience: isEnabled('experience') ? (experience.data || []) : [],
    // A project without its own image shows a live screenshot of its demo site
    projects: isEnabled('projects') ? (projects.data || []).map((project) => ({ ...project, image_url: projectImage(project) })) : [],
    services: isEnabled('services') ? (services.data || []) : [],
    contact: isEnabled('contact') ? (contact.data || null) : null,
    skills: isEnabled('skills') ? (skills.data || []) : [],
    testimonials: isEnabled('testimonials') ? (testimonials.data || []) : [],
    gallery: isEnabled('gallery') ? (gallery.data || []) : [],
    custom: groupCustomSections(custom.data || []).filter((section) => customEnabled(section.title)),
  };
}

/** Same as loadPublicPortfolio, but metadata and the page body share one set of queries per request. */
export const loadPublicPortfolioCached = cache(
  (slug: string, preview: boolean, demoTemplate: string | null, demoTheme: string | null) =>
    loadPublicPortfolio(slug, { preview, demo: { template: demoTemplate, theme: demoTheme } }),
);

/** The few fields the share card needs, for published portfolios only (crawlers never send a session). */
export async function loadShareCard(slug: string) {
  const db = getSupabaseAdmin();
  const portfolio = await findPublicPortfolio(slug);
  if (!portfolio) return null;
  const [{ data: about }, { data: hero }] = await Promise.all([
    db.from('about').select('name, title, bio, photo_url').eq('owner_id', portfolio.owner_id).maybeSingle(),
    db.from('hero').select('headline, subheadline').eq('owner_id', portfolio.owner_id).maybeSingle(),
  ]);
  return { slug: portfolio.slug, title: portfolio.title as string | null, theme: portfolio.theme as string | null, about, hero };
}
