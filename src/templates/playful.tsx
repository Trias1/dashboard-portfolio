'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

// Playful: a sticker book. Friendly rounded display type, outlined cards with
// a flat offset shadow, little tilted sticker labels and a hand-drawn squiggle
// under headings. Everything stays still unless you hover or focus it.

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
function lines(text?: string): string[] {
  return (text || '').split(/\n+/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
function splitList(text?: string): string[] {
  return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}
function customId(sec: TemplateItem): string {
  return `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;
}

const ROUNDED = 'ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", var(--font-bricolage), system-ui, sans-serif';
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const MD_TILTS = ['md:-rotate-2', 'md:rotate-1', 'md:-rotate-1', 'md:rotate-2'];

type Sticker = { fill: string; text: string };
type Palette = { bg: string; card: string; ink: string; muted: string; edge: string; shadow: string; acText: string; stickers: Sticker[] };

function Squiggle({ color, className = '' }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 140 14" className={`h-3 w-32 ${className}`} fill="none" aria-hidden="true">
      <path d="M2 8c9-7 15 5 24 0s15-7 24 0 15 6 24 0 15-7 24 0 15 6 24 0 10-4 16-2" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tag({ children, s, tilt = '-rotate-2', p, className = '' }: { children: ReactNode; s: Sticker; tilt?: string; p: Palette; className?: string }) {
  return (
    <span className={`inline-block rounded-lg border-2 px-2.5 py-0.5 text-xs font-bold ${tilt} ${className}`}
      style={{ backgroundColor: s.fill, color: s.text, borderColor: p.edge, boxShadow: `2px 2px 0 ${p.shadow}` }}>
      {children}
    </span>
  );
}

function Card({ children, p, className = '', style }: { children: ReactNode; p: Palette; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative rounded-xl border-2 ${className}`} style={{ backgroundColor: p.card, borderColor: p.edge, boxShadow: `4px 4px 0 ${p.shadow}`, ...style }}>
      {children}
    </div>
  );
}

function Heading({ title, p, color }: { title: string; p: Palette; color: string }) {
  return (
    <div className="mb-10 md:mb-14">
      <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{ color: p.ink, fontFamily: ROUNDED }}>{title}</h2>
      <Squiggle color={color} className="mt-2" />
    </div>
  );
}

function Page({ id, title, p, color, children }: { id: string; title: string; p: Palette; color: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        <Heading title={title} p={p} color={color} />
        {children}
      </div>
    </section>
  );
}

