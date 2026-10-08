'use client';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
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
  const ink: RGB = dark ? [228, 228, 226] : [28, 28, 30];
  return {
    dark,
    bg: toHex(bg),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.45), bg, ink)),
    rule: toHex(mix(ink, bg, 0.86)),
    accent: toHex(readable(ac, bg, ink)),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';

function bullets(text?: string): string[] {
  if (!text) return [];
  const parts = text.split(/\r?\n|\s[-*•]\s/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
  if (parts.length > 1) return parts;
  return text.split(/\.\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}
const year = (d?: string) => (d ? d.slice(0, 4) : '');
function fmtDate(d?: string) {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;
const slugId = (sec: TemplateItem) => `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;

/** Text-coloured link with a quiet accent underline — the only colour on the page. */
function L({ href, children, p, external }: { href?: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`underline decoration-1 underline-offset-[3px] hover:decoration-2 ${FOCUS}`}
      style={{ color: p.text, textDecorationColor: p.accent, outlineColor: p.accent }}>
      {children}
    </a>
  );
}

function H2({ children, p }: { children: ReactNode; p: Palette }) {
  return <h2 className="mb-6 text-sm font-medium" style={{ color: p.muted }}>{children}</h2>;
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="leading-relaxed whitespace-pre-line">{c?.body}</p>;
  if (sec.type === 'list') return (
    <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
      {(c?.items || []).map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
  if (sec.type === 'cards') return (
    <dl className="space-y-4">
      {(c?.cards || []).map((card, i) => (
        <div key={i}>
          <dt className="font-medium">{card.title}</dt>
          {card.desc && <dd className="leading-relaxed" style={{ color: p.muted }}>{card.desc}</dd>}
        </div>
      ))}
    </dl>
  );
  if (sec.type === 'links') return (
    <p className="flex flex-wrap gap-x-4 gap-y-1">
      {(c?.links || []).map((link, i) => <L key={i} href={link.url} p={p} external>{link.label}</L>)}
    </p>
  );
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <CertificationSection items={c.items} accentColor={p.accent}
        textColor={p.dark ? 'text-neutral-100' : 'text-neutral-900'}
        subTextColor={p.dark ? 'text-neutral-400' : 'text-neutral-600'}
        cardBg={p.dark ? 'border-white/10 bg-transparent' : 'border-neutral-200 bg-transparent'} initialCount={2} />
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <div>
        <p className="font-medium">{c.institution}</p>
        {(c.degree || c.field) && <p style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {(c.start_date || c.end_date || c.gpa) && (
          <p className="text-sm tabular-nums" style={{ color: p.muted }}>
            {[year(c.start_date), year(c.end_date)].filter(Boolean).join('–')}{c.gpa ? ` · GPA ${c.gpa}` : ''}
          </p>
        )}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div>
        <p className="font-medium">{c.name}</p>
        <p style={{ color: p.muted }}>{[c.issuer, c.date].filter(Boolean).join(' · ')}</p>
        {c.credential_url && <p className="mt-1 text-sm"><L href={c.credential_url} p={p} external>View credential</L></p>}
      </div>
    );
  }
  if (c.language) return <p><span className="font-medium">{c.language}</span>{c.proficiency && <span style={{ color: p.muted }}> — {c.proficiency}</span>}</p>;
  return c.body ? <p className="leading-relaxed">{c.body}</p> : null;
}

export default function MinimalTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const name = about?.name || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;

  return (
    <div className="min-h-screen overflow-x-clip font-sans text-[16px] antialiased" style={{ backgroundColor: p.bg, color: p.text }}>
      <div className={`mx-auto max-w-[38rem] px-5 ${isPreview ? 'pt-16' : 'pt-10'} pb-20 sm:pt-16`}>
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
          <a href="#about" className={`font-medium ${FOCUS}`} style={{ outlineColor: p.accent }}>{name}</a>
          <nav aria-label="Sections" className="flex gap-5" style={{ color: p.muted }}>
            {[['about', 'About'], ['projects', 'Work'], ['contact', 'Contact']].map(([id, label]) => (
              <a key={id} href={`#${id}`} className={`underline-offset-[3px] hover:underline ${FOCUS}`} style={{ outlineColor: p.accent }}>{label}</a>
            ))}
          </nav>
        </header>

        <main className="space-y-20 pt-20 sm:pt-28">
          {/* Intro (doubles as the About section) */}
          <section id="about">
            {hero?.background_url && (
              <SafeImg src={hero.background_url} alt="" className="mb-10 aspect-[3/1] w-full rounded-[3px] object-cover" />
            )}
            {about?.photo_url && <SafeImg src={about.photo_url} alt={about?.name || ''} className="mb-8 h-14 w-14 rounded-full object-cover" />}
            <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight break-words sm:text-[2rem]">
              {hero?.headline || about?.name || portfolio.title}
            </h1>
            {hero?.subheadline && <p className="mt-2 text-lg leading-snug" style={{ color: p.muted }}>{hero.subheadline}</p>}
            {(hero?.description || about?.bio) && (
              <p className="mt-6 leading-relaxed whitespace-pre-line">{hero?.description || about?.bio}</p>
            )}
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
              <L href={hero?.cta_url || '#projects'} p={p}>{hero?.cta_text || 'Selected work'}</L>
              {about?.cv_url && <L href={about.cv_url} p={p} external>Résumé</L>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && <L href={hero.cta_secondary_url} p={p} external>{hero.cta_secondary_text}</L>}
            </p>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section id="skills">
              <H2 p={p}>Skills</H2>
              <div className="space-y-5">
                {skills.map((sk, i) => (
                  <div key={sk.id ?? i}>
                    {sk.title && <h3 className="mb-2 text-sm">{sk.title}</h3>}
                    <div className="flex flex-wrap gap-1.5">
                      {sk.skills?.split(',').filter((s) => s.trim()).map((s) => (
                        <TechBadge key={s} name={s.trim()} accentColor={p.muted} variant="outline" textColor={p.text} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section id="experience">
              <H2 p={p}>Experience</H2>
              <ol className="space-y-8">
                {experience.map((exp, i) => (
                  <li key={exp.id ?? i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="font-medium">{exp.position}, <span className="font-normal">{exp.company}</span></h3>
                      <span className="text-sm tabular-nums" style={{ color: p.muted }}>{year(exp.start_date)}–{exp.end_date ? year(exp.end_date) : 'now'}</span>
                    </div>
                    {bullets(exp.description).length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed" style={{ color: p.muted }}>
                        {bullets(exp.description).map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section id="projects">
              <H2 p={p}>Work</H2>
              <ul className="space-y-10">
                {projects.map((proj, i) => (
                  <li key={proj.id ?? i}>
                    {proj.image_url && <SafeImg src={proj.image_url} alt={proj.title || ''} className="mb-4 aspect-[16/9] w-full rounded-[3px] object-cover" />}
                    <h3 className="font-medium">
                      {proj.demo_url ? <L href={proj.demo_url} p={p} external>{proj.title}</L> : proj.title}
                    </h3>
                    {proj.description && <p className="mt-1 leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                    {proj.tech_stack && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                          <TechBadge key={t} name={t.trim()} accentColor={p.muted} variant="outline" textColor={p.text} />
                        ))}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <p className="mt-2 flex gap-4 text-sm">
                        {proj.demo_url && <L href={proj.demo_url} p={p} external>Demo</L>}
                        {proj.github_url && <L href={proj.github_url} p={p} external>Source</L>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section id="services">
              <H2 p={p}>Services</H2>
              <dl className="space-y-4">
                {services.map((svc, i) => (
                  <div key={svc.id ?? i}>
                    <dt className="font-medium">{svc.title}</dt>
                    {svc.description && <dd className="leading-relaxed" style={{ color: p.muted }}>{svc.description}</dd>}
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section id="testimonials">
              <H2 p={p}>Kind words</H2>
              <div className="space-y-8">
                {testimonials.map((tm, i) => (
                  <figure key={tm.id ?? i}>
                    <blockquote className="leading-relaxed">“{tm.message}”</blockquote>
                    <figcaption className="mt-2 flex items-center gap-2 text-sm" style={{ color: p.muted }}>
                      {tm.photo_url && <SafeImg src={tm.photo_url} alt={tm.name || ''} className="h-6 w-6 rounded-full object-cover" />}
                      <span>— {tm.name}{tm.position ? `, ${tm.position}` : ''}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Custom sections */}
          {custom.map((sec, i) => (
            <section key={sec.id ?? i} id={slugId(sec)}>
              <H2 p={p}>{sec.title || sec.original_type || 'More'}</H2>
              <CustomBody sec={sec} p={p} />
            </section>
          ))}

          {/* Certificates */}
          {gallery.length > 0 && (
            <section id="gallery">
              <H2 p={p}>Certificates</H2>
              <ul className="space-y-5">
                {gallery.map((cert, i) => (
                  <li key={cert.id ?? i} className="flex gap-4">
                    {(cert.image_url || cert.file_url) && (
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || ''} className="h-14 w-20 flex-shrink-0 rounded-[3px] border object-cover"
                        style={{ borderColor: p.rule }}
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium">{cert.file_url ? <L href={cert.file_url} p={p} external>{cert.title}</L> : cert.title}</p>
                      {cert.issued_date && <p className="text-sm tabular-nums" style={{ color: p.muted }}>{fmtDate(cert.issued_date)}</p>}
                      {cert.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Contact */}
          <section id="contact">
            <H2 p={p}>Contact</H2>
            <p className="leading-relaxed">
              I&apos;m available for work.{' '}
              {email ? <>The best way to reach me is <L href={`mailto:${email}`} p={p}>{email}</L>.</> : 'Leave a message below.'}
            </p>
            {(contact?.phone || contact?.linkedin_url || contact?.github_url) && (
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {contact?.phone && <L href={waLink(contact.phone, about?.name)} p={p} external>WhatsApp</L>}
                {contact?.linkedin_url && <L href={contact.linkedin_url} p={p} external>LinkedIn</L>}
                {contact?.github_url && <L href={contact.github_url} p={p} external>GitHub</L>}
              </p>
            )}
            {contact?.phone && <p className="mt-2 text-sm tabular-nums" style={{ color: p.muted }}>{contact.phone}</p>}
            <div className="mt-8">
              <ContactForm slug={portfolio.slug} accentColor={p.accent} textColor={p.text} subColor={p.muted} />
            </div>
          </section>
        </main>

        <footer className="mt-24 flex flex-wrap justify-between gap-2 border-t pt-5 text-sm" style={{ borderColor: p.rule, color: p.muted }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </footer>
      </div>
    </div>
  );
}
