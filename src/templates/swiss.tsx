'use client';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
import type { SyntheticEvent } from 'react';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

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
  // Swiss: pure black on light, pure white on dark — maximum contrast.
  const ink: RGB = isDark ? [255, 255, 255] : [0, 0, 0];
  const acc = parseHex(theme.accent, [99, 102, 241]);
  return {
    isDark,
    bg: toHex(bg),
    text: toHex(ink),
    sub: toHex(readable(mix(ink, bg, 0.42), bg, ink)),
    rule: toHex(mix(bg, ink, isDark ? 0.22 : 0.18)),
    accent: toHex(acc),
    accentText: toHex(readable(acc, bg, ink)),
    onAccent: contrast(acc, [255, 255, 255]) >= contrast(acc, [0, 0, 0]) ? '#ffffff' : '#000000',
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const yr = (d?: string | null) => (d ? d.slice(0, 4) : '');
const ym = (d?: string | null) => (d ? d.slice(0, 7).replace('-', '.') : '');
const pad = (n: number) => String(n).padStart(2, '0');
function descLines(text?: string) {
  return (text || '').split(/\n+/).map(s => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
function shortDate(d?: string) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${m[2]}.${m[1]}` : d;
}

const helvetica = { fontFamily: '"Helvetica Neue", Helvetica, Arial, var(--font-geist-sans), sans-serif' };
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2';

/** Section frame: heavy rule on top, label in the left three columns, content in the right nine. */
function Frame({ id, label, p, children }: { id: string; label: string; p: Palette; children: React.ReactNode }) {
  return (
    <section id={id} className="px-5 sm:px-8">
      <div className="max-w-7xl mx-auto border-t-2 pt-5 pb-20 sm:pb-24 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8" style={{ borderColor: p.text }}>
        <h2 className="md:col-span-3 text-sm font-bold leading-tight" style={{ color: p.text }}>{label}</h2>
        <div className="md:col-span-9 min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function SwissTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const ac = p.accent;
  const name = about?.name || portfolio.title || portfolio.slug;
  const email = contact?.email || about?.email;
  void isPreview;

  const ctaPrimary = `inline-flex items-center px-5 py-3 text-sm font-bold ${focusRing}`;
  const ctaSecondary = `inline-flex items-center px-5 py-3 text-sm font-bold border-2 ${focusRing}`;
  const textLink = `underline underline-offset-[5px] decoration-2 hover:no-underline ${focusRing}`;

  const socials = [
    contact?.phone ? { label: 'WhatsApp', href: `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` } : null,
    contact?.linkedin_url ? { label: 'LinkedIn', href: contact.linkedin_url } : null,
    contact?.github_url ? { label: 'GitHub', href: contact.github_url } : null,
  ].filter((s): s is { label: string; href: string } => !!s);

  return (
    <div className="min-h-screen antialiased overflow-x-hidden" style={{ ...helvetica, backgroundColor: p.bg, color: p.text }}>
      {/* Masthead */}
      <header className="px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-x-6 py-4 text-sm">
          <a href="#hero" className={`md:col-span-3 font-bold truncate ${focusRing}`}>{name}</a>
          <p className="hidden md:block md:col-span-4" style={{ color: p.sub }}>{about?.title}</p>
          <nav aria-label="Sections" className="md:col-span-5 flex justify-end md:justify-start gap-5">
            <a href="#projects" className={`hidden sm:inline hover:underline underline-offset-4 ${focusRing}`}>Work</a>
            <a href="#about" className={`hidden sm:inline hover:underline underline-offset-4 ${focusRing}`}>About</a>
            <a href="#contact" className={`hover:underline underline-offset-4 ${focusRing}`}>Contact</a>
          </nav>
        </div>
      </header>

      <div>
        {/* Hero */}
        <section id="hero" className="px-5 sm:px-8">
          <div className="max-w-7xl mx-auto border-t-2 pt-6 pb-20 sm:pb-28" style={{ borderColor: p.text }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
              <div className="md:col-span-3 flex md:block items-center gap-4">
                <span aria-hidden="true" className="block w-12 h-12 md:w-20 md:h-20" style={{ backgroundColor: ac }} />
                {hero?.greeting && <p className="md:mt-5 text-sm font-bold">{hero.greeting}</p>}
              </div>
              <h1 className="md:col-span-9 font-bold tracking-[-0.045em] leading-[0.9] text-[clamp(2.75rem,10.5vw,8.5rem)] break-words hyphens-auto">
                {hero?.headline || name}
              </h1>
            </div>

            <div className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 text-base leading-snug">
              <div className="md:col-start-4 md:col-span-4">
                {hero?.subheadline && <p className="font-bold max-w-[34ch]">{hero.subheadline}</p>}
                {hero?.description && <p className="mt-3 max-w-[40ch]" style={{ color: p.sub }}>{hero.description}</p>}
              </div>
              <dl className="md:col-span-2 text-sm space-y-3">
                {about?.title && <div><dt className="font-bold">Role</dt><dd style={{ color: p.sub }}>{about.title}</dd></div>}
                {contact?.location && <div><dt className="font-bold">Based in</dt><dd style={{ color: p.sub }}>{contact.location}</dd></div>}
              </dl>
              <div className="md:col-span-3 flex flex-wrap md:flex-col items-start gap-3">
                <a href={hero?.cta_url || '#projects'} className={ctaPrimary} style={{ backgroundColor: p.text, color: p.bg }}>
                  {hero?.cta_text || 'View projects'} <span aria-hidden="true" className="ml-3">→</span>
                </a>
                {about?.cv_url && <a href={about.cv_url} target="_blank" rel="noreferrer" className={ctaSecondary} style={{ borderColor: p.text }}>Download CV</a>}
                {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                  <a href={hero.cta_secondary_url} target="_blank" rel="noreferrer" className={ctaSecondary} style={{ borderColor: p.text }}>{hero.cta_secondary_text}</a>
                )}
              </div>
            </div>

            {hero?.background_url && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-x-6">
                <img src={hero.background_url} alt="" className="md:col-start-4 md:col-span-9 w-full aspect-[16/7] object-cover grayscale" />
              </div>
            )}
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <Frame id="about" label="About" p={p}>
            <div className="grid grid-cols-1 sm:grid-cols-9 gap-x-6 gap-y-8">
              {about.photo_url && (
                <img src={about.photo_url} alt={about.name} className="sm:col-span-3 w-40 sm:w-full aspect-[3/4] object-cover grayscale" />
              )}
              <div className={about.photo_url ? 'sm:col-span-6' : 'sm:col-span-9'}>
                <p className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.05]">{about.name}</p>
                {about.title && <p className="mt-2 text-lg" style={{ color: p.accentText }}>{about.title}</p>}
                {about.bio && <p className="mt-8 text-lg leading-[1.55] max-w-[58ch] whitespace-pre-line">{about.bio}</p>}
              </div>
            </div>
          </Frame>
        )}

        {/* Projects — numbered index */}
        {projects.length > 0 && (
          <Frame id="projects" label="Selected work" p={p}>
            <ol>
              {projects.map((proj: TemplateItem, i: number) => (
                <li key={proj.id ?? i} className={`grid grid-cols-[3.25rem_minmax(0,1fr)] sm:grid-cols-9 gap-x-6 py-8 ${i > 0 ? 'border-t' : 'pt-0'}`} style={{ borderColor: p.rule }}>
                  <span className="sm:col-span-1 text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-none tabular-nums" style={{ color: ac }} aria-hidden="true">{pad(i + 1)}</span>
                  <div className={`${proj.image_url ? 'sm:col-span-4' : 'sm:col-span-8'} min-w-0`}>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] leading-tight">{proj.title}</h3>
                    {proj.description && <p className="mt-3 text-base leading-[1.55] max-w-[52ch]" style={{ color: p.sub }}>{proj.description}</p>}
                    {proj.tech_stack && (
                      <div className="flex flex-wrap gap-1.5 mt-5">
                        {proj.tech_stack.split(',').filter(t => t.trim()).map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} textColor={p.text} size="sm" variant="pill" />)}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <div className="flex gap-6 mt-5 text-sm font-bold">
                        {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className={textLink}>Live site</a>}
                        {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className={textLink}>Source</a>}
                      </div>
                    )}
                  </div>
                  {proj.image_url && (
                    <img src={proj.image_url} alt={proj.title} className="col-start-2 sm:col-start-auto sm:col-span-4 mt-6 sm:mt-0 w-full aspect-[4/3] object-cover" />
                  )}
                </li>
              ))}
            </ol>
          </Frame>
        )}

        {/* Experience — years as display numerals */}
        {experience.length > 0 && (
          <Frame id="experience" label="Experience" p={p}>
            <ol>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className={`grid grid-cols-1 sm:grid-cols-9 gap-x-6 gap-y-3 py-7 ${i > 0 ? 'border-t' : 'pt-0'}`} style={{ borderColor: p.rule }}>
                  <p className="sm:col-span-3 text-3xl sm:text-4xl font-bold tracking-[-0.04em] leading-none tabular-nums">
                    {yr(exp.start_date)}<span style={{ color: p.sub }}>–{exp.end_date ? yr(exp.end_date).slice(2) : ''}</span>
                    <span className="block mt-2 text-xs font-normal tracking-normal" style={{ color: p.sub }}>
                      {ym(exp.start_date)} — {ym(exp.end_date) || 'present'}
                    </span>
                  </p>
                  <div className="sm:col-span-6">
                    <h3 className="text-xl font-bold leading-tight">{exp.position}</h3>
                    {exp.company && <p className="mt-1 text-base" style={{ color: p.accentText }}>{exp.company}</p>}
                    {descLines(exp.description).length > 0 && (
                      <ul className="mt-4 space-y-2 text-base leading-[1.55] max-w-[56ch]" style={{ color: p.sub }}>
                        {descLines(exp.description).map((s, si) => (
                          <li key={si} className="grid grid-cols-[1rem_minmax(0,1fr)]"><span aria-hidden="true">–</span><span>{s}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Frame>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Frame id="skills" label="Skills" p={p}>
            <dl>
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i} className={`grid grid-cols-1 sm:grid-cols-9 gap-x-6 gap-y-3 py-5 ${i > 0 ? 'border-t' : 'pt-0'}`} style={{ borderColor: p.rule }}>
                  <dt className="sm:col-span-3 text-base font-bold">{skill.title}</dt>
                  <dd className="sm:col-span-6 flex flex-wrap gap-1.5">
                    {skill.skills?.split(',').filter(s => s.trim()).map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} textColor={p.text} size="sm" variant="pill" />)}
                  </dd>
                </div>
              ))}
            </dl>
          </Frame>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Frame id="services" label="Services" p={p}>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {services.map((svc: TemplateItem, i: number) => (
                <li key={svc.id ?? i} className="border-t pt-4" style={{ borderColor: p.text }}>
                  <span className="block text-5xl font-bold tracking-[-0.05em] leading-none tabular-nums" aria-hidden="true">{pad(i + 1)}</span>
                  <h3 className="mt-6 text-lg font-bold leading-tight">{svc.title}</h3>
                  {svc.description && <p className="mt-2 text-base leading-[1.55]" style={{ color: p.sub }}>{svc.description}</p>}
                </li>
              ))}
            </ol>
          </Frame>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Frame id="testimonials" label="Testimonials" p={p}>
            <div className="space-y-14">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <blockquote className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.2] max-w-[30ch]">
                    <span aria-hidden="true" style={{ color: ac }}>“</span>{t.message}<span aria-hidden="true" style={{ color: ac }}>”</span>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 object-cover grayscale" />}
                    <span><span className="font-bold">{t.name}</span>{t.position && <span style={{ color: p.sub }}>, {t.position}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Frame>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <Frame id="gallery" label="Certificates" p={p}>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {gallery.map((cert: TemplateItem, i: number) => (
                <li key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full aspect-[4/3] mb-4 overflow-hidden bg-cover bg-center" style={{ backgroundColor: p.rule, backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title} className="w-full h-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 border-t pt-3" style={{ borderColor: p.text }}>
                    <h3 className="text-base font-bold leading-tight">{cert.title}</h3>
                    {cert.issued_date && <span className="text-sm tabular-nums shrink-0" style={{ color: p.sub }}>{shortDate(cert.issued_date)}</span>}
                  </div>
                  {cert.description && <p className="mt-2 text-sm leading-[1.55]" style={{ color: p.sub }}>{cert.description}</p>}
                  {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm font-bold ${textLink}`}>View</a>}
                </li>
              ))}
            </ul>
          </Frame>
        )}

        {/* Custom sections */}
        {custom.length > 0 && custom.map((sec: TemplateItem) => (
          <Frame key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} label={sec.title || sec.original_type || 'Section'} p={p}>
            {sec.type === 'text' && <p className="text-lg leading-[1.55] max-w-[58ch] whitespace-pre-line">{sec.content?.body}</p>}
            {sec.type === 'list' && (
              <ul className="max-w-[58ch]">
                {(sec.content?.items || []).map((item: string, i: number) => (
                  <li key={i} className={`py-3 text-base ${i > 0 ? 'border-t' : 'pt-0'}`} style={{ borderColor: p.rule }}>{item}</li>
                ))}
              </ul>
            )}
            {sec.type === 'links' && (
              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-bold">
                {(sec.content?.links || []).map((link: TemplateItem, i: number) => (
                  <li key={i}><a href={link.url} target="_blank" rel="noreferrer" className={textLink}>{link.label}</a></li>
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
                          cardBg={p.isDark ? 'border-white/25' : 'border-black/20'} />
                      </div>
                    );
                  }
                  const c = sec.content;
                  if (c.institution || c.degree || c.field) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-9 gap-x-6 gap-y-2">
                        <p className="sm:col-span-3 text-base tabular-nums" style={{ color: p.sub }}>{[ym(c.start_date), ym(c.end_date)].filter(Boolean).join(' — ')}</p>
                        <div className="sm:col-span-6">
                          {c.institution && <p className="text-xl font-bold leading-tight">{c.institution}</p>}
                          {(c.degree || c.field) && <p className="mt-1 text-base">{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
                          {c.gpa && <p className="mt-1 text-sm" style={{ color: p.sub }}>GPA {c.gpa}</p>}
                        </div>
                      </div>
                    );
                  }
                  if (c.name || c.issuer) {
                    return (
                      <div>
                        {c.name && <p className="text-xl font-bold leading-tight">{c.name}</p>}
                        {c.issuer && <p className="mt-1 text-base">{c.issuer}</p>}
                        {c.date && <p className="mt-1 text-sm tabular-nums" style={{ color: p.sub }}>{c.date}</p>}
                        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm font-bold ${textLink}`}>View credential</a>}
                      </div>
                    );
                  }
                  if (c.language) {
                    return (
                      <p className="text-xl font-bold">{c.language}{c.proficiency && <span className="font-normal" style={{ color: p.sub }}> — {c.proficiency}</span>}</p>
                    );
                  }
                  if (c.body) {
                    return <p className="text-lg leading-[1.55] max-w-[58ch]">{c.body}</p>;
                  }
                  return null;
                })()}
              </div>
            )}
          </Frame>
        ))}

        {/* Contact */}
        <Frame id="contact" label="Contact" p={p}>
          <p className="text-[clamp(2.25rem,7vw,5rem)] font-bold tracking-[-0.045em] leading-[0.95]">Get in touch.</p>
          {email && (
            <a href={`mailto:${email}`} className={`mt-6 inline-block text-xl sm:text-2xl font-bold break-all ${textLink}`} style={{ textDecorationColor: ac }}>{email}</a>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              {socials.map(s => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className={textLink}>{s.label}</a></li>)}
            </ul>
          )}
          <div className="mt-14 max-w-lg [&_form]:mx-0">
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={p.text} subColor={p.sub} />
          </div>
        </Frame>
      </div>

      <footer className="px-5 sm:px-8">
        <div className="max-w-7xl mx-auto border-t-2 py-5 grid grid-cols-2 md:grid-cols-12 gap-x-6 text-xs" style={{ borderColor: p.text }}>
          <p className="md:col-span-3 font-bold">© {new Date().getFullYear()} {name}</p>
          <p className="md:col-span-9 text-right md:text-left" style={{ color: p.sub }}>Built with PortfolioKit</p>
        </div>
      </footer>
    </div>
  );
}
