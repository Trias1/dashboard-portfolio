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
  const ink: RGB = isDark ? [246, 245, 242] : [12, 12, 14];
  const acc = parseHex(theme.accent, [99, 102, 241]);
  return {
    isDark,
    bg: toHex(bg),
    text: toHex(ink),
    sub: toHex(readable(mix(ink, bg, 0.4), bg, ink)),
    rule: toHex(mix(bg, ink, isDark ? 0.2 : 0.15)),
    surface: toHex(mix(bg, ink, isDark ? 0.06 : 0.04)),
    accent: toHex(acc),
    accentText: toHex(readable(acc, bg, ink)),
    onAccent: contrast(acc, [255, 255, 255]) >= contrast(acc, [12, 12, 12]) ? '#ffffff' : '#0c0c0c',
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const yr = (d?: string | null) => (d ? d.slice(0, 4) : '');
function descLines(text?: string) {
  return (text || '').split(/\n+/).map(s => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthYear(d?: string | null) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim() : d;
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4';
const wrap = 'max-w-6xl mx-auto px-5 sm:px-8';
const sectionPad = 'py-20 sm:py-28';

/** Big one-word title with a hard accent full stop. */
function Title({ children, p }: { children: React.ReactNode; p: Palette }) {
  return (
    <h2 className="font-display text-5xl sm:text-7xl font-extrabold tracking-[-0.045em] leading-[0.9] mb-12 sm:mb-14" style={{ color: p.text }}>
      {children}<span style={{ color: p.accentText }}>.</span>
    </h2>
  );
}

export default function BoldPersonaTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const ac = p.accent;
  const name = about?.name || portfolio.title || portfolio.slug;
  const email = contact?.email || about?.email;
  void isPreview;

  // The name is the brand; the headline becomes the one-line statement under it
  // (skipped when it just repeats the name, e.g. "Hi, I'm Alex Rivera").
  const bigName = name;
  const headlineRepeatsName = !!(about?.name && hero?.headline && hero.headline.toLowerCase().includes(about.name.toLowerCase()));
  const statement = hero?.headline && !headlineRepeatsName ? hero.headline : hero?.subheadline;
  const statementSub = statement === hero?.subheadline ? hero?.description : hero?.subheadline;

  const loud = `inline-flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] ${focusRing}`;
  const underline = `font-bold underline underline-offset-[6px] decoration-2 hover:decoration-4 ${focusRing}`;

  const socials = [
    contact?.phone ? { label: 'WhatsApp', href: `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` } : null,
    contact?.linkedin_url ? { label: 'LinkedIn', href: contact.linkedin_url } : null,
    contact?.github_url ? { label: 'GitHub', href: contact.github_url } : null,
  ].filter((s): s is { label: string; href: string } => !!s);

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden" style={{ backgroundColor: p.bg, color: p.text }}>
      <header className={`${wrap} h-16 flex items-center justify-between gap-6 text-sm`}>
        <a href="#hero" className={`font-display font-extrabold text-lg tracking-tight ${focusRing}`}>
          {name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase()}
        </a>
        <nav aria-label="Sections" className="flex gap-6 font-semibold">
          <a href="#work" className={`hover:underline underline-offset-4 ${focusRing}`}>Work</a>
          <a href="#about" className={`hidden sm:inline hover:underline underline-offset-4 ${focusRing}`}>About</a>
          <a href="#connect" className={`hover:underline underline-offset-4 ${focusRing}`} style={{ color: p.accentText }}>Contact</a>
        </nav>
      </header>

      <div>
        {/* Hero — the name is the poster */}
        <section id="hero" className={`${wrap} pt-10 sm:pt-16 pb-20 sm:pb-28`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm font-semibold border-b pb-4 mb-8 sm:mb-10" style={{ borderColor: p.rule }}>
            <span>{hero?.greeting || about?.title}</span>
            {(contact?.location || (hero?.greeting && about?.title)) && (
              <span style={{ color: p.sub }}>{[hero?.greeting ? about?.title : null, contact?.location].filter(Boolean).join(' — ')}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-end">
            <h1 className={`${about?.photo_url ? 'md:col-span-8' : 'md:col-span-12'} font-display font-extrabold uppercase tracking-[-0.055em] leading-[0.82] text-[clamp(3.4rem,14.5vw,11rem)] break-words`}>
              {bigName.split(/\s+/).map((w, i) => <span key={i} className="block">{w}</span>)}
            </h1>
            {about?.photo_url && (
              <div className="md:col-span-4 relative w-[min(72%,300px)] md:w-full justify-self-start md:justify-self-end">
                <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4" style={{ backgroundColor: ac }} />
                <SafeImg src={about.photo_url} alt={about.name || name} className="relative w-full aspect-[4/5] object-cover" />
              </div>
            )}
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              {statement && <p className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.15] max-w-[26ch]">{statement}</p>}
              {statementSub && <p className="mt-4 text-lg leading-relaxed max-w-[48ch]" style={{ color: p.sub }}>{statementSub}</p>}
            </div>
            <div className="md:col-span-5 flex flex-wrap md:justify-end items-start gap-3">
              <a href={hero?.cta_url || '#work'} className={`${loud} hover:opacity-90`} style={{ backgroundColor: ac, color: p.onAccent }}>
                {hero?.cta_text || 'See the work'} <span aria-hidden="true">→</span>
              </a>
              {about?.cv_url && <a href={about.cv_url} target="_blank" rel="noreferrer" className={`${loud} border-2`} style={{ borderColor: p.text }}>Resume</a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <a href={hero.cta_secondary_url} target="_blank" rel="noreferrer" className={`${loud} border-2`} style={{ borderColor: p.text }}>{hero.cta_secondary_text}</a>
              )}
            </div>
          </div>

          {hero?.background_url && (
            <SafeImg src={hero.background_url} alt="" className="mt-16 w-full aspect-[16/7] object-cover" />
          )}
        </section>

        {/* Work */}
        {projects.length > 0 && (
          <section id="work" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Work</Title>
            <ol className="space-y-16 sm:space-y-20">
              {projects.map((proj: TemplateItem, i: number) => (
                <li key={proj.id ?? i} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                  <div className={proj.image_url ? 'md:col-span-6 md:order-2' : 'hidden'}>
                    {proj.image_url && <SafeImg src={proj.image_url} alt={proj.title} className="w-full aspect-[4/3] object-cover" />}
                  </div>
                  <div className={proj.image_url ? 'md:col-span-6' : 'md:col-span-9'}>
                    <p className="font-display text-sm font-bold tabular-nums" style={{ color: p.accentText }}>{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] break-words">{proj.title}</h3>
                    <DescText text={proj.description} className="mt-5 text-lg leading-relaxed max-w-[44ch]" style={{ color: p.sub }} />
                    {proj.tech_stack && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {proj.tech_stack.split(',').filter(t => t.trim()).map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} textColor={p.text} size="md" variant="pill" />)}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-sm uppercase tracking-[0.12em]">
                        {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className={underline} style={{ textDecorationColor: ac }}>Live</a>}
                        {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className={underline}>Code</a>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* About — one loud paragraph */}
        {about?.name && (
          <section id="about" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>About</Title>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <p className="font-display text-2xl font-extrabold tracking-[-0.03em]">{about.name}</p>
                {about.title && <p className="mt-1 text-base font-semibold" style={{ color: p.accentText }}>{about.title}</p>}
              </div>
              {about.bio && <p className="md:col-span-8 text-xl sm:text-2xl leading-[1.45] tracking-[-0.01em] whitespace-pre-line">{about.bio}</p>}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section id="experience" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Track record</Title>
            <ol>
              {experience.map((exp: TemplateItem, i: number) => (
                <li key={exp.id ?? i} className="grid grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)] gap-x-8 gap-y-2 py-7 border-t" style={{ borderColor: p.rule }}>
                  <p className="font-display text-xl font-extrabold tabular-nums tracking-tight" style={{ color: p.sub }}>{yr(exp.start_date)}–{yr(exp.end_date) || 'now'}</p>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] leading-tight">
                      {exp.position}{exp.company && <span style={{ color: p.accentText }}> @ {exp.company}</span>}
                    </h3>
                    {descLines(exp.description).length > 0 && (
                      <div className="mt-3 space-y-1.5 text-base leading-relaxed max-w-[60ch]" style={{ color: p.sub }}>
                        <DescItems items={descLines(exp.description)} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section id="skills" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Toolkit</Title>
            <dl className="space-y-10">
              {skills.map((skill: TemplateItem, i: number) => (
                <div key={skill.id ?? i} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                  <dt className="md:col-span-4 font-display text-2xl font-extrabold tracking-[-0.03em]">{skill.title}</dt>
                  <dd className="md:col-span-8 flex flex-wrap gap-2">
                    {skill.skills?.split(',').filter(s => s.trim()).map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} textColor={p.text} size="md" />)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section id="services" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Hire me for</Title>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
              {services.map((svc: TemplateItem, i: number) => (
                <li key={svc.id ?? i} className="border-l-4 pl-5" style={{ borderColor: ac }}>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] leading-tight">{svc.title}</h3>
                  {svc.description && <p className="mt-2 text-base leading-relaxed max-w-[44ch]" style={{ color: p.sub }}>{svc.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section id="testimonials" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Word on the street</Title>
            <div className="space-y-14">
              {testimonials.map((t: TemplateItem, i: number) => (
                <figure key={t.id ?? i}>
                  <blockquote className="font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.02] max-w-[22ch]">
                    <span aria-hidden="true" style={{ color: p.accentText }}>“</span>{t.message}<span aria-hidden="true" style={{ color: p.accentText }}>”</span>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm font-semibold">
                    {t.photo_url && <SafeImg src={t.photo_url} alt={t.name} className="w-11 h-11 object-cover" />}
                    <span>{t.name}{t.position && <span className="font-normal" style={{ color: p.sub }}> — {t.position}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>Proof</Title>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {gallery.map((cert: TemplateItem, i: number) => (
                <li key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full aspect-[4/3] mb-4 overflow-hidden bg-cover bg-center" style={{ backgroundColor: p.surface, backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title} className="w-full h-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <h3 className="font-display text-xl font-extrabold tracking-tight leading-snug">{cert.title}</h3>
                  {cert.issued_date && <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: p.sub }}>{monthYear(cert.issued_date)}</p>}
                  {cert.description && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: p.sub }}>{cert.description}</p>}
                  {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm uppercase tracking-[0.12em] ${underline}`}>View</a>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Custom sections */}
        {custom.length > 0 && custom.map((sec: TemplateItem) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
            <Title p={p}>{sec.title || sec.original_type || 'Section'}</Title>
            {sec.type === 'text' && <p className="text-xl sm:text-2xl leading-[1.45] max-w-[50ch] whitespace-pre-line">{sec.content?.body}</p>}
            {sec.type === 'list' && (
              <ul className="space-y-3 max-w-[56ch]">
                {(sec.content?.items || []).map((item: string, i: number) => (
                  <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] text-lg">
                    <span aria-hidden="true" className="mt-[0.6em] w-2 h-2" style={{ backgroundColor: ac }} />{item}
                  </li>
                ))}
              </ul>
            )}
            {sec.type === 'links' && (
              <ul className="flex flex-wrap gap-3">
                {(sec.content?.links || []).map((link: TemplateItem, i: number) => (
                  <li key={i}><a href={link.url} target="_blank" rel="noreferrer" className={`${loud} border-2`} style={{ borderColor: p.text }}>{link.label}</a></li>
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
                          cardBg={p.isDark ? 'border-white/20' : 'border-black/15'} />
                      </div>
                    );
                  }
                  const c = sec.content;
                  if (c.institution || c.degree || c.field) {
                    return (
                      <div className="border-l-4 pl-5" style={{ borderColor: ac }}>
                        {c.institution && <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em]">{c.institution}</p>}
                        {(c.degree || c.field) && <p className="mt-1 text-lg">{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
                        {(c.start_date || c.end_date) && <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: p.sub }}>{[yr(c.start_date), yr(c.end_date)].filter(Boolean).join('–')}</p>}
                        {c.gpa && <p className="mt-1 text-sm" style={{ color: p.sub }}>GPA {c.gpa}</p>}
                      </div>
                    );
                  }
                  if (c.name || c.issuer) {
                    return (
                      <div className="border-l-4 pl-5" style={{ borderColor: ac }}>
                        {c.name && <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em]">{c.name}</p>}
                        {c.issuer && <p className="mt-1 text-lg">{c.issuer}</p>}
                        {c.date && <p className="mt-1 text-sm font-semibold" style={{ color: p.sub }}>{c.date}</p>}
                        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className={`inline-block mt-3 text-sm uppercase tracking-[0.12em] ${underline}`}>View credential</a>}
                      </div>
                    );
                  }
                  if (c.language) {
                    return <p className="font-display text-3xl font-extrabold tracking-[-0.03em]">{c.language}{c.proficiency && <span className="font-sans text-lg font-semibold" style={{ color: p.sub }}> — {c.proficiency}</span>}</p>;
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

        {/* Contact */}
        <section id="connect" className={`${wrap} ${sectionPad} border-t-4`} style={{ borderColor: p.text }}>
          <h2 className="font-display font-extrabold uppercase tracking-[-0.055em] leading-[0.85] text-[clamp(3rem,12vw,9rem)]">
            Let&apos;s<span className="block" style={{ color: p.accentText }}>talk.</span>
          </h2>
          {email && (
            <a href={`mailto:${email}`} className={`mt-10 inline-block font-display text-2xl sm:text-4xl tracking-[-0.03em] break-all ${underline}`} style={{ textDecorationColor: ac }}>{email}</a>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm uppercase tracking-[0.12em]">
              {socials.map(s => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className={underline}>{s.label}</a></li>)}
            </ul>
          )}
          <div className="mt-14 max-w-lg [&_form]:mx-0">
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={p.text} subColor={p.sub} />
          </div>
        </section>
      </div>

      <footer className={`${wrap} py-8 border-t flex flex-col sm:flex-row gap-2 sm:justify-between text-sm font-semibold`} style={{ borderColor: p.rule, color: p.sub }}>
        <span>© {new Date().getFullYear()} {name}</span>
        <span>Built with PortfolioKit</span>
      </footer>
    </div>
  );
}
