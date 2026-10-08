'use client';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
import type { SyntheticEvent } from 'react';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';
import DescText, { DescItems } from '@/components/DescText';

/* ------------------------------------------------------------------ */
/* Colour helpers — text/rules derived from the user's theme.bg        */
/* ------------------------------------------------------------------ */
type RGB = [number, number, number];

function parseHex(hex: string | undefined, fallback: RGB): RGB {
  const h = (hex || '').trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as RGB;
}
const toHex = (c: RGB) => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
function lum([r, g, b]: RGB) {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: RGB, b: RGB) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t) as RGB;
function readable(fg: RGB, bg: RGB, toward: RGB, min = 4.5): RGB {
  let c = fg;
  for (let i = 0; i < 12 && contrast(c, bg) < min; i++) c = mix(c, toward, 0.15);
  return c;
}

function makePalette(theme: ThemeConfig) {
  const bg = parseHex(theme.bg, [10, 10, 26]);
  const isDark = lum(bg) < 0.2;
  const ink: RGB = isDark ? [240, 240, 236] : [16, 16, 18];
  const acc = parseHex(theme.accent, [99, 102, 241]);
  const onAcc: RGB = contrast(acc, [255, 255, 255]) >= contrast(acc, [12, 12, 12]) ? [255, 255, 255] : [12, 12, 12];
  return {
    isDark,
    bg: toHex(bg),
    text: toHex(ink),
    sub: toHex(readable(mix(ink, bg, 0.42), bg, ink)),
    rule: toHex(mix(bg, ink, isDark ? 0.18 : 0.13)),
    band: toHex(mix(bg, ink, isDark ? 0.05 : 0.035)),
    accent: toHex(acc),
    accentText: toHex(readable(acc, bg, ink)),
    onAccent: toHex(onAcc),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const yr = (d?: string | null) => (d ? d.slice(0, 4) : '');
const pad = (n: number) => String(n).padStart(2, '0');
function descLines(text?: string) {
  return (text || '').split(/\n+/).map(s => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthYear(d?: string | null) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim() : d;
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2';

function SectionHead({ label, title, p }: { label: string; title: string; p: Palette }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-12 sm:mb-16">
      <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]" style={{ color: p.text }}>{title}</h2>
      <p className="text-sm" style={{ color: p.sub }}>{label}</p>
    </div>
  );
}

const wrap = 'max-w-7xl mx-auto px-5 sm:px-8';
const sectionPad = 'py-20 sm:py-28';

export default function AgencyTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const ac = p.accent;
  const name = about?.name || portfolio.title || portfolio.slug;
  const email = contact?.email || about?.email;
  const clients = Array.from(new Set(experience.map(e => e.company?.trim()).filter((c): c is string => !!c)));
  void isPreview;

  const arrowLink = `inline-flex items-center gap-2 font-medium underline-offset-[6px] hover:underline ${focusRing}`;

  const socials = [
    contact?.phone ? { label: 'WhatsApp', href: `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` } : null,
    contact?.linkedin_url ? { label: 'LinkedIn', href: contact.linkedin_url } : null,
    contact?.github_url ? { label: 'GitHub', href: contact.github_url } : null,
  ].filter((s): s is { label: string; href: string } => !!s);

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden" style={{ backgroundColor: p.bg, color: p.text }}>
      {/* Studio bar */}
      <header className="border-b" style={{ borderColor: p.rule }}>
        <div className={`${wrap} h-16 flex items-center justify-between gap-6`}>
          <a href="#hero" className={`font-semibold tracking-tight truncate ${focusRing}`}>
            {name}<span style={{ color: p.accentText }}>.</span>
          </a>
          <nav aria-label="Sections" className="flex items-center gap-6 lg:gap-8 text-sm">
            <a href="#projects" className={`hidden md:inline hover:underline underline-offset-4 ${focusRing}`}>Work</a>
            <a href="#services" className={`hidden md:inline hover:underline underline-offset-4 ${focusRing}`}>Services</a>
            <a href="#about" className={`hidden md:inline hover:underline underline-offset-4 ${focusRing}`}>About</a>
            <a href="#contact" className={`px-4 py-2 rounded-[4px] font-medium hover:opacity-90 ${focusRing}`} style={{ backgroundColor: p.text, color: p.bg }}>Start a project</a>
          </nav>
        </div>
      </header>

      <div>
        {/* Hero — statement + clients */}
        <section id="hero" className={wrap}>
          <div className="pt-16 sm:pt-24 pb-16 sm:pb-20">
            {hero?.greeting && <p className="text-sm mb-8" style={{ color: p.sub }}>{hero.greeting}</p>}
            <h1 className="text-[clamp(2.6rem,8.2vw,7.25rem)] font-semibold tracking-[-0.05em] leading-[0.92] max-w-[14ch] break-words">
              {hero?.headline || name}
            </h1>
            <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 border-t pt-8" style={{ borderColor: p.rule }}>
              <div className="md:col-span-6">
                {hero?.subheadline && <p className="text-xl sm:text-2xl leading-snug tracking-[-0.01em] max-w-[34ch]">{hero.subheadline}</p>}
                {hero?.description && <p className="mt-4 text-base leading-relaxed max-w-[52ch]" style={{ color: p.sub }}>{hero.description}</p>}
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-[15px]">
                  <a href={hero?.cta_url || '#projects'} className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-[4px] font-medium hover:opacity-90 ${focusRing}`} style={{ backgroundColor: ac, color: p.onAccent }}>
                    {hero?.cta_text || 'See our work'} <span aria-hidden="true">→</span>
                  </a>
                  {about?.cv_url && <a href={about.cv_url} target="_blank" rel="noreferrer" className={arrowLink}>Credentials deck <span aria-hidden="true">↗</span></a>}
                  {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                    <a href={hero.cta_secondary_url} target="_blank" rel="noreferrer" className={arrowLink}>{hero.cta_secondary_text} <span aria-hidden="true">↗</span></a>
                  )}
                </div>
              </div>
              {clients.length > 0 && (
                <div className="md:col-start-8 md:col-span-5">
                  <p className="text-sm mb-4" style={{ color: p.sub }}>Teams &amp; clients</p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg sm:text-xl font-medium tracking-tight">
                    {clients.map(c => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {hero?.background_url && (
            <SafeImg src={hero.background_url} alt="" className="w-full aspect-[16/7] object-cover mb-4 rounded-[4px]" />
          )}
        </section>

        {/* About — studio intro */}
        {about?.name && (
          <section id="about" className={`${wrap} ${sectionPad}`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 border-t pt-10" style={{ borderColor: p.rule }}>
              <div className="md:col-span-4">
                <p className="text-sm" style={{ color: p.sub }}>About</p>
                {about.photo_url && <SafeImg src={about.photo_url} alt={about.name} className="mt-6 w-full max-w-[300px] aspect-square object-cover rounded-[4px]" />}
                <p className="mt-5 font-semibold">{about.name}</p>
                {about.title && <p className="text-sm" style={{ color: p.sub }}>{about.title}</p>}
              </div>
              {about.bio && (
                <p className="md:col-span-8 text-2xl sm:text-3xl leading-[1.3] tracking-[-0.02em] whitespace-pre-line">{about.bio}</p>
              )}
            </div>
          </section>
        )}

        {/* Services — numbered rows */}
        {services.length > 0 && (
          <section id="services" className={`${wrap} ${sectionPad}`}>
            <SectionHead label={`${pad(services.length)} disciplines`} title="Services" p={p} />
            <ol className="border-t" style={{ borderColor: p.text }}>
              {services.map((svc: TemplateItem, i: number) => (
                <li key={svc.id ?? i} className="grid grid-cols-[3rem_minmax(0,1fr)] md:grid-cols-12 gap-x-4 md:gap-x-8 gap-y-3 py-8 border-b" style={{ borderColor: p.rule }}>
                  <span className="md:col-span-1 text-sm tabular-nums pt-2" style={{ color: p.sub }}>{pad(i + 1)}</span>
                  <h3 className="md:col-span-5 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] leading-tight">{svc.title}</h3>
                  {svc.description && <p className="col-start-2 md:col-start-auto md:col-span-6 text-base leading-relaxed max-w-[52ch] md:pt-1.5" style={{ color: p.sub }}>{svc.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Projects — case-study rows */}
        {projects.length > 0 && (
          <section id="projects" className={`${wrap} ${sectionPad}`}>
            <SectionHead label={`Selected cases, ${pad(projects.length)}`} title="Work" p={p} />
            <div className="border-t" style={{ borderColor: p.text }}>
              {projects.map((proj: TemplateItem, i: number) => {
                const flip = i % 2 === 1;
                return (
                  <article key={proj.id ?? i} className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 sm:py-14 border-b" style={{ borderColor: p.rule }}>
                    {proj.image_url && (
                      <div className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
                        <SafeImg src={proj.image_url} alt={proj.title} className="w-full aspect-[16/10] object-cover rounded-[4px]" />
                      </div>
                    )}
                    <div className={`${proj.image_url ? 'md:col-span-5' : 'md:col-span-12 md:grid md:grid-cols-12 md:gap-8'} flex flex-col`}>
                      <div className={proj.image_url ? '' : 'md:col-span-7'}>
                        <p className="text-sm tabular-nums" style={{ color: p.sub }}>Case {pad(i + 1)}</p>
                        <h3 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.04em] leading-[0.98] break-words">{proj.title}</h3>
                      </div>
                      <div className={proj.image_url ? 'mt-6' : 'mt-6 md:mt-0 md:col-span-5'}>
                        <DescText text={proj.description} className="text-base leading-relaxed max-w-[48ch]" style={{ color: p.sub }} />
                        {proj.tech_stack && (
                          <div className="flex flex-wrap gap-1.5 mt-5">
                            {proj.tech_stack.split(',').filter(t => t.trim()).map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} textColor={p.text} size="sm" variant="pill" />)}
                          </div>
                        )}
                        {(proj.demo_url || proj.github_url) && (
                          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-[15px]">
                            {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className={arrowLink} style={{ color: p.accentText }}>View live <span aria-hidden="true">↗</span></a>}
                            {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className={arrowLink}>Source <span aria-hidden="true">↗</span></a>}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience — track record table */}
        {experience.length > 0 && (
          <section id="experience" className={`${wrap} ${sectionPad}`}>
            <SectionHead label="Track record" title="Experience" p={p} />
            <ol className="border-t" style={{ borderColor: p.text }}>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-2 py-7 border-b" style={{ borderColor: p.rule }}>
                  <p className="md:col-span-2 text-sm tabular-nums md:pt-1" style={{ color: p.sub }}>{yr(exp.start_date)} – {yr(exp.end_date) || 'Now'}</p>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] leading-snug">{exp.position}</h3>
                    {exp.company && <p className="text-base" style={{ color: p.accentText }}>{exp.company}</p>}
                  </div>
                  {descLines(exp.description).length > 0 && (
                    <div className="md:col-span-6 space-y-2 text-base leading-relaxed max-w-[56ch]" style={{ color: p.sub }}>
                      <DescItems items={descLines(exp.description)} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Skills — capabilities columns */}
        {skills.length > 0 && (
          <section id="skills" className={`${wrap} ${sectionPad}`}>
            <SectionHead label="What we work with" title="Capabilities" p={p} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i} className="border-t pt-5" style={{ borderColor: p.text }}>
                  <h3 className="text-lg font-semibold tracking-tight mb-4">{skill.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.skills?.split(',').filter(s => s.trim()).map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} textColor={p.text} size="sm" />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section id="testimonials" style={{ backgroundColor: p.band }}>
            <div className={`${wrap} ${sectionPad}`}>
              <p className="text-sm mb-12" style={{ color: p.sub }}>Client words</p>
              <div className="space-y-16">
                {testimonials.map((t: TemplateItem, i: number) => (
                  <figure key={t.id ?? i} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    <blockquote className="md:col-span-9 text-2xl sm:text-4xl font-medium tracking-[-0.03em] leading-[1.15]">
                      “{t.message}”
                    </blockquote>
                    <figcaption className="md:col-span-3 md:pt-2 flex md:flex-col items-center md:items-start gap-3 text-sm">
                      {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
                      <span>
                        <span className="block font-semibold">{t.name}</span>
                        {t.position && <span className="block" style={{ color: p.sub }}>{t.position}</span>}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery" className={`${wrap} ${sectionPad}`}>
            <SectionHead label="Certificates & awards" title="Recognition" p={p} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {gallery.map((cert: TemplateItem, i: number) => (
                <li key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full aspect-[4/3] mb-5 overflow-hidden rounded-[4px] bg-cover bg-center" style={{ backgroundColor: p.band, backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title} className="w-full h-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight leading-snug">{cert.title}</h3>
                  {cert.issued_date && <p className="mt-1 text-sm tabular-nums" style={{ color: p.sub }}>{monthYear(cert.issued_date)}</p>}
                  {cert.description && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: p.sub }}>{cert.description}</p>}
                  {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" className={`mt-3 text-sm ${arrowLink}`}>View <span aria-hidden="true">↗</span></a>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Custom sections */}
        {custom.length > 0 && custom.map((sec: TemplateItem) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className={`${wrap} ${sectionPad}`}>
            <SectionHead label={(sec.original_type || sec.type || '').replace(/[-_]/g, ' ')} title={sec.title || sec.original_type || 'Section'} p={p} />
            {sec.type === 'text' && <p className="text-xl sm:text-2xl leading-[1.4] tracking-[-0.01em] max-w-[50ch] whitespace-pre-line">{sec.content?.body}</p>}
            {sec.type === 'list' && (
              <ol className="border-t" style={{ borderColor: p.text }}>
                {(sec.content?.items || []).map((item: string, i: number) => (
                  <li key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] py-4 border-b text-lg" style={{ borderColor: p.rule }}>
                    <span className="text-sm tabular-nums pt-1" style={{ color: p.sub }}>{pad(i + 1)}</span>{item}
                  </li>
                ))}
              </ol>
            )}
            {sec.type === 'links' && (
              <ul className="flex flex-wrap gap-x-10 gap-y-3 text-xl">
                {(sec.content?.links || []).map((link: TemplateItem, i: number) => (
                  <li key={i}><a href={link.url} target="_blank" rel="noreferrer" className={arrowLink}>{link.label} <span aria-hidden="true">↗</span></a></li>
                ))}
              </ul>
            )}
            {!['text', 'list', 'cards', 'links'].includes(sec.type ?? '') && sec.content && (
              <div>
                {(() => {
                  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(sec.content?.items)) {
                    return (
                      <div style={{ color: p.text }}>
                        <CertificationSection items={sec.content?.items} textColor="" subTextColor="opacity-75" accentColor={p.accentText}
                          cardBg={p.isDark ? 'border-white/15' : 'border-black/10'} />
                      </div>
                    );
                  }
                  const c = sec.content;
                  if (c.institution || c.degree || c.field) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-2 border-t pt-6" style={{ borderColor: p.rule }}>
                        <p className="md:col-span-2 text-sm tabular-nums" style={{ color: p.sub }}>{[yr(c.start_date), yr(c.end_date)].filter(Boolean).join(' – ')}</p>
                        <div className="md:col-span-10">
                          {c.institution && <p className="text-2xl font-semibold tracking-[-0.02em]">{c.institution}</p>}
                          {(c.degree || c.field) && <p className="mt-1 text-base" style={{ color: p.sub }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
                          {c.gpa && <p className="mt-1 text-sm" style={{ color: p.sub }}>GPA {c.gpa}</p>}
                        </div>
                      </div>
                    );
                  }
                  if (c.name || c.issuer) {
                    return (
                      <div className="border-t pt-6" style={{ borderColor: p.rule }}>
                        {c.name && <p className="text-2xl font-semibold tracking-[-0.02em]">{c.name}</p>}
                        {c.issuer && <p className="mt-1 text-base" style={{ color: p.sub }}>{c.issuer}</p>}
                        {c.date && <p className="mt-1 text-sm" style={{ color: p.sub }}>{c.date}</p>}
                        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className={`mt-3 text-sm ${arrowLink}`}>View credential <span aria-hidden="true">↗</span></a>}
                      </div>
                    );
                  }
                  if (c.language) {
                    return <p className="text-2xl font-semibold tracking-[-0.02em]">{c.language}{c.proficiency && <span className="font-normal" style={{ color: p.sub }}> — {c.proficiency}</span>}</p>;
                  }
                  if (c.body) {
                    return <p className="text-xl leading-[1.45] max-w-[50ch]">{c.body}</p>;
                  }
                  return null;
                })()}
              </div>
            )}
          </section>
        ))}

        {/* Contact — accent block + form */}
        <section id="contact" className={`${wrap} ${sectionPad}`}>
          <div className="rounded-[4px] px-6 py-12 sm:px-12 sm:py-16" style={{ backgroundColor: ac, color: p.onAccent }}>
            <p className="text-sm opacity-90">Contact</p>
            <h2 className="mt-4 text-[clamp(2.25rem,6.5vw,5.5rem)] font-semibold tracking-[-0.05em] leading-[0.95] max-w-[14ch]">Have a project in mind?</h2>
            {email && (
              <a href={`mailto:${email}`} className={`mt-8 inline-block text-xl sm:text-3xl font-medium tracking-[-0.02em] underline underline-offset-[8px] decoration-2 hover:decoration-[3px] break-all ${focusRing}`}>{email}</a>
            )}
            {(socials.length > 0 || contact?.location) && (
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
                {socials.map(s => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className={`underline underline-offset-4 hover:no-underline ${focusRing}`}>{s.label}</a>)}
                {contact?.location && <span className="opacity-90">{contact.location}</span>}
              </div>
            )}
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Send a brief</h3>
              <p className="mt-2 text-base leading-relaxed max-w-[36ch]" style={{ color: p.sub }}>A few lines about the project, timeline and budget is plenty to start.</p>
            </div>
            <div className="md:col-span-8 max-w-xl [&_form]:mx-0 [&_form]:max-w-none">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={p.text} subColor={p.sub} />
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t" style={{ borderColor: p.rule }}>
        <div className={`${wrap} py-8 flex flex-col sm:flex-row gap-2 sm:justify-between text-sm`} style={{ color: p.sub }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Built with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
