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
  const ink: RGB = isDark ? [236, 236, 233] : [22, 22, 22];
  const acc = parseHex(theme.accent, [99, 102, 241]);
  return {
    isDark,
    bg: toHex(bg),
    text: toHex(ink),
    sub: toHex(readable(mix(ink, bg, 0.45), bg, ink)),
    rule: toHex(mix(bg, ink, isDark ? 0.17 : 0.12)),
    tint: toHex(mix(bg, ink, isDark ? 0.04 : 0.025)),
    accent: toHex(acc),
    accentText: toHex(readable(acc, bg, ink)),
    onAccent: contrast(acc, [255, 255, 255]) >= contrast(acc, [17, 17, 17]) ? '#ffffff' : '#111111',
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthYear(d?: string | null) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim() : d;
}
function descLines(text?: string) {
  return (text || '').split(/\n+/).map(s => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}

const focusRing = 'focus-visible:outline-1 focus-visible:outline-offset-4';

/** Editorial section: hairline rule, small department label, light headline. */
function Department({ id, kicker, title, p, children, wide }: { id: string; kicker: string; title: string; p: Palette; children: React.ReactNode; wide?: boolean }) {
  return (
    <section id={id} className="px-6 sm:px-10">
      <div className="max-w-5xl mx-auto py-20 sm:py-28 border-t" style={{ borderColor: p.rule }}>
        <header className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: p.sub }}>{kicker}</p>
          <h2 className="mt-3 text-3xl sm:text-[2.6rem] font-light tracking-[-0.02em] leading-[1.1]" style={{ color: p.text }}>{title}</h2>
        </header>
        <div className={wide ? '' : 'max-w-2xl'}>{children}</div>
      </div>
    </section>
  );
}

