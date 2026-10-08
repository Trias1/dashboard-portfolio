'use client';
import type { TemplateData, TemplateItem, TemplateSectionOrder, ThemeConfig } from '@/types';
import type { ReactNode, SyntheticEvent } from 'react';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

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
  const ink: RGB = dark ? [245, 244, 240] : [14, 14, 16];
  const white: RGB = [255, 255, 255];
  const black: RGB = [14, 14, 16];
  const onAccent = contrast(white, ac) >= contrast(black, ac) ? white : black;
  return {
    dark,
    bg: toHex(bg),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.38), bg, ink)),
    rule: toHex(mix(ink, bg, 0.8)),
    accent: toHex(readable(ac, bg, ink)),
    block: toHex(ac),
    onBlock: toHex(onAccent),
    onBlockMuted: toHex(readable(mix(onAccent, ac, 0.3), ac, onAccent)),
  };
}
type Palette = ReturnType<typeof makePalette>;

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';
const NAV = ['about', 'experience', 'projects', 'services', 'contact'];
const PAD = 'px-5 sm:px-8 lg:px-12';

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
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;
const slugId = (sec: TemplateItem) => `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;

/** Poster headline. */
function Big({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-[clamp(2.6rem,9vw,7rem)] leading-[0.88] font-extrabold uppercase tracking-[-0.035em] break-words ${className}`}>
      {children}
    </h2>
  );
}

