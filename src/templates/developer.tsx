'use client';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
import type { SyntheticEvent } from 'react';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';
import DescText from '@/components/DescText';
import Pager, { usePager } from '@/components/Pager';

/* ------------------------------------------------------------------ */
/* Colour helpers: derive readable ink/rules from whatever bg the      */
/* user picked in the dashboard (dark or light).                       */
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
  const ink: RGB = isDark ? [226, 228, 222] : [28, 30, 33];
  const acc = parseHex(theme.accent, [99, 102, 241]);
  return {
    isDark,
    bg: toHex(bg),
    text: toHex(ink),
    sub: toHex(readable(mix(ink, bg, 0.38), bg, ink)),
    rule: toHex(mix(bg, ink, isDark ? 0.16 : 0.14)),
    panel: toHex(mix(bg, ink, isDark ? 0.045 : 0.03)),
    accent: toHex(acc),
    accentText: toHex(readable(acc, bg, ink)),
    onAccent: contrast(acc, [255, 255, 255]) >= contrast(acc, [17, 17, 17]) ? '#ffffff' : '#111111',
  };
}

/* ------------------------------------------------------------------ */
/* Small formatting helpers                                            */
/* ------------------------------------------------------------------ */
const ym = (d?: string | null) => (d ? d.slice(0, 7).replace('-', '.') : '');
const slugify = (s?: string) => (s || 'untitled').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function descLines(text?: string) {
  return (text || '').split(/\n+/).map(s => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
function shortDate(d?: string) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : d;
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[3px]';

type Palette = ReturnType<typeof makePalette>;

function Prompt({ cmd, p }: { cmd: string; p: Palette }) {
  return (
    <p className="font-mono text-[13px] mb-5 break-all" style={{ color: p.sub }}>
      <span style={{ color: p.accentText }}>$</span> {cmd}
    </p>
  );
}

function H2({ children, p }: { children: React.ReactNode; p: Palette }) {
  return (
    <h2 className="font-mono text-xl sm:text-2xl font-semibold tracking-tight mb-8" style={{ color: p.text }}>
      <span aria-hidden="true" style={{ color: p.sub }}>## </span>{children}
    </h2>
  );
}

export default function DeveloperTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const projPager = usePager(projects, 5, 'projects');
  const p = makePalette(theme);
  const ac = p.accent;
  const name = about?.name || portfolio.title || portfolio.slug;
  const handle = slugify(name);
  const email = contact?.email || about?.email;
  void isPreview;

  const sectionCls = 'py-14 sm:py-16 border-t';
  const linkCls = `font-mono text-[13px] underline underline-offset-4 decoration-1 hover:decoration-2 ${focusRing}`;

  const tree = [
    { id: 'about', label: 'about.md', show: !!about?.name },
    { id: 'experience', label: 'experience.log', show: experience.length > 0 },
    { id: 'projects', label: 'projects/', show: projects.length > 0 },
    { id: 'skills', label: 'stack.json', show: skills.length > 0 },
    { id: 'services', label: 'services.md', show: services.length > 0 },
    { id: 'testimonials', label: 'reviews.md', show: testimonials.length > 0 },
    { id: 'gallery', label: 'certs/', show: gallery.length > 0 },
    { id: 'contact', label: 'contact.sh', show: true },
  ].filter(t => t.show);

  const contactRows = [
    email ? { k: 'email', v: email, href: `mailto:${email}` } : null,
    contact?.phone ? { k: 'whatsapp', v: contact.phone, href: `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` } : null,
    contact?.linkedin_url ? { k: 'linkedin', v: contact.linkedin_url.replace(/^https?:\/\/(www\.)?/, ''), href: contact.linkedin_url } : null,
    contact?.github_url ? { k: 'github', v: contact.github_url.replace(/^https?:\/\/(www\.)?/, ''), href: contact.github_url } : null,
  ].filter((r): r is { k: string; v: string; href: string } => !!r);

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden" style={{ backgroundColor: p.bg, color: p.text }}>
      {/* Path bar */}
      <header className="border-b" style={{ borderColor: p.rule }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between gap-4 font-mono text-[13px]">
          <span className="truncate" style={{ color: p.sub }}>
            ~/<span style={{ color: p.text }}>{handle}</span>
          </span>
          <a href="#contact" className={`shrink-0 ${linkCls}`} style={{ color: p.accentText }}>./contact</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
        {/* File tree */}
        <aside className="hidden lg:block">
          <nav aria-label="Sections" className="sticky top-8 pt-14 font-mono text-[13px] leading-7">
            <p style={{ color: p.text }}>{handle}/</p>
            <ul>
              {tree.map((t, i) => (
                <li key={t.id} className="whitespace-nowrap">
                  <span aria-hidden="true" style={{ color: p.rule }}>{i === tree.length - 1 ? '└── ' : '├── '}</span>
                  <a href={`#${t.id}`} className={`hover:underline underline-offset-4 ${focusRing}`} style={{ color: p.sub }}>{t.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0">
          {/* Hero — README header */}
          <section id="hero" className="pt-14 pb-16 sm:pt-20">
            {hero?.background_url && (
              <SafeImg src={hero.background_url} alt="" className="w-full h-40 sm:h-56 object-cover border mb-10 rounded-md" style={{ borderColor: p.rule }} />
            )}
            <p className="font-mono text-[13px] mb-6" style={{ color: p.sub }}>
              README.md {hero?.greeting && <span>· {hero.greeting}</span>}
            </p>
            <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] break-words" style={{ color: p.text }}>
              <span aria-hidden="true" style={{ color: p.accentText }}># </span>{hero?.headline || name}
            </h1>
            {(hero?.subheadline || hero?.description) && (
              <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-[60ch]" style={{ color: p.sub }}>
                {hero?.subheadline || hero?.description}
              </p>
            )}

            <dl className="mt-10 font-mono text-[13px] grid grid-cols-[88px_minmax(0,1fr)] gap-y-1.5 max-w-xl">
              {about?.title && (<><dt style={{ color: p.sub }}>role</dt><dd className="break-words">{about.title}</dd></>)}
              {contact?.location && (<><dt style={{ color: p.sub }}>location</dt><dd className="break-words">{contact.location}</dd></>)}
              {email && (<><dt style={{ color: p.sub }}>email</dt><dd className="break-all"><a href={`mailto:${email}`} className={`hover:underline underline-offset-4 ${focusRing}`}>{email}</a></dd></>)}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3 font-mono text-[13px]">
              <a href={hero?.cta_url || '#projects'} className={`px-4 py-2.5 rounded-md font-medium hover:opacity-90 ${focusRing}`} style={{ backgroundColor: ac, color: p.onAccent }}>
                {hero?.cta_text || 'view projects'}
              </a>
              {about?.cv_url && (
                <a href={about.cv_url} target="_blank" rel="noreferrer" className={`px-4 py-2.5 rounded-md border hover:border-current ${focusRing}`} style={{ borderColor: p.rule, color: p.text }}>
                  resume.pdf
                </a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <a href={hero.cta_secondary_url} target="_blank" rel="noreferrer" className={`px-4 py-2.5 rounded-md border hover:border-current ${focusRing}`} style={{ borderColor: p.rule, color: p.text }}>
                  {hero.cta_secondary_text}
                </a>
              )}
            </div>
          </section>

          {/* About */}
          {about?.name && (
            <section id="about" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="cat about.md" />
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {about.photo_url && (
                  <SafeImg src={about.photo_url} alt={about.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-md object-cover border shrink-0" style={{ borderColor: p.rule }} />
                )}
                <div className="min-w-0">
                  <h2 className="font-mono text-xl font-semibold" style={{ color: p.text }}>{about.name}</h2>
                  {about.title && <p className="font-mono text-[13px] mt-1" style={{ color: p.accentText }}>{about.title}</p>}
                  {about.bio && <p className="mt-5 text-base leading-[1.75] max-w-[68ch] whitespace-pre-line" style={{ color: p.sub }}>{about.bio}</p>}
                </div>
              </div>
            </section>
          )}

          {/* Experience — git log */}
          {experience.length > 0 && (
            <section id="experience" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="git log --career" />
              <H2 p={p}>Work Experience</H2>
              <ol className="border-l" style={{ borderColor: p.rule }}>
                {experience.map((exp: TemplateItem, i: number) => (
                  <li key={exp.id ?? i} className="relative pl-6 pb-10 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[5px] top-[7px] w-[9px] h-[9px] rounded-full" style={{ backgroundColor: i === 0 ? ac : p.bg, border: `1.5px solid ${i === 0 ? ac : p.sub}` }} />
                    <p className="font-mono text-[12px] tabular-nums" style={{ color: p.sub }}>
                      {ym(exp.start_date)} → {ym(exp.end_date) || 'HEAD'}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold leading-snug" style={{ color: p.text }}>
                      {exp.position}
                      {exp.company && <span className="font-normal" style={{ color: p.sub }}> @ {exp.company}</span>}
                    </h3>
                    {descLines(exp.description).length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed max-w-[68ch]" style={{ color: p.sub }}>
                        {descLines(exp.description).map((s, si) => (
                          <li key={si} className="flex gap-3">
                            <span aria-hidden="true" className="font-mono shrink-0" style={{ color: p.accentText }}>+</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Projects — file tree */}
          {projects.length > 0 && (
            <section id="projects" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="tree projects/ -L 1" />
              <H2 p={p}>Projects</H2>
              <p className="font-mono text-[13px] mb-2" style={{ color: p.text }}>projects/</p>
              <ul>
                {projPager.items.map((proj: TemplateItem, i: number) => {
                  const last = i === projects.length - 1;
                  return (
                    <li key={proj.id ?? i} className="grid grid-cols-[2.25rem_minmax(0,1fr)] font-mono text-[13px]">
                      <span aria-hidden="true" className="relative" style={{ color: p.rule }}>
                        <span className="absolute left-[0.35rem] top-0 w-px" style={{ backgroundColor: p.rule, height: last ? '0.9rem' : '100%' }} />
                        <span className="absolute left-[0.35rem] top-[0.9rem] w-[1.2rem] h-px" style={{ backgroundColor: p.rule }} />
                      </span>
                      <div className="pb-9 min-w-0">
                        <h3 className="text-base font-semibold" style={{ color: p.accentText }}>{slugify(proj.title)}/</h3>
                        {proj.title && slugify(proj.title) !== proj.title && (
                          <p className="font-sans text-sm mt-0.5" style={{ color: p.text }}>{proj.title}</p>
                        )}
                        <DescText text={proj.description} className="font-sans mt-2 text-[15px] leading-relaxed max-w-[64ch]" style={{ color: p.sub }} />
                        {proj.image_url && (
                          <SafeImg src={proj.image_url} alt={proj.title} className="mt-4 w-full max-w-xl aspect-[16/9] object-cover rounded-md border" style={{ borderColor: p.rule }} />
                        )}
                        {proj.tech_stack && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {proj.tech_stack.split(',').filter(t => t.trim()).map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} textColor={p.text} size="sm" variant="pill" />)}
                          </div>
                        )}
                        {(proj.demo_url || proj.github_url) && (
                          <div className="flex gap-5 mt-4">
                            {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className={linkCls} style={{ color: p.accentText }}>demo ↗</a>}
                            {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className={linkCls} style={{ color: p.text }}>source ↗</a>}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pager pager={projPager} />
            </section>
          )}

          {/* Skills — stack.json */}
          {skills.length > 0 && (
            <section id="skills" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="cat stack.json" />
              <H2 p={p}>Skills</H2>
              <dl className="divide-y border-y" style={{ borderColor: p.rule }}>
                {skills.map((skill: TemplateItem, i: number) => (
                  <div key={skill.id ?? i} className="py-4 grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-3" style={{ borderColor: p.rule }}>
                    <dt className="font-mono text-[13px] pt-1" style={{ color: p.sub }}>&quot;{slugify(skill.title)}&quot;:</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {skill.skills?.split(',').filter(s => s.trim()).map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} textColor={p.text} size="sm" />)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section id="services" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="cat services.md" />
              <H2 p={p}>Services</H2>
              <ol className="space-y-7">
                {services.map((svc: TemplateItem, i: number) => (
                  <li key={svc.id ?? i} className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
                    <span className="font-mono text-[13px] pt-1 tabular-nums" style={{ color: p.sub }}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: p.text }}>{svc.title}</h3>
                      {svc.description && <p className="mt-1.5 text-[15px] leading-relaxed max-w-[64ch]" style={{ color: p.sub }}>{svc.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Testimonials — markdown quotes */}
          {testimonials.length > 0 && (
            <section id="testimonials" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="cat reviews.md" />
              <H2 p={p}>Testimonials</H2>
              <div className="space-y-10">
                {testimonials.map((t: TemplateItem, i: number) => (
                  <figure key={t.id ?? i} className="border-l-2 pl-5" style={{ borderColor: ac }}>
                    <blockquote className="text-base sm:text-[17px] leading-relaxed max-w-[64ch]" style={{ color: p.text }}>{t.message}</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3 font-mono text-[13px]">
                      {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="w-8 h-8 rounded object-cover" />}
                      <span style={{ color: p.text }}>{t.name}</span>
                      {t.position && <span style={{ color: p.sub }}>· {t.position}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section id="gallery" className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd="ls certs/" />
              <H2 p={p}>Certificates</H2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {gallery.map((cert: TemplateItem, i: number) => (
                  <li key={cert.id ?? i} className="min-w-0">
                    {(cert.image_url || cert.file_url) && (
                      <div className="w-full aspect-[4/3] mb-4 overflow-hidden rounded-md border bg-cover bg-center" style={{ borderColor: p.rule, backgroundColor: p.panel, backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                        <SafeImg src={cert.image_url || cert.file_url} alt={cert.title} className="w-full h-full object-cover"
                          onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    <h3 className="text-base font-semibold" style={{ color: p.text }}>{cert.title}</h3>
                    {cert.issued_date && <p className="font-mono text-[12px] mt-1 tabular-nums" style={{ color: p.sub }}>{shortDate(cert.issued_date)}</p>}
                    {cert.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: p.sub }}>{cert.description}</p>}
                    {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 ${linkCls}`} style={{ color: p.accentText }}>open ↗</a>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Custom sections */}
          {custom.length > 0 && custom.map((sec: TemplateItem) => (
            <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className={sectionCls} style={{ borderColor: p.rule }}>
              <Prompt p={p} cmd={`cat ${(sec.title || sec.original_type || 'section').toLowerCase().replace(/\s+/g, '_')}.md`} />
              <H2 p={p}>{sec.title}</H2>
              {sec.type === 'text' && <p className="text-base leading-[1.75] max-w-[68ch] whitespace-pre-line" style={{ color: p.sub }}>{sec.content?.body}</p>}
              {sec.type === 'list' && (
                <ul className="space-y-2 max-w-[68ch]">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-[15px]" style={{ color: p.sub }}>
                      <span aria-hidden="true" className="font-mono" style={{ color: p.accentText }}>-</span>{item}
                    </li>
                  ))}
                </ul>
              )}
              {sec.type === 'links' && (
                <ul className="space-y-2">
                  {(sec.content?.links || []).map((link: TemplateItem, i: number) => (
                    <li key={i}><a href={link.url} target="_blank" rel="noreferrer" className={linkCls} style={{ color: p.accentText }}>{link.label} ↗</a></li>
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
                            cardBg={p.isDark ? 'border-white/15 bg-white/[0.03]' : 'border-black/10 bg-black/[0.02]'} />
                        </div>
                      );
                    }
                    const c = sec.content;
                    const box = 'border rounded-md p-5 font-mono text-[13px] max-w-xl';
                    if (c.institution || c.degree || c.field) {
                      return (
                        <div className={box} style={{ borderColor: p.rule, backgroundColor: p.panel }}>
                          {c.institution && <p className="font-sans text-base font-semibold" style={{ color: p.text }}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className="mt-1" style={{ color: p.sub }}>{[c.degree, c.field].filter(Boolean).join(' · ')}</p>}
                          {(c.start_date || c.end_date) && <p className="mt-1 tabular-nums" style={{ color: p.sub }}>{[ym(c.start_date), ym(c.end_date)].filter(Boolean).join(' → ')}</p>}
                          {c.gpa && <p className="mt-1" style={{ color: p.sub }}>gpa: {c.gpa}</p>}
                        </div>
                      );
                    }
                    if (c.name || c.issuer) {
                      return (
                        <div className={box} style={{ borderColor: p.rule, backgroundColor: p.panel }}>
                          {c.name && <p className="font-sans text-base font-semibold" style={{ color: p.text }}>{c.name}</p>}
                          {c.issuer && <p className="mt-1" style={{ color: p.sub }}>{c.issuer}</p>}
                          {c.date && <p className="mt-1" style={{ color: p.sub }}>{c.date}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 ${linkCls}`} style={{ color: p.accentText }}>view credential ↗</a>}
                        </div>
                      );
                    }
                    if (c.language) {
                      return (
                        <p className="font-mono text-[15px]" style={{ color: p.text }}>
                          {c.language}{c.proficiency && <span style={{ color: p.sub }}> — {c.proficiency}</span>}
                        </p>
                      );
                    }
                    if (c.body) {
                      return <p className="text-base leading-[1.75] max-w-[68ch]" style={{ color: p.sub }}>{c.body}</p>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </section>
          ))}

          {/* Contact */}
          <section id="contact" className={sectionCls} style={{ borderColor: p.rule }}>
            <Prompt p={p} cmd="./contact.sh" />
            <H2 p={p}>Contact</H2>
            {contactRows.length > 0 && (
              <dl className="font-mono text-[13px] grid grid-cols-[88px_minmax(0,1fr)] gap-y-2 mb-10 max-w-xl">
                {contactRows.map(r => (
                  <div key={r.k} className="contents">
                    <dt style={{ color: p.sub }}>{r.k}</dt>
                    <dd className="break-all">
                      <a href={r.href} target={r.k === 'email' ? undefined : '_blank'} rel="noreferrer" className={`underline underline-offset-4 decoration-1 hover:decoration-2 ${focusRing}`} style={{ color: p.accentText }}>{r.v}</a>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="text-[15px] mb-6" style={{ color: p.sub }}>Or leave a message here — it lands straight in my inbox.</p>
            <div className="max-w-lg [&_form]:mx-0">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={p.text} subColor={p.sub} />
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t mt-6" style={{ borderColor: p.rule }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-2 sm:justify-between font-mono text-[12px]" style={{ color: p.sub }}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>built with PortfolioKit</span>
        </div>
      </footer>
    </div>
  );
}
