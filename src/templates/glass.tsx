'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';

// Glass: one frosted header floating over a full-bleed photograph (or a solid
// colour field). Everything below is flat, light-weight type on hairline rules.

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
function onColor(bg: string): string {
  return contrast('#ffffff', bg) >= contrast('#111111', bg) ? '#ffffff' : '#111111';
}
function rgba(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
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

function Arrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="inline-block">
      <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Palette = { bg: string; ink: string; muted: string; rule: string; ac: string; acText: string; surface: string };

function Block({ id, label, p, children }: { id: string; label: string; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 border-t" style={{ borderColor: p.rule }}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-12 md:py-28">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] md:col-span-3" style={{ color: p.muted }}>{label}</h2>
        <div className="min-w-0 md:col-span-9">{children}</div>
      </div>
    </section>
  );
}

function TextLink({ href, children, p, external = true }: { href: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex items-center gap-1 text-sm underline decoration-1 underline-offset-4 transition-colors duration-150 hover:no-underline"
      style={{ color: p.acText }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[62ch] text-lg font-light leading-relaxed whitespace-pre-line" style={{ color: p.ink }}>{c?.body}</p>;
  if (sec.type === 'list') {
    return (
      <ul className="max-w-[62ch]">
        {(c?.items || []).map((item: string, i: number) => (
          <li key={i} className="border-t py-3 first:border-t-0" style={{ borderColor: p.rule, color: p.ink }}>{item}</li>
        ))}
      </ul>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {(c?.cards || []).map((card: TemplateItem, i: number) => (
          <div key={i} className="border-t pt-4" style={{ borderColor: p.rule }}>
            <h3 className="text-lg" style={{ color: p.ink }}>{card.title}</h3>
            {card.desc && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <ul className="flex flex-wrap gap-x-8 gap-y-3">
        {(c?.links || []).map((link: TemplateItem, i: number) => (
          <li key={i}><TextLink href={link.url || '#'} p={p}>{link.label}<Arrow /></TextLink></li>
        ))}
      </ul>
    );
  }
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <div style={{ color: p.ink, '--t-ink': p.ink, '--t-muted': p.muted, '--t-rule': p.rule } as CSSProperties}>
        <CertificationSection items={c.items} textColor="text-[color:var(--t-ink)]" subTextColor="text-[color:var(--t-muted)]"
          accentColor={p.ac} cardBg="border-[color:var(--t-rule)] bg-transparent" />
      </div>
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <div className="border-t pt-4" style={{ borderColor: p.rule }}>
        {c.institution && <p className="text-xl font-light" style={{ color: p.ink }}>{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-1 text-sm" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(' · ')}</p>}
        {(c.start_date || c.end_date) && <p className="mt-1 font-mono text-xs tabular-nums" style={{ color: p.muted }}>{[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' – ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className="border-t pt-4" style={{ borderColor: p.rule }}>
        {c.name && <p className="text-xl font-light" style={{ color: p.ink }}>{c.name}</p>}
        {c.issuer && <p className="mt-1 text-sm" style={{ color: p.muted }}>{c.issuer}</p>}
        {c.date && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <div className="mt-3"><TextLink href={c.credential_url} p={p}>View credential<Arrow /></TextLink></div>}
      </div>
    );
  }
  if (c.language) {
    return (
      <p className="flex items-baseline gap-4 border-t pt-4" style={{ borderColor: p.rule }}>
        <span className="text-xl font-light" style={{ color: p.ink }}>{c.language}</span>
        {c.proficiency && <span className="text-sm" style={{ color: p.muted }}>{c.proficiency}</span>}
      </p>
    );
  }
  if (c.body) return <p className="max-w-[62ch] text-base leading-relaxed" style={{ color: p.muted }}>{c.body}</p>;
  return null;
}

export default function GlassTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  void isPreview;

  const bg = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(bg) < 0.35;
  const ink = mix(bg, dark ? '#ffffff' : '#000000', 0.9);
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const p: Palette = {
    bg, ink, ac,
    muted: legible(mix(bg, ink, 0.62), bg),
    rule: mix(bg, ink, 0.14),
    acText: legible(ac, bg),
    surface: mix(bg, ink, 0.04),
  };

  const name = about?.name || portfolio.title || '';
  const backdropImg = hero?.background_url || about?.photo_url || '';
  const field = mix(bg, ac, dark ? 0.32 : 0.2);
  const heroInk = backdropImg ? '#ffffff' : onColor(field) === '#ffffff' ? mix(field, '#ffffff', 0.92) : mix(field, '#000000', 0.85);
  const heroMuted = backdropImg ? 'rgba(255,255,255,0.82)' : legible(mix(field, heroInk, 0.7), field);
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;

  const nav = [
    about?.name && ['about', 'About'],
    experience.length > 0 && ['experience', 'Experience'],
    projects.length > 0 && ['projects', 'Work'],
    contactEnabled && ['contact', 'Contact'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: bg, color: ink }}>
      {/* The one frosted surface on the page */}
      <header className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md backdrop-saturate-150"
        style={{ backgroundColor: rgba(bg, 0.55), borderColor: rgba(ink, 0.12) }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#hero" className="truncate text-sm font-medium tracking-tight" style={{ color: ink }}>{name}</a>
          <nav aria-label="Sections" className="flex items-center gap-4 sm:gap-6">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-[13px] transition-colors duration-150 hover:underline underline-offset-4 max-sm:[&:nth-child(n+3)]:hidden" style={{ color: p.muted }}>{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="relative flex min-h-[88svh] items-end overflow-hidden" style={{ backgroundColor: field }}>
          {backdropImg && (
            <>
              <SafeImg src={backdropImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: 'rgba(8,8,12,0.55)' }} />
            </>
          )}
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 md:pb-24">
            {hero?.greeting && <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: heroMuted }}>{hero.greeting}</p>}
            <h1 className="max-w-[18ch] text-5xl font-light leading-[1.02] tracking-[-0.03em] sm:text-7xl md:text-8xl" style={{ color: heroInk }}>
              {hero?.headline || name}
            </h1>
            {hero?.subheadline && <p className="mt-6 max-w-[48ch] text-lg font-light leading-relaxed md:text-xl" style={{ color: heroMuted }}>{hero.subheadline}</p>}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href={hero?.cta_url || '#projects'} className="rounded-md px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-90"
                style={{ backgroundColor: heroInk, color: backdropImg ? '#111111' : field }}>
                {hero?.cta_text || 'View work'}
              </a>
              {about?.cv_url && (
                <a href={about.cv_url} target="_blank" rel="noopener noreferrer" className="rounded-md border px-5 py-3 text-sm font-medium transition-colors duration-150"
                  style={{ borderColor: backdropImg ? 'rgba(255,255,255,0.45)' : rgba(heroInk, 0.35), color: heroInk }}>
                  Download CV
                </a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <a href={hero.cta_secondary_url} target="_blank" rel="noopener noreferrer" className="rounded-md border px-5 py-3 text-sm font-medium transition-colors duration-150"
                  style={{ borderColor: backdropImg ? 'rgba(255,255,255,0.45)' : rgba(heroInk, 0.35), color: heroInk }}>
                  {hero.cta_secondary_text}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <Block id="about" label="About" p={p}>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <p className="max-w-[40ch] text-2xl font-light leading-snug tracking-tight md:text-3xl" style={{ color: ink }}>
                  {about.name}{about.title ? <span style={{ color: p.muted }}> — {about.title}</span> : null}
                </p>
                {about.bio && <p className="mt-6 max-w-[62ch] text-base leading-relaxed whitespace-pre-line" style={{ color: p.muted }}>{about.bio}</p>}
              </div>
              {about.photo_url && (
                <SafeImg src={about.photo_url} alt={about.name} className="aspect-[4/5] w-40 shrink-0 rounded-md object-cover sm:w-48" style={{ border: `1px solid ${p.rule}` }} />
              )}
            </div>
          </Block>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Block id="skills" label="Skills & tools" p={p}>
            <dl>
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i} className="grid gap-3 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr]" style={{ borderColor: p.rule }}>
                  <dt className="text-sm" style={{ color: ink }}>{skill.title}</dt>
                  <dd className="flex flex-wrap gap-2">
                    {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={p.acText} size="sm" variant="outline" />)}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Block id="experience" label="Experience" p={p}>
            <ol>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className="grid gap-2 border-t py-6 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-6" style={{ borderColor: p.rule }}>
                  <p className="font-mono text-xs tabular-nums sm:pt-1.5" style={{ color: p.muted }}>
                    {fmtMonth(exp.start_date)} – {exp.end_date ? fmtMonth(exp.end_date) : 'Now'}
                  </p>
                  <div className="min-w-0">
                    <h3 className="text-xl font-light tracking-tight" style={{ color: ink }}>{exp.position}</h3>
                    <p className="mt-0.5 text-sm" style={{ color: p.acText }}>{exp.company}</p>
                    {lines(exp.description).length > 0 && (
                      <div className="mt-3 max-w-[62ch] space-y-1.5 text-sm leading-relaxed" style={{ color: p.muted }}>
                        {lines(exp.description).map((l, li) => <p key={li}>{l}</p>)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Block id="projects" label="Selected work" p={p}>
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {projects.map((proj: TemplateItem, i: number) => (
                <article key={proj.id ?? i} className="min-w-0">
                  {proj.image_url ? (
                    <SafeImg src={proj.image_url} alt={proj.title} className="mb-5 aspect-[4/3] w-full rounded-md object-cover" style={{ border: `1px solid ${p.rule}` }} />
                  ) : (
                    <div className="mb-5 h-px w-full" style={{ backgroundColor: p.rule }} />
                  )}
                  <h3 className="text-xl font-light tracking-tight" style={{ color: ink }}>{proj.title}</h3>
                  {proj.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                  {proj.tech_stack && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={p.acText} />)}
                    </div>
                  )}
                  {(proj.demo_url || proj.github_url) && (
                    <div className="mt-4 flex gap-5">
                      {proj.demo_url && <TextLink href={proj.demo_url} p={p}>Live<Arrow /></TextLink>}
                      {proj.github_url && <TextLink href={proj.github_url} p={p}>Source<Arrow /></TextLink>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Block>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Block id="services" label="Services" p={p}>
            <ul>
              {services.map((svc: TemplateItem, i: number) => (
                <li key={svc.id ?? i} className="grid gap-2 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-[1fr_1.4fr] sm:gap-8" style={{ borderColor: p.rule }}>
                  <h3 className="text-lg font-light" style={{ color: ink }}>{svc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Block id="testimonials" label="Kind words" p={p}>
            <div className="space-y-14">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <blockquote className="max-w-[44ch] text-2xl font-light leading-snug tracking-tight md:text-3xl" style={{ color: ink }}>
                    &ldquo;{t.message}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm">
                    {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="h-9 w-9 rounded-full object-cover" />}
                    <span style={{ color: ink }}>{t.name}</span>
                    {t.position && <span style={{ color: p.muted }}>{t.position}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {/* Certificates / gallery */}
        {gallery.length > 0 && (
          <Block id="gallery" label="Certificates" p={p}>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert: TemplateItem, i: number) => (
                <figure key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md" style={{ backgroundColor: p.surface, border: `1px solid ${p.rule}` }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption>
                    <p className="text-sm" style={{ color: ink }}>{cert.title}</p>
                    {cert.description && <p className="mt-1 text-xs leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    <p className="mt-2 flex items-center gap-4 font-mono text-xs" style={{ color: p.muted }}>
                      {cert.issued_date && <span>{new Date(cert.issued_date).toLocaleDateString()}</span>}
                      {cert.file_url && <TextLink href={cert.file_url} p={p}>View<Arrow /></TextLink>}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {/* Custom sections */}
        {custom.map((sec: TemplateItem, i: number) => (
          <section key={sec.id ?? i} id={customId(sec)} className="scroll-mt-16 border-t" style={{ borderColor: p.rule }}>
            <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-12 md:py-28">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] md:col-span-3" style={{ color: p.muted }}>{sec.title || sec.original_type || 'Section'}</h2>
              <div className="min-w-0 md:col-span-9"><CustomBody sec={sec} p={p} /></div>
            </div>
          </section>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <Block id="contact" label="Contact" p={p}>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="max-w-[22ch] text-3xl font-light leading-tight tracking-tight md:text-4xl" style={{ color: ink }}>
                  Open to new projects and conversations.
                </p>
                <ul className="mt-8 space-y-3 text-sm">
                  {email && <li><TextLink href={`mailto:${email}`} p={p} external={false}>{email}</TextLink></li>}
                  {contact?.phone && <li><TextLink href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} p={p}>WhatsApp {contact.phone}<Arrow /></TextLink></li>}
                  {contact?.linkedin_url && <li><TextLink href={contact.linkedin_url} p={p}>LinkedIn<Arrow /></TextLink></li>}
                  {contact?.github_url && <li><TextLink href={contact.github_url} p={p}>GitHub<Arrow /></TextLink></li>}
                  {contact?.location && <li style={{ color: p.muted }}>{contact.location}</li>}
                </ul>
              </div>
              <div className="min-w-0">
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={ink} subColor={p.muted} />
              </div>
            </div>
          </Block>
        )}
      </main>

      <footer className="border-t" style={{ borderColor: p.rule }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-8 text-xs" style={{ color: p.muted }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
