'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const demoTemplates = [
  { id: 'modern', label: 'Modern', desc: 'Dark & dynamic' },
  { id: 'creative', label: 'Creative', desc: 'Sidebar layout' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean typography' },
  { id: 'bold', label: 'Bold', desc: 'Gradient & glow' },
  { id: 'classic', label: 'Classic', desc: 'Professional cards' },
  { id: 'neon', label: 'Neon', desc: 'Cyberpunk vibe' },
  { id: 'glass', label: 'Glass', desc: 'Glassmorphism' },
  { id: 'nature', label: 'Nature', desc: 'Earth tones' },
  { id: 'vibrant', label: 'Vibrant', desc: 'Playful colors' },
  { id: 'retro', label: 'Retro', desc: 'Vintage feel' },
  { id: 'immersive', label: 'Immersive', desc: 'Fullscreen parallax' },
  { id: 'playful', label: 'Playful', desc: 'Micro-interactions' },
  { id: 'developer', label: 'Developer', desc: 'Terminal styled' },
  { id: 'swiss', label: 'Swiss', desc: 'Swiss design' },
  { id: 'white', label: 'White Template', desc: 'Clean light' },
  { id: 'agency', label: 'Agency', desc: 'Agency vibe' },
  { id: 'boldpersona', label: 'BoldPersona', desc: 'Bold branding' },
];

const demoThemes = [
  { id: 'dark-space', label: 'Default Dark', accent: '#a855f7' },
  { id: 'white', label: 'White', accent: '#6366f1' },
];

export default function DemoPage() {
  const [template, setTemplate] = useState('modern');
  const [theme, setTheme] = useState(demoThemes[0]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a1a' }}>

      {/* Navbar */}
      <nav className="flex-shrink-0 border-b px-4 py-3 flex flex-col gap-2"
        style={{ backgroundColor: '#0a0a1acc', borderColor: '#a855f720' }}>

        {/* Row 1: Logo + CTA */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>P</div>
            <span className="font-bold text-white text-sm">PortfolioKit</span>
          </Link>
          <Link href="/register"
            className="text-xs px-4 py-2 rounded-full font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#a855f7' }}>
            Build Portfolio
          </Link>
        </div>

        {/* Row 2: Template + Theme picker */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Template picker */}
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-purple-400/20 bg-white/5 px-3 py-2 sm:max-w-xs">
            <span className="flex-shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">Template</span>
            <select value={template} onChange={(event) => setTemplate(event.target.value)} aria-label="Choose portfolio template"
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-white outline-none">
              {demoTemplates.map((item) => <option key={item.id} value={item.id} className="bg-[#111124]">{item.label} — {item.desc}</option>)}
            </select>
          </label>

          {/* Theme picker */}
          <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
            {demoThemes.map(th => (
              <button type="button" key={th.id} aria-pressed={theme.id === th.id} onClick={() => setTheme(th)}
                title={th.label}
                className="h-8 rounded-full border-2 px-3 text-[11px] font-semibold transition-all"
                style={{
                  backgroundColor: theme.id === th.id ? th.accent : 'transparent',
                  color: theme.id === th.id ? '#fff' : '#aaa',
                  borderColor: theme.id === th.id ? '#fff' : '#ffffff30',
                  transform: theme.id === th.id ? 'scale(1.2)' : 'scale(1)'
                }} >{th.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* iframe full height */}
      <motion.div key={`${template}-${theme.id}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex-1">
        <iframe
          title="Portfolio template demo"
          src={`/portfolio/demo?preview=true&template=${template}&theme=${theme.id}&demo=alex`}
          className="h-full min-h-[calc(100dvh-8rem)] w-full border-0 sm:min-h-[calc(100dvh-5.5rem)]"
        />
      </motion.div>
    </div>
  );
}


