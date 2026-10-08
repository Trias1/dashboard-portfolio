'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';
import DescText, { DescItems } from '@/components/DescText';

// Vibrant: a colour-block layout built from exactly three flat colours
// (the theme accent, lemon and mint) plus ink. Square corners, heavy display
// type, no gradients, nothing that bounces.

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

/* ---------- content helpers ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtMonth(d?: string | null): string {
  if (!d) return '';
  const [y, m] = String(d).split('-');
  const mi = parseInt(m, 10);
  return mi >= 1 && mi <= 12 ? `${MONTHS[mi - 1]} ${y}` : y;
}
function year(d?: string | null): string {
  return d ? String(d).slice(0, 4) : '';
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

type Swatch = { fill: string; text: string };
type Palette = { bg: string; ink: string; muted: string; line: string; acText: string; swatches: Swatch[] };

function Heading({ title, sw, p }: { title: string; sw: Swatch; p: Palette }) {
  return (
    <h2 className="mb-10 flex items-center gap-4 font-display text-4xl font-extrabold leading-none tracking-[-0.03em] md:mb-14 md:text-6xl" style={{ color: p.ink }}>
      <span className="inline-block h-4 w-4 shrink-0 md:h-6 md:w-6" style={{ backgroundColor: sw.fill }} aria-hidden="true" />
      {title}
    </h2>
  );
}

function Band({ id, title, sw, p, children }: { id: string; title: string; sw: Swatch; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Heading title={title} sw={sw} p={p} />
        {children}
      </div>
    </section>
  );
}

function Btn({ href, children, fill, text, external = false, outline }: { href: string; children: ReactNode; fill: string; text: string; external?: boolean; outline?: string }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-block px-5 py-3 text-sm font-bold transition-[filter] duration-150 hover:brightness-95"
      style={{ backgroundColor: fill, color: text, border: `2px solid ${outline || fill}` }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[60ch] text-lg leading-relaxed whitespace-pre-line" style={{ color: p.ink }}>{c?.body}</p>;
  if (sec.type === 'list') {
    return (
      <ul className="max-w-[60ch] space-y-3">
        {(c?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-lg" style={{ color: p.ink }}>
            <span className="mt-2 h-2.5 w-2.5 shrink-0" style={{ backgroundColor: p.swatches[i % 3].fill }} />{item}
          </li>
        ))}
      </ul>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(c?.cards || []).map((card: TemplateItem, i: number) => {
          const sw = p.swatches[i % 3];
          return (
            <div key={i} className="p-6" style={{ backgroundColor: sw.fill, color: sw.text }}>
              <h3 className="font-display text-xl font-extrabold">{card.title}</h3>
              {card.desc && <p className="mt-2 text-sm leading-relaxed">{card.desc}</p>}
            </div>
          );
        })}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <div className="flex flex-wrap gap-3">
        {(c?.links || []).map((link: TemplateItem, i: number) => {
          const sw = p.swatches[i % 3];
          return <Btn key={i} href={link.url || '#'} fill={sw.fill} text={sw.text} external>{link.label}</Btn>;
        })}
      </div>
    );
  }
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <div style={{ color: p.ink, '--t-ink': p.ink, '--t-muted': p.muted, '--t-line': p.line } as CSSProperties}>
        <CertificationSection items={c.items} textColor="text-[color:var(--t-ink)]" subTextColor="text-[color:var(--t-muted)]"
          accentColor={p.swatches[0].fill} cardBg="border-2 border-[color:var(--t-line)] bg-transparent" />
      </div>
    );
  }
  const box = 'border-2 p-6';
  if (c.institution || c.degree || c.field) {
    return (
      <div className={box} style={{ borderColor: p.line }}>
        {c.institution && <p className="font-display text-2xl font-extrabold" style={{ color: p.ink }}>{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-1" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(' · ')}</p>}
        {(c.start_date || c.end_date) && <p className="mt-2 font-mono text-sm" style={{ color: p.muted }}>{[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' – ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className={box} style={{ borderColor: p.line }}>
        {c.name && <p className="font-display text-2xl font-extrabold" style={{ color: p.ink }}>{c.name}</p>}
        {c.issuer && <p className="mt-1" style={{ color: p.muted }}>{c.issuer}</p>}
        {c.date && <p className="mt-1 font-mono text-sm" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-bold underline underline-offset-4" style={{ color: p.acText }}>View credential</a>}
      </div>
    );
  }
  if (c.language) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-display text-2xl font-extrabold" style={{ color: p.ink }}>{c.language}</p>
        {c.proficiency && <span className="px-2 py-1 text-xs font-bold uppercase" style={{ backgroundColor: p.swatches[1].fill, color: p.swatches[1].text }}>{c.proficiency}</span>}
      </div>
    );
  }
  if (c.body) return <p className="max-w-[60ch] text-lg leading-relaxed" style={{ color: p.muted }}>{c.body}</p>;
  return null;
}

export default function VibrantTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  void isPreview;

  const bg = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(bg) < 0.35;
  const ink = dark ? '#f4f4f0' : '#111111';
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const lemon = '#ffd23f';
  const mint = '#3ddbb0';
  const p: Palette = {
    bg, ink,
    muted: legible(mix(bg, ink, 0.68), bg),
    line: ink,
    acText: legible(ac, bg),
    swatches: [ac, lemon, mint].map((fill) => ({ fill, text: onColor(fill) })),
  };
  const [A, L, M] = p.swatches;

  const name = about?.name || portfolio.title || '';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;
  const nav = [
    about?.name && ['about', 'About'],
    projects.length > 0 && ['projects', 'Work'],
    skills.length > 0 && ['skills', 'Skills'],
    contactEnabled && ['contact', 'Contact'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: bg, color: ink }}>
      <header className="border-b-2" style={{ borderColor: ink }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
          <a href="#hero" className="font-display text-xl font-extrabold tracking-tight" style={{ color: ink }}>{name}</a>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-1">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ink }}>{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero: three colour blocks */}
        <section id="hero">
          <div className="mx-auto grid max-w-6xl gap-3 px-5 py-8 md:grid-cols-12 md:py-12">
            <div className="flex min-h-[22rem] flex-col justify-between p-6 sm:p-10 md:col-span-8 md:min-h-[32rem]"
              style={{ backgroundColor: A.fill, color: A.text, ...(hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={hero?.background_url ? { backgroundColor: A.fill, alignSelf: 'flex-start', padding: '2px 6px' } : undefined}>
                {hero?.greeting || about?.title || ' '}
              </p>
              <div>
                <h1 className="font-display text-5xl font-extrabold leading-[0.92] tracking-[-0.04em] break-words sm:text-7xl lg:text-8xl"
                  style={hero?.background_url ? { backgroundColor: A.fill, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', display: 'inline', padding: '0 0.12em' } : undefined}>
                  {hero?.headline || name}
                </h1>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn href={hero?.cta_url || '#projects'} fill={A.text} text={A.fill}>{hero?.cta_text || 'See the work'}</Btn>
                  {about?.cv_url && <Btn href={about.cv_url} fill={A.fill} text={A.text} outline={A.text} external>Download CV</Btn>}
                  {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                    <Btn href={hero.cta_secondary_url} fill={A.fill} text={A.text} outline={A.text} external>{hero.cta_secondary_text}</Btn>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:col-span-4 md:grid-cols-1">
              <div className="relative min-h-[14rem] overflow-hidden" style={{ backgroundColor: L.fill }}>
                {about?.photo_url ? (
                  <SafeImg src={about.photo_url} alt={name} className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] object-cover" />
                ) : (
                  <span className="absolute bottom-3 left-4 font-display text-[7rem] font-extrabold leading-none" style={{ color: L.text }} aria-hidden="true">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex flex-col justify-end p-6" style={{ backgroundColor: M.fill, color: M.text }}>
                {hero?.subheadline && <p className="text-lg font-semibold leading-snug">{hero.subheadline}</p>}
                {contact?.location && <p className="mt-3 font-mono text-xs uppercase tracking-wider">{contact.location}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <Band id="about" title="About" sw={L} p={p}>
            <div className="grid gap-8 md:grid-cols-12">
              <p className="max-w-[60ch] text-xl leading-relaxed whitespace-pre-line md:col-span-8 md:text-2xl" style={{ color: ink }}>{about.bio}</p>
              <div className="self-start border-2 p-5 md:col-span-4" style={{ borderColor: ink }}>
                <p className="font-display text-2xl font-extrabold" style={{ color: ink }}>{about.name}</p>
                {about.title && <p className="mt-1 text-sm" style={{ color: p.muted }}>{about.title}</p>}
                {about.cv_url && <a href={about.cv_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold underline underline-offset-4" style={{ color: p.acText }}>Download CV</a>}
              </div>
            </div>
          </Band>
        )}

        {/* Skills: one solid tile per group */}
        {skills.length > 0 && (
          <Band id="skills" title="Skills" sw={M} p={p}>
            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((skill: TemplateItem, i: number) => {
                const sw = p.swatches[(i + 1) % 3];
                return (
                  <div key={skill.id ?? i} className="p-6 sm:p-8" style={{ backgroundColor: sw.fill, color: sw.text }}>
                    {skill.title && <h3 className="mb-5 font-display text-2xl font-extrabold tracking-tight">{skill.title}</h3>}
                    <div className="flex flex-wrap gap-2">
                      {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={sw.text} textColor={sw.text} size="md" />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Band>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Band id="experience" title="Experience" sw={A} p={p}>
            <ol className="border-t-2" style={{ borderColor: ink }}>
              {experience.map((exp: TemplateItem, i: number) => {
                const sw = p.swatches[i % 3];
                return (
                  <li key={exp.id ?? i} className="grid gap-4 border-b-2 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8" style={{ borderColor: ink }}>
                    <div className="self-start px-3 py-2 font-display text-2xl font-extrabold leading-none tabular-nums" style={{ backgroundColor: sw.fill, color: sw.text }}>
                      {year(exp.start_date)}<span className="block pt-1 text-sm font-bold">to {exp.end_date ? fmtMonth(exp.end_date) : 'now'}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-extrabold tracking-tight" style={{ color: ink }}>{exp.position}</h3>
                      <p className="mt-1 font-bold" style={{ color: p.acText }}>{exp.company}</p>
                      {lines(exp.description).length > 0 && (
                        <div className="mt-3 max-w-[64ch] space-y-1.5 leading-relaxed" style={{ color: p.muted }}>
                          <DescItems items={lines(exp.description)} />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Band>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Band id="projects" title="Work" sw={L} p={p}>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((proj: TemplateItem, i: number) => {
                const sw = p.swatches[i % 3];
                return (
                  <article key={proj.id ?? i} className="flex min-w-0 flex-col border-2" style={{ borderColor: ink }}>
                    <div className="relative aspect-[16/10] overflow-hidden border-b-2" style={{ backgroundColor: sw.fill, borderColor: ink }}>
                      {proj.image_url ? (
                        <SafeImg src={proj.image_url} alt={proj.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="absolute bottom-3 left-5 font-display text-6xl font-extrabold leading-none tracking-tight sm:text-7xl" style={{ color: sw.text }} aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-2xl font-extrabold tracking-tight" style={{ color: ink }}>{proj.title}</h3>
                      <DescText text={proj.description} className="mt-2 leading-relaxed" style={{ color: p.muted }} />
                      {proj.tech_stack && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={p.acText} textColor={ink} />)}
                        </div>
                      )}
                      {(proj.demo_url || proj.github_url) && (
                        <div className="mt-auto flex flex-wrap gap-3 pt-6">
                          {proj.demo_url && <Btn href={proj.demo_url} fill={ink} text={bg} external>Live demo</Btn>}
                          {proj.github_url && <Btn href={proj.github_url} fill={bg} text={ink} outline={ink} external>Code</Btn>}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </Band>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Band id="services" title="Services" sw={M} p={p}>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc: TemplateItem, i: number) => {
                const sw = p.swatches[i % 3];
                return (
                  <div key={svc.id ?? i}>
                    <span className="inline-flex h-12 w-12 items-center justify-center font-display text-xl font-extrabold tabular-nums" style={{ backgroundColor: sw.fill, color: sw.text }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-display text-xl font-extrabold" style={{ color: ink }}>{svc.title}</h3>
                    {svc.description && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                  </div>
                );
              })}
            </div>
          </Band>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Band id="testimonials" title="Kind words" sw={A} p={p}>
            <div className="grid gap-3 md:grid-cols-2">
              {testimonials.map((t: TemplateItem, i: number) => {
                const sw = p.swatches[(i + 1) % 3];
                return (
                  <figure key={t.id ?? i} className="p-6 sm:p-8" style={{ backgroundColor: sw.fill, color: sw.text }}>
                    <blockquote className="font-display text-2xl font-bold leading-snug tracking-tight">&ldquo;{t.message}&rdquo;</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 text-sm">
                      {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="h-10 w-10 object-cover" />}
                      <span><strong>{t.name}</strong>{t.position ? ` — ${t.position}` : ''}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </Band>
        )}

        {/* Certificates / gallery */}
        {gallery.length > 0 && (
          <Band id="gallery" title="Certificates" sw={L} p={p}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert: TemplateItem, i: number) => (
                <figure key={cert.id ?? i} className="min-w-0 border-2" style={{ borderColor: ink }}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="aspect-[4/3] overflow-hidden border-b-2" style={{ borderColor: ink, backgroundColor: p.swatches[i % 3].fill }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption className="p-4">
                    <p className="font-display text-lg font-extrabold" style={{ color: ink }}>{cert.title}</p>
                    {cert.description && <p className="mt-1 text-sm" style={{ color: p.muted }}>{cert.description}</p>}
                    {cert.issued_date && <p className="mt-2 font-mono text-xs" style={{ color: p.muted }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                    {cert.file_url && <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold underline underline-offset-4" style={{ color: p.acText }}>View certificate</a>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Band>
        )}

        {/* Custom sections */}
        {custom.map((sec: TemplateItem, i: number) => (
          <Band key={sec.id ?? i} id={customId(sec)} title={sec.title || sec.original_type || 'Section'} sw={p.swatches[i % 3]} p={p}>
            <CustomBody sec={sec} p={p} />
          </Band>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <section id="contact" className="scroll-mt-4">
            <div className="mx-auto grid max-w-6xl gap-3 px-5 py-16 md:grid-cols-2 md:py-24">
              <div className="flex flex-col justify-between gap-10 p-6 sm:p-10" style={{ backgroundColor: A.fill, color: A.text }}>
                <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">Let&apos;s make something.</h2>
                <ul className="space-y-2 text-base font-semibold">
                  {email && <li><a href={`mailto:${email}`} className="underline decoration-2 underline-offset-4 break-all">{email}</a></li>}
                  {contact?.phone && <li><a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4">WhatsApp</a></li>}
                  {contact?.linkedin_url && <li><a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4">LinkedIn</a></li>}
                  {contact?.github_url && <li><a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4">GitHub</a></li>}
                </ul>
              </div>
              <div className="border-2 p-6 sm:p-8" style={{ borderColor: ink }}>
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={ink} subColor={p.muted} />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t-2" style={{ borderColor: ink }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm font-bold" style={{ color: ink }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {p.swatches.map((s) => <span key={s.fill} className="inline-block h-3 w-3" style={{ backgroundColor: s.fill }} />)}
          </span>
          <span className="font-normal" style={{ color: p.muted }}>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
