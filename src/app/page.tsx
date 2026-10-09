'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TemplateShowcase from '@/components/TemplateShowcase';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';

const t = {
  login: 'Log in',
  register: 'Sign up',
  kicker: 'Online portfolio, free',
  hero1: 'A portfolio that shows your work,',
  hero2: 'not the template.',
  sub: 'Add your experience, projects, and skills once. Pick one of 17 layouts, then share the link with clients or recruiters. No code, no credit card.',
  cta: 'Build your portfolio',
  demo: 'See an example',
  published: (n: number) => `${n} ${n === 1 ? 'portfolio' : 'portfolios'} published here so far.`,
  howTitle: 'How it works',
  steps: [
    { n: '01', title: 'Add your details', body: 'Profile, experience, projects, skills, certificates. GitHub repos import directly.' },
    { n: '02', title: 'Pick a layout', body: '17 templates. Switch any time and your content moves with you.' },
    { n: '03', title: 'Publish', body: 'Get your own shareable link and a QR code to put on your CV or business card.' },
  ],
  featTitle: "What's already inside",
  features: [
    ['Reorder sections', 'Drag and drop hero, about, experience, projects, contact. Hide what isn\'t ready.'],
    ['Certificates', 'Upload certificates as images or PDFs; visitors can open each one right from your page.'],
    ['Direct contact', 'Visitors can send a message or open a WhatsApp chat.'],
    ['Visit stats', 'See how many people opened your portfolio, per day.'],
    ['Works on phones', 'Every template is checked on small screens, since that\'s where most people open it.'],
    ['CV from your page', 'Download an ATS-friendly CV built from the same content, or import the PDF CV you already have.'],
  ],
  tplTitle: '17 layouts.',
  tplTitle2: 'Same content.',
  tplLink: 'Try them all in the demo →',
  tplHint: 'Click a layout to preview it with sample content.',
  closing: 'Start now, polish it later.',
  closingSub: 'Saving a half-finished page is fine. Nothing is public until you publish it.',
  closingCta: 'Sign up free',
  footer: 'Made by Trias.',
};

const templates = [
  { id: 'modern', name: 'Modern', desc: 'Big name, two-column work list' },
  { id: 'creative', name: 'Creative', desc: 'Printed-portfolio sidebar' },
  { id: 'minimal', name: 'Minimal', desc: 'One narrow column of text' },
  { id: 'bold', name: 'Bold', desc: 'Poster type, solid blocks' },
  { id: 'classic', name: 'Classic', desc: 'Reads like a CV' },
  { id: 'neon', name: 'Neon', desc: 'Night flyer, outlined type' },
  { id: 'glass', name: 'Glass', desc: 'Frosted header over a photo' },
  { id: 'nature', name: 'Nature', desc: 'Field notebook' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Three flat colours' },
  { id: 'retro', name: 'Retro', desc: 'Photocopied zine' },
  { id: 'immersive', name: 'Immersive', desc: 'Full-bleed bands' },
  { id: 'playful', name: 'Playful', desc: 'Sticker book' },
  { id: 'developer', name: 'Developer', desc: 'Terminal / README' },
  { id: 'swiss', name: 'Swiss', desc: 'Strict grid, big numerals' },
  { id: 'white', name: 'White', desc: 'Quiet editorial' },
  { id: 'agency', name: 'Agency', desc: 'Studio case studies' },
  { id: 'boldpersona', name: 'BoldPersona', desc: 'Huge name, personal' },
];


export default function LandingPage() {
  const [count, setCount] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('stats unavailable'))))
      .then(d => setCount(d.portfolios || 0))
      .catch(() => setCount(0)); // hide the number when stats are unavailable
  }, []);

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-display font-semibold text-xl tracking-tight">PortfolioKit</Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link href="/login" className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">{t.login}</Link>
            <Link href="/register" className="rounded-md bg-ink px-3.5 py-2 font-medium text-paper transition-colors hover:bg-black">{t.register}</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
          <div>
            <p className="mb-6 flex items-center gap-3 text-sm text-ink-soft">
              <span className="h-px w-8 bg-accent" />{t.kicker}
            </p>
            <h1 className="font-display font-semibold text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              {t.hero1} <span className="text-accent">{t.hero2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t.sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/register" className="rounded-md bg-accent px-5 py-3 font-medium text-white transition-colors hover:bg-accent-dark">{t.cta}</Link>
              <Link href="/demo" target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-rule decoration-2 underline-offset-[6px] hover:decoration-ink">{t.demo} →</Link>
            </div>
            {count > 0 && <p className="mt-8 text-sm text-ink-soft">{t.published(count)}</p>}
          </div>
          <TemplateShowcase templates={templates} />
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <h2 className="font-display font-semibold text-3xl tracking-tight">{t.howTitle}</h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {t.steps.map(s => (
                <li key={s.n} className="border-t-2 border-ink pt-4">
                  <span className="font-mono text-sm text-accent">{s.n}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-rule bg-paper-deep">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-20">
            <h2 className="font-display font-semibold text-3xl tracking-tight">{t.featTitle}</h2>
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {t.features.map(([title, body]) => (
                <div key={title} className="border-t border-rule py-5">
                  <dt className="font-semibold">{title}</dt>
                  <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display font-semibold text-3xl tracking-tight sm:text-4xl">{t.tplTitle}<br /><span className="text-ink-soft">{t.tplTitle2}</span></h2>
              <Link href="/demo" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent underline-offset-4 hover:underline">{t.tplLink}</Link>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{t.tplHint}</p>
            <ol className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(({ name, desc }, i) => (
                <li key={name} className="border-t border-rule">
                  <button type="button" onClick={() => setPreview(i)} aria-haspopup="dialog"
                    className="group flex w-full items-baseline gap-4 py-3.5 text-left transition-colors hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none">
                    <span className="w-6 shrink-0 font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium underline-offset-4 group-hover:underline">{name}</span>
                    <span className="ml-auto text-right text-sm text-ink-soft">{desc}</span>
                    <span aria-hidden="true" className="w-4 shrink-0 text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
            <h2 className="max-w-2xl font-display font-semibold text-4xl leading-tight tracking-tight sm:text-5xl">{t.closing}</h2>
            <p className="mt-4 max-w-lg text-ink-soft">{t.closingSub}</p>
            <Link href="/register" className="mt-8 inline-block rounded-md bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-black">{t.closingCta}</Link>
          </div>
        </section>
      </main>

      <TemplatePreviewModal templates={templates} index={preview} onIndexChange={setPreview} onClose={() => setPreview(null)} />

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-ink-soft sm:px-8">
          <span>© 2026 PortfolioKit. {t.footer}</span>
          <span className="flex gap-5">
            <Link href="/demo" className="hover:text-ink">Demo</Link>
            <Link href="/login" className="hover:text-ink">{t.login}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