export default function WhiteTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const ac = p.accent;
  const name = about?.name || portfolio.title || portfolio.slug;
  const email = contact?.email || about?.email;
  void isPreview;

  const quiet = `underline underline-offset-[6px] decoration-1 hover:decoration-2 ${focusRing}`;

  const socials = [
    contact?.phone ? { label: 'WhatsApp', href: `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` } : null,
    contact?.linkedin_url ? { label: 'LinkedIn', href: contact.linkedin_url } : null,
    contact?.github_url ? { label: 'GitHub', href: contact.github_url } : null,
  ].filter((s): s is { label: string; href: string } => !!s);

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden" style={{ backgroundColor: p.bg, color: p.text }}>
      <header className="px-6 sm:px-10">
        <div className="max-w-5xl mx-auto h-20 flex items-center justify-between gap-6">
          <a href="#hero" className={`text-[15px] tracking-tight truncate ${focusRing}`}>{name}</a>
          <nav aria-label="Sections" className="flex gap-5 sm:gap-8 text-sm" style={{ color: p.sub }}>
            <a href="#about" className={`hidden sm:inline hover:opacity-70 ${focusRing}`} style={{ color: p.text }}>About</a>
            <a href="#projects" className={`hover:opacity-70 ${focusRing}`} style={{ color: p.text }}>Work</a>
            <a href="#contact" className={`hover:opacity-70 ${focusRing}`} style={{ color: p.text }}>Contact</a>
          </nav>
        </div>
      </header>

      <div>
        {/* Hero — the opening spread */}
        <section id="hero" className="px-6 sm:px-10">
          <div className="max-w-5xl mx-auto pt-16 sm:pt-28 pb-20 sm:pb-28">
            {hero?.greeting && <p className="text-[11px] uppercase tracking-[0.22em] mb-8" style={{ color: p.sub }}>{hero.greeting}</p>}
            <h1 className="text-[clamp(2.5rem,7.5vw,5.75rem)] font-extralight tracking-[-0.035em] leading-[1.02] max-w-[16ch] break-words">
              {hero?.headline || name}
            </h1>
            <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-10 md:gap-16 items-end">
              <div className="h-px md:self-center" style={{ backgroundColor: p.rule }} aria-hidden="true" />
              <div>
                {hero?.subheadline && <p className="text-lg sm:text-xl font-light leading-[1.55] max-w-[42ch]" style={{ color: p.sub }}>{hero.subheadline}</p>}
                {hero?.description && <p className="mt-4 text-base leading-[1.7] max-w-[52ch]" style={{ color: p.sub }}>{hero.description}</p>}
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
                  <a href={hero?.cta_url || '#projects'} className={`inline-flex items-center px-6 py-3 rounded-[3px] hover:opacity-90 ${focusRing}`} style={{ backgroundColor: ac, color: p.onAccent }}>
                    {hero?.cta_text || 'See the work'}
                  </a>
                  {about?.cv_url && <a href={about.cv_url} target="_blank" rel="noreferrer" className={quiet}>Résumé</a>}
                  {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                    <a href={hero.cta_secondary_url} target="_blank" rel="noreferrer" className={quiet}>{hero.cta_secondary_text}</a>
                  )}
                </div>
              </div>
            </div>
            {hero?.background_url && (
              <figure className="mt-20">
                <SafeImg src={hero.background_url} alt="" className="w-full aspect-[21/9] object-cover" />
              </figure>
            )}
          </div>
        </section>

        {/* About — portrait + standfirst */}
        {about?.name && (
          <Department id="about" kicker="About" title={about.name} p={p} wide>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-10 md:gap-16">
              <div>
                {about.photo_url && <SafeImg src={about.photo_url} alt={about.name} className="w-full max-w-[260px] aspect-[4/5] object-cover" />}
                {about.title && <p className="mt-4 text-sm" style={{ color: p.sub }}>{about.title}</p>}
              </div>
              {about.bio && (
                <p className="text-lg sm:text-xl font-light leading-[1.7] max-w-[60ch] whitespace-pre-line">{about.bio}</p>
              )}
            </div>
          </Department>
        )}

        {/* Projects — features with captions */}
        {projects.length > 0 && (
          <Department id="projects" kicker="Portfolio" title="Selected work" p={p} wide>
            <div className="space-y-20 sm:space-y-24">
              {projects.map((proj: TemplateItem, i: number) => (
                <article key={proj.id ?? i}>
                  {proj.image_url && <SafeImg src={proj.image_url} alt={proj.title} className="w-full aspect-[16/9] object-cover mb-8" />}
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 md:gap-16">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] tabular-nums" style={{ color: p.sub }}>No. {String(i + 1).padStart(2, '0')}</p>
                      <h3 className="mt-2 text-2xl font-light tracking-[-0.01em] leading-snug">{proj.title}</h3>
                    </div>
                    <div>
                      <DescText text={proj.description} className="text-base sm:text-[17px] leading-[1.7] max-w-[58ch]" style={{ color: p.sub }} />
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mt-5">
                          {proj.tech_stack.split(',').filter(t => t.trim()).map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={p.accentText} size="sm" variant="outline" />)}
                        </div>
                      )}
                      {(proj.demo_url || proj.github_url) && (
                        <div className="flex gap-8 mt-6 text-sm">
                          {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className={quiet}>Visit project</a>}
                          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className={quiet} style={{ color: p.sub }}>Source code</a>}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Department>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Department id="experience" kicker="Career" title="Experience" p={p}>
            <ol>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className="py-8 border-b first:pt-0" style={{ borderColor: p.rule }}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                    <h3 className="text-xl font-light leading-snug">{exp.position}</h3>
                    <p className="text-sm tabular-nums shrink-0" style={{ color: p.sub }}>
                      {monthYear(exp.start_date)} – {monthYear(exp.end_date) || 'Present'}
                    </p>
                  </div>
                  {exp.company && <p className="mt-1 text-[15px]" style={{ color: p.accentText }}>{exp.company}</p>}
                  {descLines(exp.description).length > 0 && (
                    <div className="mt-4 space-y-2 text-base leading-[1.7]" style={{ color: p.sub }}>
                      <DescItems items={descLines(exp.description)} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Department>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Department id="skills" kicker="Toolkit" title="Skills" p={p}>
            <dl className="space-y-8">
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i}>
                  <dt className="text-sm mb-3" style={{ color: p.sub }}>{skill.title}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {skill.skills?.split(',').filter(s => s.trim()).map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={p.accentText} size="sm" variant="outline" />)}
                  </dd>
                </div>
              ))}
            </dl>
          </Department>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Department id="services" kicker="Services" title="What I can help with" p={p}>
            <dl>
              {services.map((svc: TemplateItem, i: number) => (
                <div key={svc.id ?? i} className="py-6 border-b first:pt-0" style={{ borderColor: p.rule }}>
                  <dt className="text-xl font-light">{svc.title}</dt>
                  {svc.description && <dd className="mt-2 text-base leading-[1.7]" style={{ color: p.sub }}>{svc.description}</dd>}
                </div>
              ))}
            </dl>
          </Department>
        )}

        {/* Testimonials — pull quotes */}
        {testimonials.length > 0 && (
          <Department id="testimonials" kicker="In their words" title="Testimonials" p={p}>
            <div className="space-y-16">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <blockquote className="text-2xl sm:text-[1.9rem] font-extralight italic leading-[1.35] tracking-[-0.01em]">
                    “{t.message}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm">
                    {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="w-9 h-9 rounded-full object-cover" />}
                    <span>
                      <span style={{ color: p.text }}>{t.name}</span>
                      {t.position && <span style={{ color: p.sub }}> — {t.position}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Department>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <Department id="gallery" kicker="Credentials" title="Certificates" p={p} wide>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-14">
              {gallery.map((cert: TemplateItem, i: number) => (
                <li key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full aspect-[4/3] mb-5 overflow-hidden bg-cover bg-center" style={{ backgroundColor: p.tint, backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title} className="w-full h-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <h3 className="text-lg font-light leading-snug">{cert.title}</h3>
                  {cert.issued_date && <p className="mt-1 text-sm tabular-nums" style={{ color: p.sub }}>{monthYear(cert.issued_date)}</p>}
                  {cert.description && <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: p.sub }}>{cert.description}</p>}
                  {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm ${quiet}`}>View certificate</a>}
                </li>
              ))}
            </ul>
          </Department>
        )}

        {/* Custom sections */}
        {custom.length > 0 && custom.map((sec: TemplateItem) => (
          <Department key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`}
            kicker={(sec.original_type || sec.type || 'Notes').replace(/[-_]/g, ' ')} title={sec.title || sec.original_type || 'Section'} p={p}>
            {sec.type === 'text' && <p className="text-lg font-light leading-[1.7] whitespace-pre-line">{sec.content?.body}</p>}
            {sec.type === 'list' && (
              <ul>
                {(sec.content?.items || []).map((item: string, i: number) => (
                  <li key={i} className="py-3 border-b text-base first:pt-0" style={{ borderColor: p.rule }}>{item}</li>
                ))}
              </ul>
            )}
            {sec.type === 'links' && (
              <ul className="space-y-3 text-lg font-light">
                {(sec.content?.links || []).map((link: TemplateItem, i: number) => (
                  <li key={i}><a href={link.url} target="_blank" rel="noreferrer" className={quiet}>{link.label}</a></li>
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
                      <div>
                        {c.institution && <p className="text-xl font-light">{c.institution}</p>}
                        {(c.degree || c.field) && <p className="mt-1 text-base" style={{ color: p.sub }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
                        {(c.start_date || c.end_date) && <p className="mt-1 text-sm tabular-nums" style={{ color: p.sub }}>{[monthYear(c.start_date), monthYear(c.end_date)].filter(Boolean).join(' – ')}</p>}
                        {c.gpa && <p className="mt-1 text-sm" style={{ color: p.sub }}>GPA {c.gpa}</p>}
                      </div>
                    );
                  }
                  if (c.name || c.issuer) {
                    return (
                      <div>
                        {c.name && <p className="text-xl font-light">{c.name}</p>}
                        {c.issuer && <p className="mt-1 text-base" style={{ color: p.sub }}>{c.issuer}</p>}
                        {c.date && <p className="mt-1 text-sm" style={{ color: p.sub }}>{c.date}</p>}
                        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm ${quiet}`}>View credential</a>}
                      </div>
                    );
                  }
                  if (c.language) {
                    return <p className="text-xl font-light">{c.language}{c.proficiency && <span style={{ color: p.sub }}> — {c.proficiency}</span>}</p>;
                  }
                  if (c.body) {
                    return <p className="text-lg font-light leading-[1.7]">{c.body}</p>;
                  }
                  return null;
                })()}
              </div>
            )}
          </Department>
        ))}

        {/* Contact */}
        <Department id="contact" kicker="Contact" title="Let’s talk" p={p}>
          {email && (
            <p className="text-lg font-light leading-[1.7]" style={{ color: p.sub }}>
              Write to <a href={`mailto:${email}`} className={`break-all ${quiet}`} style={{ color: p.text, textDecorationColor: ac }}>{email}</a>
              {contact?.location && <> — based in {contact.location}.</>}
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {socials.map(s => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className={quiet}>{s.label}</a></li>)}
            </ul>
          )}
          <div className="mt-12 max-w-lg [&_form]:mx-0">
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={p.text} subColor={p.sub} />
          </div>
        </Department>
      </div>

      <footer className="px-6 sm:px-10">
        <div className="max-w-5xl mx-auto py-10 border-t flex flex-col sm:flex-row gap-2 sm:justify-between text-xs" style={{ borderColor: p.rule, color: p.sub }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Built with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
