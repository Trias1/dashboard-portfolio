'use client';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import type { ReactNode, SyntheticEvent } from 'react';
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
  const ink: RGB = dark ? [236, 236, 234] : [26, 27, 30];
  return {
    dark,
    bg: toHex(bg),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.42), bg, ink)),
    rule: toHex(mix(ink, bg, 0.82)),
    accent: toHex(readable(ac, bg, ink)),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function bullets(text?: string): string[] {
  if (!text) return [];
  const parts = text.split(/\r?\n|\s[-*•]\s/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
  if (parts.length > 1) return parts;
  return text.split(/\.\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}
/** "2023-01-01" -> "Jan 2023" */
function monthYear(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const mi = parseInt(m, 10);
  return mi >= 1 && mi <= 12 ? `${MONTHS[mi - 1]} ${y}` : y;
}
function fmtDate(d?: string) {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;
const slugId = (sec: TemplateItem) => `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;

function A({ href, children, p, external }: { href?: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`underline decoration-1 underline-offset-2 hover:decoration-2 ${FOCUS}`} style={{ color: p.accent, outlineColor: p.accent }}>
      {children}
    </a>
  );
}

/** CV section: small-caps heading over a hairline, then content. */
function CvSection({ id, title, p, children }: { id: string; title: string; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 pt-10">
      <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ borderColor: p.text, color: p.accent }}>{title}</h2>
      <div className="pt-5">{children}</div>
    </section>
  );
}

/** Entry row: dates / meta in the left column, content on the right. */
function Row({ meta, children, p }: { meta?: ReactNode; children: ReactNode; p: Palette }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
      <div className="text-sm tabular-nums sm:pt-0.5" style={{ color: p.muted }}>{meta}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <Row p={p}><p className="max-w-[68ch] leading-relaxed whitespace-pre-line">{c?.body}</p></Row>;
  if (sec.type === 'list') return (
    <Row p={p}>
      <ul className="list-disc space-y-1 pl-5 leading-relaxed">{(c?.items || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
    </Row>
  );
  if (sec.type === 'cards') return (
    <>{(c?.cards || []).map((card, i) => (
      <Row key={i} p={p} meta={<span className="font-medium" style={{ color: p.text }}>{card.title}</span>}>
        <p className="leading-relaxed">{card.desc}</p>
      </Row>
    ))}</>
  );
  if (sec.type === 'links') return (
    <Row p={p}>
      <p className="flex flex-wrap gap-x-5 gap-y-1">{(c?.links || []).map((link, i) => <A key={i} href={link.url} p={p} external>{link.label}</A>)}</p>
    </Row>
  );
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <CertificationSection items={c.items} accentColor={p.accent}
        textColor={p.dark ? 'text-neutral-100' : 'text-neutral-900'}
        subTextColor={p.dark ? 'text-neutral-400' : 'text-neutral-600'}
        cardBg={p.dark ? 'border-white/15 bg-transparent' : 'border-neutral-300 bg-transparent'} />
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <Row p={p} meta={[monthYear(c.start_date), monthYear(c.end_date)].filter(Boolean).join(' – ')}>
        {c.institution && <p className="font-semibold">{c.institution}</p>}
        {(c.degree || c.field) && <p className="italic">{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {c.gpa && <p className="text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </Row>
    );
  }
  if (c.name || c.issuer) {
    return (
      <Row p={p} meta={c.date}>
        {c.name && <p className="font-semibold">{c.name}</p>}
        {c.issuer && <p className="italic">{c.issuer}</p>}
        {c.credential_url && <p className="text-sm"><A href={c.credential_url} p={p} external>View credential</A></p>}
      </Row>
    );
  }
  if (c.language) return <Row p={p} meta={c.proficiency}><p className="font-semibold">{c.language}</p></Row>;
  return c.body ? <Row p={p}><p className="max-w-[68ch] leading-relaxed">{c.body}</p></Row> : null;
}

export default function ClassicTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const name = about?.name || hero?.headline || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;
  const sep = <span aria-hidden="true" style={{ color: p.rule }}>|</span>;

  return (
    <div className="min-h-screen overflow-x-clip font-sans antialiased" style={{ backgroundColor: p.bg, color: p.text }} data-preview={isPreview ? 'true' : undefined}>
      <nav aria-label="Sections" className="border-b" style={{ borderColor: p.rule }}>
        <div className="mx-auto flex max-w-[52rem] flex-wrap gap-x-5 gap-y-1 px-5 py-3 text-xs uppercase tracking-[0.12em] sm:px-8" style={{ color: p.muted }}>
          {['about', 'experience', 'projects', 'skills', 'contact'].map((s) => (
            <a key={s} href={`#${s}`} className={`hover:underline underline-offset-4 ${FOCUS}`} style={{ outlineColor: p.accent }}>{s}</a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-[52rem] px-5 pb-16 sm:px-8">
        {/* Letterhead */}
        <section id="hero" className="pt-12 pb-2 sm:pt-16">
          {hero?.background_url && <SafeImg src={hero.background_url} alt="" className="mb-8 aspect-[4/1] w-full rounded-[2px] object-cover" />}
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {hero?.greeting && <p className="mb-2 text-sm" style={{ color: p.muted }}>{hero.greeting}</p>}
              <h1 className="text-4xl leading-tight font-semibold tracking-tight break-words sm:text-5xl">{name}</h1>
              {about?.title && <p className="mt-1 text-lg" style={{ color: p.muted }}>{about.title}</p>}
            </div>
            {about?.photo_url && <SafeImg src={about.photo_url} alt={about?.name || ''} className="h-28 w-24 flex-shrink-0 rounded-[2px] border object-cover" style={{ borderColor: p.rule }} />}
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {[
              email && <A key="e" href={`mailto:${email}`} p={p}>{email}</A>,
              contact?.phone && <span key="p" className="tabular-nums">{contact.phone}</span>,
              contact?.location && <span key="l">{contact.location}</span>,
              contact?.linkedin_url && <A key="in" href={contact.linkedin_url} p={p} external>LinkedIn</A>,
              contact?.github_url && <A key="gh" href={contact.github_url} p={p} external>GitHub</A>,
              about?.cv_url && <A key="cv" href={about.cv_url} p={p} external>Download CV (PDF)</A>,
            ].filter(Boolean).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-x-3">{i > 0 && sep}{item}</span>
            ))}
          </p>
          {hero?.headline && hero.headline !== name && <p className="mt-8 text-xl leading-snug font-medium">{hero.headline}</p>}
          {hero?.subheadline && <p className={`${hero?.headline && hero.headline !== name ? 'mt-2' : 'mt-8'} max-w-[60ch] text-lg leading-snug`} style={{ color: p.muted }}>{hero.subheadline}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={hero?.cta_url || '#projects'} className={`rounded-[3px] px-4 py-2 text-sm font-medium hover:opacity-90 ${FOCUS}`}
              style={{ backgroundColor: p.text, color: p.bg, outlineColor: p.accent }}>
              {hero?.cta_text || 'View projects'}
            </a>
            {hero?.cta_secondary_text && hero?.cta_secondary_url && (
              <a href={hero.cta_secondary_url} target="_blank" rel="noopener noreferrer" className={`rounded-[3px] border px-4 py-2 text-sm font-medium ${FOCUS}`}
                style={{ borderColor: p.text, outlineColor: p.accent }}>
                {hero.cta_secondary_text}
              </a>
            )}
          </div>
        </section>

        {/* Profile */}
        {about?.name && (
          <CvSection id="about" title="Profile" p={p}>
            <p className="max-w-[68ch] leading-relaxed whitespace-pre-line">{about.bio}</p>
          </CvSection>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <CvSection id="skills" title="Skills" p={p}>
            {skills.map((skill, i) => (
              <Row key={skill.id ?? i} p={p} meta={<span className="font-medium" style={{ color: p.text }}>{skill.title || 'General'}</span>}>
                <div className="flex flex-wrap gap-1.5">
                  {skill.skills?.split(',').filter((s) => s.trim()).map((s) => (
                    <TechBadge key={s} name={s.trim()} accentColor={p.text} variant="outline" />
                  ))}
                </div>
              </Row>
            ))}
          </CvSection>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <CvSection id="experience" title="Professional experience" p={p}>
            {experience.map((exp, i) => (
              <Row key={exp.id ?? i} p={p} meta={<>{monthYear(exp.start_date)} –<br className="hidden sm:block" /> {exp.end_date ? monthYear(exp.end_date) : 'Present'}</>}>
                <h3 className="font-semibold">{exp.position}</h3>
                <p className="italic">{exp.company}</p>
                {bullets(exp.description).length > 0 && (
                  <ul className="mt-2 max-w-[68ch] list-disc space-y-1 pl-5 leading-relaxed">
                    {bullets(exp.description).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </Row>
            ))}
          </CvSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <CvSection id="projects" title="Selected projects" p={p}>
            {projects.map((proj, i) => (
              <Row key={proj.id ?? i} p={p} meta={proj.image_url
                ? <SafeImg src={proj.image_url} alt={proj.title || ''} className="aspect-[4/3] w-full max-w-[12rem] rounded-[2px] border object-cover" style={{ borderColor: p.rule }} />
                : <span className="tabular-nums">No. {i + 1}</span>}>
                <h3 className="font-semibold">{proj.title}</h3>
                {proj.description && <p className="mt-1 max-w-[68ch] leading-relaxed">{proj.description}</p>}
                {proj.tech_stack && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                      <TechBadge key={t} name={t.trim()} accentColor={p.text} variant="outline" />
                    ))}
                  </div>
                )}
                {(proj.demo_url || proj.github_url) && (
                  <p className="mt-2 flex gap-4 text-sm">
                    {proj.demo_url && <A href={proj.demo_url} p={p} external>Live demo</A>}
                    {proj.github_url && <A href={proj.github_url} p={p} external>Source</A>}
                  </p>
                )}
              </Row>
            ))}
          </CvSection>
        )}

        {/* Services */}
        {services.length > 0 && (
          <CvSection id="services" title="Services" p={p}>
            {services.map((svc, i) => (
              <Row key={svc.id ?? i} p={p} meta={<span className="font-medium" style={{ color: p.text }}>{svc.title}</span>}>
                <p className="max-w-[68ch] leading-relaxed">{svc.description}</p>
              </Row>
            ))}
          </CvSection>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <CvSection id="testimonials" title="References" p={p}>
            {testimonials.map((t, i) => (
              <Row key={t.id ?? i} p={p} meta={
                <span className="flex items-center gap-2">
                  {t.photo_url && <SafeImg src={t.photo_url} alt={t.name || ''} className="h-8 w-8 rounded-full object-cover" />}
                  <span><span className="block font-medium" style={{ color: p.text }}>{t.name}</span>{t.position}</span>
                </span>
              }>
                <blockquote className="max-w-[68ch] italic leading-relaxed">“{t.message}”</blockquote>
              </Row>
            ))}
          </CvSection>
        )}

        {/* Certificates */}
        {gallery.length > 0 && (
          <CvSection id="gallery" title="Certificates" p={p}>
            {gallery.map((cert, i) => (
              <Row key={cert.id ?? i} p={p} meta={fmtDate(cert.issued_date)}>
                <div className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{cert.title}</h3>
                    {cert.description && <p className="mt-1 leading-relaxed">{cert.description}</p>}
                    {cert.file_url && <p className="mt-1 text-sm"><A href={cert.file_url} p={p} external>View certificate</A></p>}
                  </div>
                  {(cert.image_url || cert.file_url) && (
                    <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || ''} className="hidden h-16 w-24 flex-shrink-0 rounded-[2px] border object-cover sm:block"
                      style={{ borderColor: p.rule }}
                      onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                  )}
                </div>
              </Row>
            ))}
          </CvSection>
        )}

        {/* Custom sections */}
        {custom.map((sec, i) => (
          <CvSection key={sec.id ?? i} id={slugId(sec)} title={sec.title || sec.original_type || 'Section'} p={p}>
            <CustomBody sec={sec} p={p} />
          </CvSection>
        ))}

        {/* Contact */}
        {contactEnabled && (
          <CvSection id="contact" title="Contact" p={p}>
            <Row p={p} meta="Get in touch">
              <p className="max-w-[60ch] leading-relaxed">Have a project, or just want to say hello? Write to me{email ? <> at <A href={`mailto:${email}`} p={p}>{email}</A></> : ''}
                {contact?.phone && <> or message me on <A href={waLink(contact.phone, about?.name)} p={p} external>WhatsApp</A></>}.</p>
              <div className="mt-6 max-w-lg">
                <ContactForm slug={portfolio.slug} accentColor={p.accent} textColor={p.text} subColor={p.muted} />
              </div>
            </Row>
          </CvSection>
        )}
      </main>

      <footer className="mx-auto flex max-w-[52rem] flex-wrap justify-between gap-2 border-t px-5 py-6 text-xs sm:px-8" style={{ borderColor: p.rule, color: p.muted }}>
        <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
        <span>Made with PortfolioKit</span>
      </footer>
    </div>
  );
}
