'use client';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';

/* ------------------------------------------------------------------ */
/* Colour helpers: derive readable text / rule colours from theme.bg   */
/* ------------------------------------------------------------------ */
type RGB = [number, number, number];
function parseHex(input: string | undefined, fallback: RGB): RGB {
  let h = (input || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const toHex = (c: RGB) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function luminance([r, g, b]: RGB) {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: RGB, b: RGB) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
function readable(c: RGB, bg: RGB, toward: RGB, min = 4.5): RGB {
  for (let t = 0; t <= 1.0001; t += 0.05) { const m = mix(c, toward, t); if (contrast(m, bg) >= min) return m; }
  return toward;
}
function makePalette(theme: ThemeConfig) {
  const bg = parseHex(theme?.bg, [10, 10, 26]);
  const ac = parseHex(theme?.accent, [99, 102, 241]);
  const dark = luminance(bg) < 0.18;
  const ink: RGB = dark ? [236, 236, 240] : [16, 16, 22];
  return {
    dark,
    bg: toHex(bg),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.42), bg, ink)),
    rule: toHex(mix(ink, bg, 0.8)),
    /** The one neon colour — used for outlines, underlines and small metadata. */
    neon: toHex(readable(ac, bg, ink)),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';
const PAD = 'mx-auto max-w-6xl px-5 sm:px-8';

function bullets(text?: string): string[] {
  if (!text) return [];
  const parts = text.split(/\r?\n|\s[-*•]\s/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
  if (parts.length > 1) return parts;
  return text.split(/\.\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}
const ym = (d?: string) => (d ? d.slice(0, 7).replace('-', '.') : '');
function fmtDate(d?: string) {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;

/** Outlined sign lettering (stroke only, no glow). */
// A static (non-variable) heavy face: variable fonts show overlapping contours when stroked.
const outline = (p: Palette, w = 1.5): CSSProperties => ({
  color: 'transparent', WebkitTextStroke: `${w}px ${p.neon}`, fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif', fontWeight: 900,
});

function SignTitle({ children, p, kicker }: { children: ReactNode; p: Palette; kicker?: string }) {
  return (
    <div className="mb-10 md:mb-14">
      {kicker && <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: p.muted }}>{kicker}</p>}
      <h2 className="text-[clamp(2.1rem,7vw,4.75rem)] leading-[0.95] uppercase tracking-[-0.01em] break-words" style={outline(p)}>
        {children}
      </h2>
    </div>
  );
}

function N({ href, children, p, external }: { href?: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`font-medium underline decoration-2 underline-offset-[5px] transition-colors duration-150 motion-reduce:transition-none ${FOCUS}`}
      style={{ color: p.text, textDecorationColor: p.neon, outlineColor: p.neon }}>
      {children}
    </a>
  );
}

function NeonSection({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`py-20 md:py-28 ${className}`}><div className={PAD}>{children}</div></section>;
}

function CustomItem({ item, type, p }: { item: TemplateItem; type?: string; p: Palette }) {
  const c = item.content || {};
  if (type === 'text') return <p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line">{c.body}</p>;
  if (type === 'list') return (
    <ul className="max-w-3xl">
      {(c.items || []).map((li, i) => (
        <li key={i} className="flex gap-4 border-b border-dashed py-3" style={{ borderColor: p.rule }}>
          <span className="font-mono text-xs leading-7" style={{ color: p.neon }}>{String(i + 1).padStart(2, '0')}</span>
          <span className="leading-7">{li}</span>
        </li>
      ))}
    </ul>
  );
  if (type === 'cards') return (
    <div className="grid gap-x-8 sm:grid-cols-2">
      {(c.cards || []).map((card, i) => (
        <div key={i} className="border-t py-5" style={{ borderColor: p.neon }}>
          <h3 className="font-bold uppercase tracking-wide">{card.title}</h3>
          {card.desc && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
        </div>
      ))}
    </div>
  );
  if (c.institution || c.degree || c.field) {
    return (
      <div className="border-t py-5" style={{ borderColor: p.neon }}>
        {(c.start_date || c.end_date) && <p className="font-mono text-xs" style={{ color: p.neon }}>{[ym(c.start_date), ym(c.end_date)].filter(Boolean).join(' → ')}</p>}
        {c.institution && <p className="mt-1 text-lg font-bold uppercase tracking-wide">{c.institution}</p>}
        {(c.degree || c.field) && <p style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className="border-t py-5" style={{ borderColor: p.neon }}>
        {c.date && <p className="font-mono text-xs" style={{ color: p.neon }}>{c.date}</p>}
        {c.name && <p className="mt-1 text-lg font-bold uppercase tracking-wide">{c.name}</p>}
        {c.issuer && <p style={{ color: p.muted }}>{c.issuer}</p>}
        {c.credential_url && <p className="mt-2 text-sm"><N href={c.credential_url} p={p} external>View credential</N></p>}
      </div>
    );
  }
  if (c.language) {
    return (
      <div className="flex items-baseline justify-between gap-4 border-t py-5" style={{ borderColor: p.neon }}>
        <p className="text-lg font-bold uppercase tracking-wide">{c.language}</p>
        {c.proficiency && <p className="font-mono text-xs uppercase" style={{ color: p.neon }}>{c.proficiency}</p>}
      </div>
    );
  }
  return c.body ? <p className="max-w-[62ch] text-lg leading-relaxed">{c.body}</p> : null;
}

export default function NeonTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const name = about?.name || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;

  // Custom sections with the same title + type are grouped into one block (unchanged behaviour).
  const groupedCustom = (custom || []).reduce<TemplateItem[]>((groups, section: TemplateItem) => {
    const content = typeof section.content === 'string'
      ? (() => { try { return JSON.parse(section.content); } catch { return { body: section.content }; } })()
      : (section.content || {});
    const title = section.title || 'Custom Section';
    const type = section.type || 'text';
    const existing = groups.find((group) => group.title === title && group.type === type);
    const item = { ...section, content };
    if (existing) {
      existing.items = [...(existing.items || []), item];
    } else {
      groups.push({ title, type, items: [item] });
    }
    return groups;
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip font-sans antialiased" style={{ backgroundColor: p.bg, color: p.text }} data-preview={isPreview ? 'true' : undefined}>
      {/* Top strip */}
      <header className="border-b" style={{ borderColor: p.neon }}>
        <div className={`${PAD} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 font-mono text-xs uppercase tracking-[0.16em]`}>
          <span className="font-semibold">{name}</span>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-1" style={{ color: p.muted }}>
            {['about', 'projects', 'skills', 'contact'].map((s) => (
              <a key={s} href={`#${s}`} className={`decoration-2 underline-offset-4 hover:underline ${FOCUS}`} style={{ textDecorationColor: p.neon, outlineColor: p.neon }}>{s}</a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — flyer */}
        <section id="hero" className="relative">
          {hero?.background_url && (
            <>
              <SafeImg src={hero.background_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: p.bg, opacity: 0.82 }} />
            </>
          )}
          <div className={`${PAD} relative pt-16 pb-12 md:pt-24`}>
            <p className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: p.neon }}>{hero?.greeting || about?.title || 'Now showing'}</p>
            <h1 className="mt-6 text-[clamp(2.5rem,9.5vw,8.5rem)] leading-[0.92] uppercase tracking-[-0.02em] break-words" style={outline(p, 2)}>
              {hero?.headline || about?.name || portfolio.title}
            </h1>
            {hero?.subheadline && <p className="mt-8 max-w-[40ch] text-xl leading-snug font-semibold md:text-2xl">{hero.subheadline}</p>}

            <dl className="mt-12 grid border-y font-mono text-xs uppercase tracking-[0.14em] sm:grid-cols-3" style={{ borderColor: p.neon }}>
              <div className="border-b py-4 sm:border-r sm:border-b-0 sm:pr-4" style={{ borderColor: p.rule }}>
                <dt style={{ color: p.muted }}>Who</dt><dd className="mt-1 normal-case tracking-normal text-sm">{about?.title || name}</dd>
              </div>
              <div className="border-b py-4 sm:border-r sm:border-b-0 sm:px-4" style={{ borderColor: p.rule }}>
                <dt style={{ color: p.muted }}>Where</dt><dd className="mt-1 normal-case tracking-normal text-sm">{contact?.location || 'Online'}</dd>
              </div>
              <div className="py-4 sm:pl-4">
                <dt style={{ color: p.muted }}>Contact</dt>
                <dd className="mt-1 normal-case tracking-normal text-sm break-all">{email ? <N href={`mailto:${email}`} p={p}>{email}</N> : <N href="#contact" p={p}>Send a message</N>}</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href={hero?.cta_url || '#projects'} className={`border-2 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-150 motion-reduce:transition-none ${FOCUS}`}
                style={{ borderColor: p.neon, backgroundColor: p.neon, color: p.bg, outlineColor: p.neon }}>
                {hero?.cta_text || 'Explore'}
              </a>
              {about?.cv_url && (
                <a href={about.cv_url} target="_blank" rel="noopener noreferrer" className={`border-2 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] ${FOCUS}`}
                  style={{ borderColor: p.neon, outlineColor: p.neon }}>
                  CV
                </a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <a href={hero.cta_secondary_url} target="_blank" rel="noopener noreferrer" className={`border-2 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] ${FOCUS}`}
                  style={{ borderColor: p.neon, outlineColor: p.neon }}>
                  {hero.cta_secondary_text}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <NeonSection id="about">
            <SignTitle p={p} kicker="Profile">About</SignTitle>
            <div className="grid gap-10 md:grid-cols-[16rem_1fr]">
              {about.photo_url && (
                <SafeImg src={about.photo_url} alt={about.name} className="aspect-[4/5] w-full max-w-[16rem] border object-cover" style={{ borderColor: p.neon }} />
              )}
              <div className="min-w-0">
                <h3 className="text-2xl font-bold uppercase tracking-wide">{about.name}</h3>
                {about.title && <p className="mt-1 font-mono text-sm" style={{ color: p.neon }}>{about.title}</p>}
                {about.bio && <p className="mt-6 max-w-[62ch] text-lg leading-relaxed whitespace-pre-line">{about.bio}</p>}
              </div>
            </div>
          </NeonSection>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <NeonSection id="skills">
            <SignTitle p={p} kicker="Stack">Skills</SignTitle>
            <div className="grid gap-10 md:grid-cols-2">
              {skills.map((skill, i) => (
                <div key={skill.id ?? i}>
                  <p className="mb-4 border-b pb-2 font-mono text-xs uppercase tracking-[0.18em]" style={{ borderColor: p.neon, color: p.neon }}>{skill.title || 'Skills'}</p>
                  <div className="flex flex-wrap gap-2">
                    {skill.skills?.split(',').filter((s) => s.trim()).map((s) => (
                      <TechBadge key={s} name={s.trim()} accentColor={p.neon} size="md" variant="outline" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NeonSection>
        )}

        {/* Experience — the line-up */}
        {experience.length > 0 && (
          <NeonSection id="experience">
            <SignTitle p={p} kicker="Line-up">Experience</SignTitle>
            <ol className="border-t" style={{ borderColor: p.neon }}>
              {experience.map((exp, i) => (
                <li key={exp.id ?? i} className="grid gap-3 border-b border-dashed py-7 md:grid-cols-[11rem_1fr] md:gap-8" style={{ borderColor: p.rule }}>
                  <p className="font-mono text-sm tabular-nums" style={{ color: p.neon }}>{ym(exp.start_date)} → {exp.end_date ? ym(exp.end_date) : 'now'}</p>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold uppercase tracking-wide md:text-2xl">{exp.position}</h3>
                    <p className="font-mono text-sm" style={{ color: p.muted }}>@ {exp.company}</p>
                    {bullets(exp.description).length > 0 && (
                      <ul className="mt-3 max-w-[62ch] space-y-1 leading-relaxed">
                        {bullets(exp.description).map((b, j) => (
                          <li key={j} className="flex gap-3"><span aria-hidden="true" style={{ color: p.neon }}>—</span><span>{b}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </NeonSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <NeonSection id="projects">
            <SignTitle p={p} kicker="Featuring">Projects</SignTitle>
            <ol className="space-y-16">
              {projects.map((proj, i) => (
                <li key={proj.id ?? i} className="grid gap-6 md:grid-cols-[7rem_1fr_18rem] md:gap-8">
                  <span aria-hidden="true" className="text-6xl leading-none md:text-7xl" style={outline(p)}>{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-extrabold uppercase tracking-wide md:text-3xl">{proj.title}</h3>
                    {proj.description && <p className="mt-3 max-w-[56ch] leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                    {proj.tech_stack && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                          <TechBadge key={t} name={t.trim()} accentColor={p.neon} variant="outline" />
                        ))}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <p className="mt-4 flex gap-6 font-mono text-sm uppercase tracking-[0.1em]">
                        {proj.demo_url && <N href={proj.demo_url} p={p} external>Demo</N>}
                        {proj.github_url && <N href={proj.github_url} p={p} external>Code</N>}
                      </p>
                    )}
                  </div>
                  {proj.image_url && <SafeImg src={proj.image_url} alt={proj.title || ''} className="aspect-[4/3] w-full border object-cover" style={{ borderColor: p.neon }} />}
                </li>
              ))}
            </ol>
          </NeonSection>
        )}

        {/* Services */}
        {services.length > 0 && (
          <NeonSection id="services">
            <SignTitle p={p} kicker="On the bill">Services</SignTitle>
            <ol className="grid gap-x-10 md:grid-cols-2">
              {services.map((svc, i) => (
                <li key={svc.id ?? i} className="border-t py-6" style={{ borderColor: p.neon }}>
                  <p className="font-mono text-xs" style={{ color: p.neon }}>{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-xl font-extrabold uppercase tracking-wide">{svc.title}</h3>
                  {svc.description && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                </li>
              ))}
            </ol>
          </NeonSection>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <NeonSection id="testimonials">
            <SignTitle p={p} kicker="Reviews">Word of mouth</SignTitle>
            <div className="grid gap-12 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <figure key={t.id ?? i}>
                  <blockquote className="text-2xl leading-snug font-semibold">“{t.message}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {t.photo_url && <SafeImg src={t.photo_url} alt={t.name || ''} className="h-10 w-10 border object-cover" style={{ borderColor: p.neon }} />}
                    <span className="font-mono text-xs uppercase tracking-[0.14em]">{t.name}{t.position && <span style={{ color: p.muted }}> / {t.position}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </NeonSection>
        )}

        {/* Certificates */}
        {gallery.length > 0 && (
          <NeonSection id="gallery">
            <SignTitle p={p} kicker="Credentials">Certificates</SignTitle>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert, i) => (
                <figure key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="mb-4 aspect-[4/3] overflow-hidden border" style={{ borderColor: p.neon }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || ''} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption>
                    {cert.issued_date && <p className="font-mono text-xs" style={{ color: p.neon }}>{fmtDate(cert.issued_date)}</p>}
                    <h3 className="mt-1 font-bold uppercase tracking-wide">{cert.title}</h3>
                    {cert.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    {cert.file_url && <p className="mt-2 font-mono text-xs uppercase"><N href={cert.file_url} p={p} external>View</N></p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </NeonSection>
        )}

        {/* Custom sections (grouped) */}
        {groupedCustom.map((sec: TemplateItem) => (
          <NeonSection key={`${sec.title}-${sec.type}`} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`}>
            <SignTitle p={p}>{sec.title || sec.original_type || 'Section'}</SignTitle>
            {sec.type === 'links' ? (
              <p className="flex flex-wrap gap-x-8 gap-y-3 text-lg">
                {(sec.items || []).flatMap((item: TemplateItem) => item.content?.links || []).map((link: TemplateItem, i: number) => (
                  <N key={i} href={link.url} p={p} external>{link.label}</N>
                ))}
              </p>
            ) : (sec.original_type === 'certification' || sec.type === 'certification') && (sec.items || []).some((item: TemplateItem) => Array.isArray(item.content?.items)) ? (
              <CertificationSection items={(sec.items || []).flatMap((item: TemplateItem) => item.content?.items || [])} accentColor={p.neon}
                textColor={p.dark ? 'text-neutral-100' : 'text-neutral-900'}
                subTextColor={p.dark ? 'text-neutral-400' : 'text-neutral-600'}
                cardBg={p.dark ? 'border-white/15 bg-transparent' : 'border-neutral-300 bg-transparent'} />
            ) : (
              <div className={['text', 'list', 'cards'].includes(sec.type ?? '') ? 'space-y-8' : 'grid gap-x-10 md:grid-cols-2'}>
                {(sec.items || []).map((item: TemplateItem, idx: number) => (
                  <CustomItem key={item.id ?? idx} item={item} type={sec.type} p={p} />
                ))}
              </div>
            )}
          </NeonSection>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <NeonSection id="contact">
            <SignTitle p={p} kicker="Doors open">Get in touch</SignTitle>
            <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <p className="max-w-[36ch] text-lg leading-relaxed" style={{ color: p.muted }}>Have a project? Let&apos;s build something together.</p>
                {email && <p className="text-xl break-all md:text-2xl"><N href={`mailto:${email}`} p={p}>{email}</N></p>}
                <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm uppercase tracking-[0.1em]">
                  {contact?.phone && <N href={waLink(contact.phone, about?.name)} p={p} external>WhatsApp</N>}
                  {contact?.linkedin_url && <N href={contact.linkedin_url} p={p} external>LinkedIn</N>}
                  {contact?.github_url && <N href={contact.github_url} p={p} external>GitHub</N>}
                </p>
              </div>
              <div className="min-w-0 border p-5 sm:p-7" style={{ borderColor: p.neon }}>
                <ContactForm slug={portfolio.slug} accentColor={p.neon} textColor={p.text} subColor={p.muted} />
              </div>
            </div>
          </NeonSection>
        )}
      </main>

      <footer className="border-t" style={{ borderColor: p.neon }}>
        <div className={`${PAD} flex flex-wrap justify-between gap-2 py-5 font-mono text-xs uppercase tracking-[0.14em]`} style={{ color: p.muted }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
