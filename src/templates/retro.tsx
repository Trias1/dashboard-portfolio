'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';

// Retro: a photocopied zine / early-web page. Monospace throughout, a boxed
// page with a double rule, reverse-video section labels, dotted leaders,
// [bracketed] links and photos printed in grayscale.

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
function ym(d?: string | null): string {
  return d ? String(d).slice(0, 7).replace('-', '.') : '';
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

type Palette = { paper: string; ink: string; muted: string; rule: string; acText: string };

const PHOTOCOPY: CSSProperties = { filter: 'grayscale(1) contrast(1.15)' };

function Label({ children, p }: { children: ReactNode; p: Palette }) {
  return (
    <h2 className="mb-8 flex items-end gap-3">
      <span className="shrink-0 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.14em]" style={{ backgroundColor: p.ink, color: p.paper }}>{children}</span>
      <span className="mb-1 flex-1 border-b-2 border-dotted" style={{ borderColor: p.rule }} aria-hidden="true" />
    </h2>
  );
}

function Part({ id, title, p, children }: { id: string; title: string; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 px-5 py-12 sm:px-10 md:py-14">
      <Label p={p}>{title}</Label>
      {children}
    </section>
  );
}

function Bracket({ href, children, p, external = true }: { href: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-sm underline decoration-1 underline-offset-2 transition-colors duration-150 hover:no-underline" style={{ color: p.acText }}>
      [{children}]
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[68ch] text-sm leading-7 whitespace-pre-line" style={{ color: p.ink }}>{c?.body}</p>;
  if (sec.type === 'list') {
    return (
      <ul className="max-w-[68ch] space-y-1.5 text-sm leading-7">
        {(c?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3" style={{ color: p.ink }}><span style={{ color: p.muted }}>*</span>{item}</li>
        ))}
      </ul>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {(c?.cards || []).map((card: TemplateItem, i: number) => (
          <div key={i} className="border p-4" style={{ borderColor: p.ink }}>
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: p.ink }}>{card.title}</h3>
            {card.desc && <p className="mt-2 text-sm leading-6" style={{ color: p.muted }}>{card.desc}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <p className="flex flex-wrap gap-x-4 gap-y-2">
        {(c?.links || []).map((link: TemplateItem, i: number) => <Bracket key={i} href={link.url || '#'} p={p}>{link.label}</Bracket>)}
      </p>
    );
  }
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <div style={{ color: p.ink, '--t-ink': p.ink, '--t-muted': p.muted } as CSSProperties}>
        <CertificationSection items={c.items} textColor="text-[color:var(--t-ink)]" subTextColor="text-[color:var(--t-muted)]"
          accentColor={p.acText} cardBg="border-[color:var(--t-ink)] bg-transparent" />
      </div>
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <div className="text-sm leading-7">
        {c.institution && <p className="font-bold uppercase" style={{ color: p.ink }}>{c.institution}</p>}
        {(c.degree || c.field) && <p style={{ color: p.ink }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {(c.start_date || c.end_date) && <p style={{ color: p.muted }}>{[ym(c.start_date), ym(c.end_date)].filter(Boolean).join(' – ')}</p>}
        {c.gpa && <p style={{ color: p.muted }}>GPA ........ {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className="text-sm leading-7">
        {c.name && <p className="font-bold uppercase" style={{ color: p.ink }}>{c.name}</p>}
        {c.issuer && <p style={{ color: p.ink }}>{c.issuer}</p>}
        {c.date && <p style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <Bracket href={c.credential_url} p={p}>view credential</Bracket>}
      </div>
    );
  }
  if (c.language) {
    return (
      <p className="flex items-baseline gap-2 text-sm">
        <span className="font-bold uppercase" style={{ color: p.ink }}>{c.language}</span>
        <span className="flex-1 border-b border-dotted" style={{ borderColor: p.rule }} aria-hidden="true" />
        {c.proficiency && <span style={{ color: p.muted }}>{c.proficiency}</span>}
      </p>
    );
  }
  if (c.body) return <p className="max-w-[68ch] text-sm leading-7" style={{ color: p.muted }}>{c.body}</p>;
  return null;
}

export default function RetroTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  void isPreview;

  const bg = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(bg) < 0.35;
  // Light themes print on cool grey newsprint; dark themes on carbon paper.
  const desk = dark ? mix(bg, '#000000', 0.25) : mix(bg, '#d9dad5', 0.7);
  const paper = dark ? mix(bg, '#1b1b1d', 0.6) : mix(bg, '#f1f1ee', 0.85);
  const ink = dark ? '#ecece6' : '#161616';
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const p: Palette = {
    paper, ink,
    muted: legible(mix(paper, ink, 0.62), paper),
    rule: mix(paper, ink, 0.45),
    acText: legible(ac, paper),
  };

  const name = about?.name || portfolio.title || '';
  const email = contact?.email || about?.email;
  const index = [
    about?.name && ['about', 'about'],
    skills.length > 0 && ['skills', 'skills'],
    experience.length > 0 && ['experience', 'experience'],
    projects.length > 0 && ['projects', 'projects'],
    ['contact', 'contact'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-hidden px-0 py-0 font-mono antialiased sm:px-6 sm:py-10" style={{ backgroundColor: desk, color: ink }}>
      <div className="mx-auto max-w-3xl sm:border-4 sm:border-double" style={{ backgroundColor: paper, borderColor: ink }}>
        {/* Masthead */}
        <header className="border-b-4 border-double px-5 pb-6 pt-8 sm:px-10" style={{ borderColor: ink }}>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: p.muted }}>
            <span>{contact?.location || 'Personal page'}</span>
            <span>Rev. {new Date().getFullYear()}</span>
          </div>
          <p className="mt-4 break-words text-3xl font-bold uppercase leading-none tracking-tight sm:text-5xl" style={{ color: ink }}>{name}</p>
          <nav aria-label="Contents" className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <span style={{ color: p.muted }}>contents:</span>
            {index.map(([id, label]) => <Bracket key={id} href={`#${id}`} p={p} external={false}>{label}</Bracket>)}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section id="hero" className="border-b px-5 py-12 sm:px-10 md:py-16" style={{ borderColor: p.rule }}>
            {hero?.background_url && (
              <SafeImg src={hero.background_url} alt="" className="mb-10 h-40 w-full border object-cover sm:h-56" style={{ ...PHOTOCOPY, borderColor: ink }} />
            )}
            <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="min-w-0">
                {hero?.greeting && <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: p.muted }}>{hero.greeting}</p>}
                <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl" style={{ color: ink }}>
                  <span className="underline decoration-[6px] underline-offset-[6px]" style={{ textDecorationColor: mix(ac, paper, 0.35) }}>{hero?.headline || name}</span>
                </h1>
                {hero?.subheadline && <p className="mt-6 max-w-[52ch] text-sm leading-7" style={{ color: p.muted }}>{hero.subheadline}</p>}
                <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
                  <Bracket href={hero?.cta_url || '#projects'} p={p} external={false}>{hero?.cta_text || 'view work'}</Bracket>
                  {about?.cv_url && <Bracket href={about.cv_url} p={p}>resume</Bracket>}
                  {hero?.cta_secondary_text && hero?.cta_secondary_url && <Bracket href={hero.cta_secondary_url} p={p}>{hero.cta_secondary_text}</Bracket>}
                </p>
              </div>
              {about?.photo_url && (
                <figure className="w-36 sm:w-40">
                  <SafeImg src={about.photo_url} alt={name} className="aspect-square w-full border-2 object-cover" style={{ ...PHOTOCOPY, borderColor: ink }} />
                  <figcaption className="mt-1.5 text-[11px] uppercase tracking-wider" style={{ color: p.muted }}>fig. 1 — the author</figcaption>
                </figure>
              )}
            </div>
          </section>

          {/* About */}
          {about?.name && (
            <Part id="about" title="About" p={p}>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: ink }}>
                {about.name}{about.title ? <span className="font-normal normal-case tracking-normal" style={{ color: p.muted }}> / {about.title}</span> : null}
              </p>
              {about.bio && <p className="mt-4 max-w-[68ch] text-sm leading-7 whitespace-pre-line" style={{ color: ink }}>{about.bio}</p>}
            </Part>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Part id="skills" title="Skills" p={p}>
              <div className="space-y-6">
                {skills.map((skill: TemplateItem, i: number) => (
                  <div key={skill.id ?? i}>
                    {skill.title && <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: p.muted }}>{skill.title}:</h3>}
                    <div className="flex flex-wrap gap-2">
                      {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={ink} textColor={ink} variant="outline" />)}
                    </div>
                  </div>
                ))}
              </div>
            </Part>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Part id="experience" title="Experience" p={p}>
              <ol className="text-sm">
                {experience.map((exp: TemplateItem, i: number) => (
                  <li key={exp.id ?? i} className="grid gap-1 border-b border-dashed py-5 first:pt-0 last:border-b-0 sm:grid-cols-[9.5rem_1fr] sm:gap-6" style={{ borderColor: p.rule }}>
                    <span className="tabular-nums" style={{ color: p.muted }}>{ym(exp.start_date)}–{exp.end_date ? ym(exp.end_date) : 'now'}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold uppercase tracking-wide" style={{ color: ink }}>{exp.position}</h3>
                      <p style={{ color: p.muted }}>@ {exp.company}</p>
                      {lines(exp.description).length > 0 && (
                        <ul className="mt-2 max-w-[62ch] space-y-1 leading-6" style={{ color: ink }}>
                          {lines(exp.description).map((l, li) => <li key={li} className="flex gap-2"><span style={{ color: p.muted }}>-</span>{l}</li>)}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Part>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Part id="projects" title="Projects" p={p}>
              <div className="space-y-6">
                {projects.map((proj: TemplateItem, i: number) => (
                  <article key={proj.id ?? i} className="border" style={{ borderColor: ink }}>
                    <div className="flex items-baseline justify-between gap-3 border-b border-dotted px-4 py-2" style={{ borderColor: p.rule }}>
                      <h3 className="min-w-0 text-sm font-bold uppercase tracking-wide" style={{ color: ink }}>{proj.title}</h3>
                      <span className="shrink-0 text-[11px] tabular-nums" style={{ color: p.muted }}>no.{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className={proj.image_url ? 'grid gap-4 p-4 sm:grid-cols-[12rem_1fr]' : 'p-4'}>
                      {proj.image_url && <SafeImg src={proj.image_url} alt={proj.title} className="aspect-[4/3] w-full border object-cover" style={{ ...PHOTOCOPY, borderColor: p.rule }} />}
                      <div className="min-w-0">
                        {proj.description && <p className="text-sm leading-6" style={{ color: ink }}>{proj.description}</p>}
                        {proj.tech_stack && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={ink} textColor={ink} variant="outline" />)}
                          </div>
                        )}
                        {(proj.demo_url || proj.github_url) && (
                          <p className="mt-3 flex gap-4">
                            {proj.demo_url && <Bracket href={proj.demo_url} p={p}>live</Bracket>}
                            {proj.github_url && <Bracket href={proj.github_url} p={p}>source</Bracket>}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Part>
          )}

          {/* Services */}
          {services.length > 0 && (
            <Part id="services" title="Services" p={p}>
              <ul className="space-y-4 text-sm">
                {services.map((svc: TemplateItem, i: number) => (
                  <li key={svc.id ?? i}>
                    <p className="flex items-baseline gap-2">
                      <span className="font-bold uppercase tracking-wide" style={{ color: ink }}>{svc.title}</span>
                      <span className="flex-1 border-b border-dotted" style={{ borderColor: p.rule }} aria-hidden="true" />
                      <span className="tabular-nums" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</span>
                    </p>
                    {svc.description && <p className="mt-1 max-w-[62ch] leading-6" style={{ color: p.muted }}>{svc.description}</p>}
                  </li>
                ))}
              </ul>
            </Part>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <Part id="testimonials" title="Letters" p={p}>
              <div className="space-y-8">
                {testimonials.map((t: TemplateItem, i: number) => (
                  <figure key={t.id ?? i} className="border-l-4 border-double pl-4" style={{ borderColor: ink }}>
                    <blockquote className="max-w-[62ch] text-sm leading-7" style={{ color: ink }}>&ldquo;{t.message}&rdquo;</blockquote>
                    <figcaption className="mt-3 flex items-center gap-3 text-xs uppercase tracking-wider" style={{ color: p.muted }}>
                      {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="h-8 w-8 border object-cover" style={{ ...PHOTOCOPY, borderColor: ink }} />}
                      <span>— {t.name}{t.position ? `, ${t.position}` : ''}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Part>
          )}

          {/* Certificates / gallery */}
          {gallery.length > 0 && (
            <Part id="gallery" title="Certificates" p={p}>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {gallery.map((cert: TemplateItem, i: number) => (
                  <figure key={cert.id ?? i} className="min-w-0 text-sm">
                    {(cert.image_url || cert.file_url) && (
                      <div className="mb-2 aspect-[4/3] overflow-hidden border" style={{ borderColor: ink }}>
                        <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover" style={PHOTOCOPY}
                          onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    <figcaption>
                      <p className="font-bold uppercase tracking-wide" style={{ color: ink }}>{cert.title}</p>
                      {cert.description && <p className="mt-1 leading-6" style={{ color: p.muted }}>{cert.description}</p>}
                      {cert.issued_date && <p className="mt-1 text-xs" style={{ color: p.muted }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                      {cert.file_url && <p className="mt-1"><Bracket href={cert.file_url} p={p}>view</Bracket></p>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Part>
          )}

          {/* Custom sections */}
          {custom.map((sec: TemplateItem, i: number) => (
            <Part key={sec.id ?? i} id={customId(sec)} title={sec.title || sec.original_type || 'Section'} p={p}>
              <CustomBody sec={sec} p={p} />
            </Part>
          ))}

          {/* Contact */}
          <Part id="contact" title="Contact" p={p}>
            <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
              <dl className="space-y-2 text-sm">
                {email && (
                  <div className="flex flex-wrap gap-x-2"><dt style={{ color: p.muted }}>email:</dt><dd className="min-w-0 break-all"><a href={`mailto:${email}`} className="underline underline-offset-2" style={{ color: p.acText }}>{email}</a></dd></div>
                )}
                {contact?.phone && (
                  <div className="flex flex-wrap gap-x-2"><dt style={{ color: p.muted }}>whatsapp:</dt><dd><a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: p.acText }}>{contact.phone}</a></dd></div>
                )}
                {contact?.linkedin_url && (
                  <div className="flex flex-wrap gap-x-2"><dt style={{ color: p.muted }}>linkedin:</dt><dd><Bracket href={contact.linkedin_url} p={p}>profile</Bracket></dd></div>
                )}
                {contact?.github_url && (
                  <div className="flex flex-wrap gap-x-2"><dt style={{ color: p.muted }}>github:</dt><dd><Bracket href={contact.github_url} p={p}>profile</Bracket></dd></div>
                )}
              </dl>
              <div className="min-w-0 border border-dashed p-4" style={{ borderColor: p.rule }}>
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={ink} subColor={p.muted} />
              </div>
            </div>
          </Part>
        </main>

        <footer className="border-t-4 border-double px-5 py-5 text-center text-[11px] uppercase tracking-[0.16em] sm:px-10" style={{ borderColor: ink, color: p.muted }}>
          <p>— end of page —</p>
          <p className="mt-1">© {new Date().getFullYear()} {name} · made with PortfolioKit</p>
        </footer>
      </div>
    </div>
  );
}
