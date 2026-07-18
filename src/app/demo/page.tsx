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
  { id: 'dark-space', label: 'Dark bawaan', accent: '#a855f7' },
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
            Buat Portfolio
          </Link>
        </div>

        {/* Row 2: Template + Theme picker */}
        <div className="flex items-center justify-between gap-2">
          {/* Template picker */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl border" style={{ borderColor: '#a855f730' }}>
            {demoTemplates.map(t => (
              <button type="button" key={t.id} onClick={() => setTemplate(t.id)}
                className="py-1 px-2 rounded-full text-xs font-medium transition whitespace-nowrap"
                style={{
                  backgroundColor: template === t.id ? '#a855f7' : 'transparent',
                  color: template === t.id ? '#fff' : '#aaa'
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Theme picker */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {demoThemes.map(th => (
              <button type="button" key={th.id} onClick={() => setTheme(th)}
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
          src={`/portfolio/demo?preview=true&template=${template}&theme=${theme.id}&demo=alex`}
          className="w-full h-full border-0"
          style={{ minHeight: 'calc(100vh - 53px)' }}
        />
      </motion.div>
    </div>
  );
}