function PushButton({ href, children, s, p, external = false }: { href: string; children: ReactNode; s: Sticker; p: Palette; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-block rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-[transform,box-shadow] duration-150 motion-safe:hover:translate-x-[2px] motion-safe:hover:translate-y-[2px] motion-safe:hover:!shadow-none"
      style={{ backgroundColor: s.fill, color: s.text, borderColor: p.edge, boxShadow: `3px 3px 0 ${p.shadow}`, fontFamily: ROUNDED }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <Card p={p} className="p-6 sm:p-8"><p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line" style={{ color: p.ink }}>{c?.body}</p></Card>;
  if (sec.type === 'list') {
    return (
      <ul className="max-w-[62ch] space-y-3">
        {(c?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-lg" style={{ color: p.ink }}>
            <span className="mt-2 h-3 w-3 shrink-0 rounded-full border-2" style={{ backgroundColor: p.stickers[i % 4].fill, borderColor: p.edge }} />{item}
          </li>
        ))}
      </ul>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(c?.cards || []).map((card: TemplateItem, i: number) => (
          <Card key={i} p={p} className="p-6">
            <h3 className="text-xl font-extrabold" style={{ color: p.ink, fontFamily: ROUNDED }}>{card.title}</h3>
            {card.desc && <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
          </Card>
        ))}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <div className="flex flex-wrap gap-4">
        {(c?.links || []).map((link: TemplateItem, i: number) => <PushButton key={i} href={link.url || '#'} s={p.stickers[i % 4]} p={p} external>{link.label}</PushButton>)}
      </div>
    );
  }
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <div style={{ color: p.ink, '--t-ink': p.ink, '--t-muted': p.muted, '--t-edge': p.edge, '--t-card': p.card } as CSSProperties}>
        <CertificationSection items={c.items} textColor="text-[color:var(--t-ink)]" subTextColor="text-[color:var(--t-muted)]"
          accentColor={p.acText} cardBg="border-2 border-[color:var(--t-edge)] bg-[color:var(--t-card)]" />
      </div>
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <Card p={p} className="p-6">
        {c.institution && <p className="text-2xl font-extrabold" style={{ color: p.ink, fontFamily: ROUNDED }}>{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-1" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(' · ')}</p>}
        {(c.start_date || c.end_date) && <div className="mt-3"><Tag s={p.stickers[1]} p={p} tilt="rotate-1">{[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' – ')}</Tag></div>}
        {c.gpa && <p className="mt-3 text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </Card>
    );
  }
  if (c.name || c.issuer) {
    return (
      <Card p={p} className="p-6">
        {c.name && <p className="text-2xl font-extrabold" style={{ color: p.ink, fontFamily: ROUNDED }}>{c.name}</p>}
        {c.issuer && <p className="mt-1" style={{ color: p.muted }}>{c.issuer}</p>}
        {c.date && <p className="mt-1 text-sm" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-bold underline decoration-2 underline-offset-4" style={{ color: p.acText }}>View credential</a>}
      </Card>
    );
  }
  if (c.language) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-2xl font-extrabold" style={{ color: p.ink, fontFamily: ROUNDED }}>{c.language}</p>
        {c.proficiency && <Tag s={p.stickers[2]} p={p}>{c.proficiency}</Tag>}
      </div>
    );
  }
  if (c.body) return <p className="max-w-[62ch] text-lg leading-relaxed" style={{ color: p.muted }}>{c.body}</p>;
  return null;
}

export default function PlayfulTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  void isPreview;

  const base = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(base) < 0.35;
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const bg = mix(base, ac, dark ? 0.06 : 0.05);
  const ink = dark ? '#f6f4fb' : '#17151f';
  const card = dark ? mix(bg, '#ffffff', 0.06) : '#ffffff';
  const p: Palette = {
    bg, card, ink,
    muted: legible(mix(card, ink, 0.66), card),
    edge: dark ? mix(bg, ink, 0.6) : ink,
    shadow: dark ? mix(bg, '#000000', 0.6) : ink,
    acText: legible(ac, card),
    stickers: [ac, '#ffd84d', '#8ce3c1', '#ffb3c9'].map((fill) => ({ fill, text: onColor(fill) })),
  };
  const [S0, S1, S2, S3] = p.stickers;
  const squiggle = legible(ac, bg, 3);

  const name = about?.name || portfolio.title || '';
  const firstName = about?.name?.split(' ')[0] || portfolio.title || '';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;
  const nav = [
    about?.name && ['about', 'About'],
    projects.length > 0 && ['projects', 'Work'],
    skills.length > 0 && ['skills', 'Skills'],
    contactEnabled && ['contact', 'Say hi'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: bg, color: ink }}>
      <header className="sticky top-0 z-40 border-b-2" style={{ backgroundColor: bg, borderColor: p.edge }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <a href="#hero" className="truncate text-xl font-extrabold tracking-tight" style={{ color: ink, fontFamily: ROUNDED }}>{firstName}</a>
          <nav aria-label="Sections" className="flex gap-1 sm:gap-2">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-lg px-2 py-1 text-sm font-bold transition-colors duration-150 hover:underline decoration-2 underline-offset-4 max-sm:[&:nth-child(n+3)]:hidden"
                style={{ color: ink, fontFamily: ROUNDED }}>{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="scroll-mt-20">
          <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 pb-16 pt-14 md:grid-cols-[1.4fr_1fr] md:pb-24 md:pt-24">
            <div className="min-w-0">
              {hero?.greeting && <Tag s={S1} p={p} tilt="-rotate-3" className="mb-6 text-sm">{hero.greeting}</Tag>}
              <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight break-words sm:text-6xl md:text-7xl" style={{ color: ink, fontFamily: ROUNDED }}>
                {hero?.headline || name}
              </h1>
              <Squiggle color={squiggle} className="mt-4 w-40" />
              {hero?.subheadline && <p className="mt-6 max-w-[44ch] text-lg leading-relaxed md:text-xl" style={{ color: legible(mix(bg, ink, 0.7), bg) }}>{hero.subheadline}</p>}
              <div className="mt-9 flex flex-wrap gap-4">
                <PushButton href={hero?.cta_url || '#projects'} s={S0} p={p}>{hero?.cta_text || 'See my stuff'}</PushButton>
                {about?.cv_url && <PushButton href={about.cv_url} s={{ fill: card, text: ink }} p={p} external>Grab my CV</PushButton>}
                {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                  <PushButton href={hero.cta_secondary_url} s={{ fill: card, text: ink }} p={p} external>{hero.cta_secondary_text}</PushButton>
                )}
              </div>
            </div>
            {(hero?.background_url || about?.photo_url) && (
              <div className="relative mx-auto w-56 sm:w-64 md:w-full md:max-w-xs">
                <div className="rotate-2 overflow-hidden rounded-[1.25rem] border-2" style={{ borderColor: p.edge, boxShadow: `6px 6px 0 ${p.shadow}`, backgroundColor: S2.fill }}>
                  <img src={about?.photo_url || hero?.background_url} alt={name} className="aspect-square w-full object-cover" />
                </div>
                {about?.title && <Tag s={S3} p={p} tilt="-rotate-6" className="absolute -bottom-4 -left-3 text-sm">{about.title}</Tag>}
              </div>
            )}
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <Page id="about" title="About me" p={p} color={squiggle}>
            <Card p={p} className="p-6 sm:p-10">
              <p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line md:text-xl" style={{ color: ink }}>{about.bio}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Tag s={S0} p={p} tilt="-rotate-1">{about.name}</Tag>
                {about.title && <Tag s={S2} p={p} tilt="rotate-1">{about.title}</Tag>}
                {contact?.location && <Tag s={S1} p={p} tilt="-rotate-2">{contact.location}</Tag>}
              </div>
            </Card>
          </Page>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Page id="skills" title="Things I'm good at" p={p} color={squiggle}>
            <div className="grid gap-8 md:grid-cols-2">
              {skills.map((skill: TemplateItem, i: number) => (
                <Card key={skill.id ?? i} p={p} className="p-6 pt-8">
                  {skill.title && <Tag s={p.stickers[(i + 1) % 4]} p={p} tilt={TILTS[i % 4]} className="absolute -top-3.5 left-5 text-sm">{skill.title}</Tag>}
                  <div className="flex flex-wrap gap-2">
                    {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={p.acText} textColor={ink} size="md" />)}
                  </div>
                </Card>
              ))}
            </div>
          </Page>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Page id="experience" title="Where I've been" p={p} color={squiggle}>
            <div className="space-y-8">
              {experience.map((exp: TemplateItem, i: number) => (
                <Card key={exp.id ?? i} p={p} className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: ink, fontFamily: ROUNDED }}>{exp.position}</h3>
                      <p className="mt-1 font-bold" style={{ color: p.acText }}>{exp.company}</p>
                    </div>
                    <Tag s={p.stickers[(i + 1) % 4]} p={p} tilt={TILTS[(i + 1) % 4]}>
                      {fmtMonth(exp.start_date)} – {exp.end_date ? fmtMonth(exp.end_date) : 'now'}
                    </Tag>
                  </div>
                  {lines(exp.description).length > 0 && (
                    <div className="mt-4 max-w-[64ch] space-y-1.5 leading-relaxed" style={{ color: p.muted }}>
                      {lines(exp.description).map((l, li) => <p key={li}>{l}</p>)}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Page>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Page id="projects" title="Stuff I've made" p={p} color={squiggle}>
            <div className="grid gap-10 md:grid-cols-2">
              {projects.map((proj: TemplateItem, i: number) => (
                <Card key={proj.id ?? i} p={p} className={`flex flex-col overflow-hidden ${i % 2 === 0 ? 'md:rotate-[-0.6deg]' : 'md:rotate-[0.6deg]'}`}>
                  <div className="relative aspect-[16/10] border-b-2" style={{ borderColor: p.edge, backgroundColor: p.stickers[i % 4].fill }}>
                    {proj.image_url ? (
                      <img src={proj.image_url} alt={proj.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-3xl font-extrabold" style={{ color: p.stickers[i % 4].text, fontFamily: ROUNDED }} aria-hidden="true">
                        {proj.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: ink, fontFamily: ROUNDED }}>{proj.title}</h3>
                    {proj.description && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                    {proj.tech_stack && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={p.acText} textColor={ink} />)}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        {proj.demo_url && <PushButton href={proj.demo_url} s={S0} p={p} external>Try it</PushButton>}
                        {proj.github_url && <PushButton href={proj.github_url} s={{ fill: card, text: ink }} p={p} external>Code</PushButton>}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Page>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Page id="services" title="How I can help" p={p} color={squiggle}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc: TemplateItem, i: number) => (
                <Card key={svc.id ?? i} p={p} className="p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-extrabold"
                    style={{ backgroundColor: p.stickers[i % 4].fill, color: p.stickers[i % 4].text, borderColor: p.edge, fontFamily: ROUNDED }}>
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold" style={{ color: ink, fontFamily: ROUNDED }}>{svc.title}</h3>
                  {svc.description && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                </Card>
              ))}
            </div>
          </Page>
        )}

        {/* Testimonials: speech bubbles */}
        {testimonials.length > 0 && (
          <Page id="testimonials" title="Nice things people said" p={p} color={squiggle}>
            <div className="grid gap-12 md:grid-cols-2">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <Card p={p} className="p-6">
                    <blockquote className="text-lg leading-relaxed" style={{ color: ink }}>&ldquo;{t.message}&rdquo;</blockquote>
                    <span className="absolute -bottom-[11px] left-8 h-5 w-5 rotate-45 border-b-2 border-r-2" style={{ backgroundColor: card, borderColor: p.edge }} aria-hidden="true" />
                  </Card>
                  <figcaption className="mt-6 flex items-center gap-3 pl-4">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="h-10 w-10 rounded-full border-2 object-cover" style={{ borderColor: p.edge }} />}
                    <span className="text-sm" style={{ color: legible(mix(bg, ink, 0.7), bg) }}>
                      <strong style={{ color: ink }}>{t.name}</strong>{t.position ? ` · ${t.position}` : ''}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Page>
        )}

        {/* Certificates / gallery: polaroids */}
        {gallery.length > 0 && (
          <Page id="gallery" title="Certificates" p={p} color={squiggle}>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert: TemplateItem, i: number) => (
                <Card key={cert.id ?? i} p={p} className={`p-3 pb-5 ${MD_TILTS[i % 4]}`}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="aspect-[4/3] overflow-hidden rounded-md border-2" style={{ borderColor: p.edge, backgroundColor: p.stickers[i % 4].fill }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <p className="mt-3 text-lg font-extrabold" style={{ color: ink, fontFamily: ROUNDED }}>{cert.title}</p>
                  {cert.description && <p className="mt-1 text-sm" style={{ color: p.muted }}>{cert.description}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {cert.issued_date && <span style={{ color: p.muted }}>{new Date(cert.issued_date).toLocaleDateString()}</span>}
                    {cert.file_url && <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-4" style={{ color: p.acText }}>View</a>}
                  </div>
                </Card>
              ))}
            </div>
          </Page>
        )}

        {/* Custom sections */}
        {custom.map((sec: TemplateItem, i: number) => (
          <Page key={sec.id ?? i} id={customId(sec)} title={sec.title || sec.original_type || 'Section'} p={p} color={squiggle}>
            <CustomBody sec={sec} p={p} />
          </Page>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <Page id="contact" title="Say hello" p={p} color={squiggle}>
            <Card p={p} className="p-6 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
                <div>
                  <p className="max-w-[32ch] text-lg leading-relaxed" style={{ color: ink }}>
                    Got a project, a question or just want to chat? My inbox is open.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {email && <PushButton href={`mailto:${email}`} s={S0} p={p}>Email me</PushButton>}
                    {contact?.phone && <PushButton href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} s={S2} p={p} external>WhatsApp</PushButton>}
                    {contact?.linkedin_url && <PushButton href={contact.linkedin_url} s={S1} p={p} external>LinkedIn</PushButton>}
                    {contact?.github_url && <PushButton href={contact.github_url} s={S3} p={p} external>GitHub</PushButton>}
                  </div>
                </div>
                <div className="min-w-0">
                  <ContactForm slug={portfolio.slug} accentColor={ac} textColor={ink} subColor={p.muted} />
                </div>
              </div>
            </Card>
          </Page>
        )}
      </main>

      <footer className="border-t-2" style={{ borderColor: p.edge }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-sm" style={{ color: legible(mix(bg, ink, 0.7), bg) }}>
          <span className="font-bold" style={{ fontFamily: ROUNDED }}>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
