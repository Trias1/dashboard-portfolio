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
  const ink: RGB = dark ? [238, 236, 230] : [24, 22, 20];
  const paper = mix(ink, bg, 0.96);
  return {
    dark,
    bg: toHex(bg),
    paper: toHex(paper),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.45), paper, ink)),
    rule: toHex(mix(ink, bg, 0.82)),
    plate: toHex(mix(ink, bg, 0.9)),
    accent: toHex(readable(ac, paper, ink)),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';
const NAV = [['projects', 'Work'], ['experience', 'Experience'], ['skills', 'Skills'], ['contact', 'Contact']] as const;

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
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;
const slugId = (sec: TemplateItem) => `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;

/** Plate-style heading: big title on a rule with a small caption on the right. */
function Plate({ title, note, p }: { title: string; note?: string; p: Palette }) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-4 border-t pt-3" style={{ borderColor: p.text }}>
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {note && <span className="shrink-0 font-mono text-xs" style={{ color: p.muted }}>{note}</span>}
    </div>
  );
}

function A({ href, children, p, external }: { href?: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`underline decoration-1 underline-offset-[3px] hover:decoration-2 ${FOCUS}`} style={{ color: p.accent, outlineColor: p.accent }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line">{c?.body}</p>;
  if (sec.type === 'list') return (
    <ul className="max-w-[62ch] space-y-2">
      {(c?.items || []).map((item, i) => (
        <li key={i} className="grid grid-cols-[2rem_1fr]"><span className="font-mono text-xs leading-7" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</span><span className="leading-7">{item}</span></li>
      ))}
    </ul>
  );
  if (sec.type === 'cards') return (
    <div className="grid gap-px overflow-hidden rounded-[2px] border sm:grid-cols-2" style={{ borderColor: p.rule, backgroundColor: p.rule }}>
      {(c?.cards || []).map((card, i) => (
        <div key={i} className="p-5" style={{ backgroundColor: p.paper }}>
          <h3 className="font-medium">{card.title}</h3>
          {card.desc && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
        </div>
      ))}
    </div>
  );
  if (sec.type === 'links') return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {(c?.links || []).map((link, i) => <li key={i}><A href={link.url} p={p} external>{link.label}</A></li>)}
    </ul>
  );
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <CertificationSection items={c.items} accentColor={p.accent}
        textColor={p.dark ? 'text-neutral-100' : 'text-neutral-900'}
        subTextColor={p.dark ? 'text-neutral-400' : 'text-neutral-600'}
        cardBg={p.dark ? 'border-white/10 bg-white/[0.03]' : 'border-neutral-300 bg-white'} />
    );
  }
  if (c.institution || c.degree || c.field) {
    return (
      <div className="max-w-[62ch]">
        {c.institution && <p className="text-lg font-medium">{c.institution}</p>}
        {(c.degree || c.field) && <p style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {(c.start_date || c.end_date) && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>{[ym(c.start_date), ym(c.end_date)].filter(Boolean).join(' – ')}</p>}
        {c.gpa && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className="max-w-[62ch]">
        {c.name && <p className="text-lg font-medium">{c.name}</p>}
        {c.issuer && <p style={{ color: p.muted }}>{c.issuer}</p>}
        {c.date && <p className="mt-1 font-mono text-xs" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <p className="mt-2 text-sm"><A href={c.credential_url} p={p} external>View credential</A></p>}
      </div>
    );
  }
  if (c.language) {
    return <p className="text-lg"><span className="font-medium">{c.language}</span>{c.proficiency && <span style={{ color: p.muted }}> — {c.proficiency}</span>}</p>;
  }
  return c.body ? <p className="max-w-[62ch] text-lg leading-relaxed">{c.body}</p> : null;
}

/** Asymmetric layout for the image-led project grid. */
const PROJECT_LAYOUT = [
  { span: 'md:col-span-6', aspect: 'aspect-[16/9]', ph: 'aspect-[5/2]', offset: '' },
  { span: 'md:col-span-3', aspect: 'aspect-[4/5]', ph: 'aspect-[4/3]', offset: '' },
  { span: 'md:col-span-3', aspect: 'aspect-[4/3]', ph: 'aspect-[4/3]', offset: 'md:mt-24' },
];

export default function CreativeTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const name = about?.name || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;

  return (
    <div className="min-h-screen overflow-x-clip font-sans antialiased" style={{ backgroundColor: p.paper, color: p.text }} data-preview={isPreview ? 'true' : undefined}>
      {/* Sidebar — like the cover flap of a printed folio */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col overflow-y-auto border-r px-8 py-10 lg:flex" style={{ backgroundColor: p.bg, borderColor: p.rule }}>
        {about?.photo_url && <SafeImg src={about.photo_url} alt={about?.name || ''} className="mb-6 h-24 w-20 rounded-[2px] object-cover" />}
        <p className="font-display text-2xl leading-tight font-semibold tracking-tight">{name}</p>
        {about?.title && <p className="mt-1 text-sm" style={{ color: p.muted }}>{about.title}</p>}

        <nav aria-label="Index" className="mt-12">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: p.muted }}>Index</p>
          <ol className="border-t" style={{ borderColor: p.rule }}>
            {NAV.map(([id, label], i) => (
              <li key={id} className="border-b" style={{ borderColor: p.rule }}>
                <a href={`#${id}`} className={`flex items-baseline gap-4 py-2.5 text-sm hover:underline underline-offset-4 ${FOCUS}`} style={{ outlineColor: p.accent }}>
                  <span className="font-mono text-xs tabular-nums" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</span>{label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-auto space-y-1.5 pt-10 text-sm">
          {email && <p className="break-all"><A href={`mailto:${email}`} p={p}>{email}</A></p>}
          {contact?.location && <p style={{ color: p.muted }}>{contact.location}</p>}
          {about?.cv_url && (
            <a href={about.cv_url} target="_blank" rel="noopener noreferrer"
              className={`mt-4 inline-block rounded-[2px] border px-3 py-2 text-sm font-medium hover:bg-black/5 ${FOCUS}`} style={{ borderColor: p.text, outlineColor: p.accent }}>
              Download CV
            </a>
          )}
        </div>
      </aside>

      <main className="lg:ml-72">
        {/* Mobile masthead */}
        <div className="border-b px-5 py-5 lg:hidden" style={{ backgroundColor: p.bg, borderColor: p.rule }}>
          <div className="flex items-center gap-4">
            {about?.photo_url && <SafeImg src={about.photo_url} alt="" className="h-14 w-12 rounded-[2px] object-cover" />}
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-tight">{name}</p>
              {about?.title && <p className="text-sm" style={{ color: p.muted }}>{about.title}</p>}
            </div>
          </div>
          <nav aria-label="Index" className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className={`underline-offset-4 hover:underline ${FOCUS}`} style={{ outlineColor: p.accent }}>{label}</a>)}
            {about?.cv_url && <A href={about.cv_url} p={p} external>CV</A>}
          </nav>
        </div>

        <div className="mx-auto max-w-4xl space-y-24 px-5 py-14 sm:px-10 md:space-y-32 md:py-20">
          {/* Hero */}
          <section id="hero" className="relative">
            {hero?.background_url && (
              <figure className="mb-10">
                <SafeImg src={hero.background_url} alt="" className="aspect-[21/9] w-full rounded-[2px] object-cover" />
              </figure>
            )}
            <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: p.muted }}>{hero?.greeting || 'Portfolio'}</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,7vw,5rem)] leading-[1] font-semibold tracking-[-0.03em] break-words">
              {hero?.headline || about?.name || portfolio.title}
            </h1>
            {hero?.subheadline && <p className="mt-6 max-w-[48ch] text-xl leading-snug" style={{ color: p.muted }}>{hero.subheadline}</p>}
            {(hero?.description || about?.bio) && (
              <p className="mt-6 max-w-[62ch] leading-relaxed whitespace-pre-line">{hero?.description || about?.bio}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={hero?.cta_url || '#projects'} className={`rounded-[2px] px-4 py-2.5 text-sm font-medium hover:opacity-90 ${FOCUS}`}
                style={{ backgroundColor: p.text, color: p.paper, outlineColor: p.accent }}>
                {hero?.cta_text || 'See the work'}
              </a>
              <a href="#contact" className={`rounded-[2px] border px-4 py-2.5 text-sm font-medium ${FOCUS}`} style={{ borderColor: p.text, outlineColor: p.accent }}>
                Contact me
              </a>
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <a href={hero.cta_secondary_url} target="_blank" rel="noopener noreferrer"
                  className={`rounded-[2px] border px-4 py-2.5 text-sm font-medium ${FOCUS}`} style={{ borderColor: p.text, outlineColor: p.accent }}>
                  {hero.cta_secondary_text}
                </a>
              )}
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section id="skills" className="scroll-mt-8">
              <Plate title="Skills" p={p} />
              <div className="space-y-6">
                {skills.map((sk, i) => (
                  <div key={sk.id ?? i} className="grid gap-3 sm:grid-cols-[9rem_1fr]">
                    <p className="font-mono text-xs uppercase leading-7 tracking-[0.12em]" style={{ color: p.muted }}>{sk.title || 'Tools'}</p>
                    <div className="flex flex-wrap gap-2">
                      {sk.skills?.split(',').filter((s) => s.trim()).map((s) => (
                        <TechBadge key={s} name={s.trim()} accentColor={p.text} variant="outline" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section id="experience" className="scroll-mt-8">
              <Plate title="Experience" p={p} />
              <ol className="space-y-10">
                {experience.map((exp, i) => (
                  <li key={exp.id ?? i} className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <p className="font-mono text-xs leading-7 tabular-nums" style={{ color: p.muted }}>{ym(exp.start_date)} – {exp.end_date ? ym(exp.end_date) : 'now'}</p>
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium leading-7">{exp.position} <span className="font-normal" style={{ color: p.muted }}>at {exp.company}</span></h3>
                      {bullets(exp.description).length > 0 && (
                        <ul className="mt-2 max-w-[62ch] space-y-1 leading-relaxed">
                          {bullets(exp.description).map((b, j) => <li key={j} className="pl-4 -indent-4">– {b}</li>)}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Projects — image-led, asymmetric */}
          {projects.length > 0 && (
            <section id="projects" className="scroll-mt-8">
              <Plate title="Selected work" note={`${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`} p={p} />
              <div className="grid gap-x-6 gap-y-14 md:grid-cols-6">
                {projects.map((proj, i) => {
                  const L = PROJECT_LAYOUT[i % PROJECT_LAYOUT.length];
                  return (
                    <figure key={proj.id ?? i} className={`min-w-0 ${L.span} ${L.offset}`}>
                      {proj.image_url ? (
                        <SafeImg src={proj.image_url} alt={proj.title || ''} className={`${L.aspect} w-full rounded-[2px] object-cover`} />
                      ) : (
                        <div className={`${L.ph} flex w-full items-end rounded-[2px] p-5`} style={{ backgroundColor: p.plate }}>
                          <span className="font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-none font-semibold tracking-tight break-words" style={{ color: p.muted }}>{proj.title}</span>
                        </div>
                      )}
                      <figcaption className="mt-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.accent }}>Fig. {String(i + 1).padStart(2, '0')}</p>
                        <h3 className="mt-1 text-xl font-semibold tracking-tight">{proj.title}</h3>
                        {proj.description && <p className="mt-2 max-w-[56ch] text-sm leading-relaxed" style={{ color: p.muted }}>{proj.description}</p>}
                        {proj.tech_stack && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                              <TechBadge key={t} name={t.trim()} accentColor={p.text} variant="outline" />
                            ))}
                          </div>
                        )}
                        {(proj.demo_url || proj.github_url) && (
                          <p className="mt-3 flex gap-5 text-sm">
                            {proj.demo_url && <A href={proj.demo_url} p={p} external>View project</A>}
                            {proj.github_url && <A href={proj.github_url} p={p} external>Code</A>}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section id="services" className="scroll-mt-8">
              <Plate title="Services" p={p} />
              <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {services.map((svc, i) => (
                  <li key={svc.id ?? i}>
                    <span className="font-mono text-xs" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{svc.title}</h3>
                    {svc.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section id="testimonials" className="scroll-mt-8">
              <Plate title="Testimonials" p={p} />
              <div className="grid gap-10 md:grid-cols-2">
                {testimonials.map((tm, i) => (
                  <figure key={tm.id ?? i} className="border-l-2 pl-5" style={{ borderColor: p.accent }}>
                    <blockquote className="text-lg leading-relaxed">{tm.message}</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3 text-sm">
                      {tm.photo_url && <SafeImg src={tm.photo_url} alt={tm.name || ''} className="h-9 w-9 rounded-full object-cover" />}
                      <span><span className="font-medium">{tm.name}</span>{tm.position && <span style={{ color: p.muted }}> — {tm.position}</span>}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Custom sections */}
          {custom.map((sec, i) => (
            <section key={sec.id ?? i} id={slugId(sec)} className="scroll-mt-8">
              <Plate title={sec.title || sec.original_type || 'More'} p={p} />
              <CustomBody sec={sec} p={p} />
            </section>
          ))}

          {/* Certificates */}
          {gallery.length > 0 && (
            <section id="gallery" className="scroll-mt-8">
              <Plate title="Certificates" note={`${gallery.length}`} p={p} />
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {gallery.map((cert, i) => (
                  <figure key={cert.id ?? i} className="min-w-0">
                    {(cert.image_url || cert.file_url) && (
                      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-[2px]" style={{ backgroundColor: p.plate }}>
                        <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || ''} className="h-full w-full object-cover"
                          onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    <figcaption>
                      <h3 className="font-semibold">{cert.title}</h3>
                      {cert.issued_date && <p className="font-mono text-xs" style={{ color: p.muted }}>{fmtDate(cert.issued_date)}</p>}
                      {cert.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                      {cert.file_url && <p className="mt-2 text-sm"><A href={cert.file_url} p={p} external>Lihat sertifikat</A></p>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          {contactEnabled && (
            <section id="contact" className="scroll-mt-8">
              <Plate title="Let's work together" p={p} />
              <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
                <div className="space-y-3 text-sm">
                  <p className="max-w-[36ch] text-base leading-relaxed" style={{ color: p.muted }}>Have a project? I&apos;d love to hear about it.</p>
                  {email && <p className="break-all"><span className="block font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.muted }}>Email</span><A href={`mailto:${email}`} p={p}>{email}</A></p>}
                  {contact?.phone && <p><span className="block font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.muted }}>WhatsApp</span><A href={waLink(contact.phone, about?.name)} p={p} external>{contact.phone}</A></p>}
                  {contact?.linkedin_url && <p><span className="block font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.muted }}>LinkedIn</span><A href={contact.linkedin_url} p={p} external>Profile</A></p>}
                  {contact?.github_url && <p><span className="block font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.muted }}>GitHub</span><A href={contact.github_url} p={p} external>Profile</A></p>}
                </div>
                <div className="min-w-0">
                  <ContactForm slug={portfolio.slug} accentColor={p.accent} textColor={p.text} subColor={p.muted} />
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="mx-auto flex max-w-4xl flex-wrap justify-between gap-2 border-t px-5 py-6 text-xs sm:px-10" style={{ borderColor: p.rule, color: p.muted }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Made with PortfolioKit</span>
        </footer>
      </main>
    </div>
  );
}
