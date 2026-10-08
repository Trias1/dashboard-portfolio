'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';
import DescText, { DescItems } from '@/components/DescText';
import Pager, { usePager } from '@/components/Pager';

// Nature: a field notebook. Sage-tinted paper, serif entries, a margin column
// for dates and figure numbers, and hand-drawn vine rules between chapters.

/* ---------- colour helpers (local to this template) ---------- */
type RGB = [number, number, number];
function parseHex(hex: string): RGB {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [10, 10, 26];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(rgb: RGB): string {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function mix(a: string, b: string, t: number): string {
  const A = parseHex(a), B = parseHex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}
function lum(hex: string): number {
  const c = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a: string, b: string): number {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function legible(fg: string, bg: string, target = 4.5): string {
  const toward = lum(bg) > 0.35 ? '#000000' : '#ffffff';
  let out = fg;
  for (let i = 1; i <= 10 && contrast(out, bg) < target; i++) out = mix(fg, toward, i / 10);
  return out;
}

/* ---------- content helpers ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtMonth(d?: string | null): string {
  if (!d) return '';
  const [y, m] = String(d).split('-');
  const mi = parseInt(m, 10);
  return mi >= 1 && mi <= 12 ? `${MONTHS[mi - 1]} ${y}` : y;
}
function lines(text?: string): string[] {
  return (text || '').split(/\n+/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
function splitList(text?: string): string[] {
  return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}
function customId(sec: TemplateItem): string {
  return `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;
}
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

type Palette = { paper: string; ink: string; muted: string; rule: string; moss: string; ac: string; acText: string; leaf: string };

/* ---------- hand-drawn bits ---------- */
function Vine({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 600 28" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
      <path d="M2 16 C 48 9, 92 22, 150 15 S 250 7, 318 15 S 430 23, 500 13 S 566 10, 598 15"
        fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M318 15 C 322 6, 332 3, 340 4 C 336 11, 328 15, 318 15 Z" fill="none" stroke={color} strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      <path d="M150 15 C 146 23, 138 26, 130 25 C 134 19, 141 15, 150 15 Z" fill="none" stroke={color} strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Leaf({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M3.5 16.5C3.5 9 9 3.5 16.5 3.5 16.5 11 11 16.5 3.5 16.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.5 16.5 11.5 8.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Chapter({ id, title, p, children }: { id: string; title: string; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        <Vine color={p.rule} />
        <h2 className="mt-8 mb-10 flex items-center gap-3 font-serif text-3xl italic tracking-tight md:mb-14 md:text-4xl" style={{ color: p.ink }}>
          <Leaf color={p.leaf} />{title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Notebook row: narrow margin column for metadata, wide column for the entry. */
function Entry({ margin, children, p }: { margin?: ReactNode; children: ReactNode; p: Palette }) {
  return (
    <div className="grid gap-2 md:grid-cols-[9rem_1fr] md:gap-10">
      <div className="font-mono text-xs leading-6 tabular-nums" style={{ color: p.moss }}>{margin}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Link({ href, children, p, external = true }: { href: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-sm underline decoration-1 underline-offset-[5px] transition-colors duration-150 hover:decoration-2"
      style={{ color: p.acText }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <Entry p={p}><p className="max-w-[64ch] text-base leading-[1.8] whitespace-pre-line" style={{ color: p.ink }}>{c?.body}</p></Entry>;
  if (sec.type === 'list') {
    return (
      <Entry p={p}>
        <ul className="max-w-[64ch] space-y-2.5">
          {(c?.items || []).map((item: string, i: number) => (
            <li key={i} className="flex gap-3 leading-relaxed" style={{ color: p.ink }}>
              <span className="mt-[0.55em] h-px w-3 shrink-0" style={{ backgroundColor: p.leaf }} />{item}
            </li>
          ))}
        </ul>
      </Entry>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="space-y-8">
        {(c?.cards || []).map((card: TemplateItem, i: number) => (
          <Entry key={i} p={p} margin={`${ROMAN[i] || i + 1}.`}>
            <h3 className="font-serif text-xl" style={{ color: p.ink }}>{card.title}</h3>
            {card.desc && <p className="mt-1 max-w-[64ch] text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
          </Entry>
        ))}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <Entry p={p}>
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {(c?.links || []).map((link: TemplateItem, i: number) => <li key={i}><Link href={link.url || '#'} p={p}>{link.label}</Link></li>)}
        </ul>
      </Entry>
    );
  }
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <div style={{ color: p.ink, '--t-ink': p.ink, '--t-muted': p.muted, '--t-rule': p.rule } as CSSProperties}>
        <CertificationSection items={c.items} textColor="text-[color:var(--t-ink)]" subTextColor="text-[color:var(--t-muted)]"
          accentColor={p.acText} cardBg="border-[color:var(--t-rule)] bg-transparent" />
      </div>
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <Entry p={p} margin={[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' – ')}>
        {c.institution && <p className="font-serif text-xl" style={{ color: p.ink }}>{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-1 text-sm" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-xs" style={{ color: p.moss }}>GPA {c.gpa}</p>}
      </Entry>
    );
  }
  if (c.name || c.issuer) {
    return (
      <Entry p={p} margin={c.date}>
        {c.name && <p className="font-serif text-xl" style={{ color: p.ink }}>{c.name}</p>}
        {c.issuer && <p className="mt-1 text-sm" style={{ color: p.muted }}>{c.issuer}</p>}
        {c.credential_url && <p className="mt-2"><Link href={c.credential_url} p={p}>View credential</Link></p>}
      </Entry>
    );
  }
  if (c.language) {
    return (
      <Entry p={p} margin={c.proficiency}>
        <p className="font-serif text-xl" style={{ color: p.ink }}>{c.language}</p>
      </Entry>
    );
  }
  if (c.body) return <Entry p={p}><p className="max-w-[64ch] leading-relaxed" style={{ color: p.muted }}>{c.body}</p></Entry>;
  return null;
}

export default function NatureTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const projPager = usePager(projects, 5, 'projects');
  void isPreview;

  const bg = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(bg) < 0.35;
  // Tint the user's background toward moss so it reads as paper / forest floor.
  const paper = dark ? mix(bg, '#1e2a1d', 0.7) : mix(bg, '#e8ecdf', 0.75);
  const ink = dark ? '#e9eee2' : '#1c2419';
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const p: Palette = {
    paper, ink, ac,
    muted: legible(mix(paper, ink, 0.66), paper),
    rule: mix(paper, ink, 0.28),
    moss: legible(dark ? '#a7bb8e' : '#4d6a3a', paper),
    acText: legible(ac, paper),
    leaf: legible(mix(ac, dark ? '#a7bb8e' : '#4d6a3a', 0.45), paper, 3),
  };

  const name = about?.name || portfolio.title || '';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;
  const nav = [
    about?.name && ['about', 'About'],
    experience.length > 0 && ['experience', 'Experience'],
    projects.length > 0 && ['projects', 'Projects'],
    contactEnabled && ['contact', 'Contact'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: paper, color: ink }}>
      <header className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 pt-8">
        <a href="#hero" className="font-serif text-lg italic" style={{ color: ink }}>{name}</a>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-1">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-sm underline-offset-4 transition-colors duration-150 hover:underline" style={{ color: p.muted }}>{label}</a>
          ))}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="relative">
          {hero?.background_url && (
            <div className="mx-auto max-w-5xl px-5 pt-10">
              <SafeImg src={hero.background_url} alt="" className="h-48 w-full rounded-sm object-cover md:h-64" style={{ border: `1px solid ${p.rule}` }} />
            </div>
          )}
          <div className="mx-auto grid max-w-5xl gap-12 px-5 pb-16 pt-16 md:grid-cols-[1fr_auto] md:items-end md:pt-24">
            <div className="min-w-0">
              {hero?.greeting && <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em]" style={{ color: p.moss }}>{hero.greeting}</p>}
              <h1 className="max-w-[16ch] font-serif text-5xl leading-[1.04] tracking-[-0.02em] sm:text-6xl md:text-7xl" style={{ color: ink }}>
                {hero?.headline || name}
              </h1>
              {hero?.subheadline && <p className="mt-6 max-w-[46ch] text-lg leading-relaxed" style={{ color: p.muted }}>{hero.subheadline}</p>}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href={hero?.cta_url || '#projects'} className="rounded-sm px-5 py-2.5 text-sm font-medium transition-colors duration-150"
                  style={{ backgroundColor: ink, color: paper }}>
                  {hero?.cta_text || 'See the work'}
                </a>
                {about?.cv_url && <Link href={about.cv_url} p={p}>Download CV</Link>}
                {hero?.cta_secondary_text && hero?.cta_secondary_url && <Link href={hero.cta_secondary_url} p={p}>{hero.cta_secondary_text}</Link>}
              </div>
            </div>
            {about?.photo_url && (
              <figure className="w-44 sm:w-52">
                <SafeImg src={about.photo_url} alt={name} className="aspect-[3/4] w-full rounded-sm object-cover" style={{ border: `1px solid ${p.rule}`, padding: 6, backgroundColor: mix(paper, ink, 0.04) }} />
                <figcaption className="mt-2 font-mono text-[11px]" style={{ color: p.moss }}>Fig. 1 — {name}</figcaption>
              </figure>
            )}
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <Chapter id="about" title="About" p={p}>
            <Entry p={p} margin={about.title}>
              <p className="max-w-[64ch] text-lg leading-[1.8] whitespace-pre-line" style={{ color: ink }}>{about.bio}</p>
            </Entry>
          </Chapter>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Chapter id="skills" title="Skills" p={p}>
            <div className="space-y-8">
              {skills.map((skill: TemplateItem, i: number) => (
                <Entry key={skill.id ?? i} p={p} margin={<span className="font-serif text-sm italic" style={{ color: p.moss }}>{skill.title}</span>}>
                  <div className="flex flex-wrap gap-2">
                    {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={p.moss} textColor={ink} size="sm" />)}
                  </div>
                </Entry>
              ))}
            </div>
          </Chapter>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Chapter id="experience" title="Work Experience" p={p}>
            <div className="space-y-12">
              {experience.map((exp: TemplateItem, i: number) => (
                <Entry key={exp.id ?? i} p={p} margin={<>{fmtMonth(exp.start_date)}<br />{exp.end_date ? fmtMonth(exp.end_date) : 'present'}</>}>
                  <h3 className="font-serif text-2xl leading-snug" style={{ color: ink }}>{exp.position}</h3>
                  <p className="mt-1 text-sm" style={{ color: p.moss }}>{exp.company}</p>
                  {lines(exp.description).length > 0 && (
                    <div className="mt-3 max-w-[64ch] space-y-2 leading-relaxed" style={{ color: p.muted }}>
                      <DescItems items={lines(exp.description)} />
                    </div>
                  )}
                </Entry>
              ))}
            </div>
          </Chapter>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Chapter id="projects" title="Projects" p={p}>
            <div className="space-y-16">
              {projPager.items.map((proj: TemplateItem, i: number) => (
                <Entry key={proj.id ?? i} p={p} margin={`Fig. ${i + 2}`}>
                  <div className={proj.image_url ? 'grid gap-6 lg:grid-cols-[1.1fr_1fr]' : ''}>
                    {proj.image_url && (
                      <SafeImg src={proj.image_url} alt={proj.title} className="aspect-[4/3] w-full rounded-sm object-cover" style={{ border: `1px solid ${p.rule}` }} />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-serif text-2xl" style={{ color: ink }}>{proj.title}</h3>
                      <DescText text={proj.description} className="mt-2 max-w-[60ch] leading-relaxed" style={{ color: p.muted }} />
                      {proj.tech_stack && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={p.moss} textColor={ink} />)}
                        </div>
                      )}
                      {(proj.demo_url || proj.github_url) && (
                        <p className="mt-4 flex gap-5">
                          {proj.demo_url && <Link href={proj.demo_url} p={p}>Live site</Link>}
                          {proj.github_url && <Link href={proj.github_url} p={p}>Source</Link>}
                        </p>
                      )}
                    </div>
                  </div>
                </Entry>
              ))}
            </div>
            <Pager pager={projPager} />
          </Chapter>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Chapter id="services" title="Services" p={p}>
            <div className="space-y-8">
              {services.map((svc: TemplateItem, i: number) => (
                <Entry key={svc.id ?? i} p={p} margin={`${ROMAN[i] || i + 1}.`}>
                  <h3 className="font-serif text-xl" style={{ color: ink }}>{svc.title}</h3>
                  {svc.description && <p className="mt-1 max-w-[60ch] leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                </Entry>
              ))}
            </div>
          </Chapter>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Chapter id="testimonials" title="Testimonials" p={p}>
            <div className="space-y-12">
              {testimonials.map((t: TemplateItem, i: number) => (
                <Entry key={t.id ?? i} p={p} margin={t.photo_url ? <SafeImg src={t.photo_url} alt={t.name} className="h-12 w-12 rounded-full object-cover" /> : undefined}>
                  <figure className="border-l pl-6" style={{ borderColor: p.leaf }}>
                    <blockquote className="max-w-[56ch] font-serif text-xl italic leading-relaxed md:text-2xl" style={{ color: ink }}>
                      &ldquo;{t.message}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm" style={{ color: p.muted }}>
                      <span style={{ color: ink }}>{t.name}</span>{t.position ? `, ${t.position}` : ''}
                    </figcaption>
                  </figure>
                </Entry>
              ))}
            </div>
          </Chapter>
        )}

        {/* Certificates / gallery */}
        {gallery.length > 0 && (
          <Chapter id="gallery" title="Certificates" p={p}>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert: TemplateItem, i: number) => (
                <figure key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-sm p-1.5" style={{ border: `1px solid ${p.rule}` }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption>
                    <p className="font-mono text-[11px]" style={{ color: p.moss }}>Pl. {i + 1}{cert.issued_date ? ` · ${new Date(cert.issued_date).toLocaleDateString()}` : ''}</p>
                    <p className="mt-1 font-serif text-lg" style={{ color: ink }}>{cert.title}</p>
                    {cert.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    {cert.file_url && <p className="mt-2"><Link href={cert.file_url} p={p}>View certificate</Link></p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Chapter>
        )}

        {/* Custom sections */}
        {custom.map((sec: TemplateItem, i: number) => (
          <Chapter key={sec.id ?? i} id={customId(sec)} title={sec.title || sec.original_type || 'Section'} p={p}>
            <CustomBody sec={sec} p={p} />
          </Chapter>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <Chapter id="contact" title="Contact" p={p}>
            <Entry p={p} margin={contact?.location}>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
                <div>
                  <p className="max-w-[34ch] leading-relaxed" style={{ color: p.muted }}>
                    Send a note about a project, a role or a question — I read everything.
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {email && <li><Link href={`mailto:${email}`} p={p} external={false}>{email}</Link></li>}
                    {contact?.phone && <li><Link href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} p={p}>WhatsApp</Link></li>}
                    {contact?.linkedin_url && <li><Link href={contact.linkedin_url} p={p}>LinkedIn</Link></li>}
                    {contact?.github_url && <li><Link href={contact.github_url} p={p}>GitHub</Link></li>}
                  </ul>
                </div>
                <div className="min-w-0">
                  <ContactForm slug={portfolio.slug} accentColor={ac} textColor={ink} subColor={p.muted} />
                </div>
              </div>
            </Entry>
          </Chapter>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10">
        <Vine color={p.rule} />
        <div className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-[11px]" style={{ color: p.moss }}>
          <span>{name} · {new Date().getFullYear()}</span>
          <span>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