function Btn({ href, children, fg, bg, outline, external, ring }: { href?: string; children: ReactNode; fg: string; bg: string; outline?: boolean; external?: boolean; ring: string }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`inline-block border-2 px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors duration-150 motion-reduce:transition-none ${FOCUS}`}
      style={outline ? { borderColor: fg, color: fg, outlineColor: ring } : { borderColor: fg, backgroundColor: fg, color: bg, outlineColor: ring }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[60ch] text-xl leading-relaxed whitespace-pre-line">{c?.body}</p>;
  if (sec.type === 'list') return (
    <ul className="border-t-2" style={{ borderColor: p.text }}>
      {(c?.items || []).map((item, i) => (
        <li key={i} className="border-b py-4 text-lg font-medium" style={{ borderColor: p.rule }}>{item}</li>
      ))}
    </ul>
  );
  if (sec.type === 'cards') return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(c?.cards || []).map((card, i) => (
        <div key={i} className="border-2 p-6" style={{ borderColor: p.text }}>
          <h3 className="text-xl font-extrabold uppercase tracking-tight">{card.title}</h3>
          {card.desc && <p className="mt-2 leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
        </div>
      ))}
    </div>
  );
  if (sec.type === 'links') return (
    <div className="flex flex-wrap gap-3">
      {(c?.links || []).map((link, i) => <Btn key={i} href={link.url} fg={p.block} bg={p.onBlock} ring={p.text} external>{link.label}</Btn>)}
    </div>
  );
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <CertificationSection items={c.items} accentColor={p.accent}
        textColor={p.dark ? 'text-neutral-50' : 'text-neutral-950'}
        subTextColor={p.dark ? 'text-neutral-300' : 'text-neutral-700'}
        cardBg={p.dark ? 'border-white/40 bg-transparent' : 'border-neutral-900 bg-transparent'} />
    );
  }
  const box = 'border-2 p-6';
  if (c.institution || c.degree || c.field) {
    return (
      <div className={box} style={{ borderColor: p.text }}>
        {c.institution && <p className="text-2xl font-extrabold uppercase tracking-tight">{c.institution}</p>}
        {(c.degree || c.field) && <p className="mt-1 text-lg">{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
        {(c.start_date || c.end_date) && <p className="mt-2 font-mono text-sm" style={{ color: p.muted }}>{[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' — ')}</p>}
        {c.gpa && <p className="font-mono text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
      </div>
    );
  }
  if (c.name || c.issuer) {
    return (
      <div className={box} style={{ borderColor: p.text }}>
        {c.name && <p className="text-2xl font-extrabold uppercase tracking-tight">{c.name}</p>}
        {c.issuer && <p className="mt-1 text-lg">{c.issuer}</p>}
        {c.date && <p className="mt-2 font-mono text-sm" style={{ color: p.muted }}>{c.date}</p>}
        {c.credential_url && <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-block font-bold underline underline-offset-4 ${FOCUS}`} style={{ color: p.accent }}>View credential</a>}
      </div>
    );
  }
  if (c.language) {
    return (
      <p className="text-3xl font-extrabold uppercase tracking-tight">
        {c.language}{c.proficiency && <span className="ml-3 align-middle text-base font-bold" style={{ color: p.accent }}>{c.proficiency}</span>}
      </p>
    );
  }
  return c.body ? <p className="max-w-[60ch] text-xl leading-relaxed">{c.body}</p> : null;
}

export default function BoldTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const name = about?.name || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;
  const contactEnabled = data.portfolio?.sections_order?.find((section: TemplateSectionOrder) => section.type === 'contact')?.enabled !== false;

  return (
    <div className="min-h-screen overflow-x-clip font-sans antialiased" style={{ backgroundColor: p.bg, color: p.text }} data-preview={isPreview ? 'true' : undefined}>
      <main>
      {/* Hero — one solid accent block */}
      <section id="hero" className={`flex min-h-[88vh] flex-col ${PAD} pt-5 pb-10`} style={{ backgroundColor: p.block, color: p.onBlock }}>
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 pb-4" style={{ borderColor: p.onBlock }}>
          <span className="text-sm font-extrabold uppercase tracking-wide">{name}</span>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold uppercase tracking-wide">
            {NAV.map((s) => <a key={s} href={`#${s}`} className={`underline-offset-4 hover:underline ${FOCUS}`} style={{ outlineColor: p.onBlock }}>{s}</a>)}
          </nav>
        </header>

        <div className="flex flex-1 flex-col justify-center py-12">
          {hero?.greeting && <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em]">{hero.greeting}</p>}
          <h1 className="font-display text-[clamp(3rem,12.5vw,11rem)] leading-[0.84] font-extrabold uppercase tracking-[-0.045em] break-words">
            {hero?.headline || about?.name || portfolio.title}
          </h1>
        </div>

        <div className="grid items-end gap-8 border-t-2 pt-6 md:grid-cols-[1fr_auto]" style={{ borderColor: p.onBlock }}>
          <div className="flex items-end gap-6">
            {hero?.background_url && <img src={hero.background_url} alt="" className="hidden h-28 w-40 flex-shrink-0 object-cover sm:block" />}
            {hero?.subheadline && <p className="max-w-[34ch] text-xl leading-snug font-semibold md:text-2xl">{hero.subheadline}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <Btn href={hero?.cta_url || '#projects'} fg={p.onBlock} bg={p.block} ring={p.onBlock}>{hero?.cta_text || 'See the work'}</Btn>
            {about?.cv_url && <Btn href={about.cv_url} fg={p.onBlock} bg={p.block} ring={p.onBlock} outline external>Download CV</Btn>}
            {hero?.cta_secondary_text && hero?.cta_secondary_url && (
              <Btn href={hero.cta_secondary_url} fg={p.onBlock} bg={p.block} ring={p.onBlock} outline external>{hero.cta_secondary_text}</Btn>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      {about?.name && (
        <section id="about" className={`${PAD} py-20 md:py-28`}>
          <Big>Who I am</Big>
          <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr]">
            {about.photo_url && (
              <div className="w-full max-w-[20rem] p-3" style={{ backgroundColor: p.block }}>
                <img src={about.photo_url} alt={about.name} className="aspect-square w-full object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-3xl font-extrabold uppercase tracking-tight">{about.name}</p>
              {about.title && <p className="mt-1 text-lg font-semibold" style={{ color: p.accent }}>{about.title}</p>}
              {about.bio && <p className="mt-6 max-w-[58ch] text-xl leading-relaxed whitespace-pre-line">{about.bio}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Skills — inverted block */}
      {skills.length > 0 && (
        <section id="skills" className={`${PAD} py-20 md:py-28`} style={{ backgroundColor: p.text, color: p.bg }}>
          <Big>Skills &amp; tools</Big>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {skills.map((skill, i) => (
              <div key={skill.id ?? i}>
                {skill.title && <h3 className="mb-4 border-b-2 pb-2 text-lg font-extrabold uppercase tracking-wide" style={{ borderColor: p.bg }}>{skill.title}</h3>}
                <div className="flex flex-wrap gap-2">
                  {skill.skills?.split(',').filter((s) => s.trim()).map((s) => (
                    <TechBadge key={s} name={s.trim()} accentColor={p.bg} size="md" variant="outline" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section id="experience" className={`${PAD} py-20 md:py-28`}>
          <Big>Experience</Big>
          <ol className="mt-12 border-t-2" style={{ borderColor: p.text }}>
            {experience.map((exp, i) => (
              <li key={exp.id ?? i} className="grid gap-4 border-b-2 py-8 md:grid-cols-[16rem_1fr] md:gap-10" style={{ borderColor: p.text }}>
                <p className="font-display text-4xl leading-none font-extrabold tracking-tight tabular-nums md:text-5xl">
                  {year(exp.start_date)}<span style={{ color: p.accent }}>–</span>{exp.end_date ? year(exp.end_date).slice(2) : 'NOW'}
                </p>
                <div className="min-w-0">
                  <h3 className="text-2xl font-extrabold uppercase tracking-tight">{exp.position}</h3>
                  <p className="mt-1 text-lg font-semibold" style={{ color: p.accent }}>{exp.company}</p>
                  {bullets(exp.description).length > 0 && (
                    <ul className="mt-4 max-w-[62ch] space-y-1.5 text-lg leading-relaxed">
                      {bullets(exp.description).map((b, j) => <li key={j} className="flex gap-3"><span aria-hidden="true" className="font-bold" style={{ color: p.accent }}>/</span><span>{b}</span></li>)}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projects" className={`${PAD} py-20 md:py-28`}>
          <Big>Work</Big>
          <ol className="mt-12 space-y-20">
            {projects.map((proj, i) => (
              <li key={proj.id ?? i} className="grid gap-6 md:grid-cols-[9rem_1fr]">
                <span aria-hidden="true" className="font-display text-[5rem] leading-[0.8] font-extrabold tracking-tighter md:text-[7rem]" style={{ color: p.accent }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-4xl leading-[0.95] font-extrabold uppercase tracking-tight break-words md:text-5xl">{proj.title}</h3>
                  {proj.image_url && <img src={proj.image_url} alt={proj.title || ''} className="mt-6 aspect-[16/9] w-full object-cover" />}
                  {proj.description && <p className="mt-5 max-w-[58ch] text-xl leading-relaxed">{proj.description}</p>}
                  {proj.tech_stack && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                        <TechBadge key={t} name={t.trim()} accentColor={p.text} variant="outline" />
                      ))}
                    </div>
                  )}
                  {(proj.demo_url || proj.github_url) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {proj.demo_url && <Btn href={proj.demo_url} fg={p.block} bg={p.onBlock} ring={p.text} external>Live demo</Btn>}
                      {proj.github_url && <Btn href={proj.github_url} fg={p.text} bg={p.bg} ring={p.text} outline external>Source code</Btn>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Services — accent block */}
      {services.length > 0 && (
        <section id="services" className={`${PAD} py-20 md:py-28`} style={{ backgroundColor: p.block, color: p.onBlock }}>
          <Big>What I do</Big>
          <ol className="mt-12 border-t-2" style={{ borderColor: p.onBlock }}>
            {services.map((svc, i) => (
              <li key={svc.id ?? i} className="grid gap-3 border-b-2 py-7 md:grid-cols-[5rem_1fr_1fr] md:gap-8" style={{ borderColor: p.onBlock }}>
                <span className="font-display text-3xl font-extrabold">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{svc.title}</h3>
                {svc.description && <p className="text-lg leading-relaxed" style={{ color: p.onBlockMuted }}>{svc.description}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className={`${PAD} py-20 md:py-28`}>
          <Big>Kind words</Big>
          <div className="mt-12 space-y-16">
            {testimonials.map((t, i) => (
              <figure key={t.id ?? i} className="max-w-5xl">
                <blockquote className="font-display text-3xl leading-[1.1] font-bold tracking-tight md:text-5xl">“{t.message}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  {t.photo_url && <img src={t.photo_url} alt={t.name || ''} className="h-12 w-12 object-cover" />}
                  <span className="text-sm font-bold uppercase tracking-wide">{t.name}{t.position && <span style={{ color: p.accent }}> / {t.position}</span>}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Custom sections */}
      {custom.map((sec, i) => (
        <section key={sec.id ?? i} id={slugId(sec)} className={`${PAD} py-20 md:py-28`}>
          <Big className="mb-12">{sec.title || sec.original_type || 'More'}</Big>
          <CustomBody sec={sec} p={p} />
        </section>
      ))}

      {/* Certificates */}
      {gallery.length > 0 && (
        <section id="gallery" className={`${PAD} py-20 md:py-28`}>
          <Big>Certificates</Big>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((cert, i) => (
              <div key={cert.id ?? i} className="border-2" style={{ borderColor: p.text }}>
                {(cert.image_url || cert.file_url) && (
                  <div className="aspect-[4/3] overflow-hidden border-b-2" style={{ borderColor: p.text, backgroundColor: p.block }}>
                    <img src={cert.image_url || cert.file_url} alt={cert.title || ''} className="h-full w-full object-cover"
                      onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-extrabold uppercase tracking-tight">{cert.title}</h3>
                  {cert.issued_date && <p className="mt-1 font-mono text-sm" style={{ color: p.muted }}>{fmtDate(cert.issued_date)}</p>}
                  {cert.description && <p className="mt-2 leading-relaxed">{cert.description}</p>}
                  {cert.file_url && (
                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-block font-bold uppercase tracking-wide underline underline-offset-4 ${FOCUS}`} style={{ color: p.accent }}>
                      View certificate
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact — accent block */}
      {contactEnabled && (
        <section id="contact" className={`${PAD} py-20 md:py-28`} style={{ backgroundColor: p.block, color: p.onBlock }}>
          <Big>Let&apos;s make something</Big>
          {email && (
            <a href={`mailto:${email}`} className={`mt-10 inline-block font-display text-2xl font-extrabold break-all underline decoration-4 underline-offset-[6px] md:text-4xl ${FOCUS}`} style={{ outlineColor: p.onBlock }}>
              {email}
            </a>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {contact?.phone && <Btn href={waLink(contact.phone, about?.name)} fg={p.onBlock} bg={p.block} ring={p.onBlock} outline external>WhatsApp</Btn>}
            {contact?.linkedin_url && <Btn href={contact.linkedin_url} fg={p.onBlock} bg={p.block} ring={p.onBlock} outline external>LinkedIn</Btn>}
            {contact?.github_url && <Btn href={contact.github_url} fg={p.onBlock} bg={p.block} ring={p.onBlock} outline external>GitHub</Btn>}
          </div>
          <div className="mt-12 max-w-2xl p-6 sm:p-8" style={{ backgroundColor: p.bg, color: p.text }}>
            <p className="mb-5 text-sm font-extrabold uppercase tracking-wide">Or send a message</p>
            <ContactForm slug={portfolio.slug} accentColor={p.accent} textColor={p.text} subColor={p.muted} />
          </div>
        </section>
      )}

      </main>

      <footer className={`flex flex-wrap justify-between gap-2 ${PAD} py-6 text-sm font-bold uppercase tracking-wide`} style={{ backgroundColor: p.text, color: p.bg }}>
        <span>© {new Date().getFullYear()} {name}</span>
        <span>Made with PortfolioKit</span>
      </footer>
    </div>
  );
}
