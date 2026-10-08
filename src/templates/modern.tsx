'use client';
import type { TemplateData, TemplateItem, ThemeConfig } from '@/types';
import type { ReactNode, SyntheticEvent } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import SafeImg from '@/components/SafeImg';
import DescText from '@/components/DescText';

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
  const ink: RGB = dark ? [242, 242, 238] : [17, 17, 19];
  return {
    dark,
    bg: toHex(bg),
    text: toHex(ink),
    muted: toHex(readable(mix(ink, bg, 0.42), bg, ink)),
    rule: toHex(mix(ink, bg, 0.84)),
    surface: toHex(mix(ink, bg, 0.95)),
    accent: toHex(readable(ac, bg, ink)),
  };
}

/* ------------------------------------------------------------------ */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2';
const NAV = ['about', 'experience', 'projects', 'services', 'contact'];

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
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
const waLink = (phone: string, name?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`;
const slugId = (sec: TemplateItem) => `custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`;

type Palette = ReturnType<typeof makePalette>;

function Block({ id, label, p, children }: { id: string; label: string; p: Palette; children: ReactNode }) {
  return (
    <section id={id} className="border-b scroll-mt-16" style={{ borderColor: p.rule }}>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:px-8 md:grid-cols-12 md:gap-8 md:py-24">
        <h2 className="text-sm font-medium md:col-span-3" style={{ color: p.muted }}>{label}</h2>
        <div className="min-w-0 md:col-span-9">{children}</div>
      </div>
    </section>
  );
}

function TextLink({ href, children, p, external }: { href?: string; children: ReactNode; p: Palette; external?: boolean }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      className={`underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-150 hover:decoration-2 motion-reduce:transition-none ${FOCUS}`}
      style={{ color: p.accent, outlineColor: p.accent }}>
      {children}
    </a>
  );
}

function CustomBody({ sec, p }: { sec: TemplateItem; p: Palette }) {
  const c = sec.content;
  if (sec.type === 'text') return <p className="max-w-[65ch] text-lg leading-relaxed whitespace-pre-line" style={{ color: p.text }}>{c?.body}</p>;
  if (sec.type === 'list') return (
    <ul className="max-w-[65ch]">
      {(c?.items || []).map((item, i) => (
        <li key={i} className="border-t py-3 first:border-t-0 first:pt-0" style={{ borderColor: p.rule }}>{item}</li>
      ))}
    </ul>
  );
  if (sec.type === 'cards') return (
    <div className="grid gap-x-8 sm:grid-cols-2">
      {(c?.cards || []).map((card, i) => (
        <div key={i} className="border-t py-5" style={{ borderColor: p.rule }}>
          <h3 className="font-medium">{card.title}</h3>
          {card.desc && <p className="mt-1 text-sm leading-relaxed" style={{ color: p.muted }}>{card.desc}</p>}
        </div>
      ))}
    </div>
  );
  if (sec.type === 'links') return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {(c?.links || []).map((link, i) => <li key={i}><TextLink href={link.url} p={p} external>{link.label}</TextLink></li>)}
    </ul>
  );
  if (!c) return null;
  if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(c.items)) {
    return (
      <CertificationSection items={c.items} accentColor={p.accent}
        textColor={p.dark ? 'text-neutral-100' : 'text-neutral-900'}
        subTextColor={p.dark ? 'text-neutral-400' : 'text-neutral-600'}
        cardBg={p.dark ? 'border-white/10 bg-white/[0.03]' : 'border-neutral-200 bg-white'} />
    );
  }
  const heading = c.institution || c.name || c.language || c.area || c.title;
  if (heading || c.degree || c.field || c.issuer || c.proficiency) {
    return (
      <div className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6">
        <p className="font-mono text-sm tabular-nums" style={{ color: p.muted }}>
          {[c.start_date?.slice(0, 7), c.end_date?.slice(0, 7)].filter(Boolean).join(' — ') || c.date}
        </p>
        <div>
          {c.institution && <p className="text-lg font-medium">{c.institution}</p>}
          {(c.degree || c.field) && <p className="mt-0.5" style={{ color: p.muted }}>{[c.degree, c.field].filter(Boolean).join(', ')}</p>}
          {c.gpa && <p className="mt-1 font-mono text-sm" style={{ color: p.muted }}>GPA {c.gpa}</p>}
          {c.name && <p className="text-lg font-medium">{c.name}</p>}
          {c.issuer && <p className="mt-0.5" style={{ color: p.muted }}>{c.issuer}</p>}
          {c.language && <p className="text-lg font-medium">{c.language}{c.proficiency && <span className="font-normal" style={{ color: p.muted }}> — {c.proficiency}</span>}</p>}
          {!c.language && c.proficiency && <p style={{ color: p.muted }}>{c.proficiency}</p>}
          {c.area && <p className="text-lg font-medium">{c.area}</p>}
          {c.description && <p className="mt-2 max-w-[65ch] leading-relaxed" style={{ color: p.muted }}>{c.description}</p>}
          {c.credential_url && <p className="mt-2 text-sm"><TextLink href={c.credential_url} p={p} external>View credential</TextLink></p>}
        </div>
      </div>
    );
  }
  return c.body ? <p className="max-w-[65ch] text-lg leading-relaxed" style={{ color: p.text }}>{c.body}</p> : null;
}

export default function ModernTemplate({ data, theme, isPreview }: { data: TemplateData; theme: ThemeConfig; isPreview?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const hiddenSections = (searchParams.get('hidden') || '').split(',').filter(Boolean);
  const isVisible = (type: string) => !hiddenSections.includes(type);

  const { portfolio, hero, about, experience = [], projects = [], services = [], skills = [], testimonials = [], contact, gallery = [], custom = [] } = data;
  const p = makePalette(theme);
  const displayName = about?.name || portfolio.title || 'Portfolio';
  const email = contact?.email || about?.email;
  const hasBgImage = !!hero?.background_url;
  const heroText = hasBgImage ? '#ffffff' : p.text;
  const heroMuted = hasBgImage ? '#e5e5e5' : p.muted;
  const heroRule = hasBgImage ? 'rgba(255,255,255,0.3)' : p.rule;

  return (
    <div className="min-h-screen overflow-x-clip font-sans antialiased" style={{ backgroundColor: p.bg, color: p.text }} data-preview={isPreview ? 'true' : undefined}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: p.bg, borderColor: p.rule }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#hero" className={`font-display text-base font-semibold tracking-tight ${FOCUS}`} style={{ outlineColor: p.accent }}>{displayName}</a>
          <nav aria-label="Sections" className="hidden gap-7 md:flex">
            {NAV.map((s) => (
              <a key={s} href={`#${s}`} className={`text-sm capitalize underline-offset-4 hover:underline ${FOCUS}`}
                style={{ color: p.muted, outlineColor: p.accent }}>{s}</a>
            ))}
          </nav>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="modern-menu"
            className={`rounded-[4px] border px-3 py-1.5 text-sm md:hidden ${FOCUS}`} style={{ borderColor: p.rule, outlineColor: p.accent }}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <nav aria-label="Sections" className="border-t px-5 pb-3 md:hidden" style={{ borderColor: p.rule }}>
            {NAV.map((s) => (
              <a key={s} href={`#${s}`} onClick={() => setMenuOpen(false)}
                className={`block border-b py-3 text-sm capitalize last:border-b-0 ${FOCUS}`} style={{ borderColor: p.rule, outlineColor: p.accent }}>{s}</a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="relative border-b" style={{ borderColor: p.rule }}>
          {hasBgImage && (
            <>
              <SafeImg src={hero?.background_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/65" />
            </>
          )}
          <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 md:pt-28 md:pb-20">
            {hero?.greeting && <p className="mb-6 font-mono text-xs uppercase tracking-[0.14em]" style={{ color: heroMuted }}>{hero.greeting}</p>}
            <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] font-semibold tracking-[-0.035em] break-words"
              style={{ color: heroText }}>
              {hero?.headline || about?.name || portfolio.title}
            </h1>
            <div className="mt-12 grid gap-8 border-t pt-6 md:mt-16 md:grid-cols-12" style={{ borderColor: heroRule }}>
              <div className="md:col-span-7">
                {hero?.subheadline && <p className="text-xl leading-snug md:text-2xl" style={{ color: heroText }}>{hero.subheadline}</p>}
                {hero?.description && <p className="mt-3 max-w-[60ch] leading-relaxed" style={{ color: heroMuted }}>{hero.description}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
                <a href={hero?.cta_url || '#projects'}
                  className={`rounded-[4px] px-4 py-2.5 text-sm font-medium transition-opacity duration-150 hover:opacity-85 motion-reduce:transition-none ${FOCUS}`}
                  style={{ backgroundColor: heroText, color: hasBgImage ? '#111111' : p.bg, outlineColor: p.accent }}>
                  {hero?.cta_text || 'View my work'}
                </a>
                {about?.cv_url && (
                  <a href={about.cv_url} target="_blank" rel="noopener noreferrer"
                    className={`rounded-[4px] border px-4 py-2.5 text-sm font-medium ${FOCUS}`} style={{ borderColor: heroRule, color: heroText, outlineColor: p.accent }}>
                    Download CV
                  </a>
                )}
                {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                  <a href={hero.cta_secondary_url} target="_blank" rel="noopener noreferrer"
                    className={`rounded-[4px] border px-4 py-2.5 text-sm font-medium ${FOCUS}`} style={{ borderColor: heroRule, color: heroText, outlineColor: p.accent }}>
                    {hero.cta_secondary_text}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        {isVisible('about') && about?.name && (
          <Block id="about" label="About" p={p}>
            <div className="flex flex-col gap-8 sm:flex-row">
              {about.photo_url && (
                <SafeImg src={about.photo_url} alt={about.name} className="h-40 w-32 flex-shrink-0 rounded-[4px] object-cover" />
              )}
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight">{about.name}</p>
                {about.title && <p className="mt-1" style={{ color: p.muted }}>{about.title}</p>}
                {about.bio && <p className="mt-5 max-w-[65ch] text-lg leading-relaxed whitespace-pre-line">{about.bio}</p>}
              </div>
            </div>
          </Block>
        )}

        {/* Skills */}
        {isVisible('skills') && skills.length > 0 && (
          <Block id="skills" label="Skills" p={p}>
            <div>
              {skills.map((skill, i) => (
                <div key={skill.id ?? i} className="grid gap-3 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-6" style={{ borderColor: p.rule }}>
                  <h3 className="text-sm font-medium">{skill.title || 'Tools'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.skills?.split(',').filter((s) => s.trim()).map((s) => (
                      <TechBadge key={s} name={s.trim()} accentColor={p.text} variant="outline" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Experience */}
        {isVisible('experience') && experience.length > 0 && (
          <Block id="experience" label="Experience" p={p}>
            <ol>
              {experience.map((exp, i) => (
                <li key={exp.id ?? i} className="grid grid-cols-[5.5rem_1fr] gap-4 border-t py-6 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-6" style={{ borderColor: p.rule }}>
                  <p className="pt-1 font-mono text-sm tabular-nums" style={{ color: p.muted }}>
                    {year(exp.start_date)}–{exp.end_date ? year(exp.end_date) : 'Now'}
                  </p>
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium leading-snug">{exp.position}</h3>
                    <p style={{ color: p.muted }}>{exp.company}</p>
                    {bullets(exp.description).length > 0 && (
                      <ul className="mt-3 max-w-[65ch] list-disc space-y-1 pl-4 leading-relaxed marker:text-[0.8em]">
                        {bullets(exp.description).map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* Projects */}
        {isVisible('projects') && projects.length > 0 && (
          <Block id="projects" label="Selected work" p={p}>
            <ol>
              {projects.map((proj, i) => (
                <li key={proj.id ?? i} className="grid gap-6 border-t py-8 first:border-t-0 first:pt-0 md:grid-cols-[1fr_15rem]" style={{ borderColor: p.rule }}>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{proj.title}</h3>
                    <DescText text={proj.description} className="mt-3 max-w-[60ch] leading-relaxed" style={{ color: p.muted }} />
                    {proj.tech_stack && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {proj.tech_stack.split(',').filter((t) => t.trim()).map((t) => (
                          <TechBadge key={t} name={t.trim()} accentColor={p.text} variant="outline" />
                        ))}
                      </div>
                    )}
                    {(proj.demo_url || proj.github_url) && (
                      <p className="mt-4 flex gap-5 text-sm">
                        {proj.demo_url && <TextLink href={proj.demo_url} p={p} external>Live site</TextLink>}
                        {proj.github_url && <TextLink href={proj.github_url} p={p} external>Source</TextLink>}
                      </p>
                    )}
                  </div>
                  {proj.image_url && (
                    <SafeImg src={proj.image_url} alt={proj.title || ''} className="aspect-[4/3] w-full rounded-[4px] border object-cover" style={{ borderColor: p.rule }} />
                  )}
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* Services */}
        {isVisible('services') && services.length > 0 && (
          <Block id="services" label="Services" p={p}>
            <ol>
              {services.map((svc, i) => (
                <li key={svc.id ?? i} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t py-5 first:border-t-0 first:pt-0" style={{ borderColor: p.rule }}>
                  <span className="pt-0.5 font-mono text-sm tabular-nums" style={{ color: p.muted }}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-medium">{svc.title}</h3>
                    {svc.description && <p className="mt-1 max-w-[60ch] leading-relaxed" style={{ color: p.muted }}>{svc.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* Testimonials */}
        {isVisible('testimonials') && testimonials.length > 0 && (
          <Block id="testimonials" label="What people say" p={p}>
            <div className="space-y-12">
              {testimonials.map((t, i) => (
                <figure key={t.id ?? i}>
                  <blockquote className="max-w-[40ch] font-display text-2xl leading-snug tracking-tight md:text-3xl">“{t.message}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm">
                    {t.photo_url && <SafeImg src={t.photo_url} alt={t.name || ''} className="h-9 w-9 rounded-full object-cover" />}
                    <span><span className="font-medium">{t.name}</span>{t.position && <span style={{ color: p.muted }}>, {t.position}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {/* Custom sections */}
        {isVisible('custom') && custom.map((sec, i) => (
          <Block key={sec.id ?? i} id={slugId(sec)} label={sec.title || sec.original_type || 'More'} p={p}>
            <CustomBody sec={sec} p={p} />
          </Block>
        ))}

        {/* Certificates */}
        {isVisible('gallery') && gallery.length > 0 && (
          <Block id="gallery" label="Certificates" p={p}>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((cert, i) => (
                <figure key={cert.id ?? i} className="min-w-0">
                  {(cert.image_url || cert.file_url) && (
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-[4px] border" style={{ borderColor: p.rule, backgroundColor: p.surface }}>
                      <SafeImg src={cert.image_url || cert.file_url} alt={cert.title || ''} className="h-full w-full object-cover"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <figcaption>
                    <h3 className="font-medium">{cert.title}</h3>
                    {cert.issued_date && <p className="mt-0.5 font-mono text-xs" style={{ color: p.muted }}>{fmtDate(cert.issued_date)}</p>}
                    {cert.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{cert.description}</p>}
                    {cert.file_url && <p className="mt-2 text-sm"><TextLink href={cert.file_url} p={p} external>View certificate</TextLink></p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {/* Contact */}
        {isVisible('contact') && (
          <Block id="contact" label="Contact" p={p}>
            <p className="max-w-[30ch] font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Have a project in mind? Let&apos;s talk.
            </p>
            {email && (
              <p className="mt-6 text-lg break-all md:text-xl"><TextLink href={`mailto:${email}`} p={p}>{email}</TextLink></p>
            )}
            <dl className="mt-8 grid max-w-xl gap-x-6 text-sm sm:grid-cols-[8rem_1fr]">
              {contact?.phone && (<><dt className="pt-3" style={{ color: p.muted }}>WhatsApp</dt><dd className="border-b pb-3 sm:pt-3" style={{ borderColor: p.rule }}><TextLink href={waLink(contact.phone, about?.name)} p={p} external>{contact.phone}</TextLink></dd></>)}
              {contact?.linkedin_url && (<><dt className="pt-3" style={{ color: p.muted }}>LinkedIn</dt><dd className="border-b pb-3 sm:pt-3 break-all" style={{ borderColor: p.rule }}><TextLink href={contact.linkedin_url} p={p} external>Profile</TextLink></dd></>)}
              {contact?.github_url && (<><dt className="pt-3" style={{ color: p.muted }}>GitHub</dt><dd className="border-b pb-3 sm:pt-3 break-all" style={{ borderColor: p.rule }}><TextLink href={contact.github_url} p={p} external>Profile</TextLink></dd></>)}
              {contact?.location && (<><dt className="pt-3" style={{ color: p.muted }}>Based in</dt><dd className="border-b pb-3 sm:pt-3" style={{ borderColor: p.rule }}>{contact.location}</dd></>)}
            </dl>
            <div className="mt-12 max-w-lg">
              <ContactForm slug={portfolio.slug} accentColor={p.accent} textColor={p.text} subColor={p.muted} />
            </div>
          </Block>
        )}
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-8 text-sm sm:px-8" style={{ color: p.muted }}>
        <span>© {new Date().getFullYear()} {displayName}</span>
        <span>Made with PortfolioKit</span>
      </footer>
    </div>
  );
}
