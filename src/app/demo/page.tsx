'use client';
import { useState } from 'react';
import Link from 'next/link';

const demoTemplates = [
  { id: 'modern', label: 'Modern', desc: 'Big name, two-column work list' },
  { id: 'creative', label: 'Creative', desc: 'Printed-portfolio sidebar' },
  { id: 'minimal', label: 'Minimal', desc: 'One narrow column of text' },
  { id: 'bold', label: 'Bold', desc: 'Poster type, solid blocks' },
  { id: 'classic', label: 'Classic', desc: 'Reads like a CV' },
  { id: 'neon', label: 'Neon', desc: 'Night flyer, outlined type' },
  { id: 'glass', label: 'Glass', desc: 'Frosted header over a photo' },
  { id: 'nature', label: 'Nature', desc: 'Field notebook' },
  { id: 'vibrant', label: 'Vibrant', desc: 'Three flat colours' },
  { id: 'retro', label: 'Retro', desc: 'Photocopied zine' },
  { id: 'immersive', label: 'Immersive', desc: 'Full-bleed bands' },
  { id: 'playful', label: 'Playful', desc: 'Sticker book' },
  { id: 'developer', label: 'Developer', desc: 'Terminal / README' },
  { id: 'swiss', label: 'Swiss', desc: 'Strict grid, big numerals' },
  { id: 'white', label: 'White', desc: 'Quiet editorial' },
  { id: 'agency', label: 'Agency', desc: 'Studio case studies' },
  { id: 'boldpersona', label: 'BoldPersona', desc: 'Huge name, personal' },
];

const demoThemes = [
  { id: 'dark-space', label: 'Dark' },
  { id: 'white', label: 'Light' },
];

export default function DemoPage() {
  const [template, setTemplate] = useState('modern');
  const [theme, setTheme] = useState(demoThemes[0]);
  const current = demoTemplates.find(t => t.id === template);

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans text-ink">
      <header className="shrink-0 border-b border-rule">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">PortfolioKit</Link>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <label htmlFor="demo-template" className="text-sm text-ink-soft">Template</label>
            <select id="demo-template" value={template} onChange={(event) => setTemplate(event.target.value)}
              className="min-w-0 rounded-md border border-rule bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10">
              {demoTemplates.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            {current && <span className="hidden text-sm text-ink-soft md:inline">{current.desc}</span>}

            <div role="radiogroup" aria-label="Theme" className="inline-flex overflow-hidden rounded-md border border-rule bg-white text-sm">
              {demoThemes.map(th => (
                <button type="button" role="radio" key={th.id} aria-checked={theme.id === th.id} onClick={() => setTheme(th)}
                  className={`px-3 py-1.5 transition-colors ${theme.id === th.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}>
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          <Link href="/register" className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
            Make your own
          </Link>
        </div>
      </header>

      <div className="flex-1 bg-paper-deep p-0 sm:p-4">
        <iframe
          key={`${template}-${theme.id}`}
          title={`Sample portfolio using the ${current?.label ?? template} template`}
          src={`/portfolio/demo?preview=true&template=${template}&theme=${theme.id}&demo=alex`}
          className="h-full min-h-[calc(100dvh-7.5rem)] w-full border-0 bg-white sm:min-h-[calc(100dvh-6.5rem)] sm:rounded-md sm:border sm:border-rule"
        />
      </div>
    </div>
  );
}
