'use client';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

// Immersive: full-bleed bands, edge-to-edge imagery and very large type.
// The only motion is a slow parallax on the hero photograph (off when the
// visitor prefers reduced motion).

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
function year(d?: string | null): string {
  return d ? String(d).slice(0, 4) : '';
}
function lines(text?: string): string[] {
  return (text || '').split(/\n+/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
function splitList(text?: string): string[] {
  return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}
function slugOf(sec: TemplateItem): string {
  return (sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-');
}

type Palette = { bg: string; ink: string; muted: string; rule: string; surface: string; ac: string; acText: string };

function Kicker({ children, color }: { children: ReactNode; color: string }) {
  return <p className="mb-6 text-xs font-medium uppercase tracking-[0.22em]" style={{ color }}>{children}</p>;
}

function Band({ id, kicker, title, p, tone = 'base', children }: { id: string; kicker?: string; title: string; p: Palette; tone?: 'base' | 'surface'; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-0" style={{ backgroundColor: tone === 'surface' ? p.surface : p.bg }}>
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
        {kicker && <Kicker color={p.muted}>{kicker}</Kicker>}
        <h2 className="mb-14 font-display text-5xl font-bold leading-[0.95] tracking-[-0.035em] md:mb-20 md:text-7xl lg:text-8xl" style={{ color: p.ink }}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function BigLink({ href, children, color, external = true }: { href: string; children: ReactNode; color: string; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex items-center gap-2 border-b pb-0.5 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
      style={{ color, borderColor: color }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[56ch] text-xl leading-relaxed whitespace-pre-line md:text-2xl" style={{ color: p.ink }}>{c?.body}</p>;
  if (sec.type === 'list') {
    return (
      <ul className="max-w-4xl">
        {(c?.items || []).map((item: string, i: number) => (
          <li key={i} className="border-t py-4 text-xl md:text-2xl" style={{ borderColor: p.rule, color: p.ink }}>{item}</li>
        ))}
      </ul>
    );
  }
  if (sec.type === 'cards') {
    return (
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {(c?.cards || []).map((card: TemplateItem, i: number) => (
          <div key={i} className="border-t pt-5" style={{ borderColor: p.rule }}>
            <h3 className="font-display text-3xl font-bold tracking-tight" style={{ color: p.ink }}>{card.title}</h3>
            {card.desc && <p className="mt-3 max-w-[48ch] text-base leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (sec.type === 'links') {
    return (
      <div className="flex flex-wrap gap-x-10 gap-y-4">
        {(c?.links || []).map((link: TemplateItem, i: number) => <BigLink key={i} href={link.url || '#'} color={p.acText}>{link.label}</BigLink>)}
      </div>
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
      <div className="border-t pt-6" style={{ borderColor: p.rule }}>
        {c.institution && <p className="font-display text-3xl font-bold tracking-tight md:text-4xl" style={{ color: p.ink }}>{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-2 text-lg" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(' · ')}</p>}
        {(c.start_date || c.end_date) && <p className="mt-2 font-mono text-sm tabular-nums" style={{ color: p.muted }}>{[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' – ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className="border-t pt-6" style={{ borderColor: p.rule }}>
        {c.name && <p className="font-display text-3xl font-bold tracking-tight md:text-4xl" style={{ color: p.ink }}>{c.name}</p>}
        {c.issuer && <p className="mt-2 text-lg" style={{ color: p.muted }}>{c.issuer}</p>}
        {c.date && <p className="mt-2 font-mono text-sm" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <div className="mt-4"><BigLink href={c.credential_url} color={p.acText}>View credential</BigLink></div>}
      </div>
    );
  }
  if (c.language) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-6 border-t pt-6" style={{ borderColor: p.rule }}>
        <span className="font-display text-3xl font-bold tracking-tight md:text-4xl" style={{ color: p.ink }}>{c.language}</span>
        {c.proficiency && <span className="text-lg" style={{ color: p.muted }}>{c.proficiency}</span>}
      </p>
    );
  }
  if (c.body) return <p className="max-w-[56ch] text-xl leading-relaxed" style={{ color: p.muted }}>{c.body}</p>;
  return null;
}

export default function ImmersiveTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  void isPreview;

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroShift = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 140]);

  const bg = toHex(parseHex(theme.bg || '#0a0a1a'));
  const dark = lum(bg) < 0.35;
  const ink = mix(bg, dark ? '#ffffff' : '#000000', 0.92);
  const ac = toHex(parseHex(theme.accent || '#6366f1'));
  const p: Palette = {
    bg, ink, ac,
    muted: legible(mix(bg, ink, 0.6), bg),
    rule: mix(bg, ink, 0.16),
    surface: mix(bg, ink, dark ? 0.05 : 0.04),
    acText: legible(ac, bg),
  };
  const acOn = onColor(ac);

  // Keep custom sections in the order the owner chose in the builder.
  const customOrder = (portfolio.sections_order || []).filter((section: TemplateSectionOrder) => section.type === 'custom').map((section: TemplateSectionOrder) => section.label?.toLowerCase().replace(/\s+/g, '-'));
  const orderedCustom = [...(custom || [])].sort((a: TemplateItem, b: TemplateItem) => {
    const aIndex = customOrder.indexOf(slugOf(a));
    const bIndex = customOrder.indexOf(slugOf(b));
    return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
  });

  const name = about?.name || portfolio.title || '';
  const email = contact?.email || about?.email;
  const heroImg = hero?.background_url || about?.photo_url || '';
  const heroField = heroImg ? '#0b0b0e' : ac;
  const heroInk = heroImg ? '#ffffff' : acOn;
  const heroMuted = heroImg ? 'rgba(255,255,255,0.8)' : legible(mix(ac, acOn, 0.75), ac);
  // Contact band is inverted: ink becomes the background.
  const invBg = ink;
  const invInk = bg;
  const invMuted = legible(mix(invBg, invInk, 0.65), invBg);

  const nav = [
    about?.name && ['about', 'About'],
    projects.length > 0 && ['projects', 'Work'],
    ['contact', 'Contact'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: bg, color: ink }}>
      <main>
        {/* Hero */}
        <section id="hero" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ backgroundColor: heroField }}>
          {heroImg && (
            <motion.div className="absolute inset-x-0 -top-[10%] h-[120%]" style={{ y: heroShift }} aria-hidden="true">
              <img src={heroImg} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: 'rgba(8,8,10,0.5)' }} />
            </motion.div>
          )}
          <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-6 md:px-10">
            <a href="#hero" className="truncate text-sm font-medium" style={{ color: heroInk }}>{name}</a>
            <nav aria-label="Sections" className="flex gap-5 sm:gap-8">
              {nav.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="text-sm underline-offset-4 hover:underline" style={{ color: heroInk }}>{label}</a>
              ))}
            </nav>
          </header>
          <div className="relative z-10 mx-auto mt-auto w-full max-w-7xl px-5 pb-12 md:px-10 md:pb-16">
            {hero?.greeting && <Kicker color={heroMuted}>{hero.greeting}</Kicker>}
            <h1 className="max-w-[14ch] break-words font-display text-[clamp(3rem,11vw,9.5rem)] font-bold leading-[0.88] tracking-[-0.045em]" style={{ color: heroInk }}>
              {hero?.headline || name}
            </h1>
            <div className="mt-10 grid gap-8 border-t pt-6 md:grid-cols-[1fr_auto] md:items-end" style={{ borderColor: heroImg ? 'rgba(255,255,255,0.3)' : mix(ac, acOn, 0.35) }}>
              {hero?.subheadline ? <p className="max-w-[46ch] text-lg leading-relaxed md:text-xl" style={{ color: heroMuted }}>{hero.subheadline}</p> : <span />}
              <div className="flex flex-wrap items-center gap-6">
                <a href={hero?.cta_url || '#projects'} className="px-6 py-3.5 text-sm font-semibold transition-opacity duration-150 hover:opacity-85"
                  style={{ backgroundColor: heroInk, color: heroImg ? '#111111' : ac }}>
                  {hero?.cta_text || 'Explore the work'}
                </a>
                {about?.cv_url && <BigLink href={about.cv_url} color={heroInk}>Download CV</BigLink>}
                {hero?.cta_secondary_text && hero?.cta_secondary_url && <BigLink href={hero.cta_secondary_url} color={heroInk}>{hero.cta_secondary_text}</BigLink>}
              </div>
            </div>
          </div>
        </section>

        {/* About: split screen with the portrait filling one half */}
        {about?.name && (
          <section id="about" style={{ backgroundColor: bg }}>
            <div className={about.photo_url ? 'grid md:min-h-[85svh] md:grid-cols-2' : ''}>
              {about.photo_url && (
                <div className="relative aspect-[4/5] md:aspect-auto">
                  <img src={about.photo_url} alt={about.name} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}
              <div className={`flex flex-col justify-center px-5 py-20 md:px-14 md:py-28 ${about.photo_url ? '' : 'mx-auto max-w-7xl md:px-10'}`}>
                <Kicker color={p.muted}>About</Kicker>
                <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.035em] md:text-7xl" style={{ color: ink }}>{about.name}</h2>
                {about.title && <p className="mt-4 text-xl" style={{ color: p.acText }}>{about.title}</p>}
                {about.bio && <p className="mt-8 max-w-[54ch] text-lg leading-relaxed whitespace-pre-line" style={{ color: p.muted }}>{about.bio}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Band id="skills" kicker="Expertise" title="Skills" p={p} tone="surface">
            <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i} className="border-t pt-6" style={{ borderColor: p.rule }}>
                  {skill.title && <h3 className="mb-5 font-display text-3xl font-bold tracking-tight" style={{ color: ink }}>{skill.title}</h3>}
                  <div className="flex flex-wrap gap-2">
                    {splitList(skill.skills).map((s) => <TechBadge key={s} name={s} accentColor={p.acText} textColor={ink} size="md" />)}
                  </div>
                </div>
              ))}
            </div>
          </Band>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Band id="experience" kicker="Timeline" title="Experience" p={p}>
            <ol>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className="grid gap-4 border-t py-10 md:grid-cols-[14rem_1fr] md:gap-12" style={{ borderColor: p.rule }}>
                  <p className="font-display text-5xl font-bold leading-none tracking-tight tabular-nums md:text-6xl" style={{ color: p.muted }}>
                    {year(exp.start_date)}
                    <span className="mt-2 block font-sans text-sm font-normal tracking-normal">to {exp.end_date ? year(exp.end_date) : 'present'}</span>
                  </p>
                  <div className="min-w-0">
                    <h3 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl" style={{ color: ink }}>{exp.position}</h3>
                    <p className="mt-2 text-lg" style={{ color: p.acText }}>{exp.company}</p>
                    {lines(exp.description).length > 0 && (
                      <div className="mt-4 max-w-[60ch] space-y-2 text-base leading-relaxed" style={{ color: p.muted }}>
                        {lines(exp.description).map((l, li) => <p key={li}>{l}</p>)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Band>
        )}

        {/* Projects: each one gets its own full-bleed band */}
        {projects.length > 0 && (
          <section id="projects" style={{ backgroundColor: bg }}>
            <div className="mx-auto max-w-7xl px-5 pt-24 md:px-10 md:pt-36">
              <Kicker color={p.muted}>Selected work</Kicker>
              <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.035em] md:text-7xl lg:text-8xl" style={{ color: ink }}>Projects</h2>
            </div>
            <div className="mt-14 md:mt-20">
              {projects.map((proj: TemplateItem, i: number) => (
                <article key={proj.id ?? i} className="border-t" style={{ borderColor: p.rule }}>
                  {proj.image_url && (
                    <img src={proj.image_url} alt={proj.title} className="aspect-[4/3] max-h-[82svh] w-full object-cover sm:aspect-video" />
                  )}
                  <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-[5rem_1fr_1fr] md:gap-10 md:px-10 md:py-16">
                    <p className="font-mono text-sm tabular-nums" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.03em] md:text-6xl" style={{ color: ink }}>{proj.title}</h3>
                    <div className="min-w-0">
                      {proj.description && <p className="text-lg leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                      {proj.tech_stack && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {splitList(proj.tech_stack).map((t) => <TechBadge key={t} name={t} accentColor={p.acText} textColor={ink} />)}
                        </div>
                      )}
                      {(proj.demo_url || proj.github_url) && (
                        <div className="mt-6 flex gap-8">
                          {proj.demo_url && <BigLink href={proj.demo_url} color={p.acText}>Live site</BigLink>}
                          {proj.github_url && <BigLink href={proj.github_url} color={p.acText}>Source</BigLink>}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Band id="services" kicker="What I do" title="Services" p={p} tone="surface">
            <ul>
              {services.map((svc: TemplateItem, i: number) => (
                <li key={svc.id ?? i} className="grid gap-3 border-t py-8 md:grid-cols-2 md:gap-12" style={{ borderColor: p.rule }}>
                  <h3 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl" style={{ color: ink }}>{svc.title}</h3>
                  {svc.description && <p className="max-w-[48ch] text-lg leading-relaxed md:pt-2" style={{ color: p.muted }}>{svc.description}</p>}
                </li>
              ))}
            </ul>
          </Band>
        )}

        {/* Testimonials: one full-bleed accent band */}
        {testimonials.length > 0 && (
          <section id="testimonials" style={{ backgroundColor: ac, color: acOn }}>
            <div className="mx-auto max-w-7xl space-y-20 px-5 py-24 md:px-10 md:py-36">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <blockquote className="max-w-[26ch] font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-6xl">&ldquo;{t.message}&rdquo;</blockquote>
                  <figcaption className="mt-8 flex items-center gap-4 text-base">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="h-12 w-12 rounded-full object-cover" />}
                    <span><strong className="font-semibold">{t.name}</strong>{t.position ? ` — ${t.position}` : ''}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Certificates / gallery */}
        {gallery.length > 0 && (
          <Band id="gallery" kicker="Credentials" title="Certificates" p={p}>
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              {gallery.map((cert: TemplateItem, i: number) => (
                <figure key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="mb-5 aspect-[4/3] overflow-hidden" style={{ backgroundColor: p.surface }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title || 'Certificate'} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption>
                    <p className="font-display text-2xl font-bold tracking-tight" style={{ color: ink }}>{cert.title}</p>
                    {cert.description && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-6">
                      {cert.issued_date && <span className="font-mono text-sm" style={{ color: p.muted }}>{new Date(cert.issued_date).toLocaleDateString()}</span>}
                      {cert.file_url && <BigLink href={cert.file_url} color={p.acText}>View certificate</BigLink>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Band>
        )}

        {/* Custom sections */}
        {orderedCustom.map((sec: TemplateItem, i: number) => (
          <Band key={sec.id ?? i} id={`custom-${slugOf(sec)}`} title={sec.title || sec.original_type || 'Section'} p={p} tone={i % 2 === 0 ? 'surface' : 'base'}>
            <CustomBody sec={sec} p={p} />
          </Band>
        ))}

        {/* Contact: inverted full-bleed band */}
        <section id="contact" style={{ backgroundColor: invBg, color: invInk }}>
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
            <Kicker color={invMuted}>Contact</Kicker>
            <h2 className="max-w-[12ch] font-display text-5xl font-bold leading-[0.92] tracking-[-0.04em] md:text-8xl">Let&apos;s build the next one together.</h2>
            {email && (
              <a href={`mailto:${email}`} className="mt-10 inline-block break-all border-b-2 pb-1 font-display text-2xl font-bold tracking-tight transition-opacity duration-150 hover:opacity-70 md:text-4xl" style={{ borderColor: invInk }}>
                {email}
              </a>
            )}
            <div className="mt-16 grid gap-12 md:grid-cols-[1fr_1.4fr]">
              <ul className="space-y-4">
                {contact?.phone && <li><BigLink href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} color={invInk}>WhatsApp</BigLink></li>}
                {contact?.linkedin_url && <li><BigLink href={contact.linkedin_url} color={invInk}>LinkedIn</BigLink></li>}
                {contact?.github_url && <li><BigLink href={contact.github_url} color={invInk}>GitHub</BigLink></li>}
                {contact?.location && <li className="pt-2 text-sm" style={{ color: invMuted }}>{contact.location}</li>}
              </ul>
              <div className="min-w-0">
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={invInk} subColor={invMuted} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: invBg, color: invMuted }}>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t px-5 py-6 text-xs md:px-10" style={{ borderColor: mix(invBg, invInk, 0.18) }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
