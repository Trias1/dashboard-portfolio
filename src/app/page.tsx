'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const translations = {
  id: {
    login: 'Masuk',
    register: 'Daftar Gratis',
    badge: 'Platform portfolio profesional - gratis!',
    hero1: 'Tampilkan dirimu',
    hero2: 'secara profesional.',
    sub: 'Designer, developer, marketer, konsultan - siapapun kamu, portfolio yang kuat membuka lebih banyak peluang.',
    subBold: 'Mulai sekarang, gratis.',
    cta1: 'Buat Portfolio Sekarang',
    cta2: 'Sudah punya akun',
    whyTitle: 'Kenapa PortfolioKit?',
    whySubtitle: 'Semua yang kamu butuhkan sudah tersedia',
    templateTitle: 'Tujuh belas tampilan,',
    templateTitle2: 'satu tujuan',
    templateSub: 'Ganti template kapan saja - data kamu tetap tersimpan',
    demoTitle: 'Lihat contohnya',
    demoSub: 'Begini tampilan portfolio kamu nanti',
    ctaBottom: 'Mulai sekarang,',
    ctaBottom2: 'gratis selamanya.',
    ctaBottomSub: 'Tidak perlu kartu kredit. Tidak ada biaya tersembunyi.',
    ctaBottomBtn: 'Buat Portfolio Gratis',
    footer: 'Dibuat oleh Trias',
  },
  en: {
    login: 'Login',
    register: 'Get Started Free',
    badge: 'Professional portfolio platform - free!',
    hero1: 'Present yourself',
    hero2: 'professionally.',
    sub: 'Designer, developer, marketer, consultant - whoever you are, a strong portfolio opens more opportunities.',
    subBold: 'Start now, for free.',
    cta1: 'Build Your Portfolio',
    cta2: 'Already have an account',
    whyTitle: 'Why PortfolioKit?',
    whySubtitle: 'Everything you need, already here',
    templateTitle: 'Seventeen designs,',
    templateTitle2: 'one purpose',
    templateSub: 'Switch templates anytime - your data stays intact',
    demoTitle: 'See it in action',
    demoSub: 'This is how your portfolio will look',
    ctaBottom: 'Start now,',
    ctaBottom2: 'free forever.',
    ctaBottomSub: 'No credit card required. No hidden fees.',
    ctaBottomBtn: 'Build Portfolio Free',
    footer: 'Made by Trias',
  }
};

const features = {
  id: [
    { icon: 'templates', title: '17 Template Pilihan', desc: 'Modern, Creative, Minimal, Bold, Classic, Neon, Glass, Nature, Vibrant, Retro, Immersive, Playful, Developer, Swiss, White, Agency, BoldPersona - banyak pilihan sesuai karaktermu' },
    { icon: 'ai', title: 'AI Auto-fill', desc: 'Tidak tahu harus menulis apa? AI kami bantu isi bio, skill, hingga deskripsi layananmu' },
    { icon: 'publish', title: 'Publish Instan', desc: 'Satu klik publish, langsung online dan siap dibagikan ke siapa saja' },
    { icon: 'certificate', title: 'Upload Sertifikat', desc: 'Upload sertifikat PDF, otomatis tampil sebagai preview gambar yang rapi' },
    { icon: 'contact', title: 'WA & Email Contact', desc: 'Pengunjung bisa langsung hubungi kamu via WhatsApp atau email' },
    { icon: 'mobile', title: 'Mobile Friendly', desc: 'Tampil sempurna di semua perangkat, dari smartphone hingga desktop' },
  ],
  en: [
    { icon: 'templates', title: '17 Templates', desc: 'Modern, Creative, Minimal, Bold, Classic, Neon, Glass, Nature, Vibrant, Retro, Immersive, Playful, Developer, Swiss, White, Agency, BoldPersona - pick the one that fits you' },
    { icon: 'ai', title: 'AI Auto-fill', desc: "Don't know what to write? Our AI helps fill your bio, skills, and service descriptions" },
    { icon: 'publish', title: 'Instant Publish', desc: 'One click to publish, instantly online and ready to share' },
    { icon: 'certificate', title: 'Certificate Upload', desc: 'Upload PDF certificates, automatically displayed as a clean image preview' },
    { icon: 'contact', title: 'WA & Email Contact', desc: 'Visitors can directly contact you via WhatsApp or email' },
    { icon: 'mobile', title: 'Mobile Friendly', desc: 'Looks great on all devices, from smartphone to desktop' },
  ]
};

const featureIconPaths: Record<string, string> = {
  templates: 'M4 5h6v6H4z M14 5h6v6h-6z M4 15h6v4H4z M14 15h6v4h-6z',
  ai: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8z M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z',
  publish: 'M12 16V4 M7 9l5-5 5 5 M5 14v5h14v-5',
  certificate: 'M6 3h12v13H6z M9 7h6 M9 11h4 M12 16l-3 5v-3H7l3-2 M12 16l3 5v-3h2l-3-2',
  contact: 'M4 5h16v12H7l-3 3z M7 8l5 4 5-4',
  mobile: 'M8 2h8v20H8z M11 18h2',
};

function FeatureIcon({ name }: { name: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d={featureIconPaths[name]} /></svg>;
}

const templates = {
  id: [
    { name: 'Modern', desc: 'Elegan, gelap, dan dinamis. Cocok untuk semua profesi teknis dan kreatif.' },
    { name: 'Creative', desc: 'Layout sidebar yang bersih dan editorial. Berkesan tanpa berlebihan.' },
    { name: 'Minimal', desc: 'Fokus pada tipografi. Sederhana, namun berkarakter kuat.' },
    { name: 'Bold', desc: 'Vibrant gradient & neon glow. Berani dan menonjol.' },
    { name: 'Classic', desc: 'Card profesional, clean, dan terstruktur rapi.' },
    { name: 'Neon', desc: 'Cyberpunk, grid, dan neon glow yang futuristik.' },
    { name: 'Glass', desc: 'Glassmorphism dengan blur dan efek transparan.' },
    { name: 'Nature', desc: 'Nada earthy, organik, dan warna hangat alami.' },
    { name: 'Vibrant', desc: 'Penuh warna, playful, dan animasi bouncy.' },
    { name: 'Retro', desc: 'Vintage dengan sentuhan monospace dan dot grid.' },
    { name: 'Immersive', desc: 'Fullscreen dengan parallax dan efek dramatis.' },
    { name: 'Playful', desc: 'Micro-interactions, playful, dan penuh animasi lucu.' },
    { name: 'Developer', desc: 'Terminal styled dengan estetika coding.' },
    { name: 'Swiss', desc: 'Bold color blocks dan grid Swiss yang ikonik.' },
    { name: 'White', desc: 'Bersih, terang, dan minimal. Fokus pada konten.' },
    { name: 'Agency', desc: 'Tampilan profesional ala agency kreatif.' },
    { name: 'BoldPersona', desc: 'Tipografi raksasa dan kesan personal yang kuat.' },
  ],
  en: [
    { name: 'Modern', desc: 'Elegant, dark, and dynamic. Perfect for technical and creative professions.' },
    { name: 'Creative', desc: 'Clean sidebar layout, editorial feel. Impressive without being excessive.' },
    { name: 'Minimal', desc: 'Typography-focused. Simple, yet strong in character.' },
    { name: 'Bold', desc: 'Vibrant gradient & neon glow. Bold and standout.' },
    { name: 'Classic', desc: 'Professional cards, clean and well-structured.' },
    { name: 'Neon', desc: 'Cyberpunk, grid, and futuristic neon glow.' },
    { name: 'Glass', desc: 'Glassmorphism with blur and transparent effects.' },
    { name: 'Nature', desc: 'Earthy tones, organic, and warm natural colors.' },
    { name: 'Vibrant', desc: 'Colorful, playful, with bouncy animations.' },
    { name: 'Retro', desc: 'Vintage with monospace and dot grid charm.' },
    { name: 'Immersive', desc: 'Fullscreen with parallax and dramatic effects.' },
    { name: 'Playful', desc: 'Micro-interactions, playful, with fun animations.' },
    { name: 'Developer', desc: 'Terminal styled with coding aesthetics.' },
    { name: 'Swiss', desc: 'Bold color blocks and iconic Swiss grid.' },
    { name: 'White', desc: 'Clean, bright, and minimal. Content-focused.' },
    { name: 'Agency', desc: 'Professional creative agency look.' },
    { name: 'BoldPersona', desc: 'Giant typography with strong personal branding.' },
  ]
};
export default function LandingPage() {
  const [count, setCount] = useState(0);
  const [lang, setLang] = useState<'id'|'en'>('id');

  const t = translations[lang];
  const f = features[lang];
  const tmpl = templates[lang];
  const ac = '#a855f7';

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => setCount(d.portfolios || 0))
      .catch(() => setCount(42));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a1a', color: '#fff' }}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ backgroundColor: '#0a0a1acc', borderColor: '#a855f720' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>P</div>
            <span className="font-bold text-white">PortfolioKit</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="text-xs px-3 py-1.5 rounded-full border transition hover:border-purple-500"
              style={{ borderColor: '#a855f730', color: '#aaa' }}>
               {lang.toUpperCase()}
            </button>
            <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition">{t.login}</Link>
            <Link href="/register"
              className="text-sm px-4 py-2 rounded-full font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: ac }}>
              {t.register}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ backgroundColor: '#a855f7' }} />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ backgroundColor: '#06b6d4', animationDelay: '1.5s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{ borderColor: '#a855f730', backgroundColor: '#a855f710', color: '#a855f7' }}>
             {count > 0 ? `${count} portfolio sudah dibuat` : t.badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t.hero1}<br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t.hero2}
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            {t.sub} <span className="text-white font-medium">{t.subBold}</span>
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <Link href="/register"
              className="px-8 py-4 rounded-full font-semibold text-white text-lg transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>
              {t.cta1}
            </Link>
            <Link href="/login"
              className="px-8 py-4 rounded-full font-semibold border transition hover:border-purple-500"
              style={{ borderColor: '#a855f730', color: '#aaa' }}>
              {t.cta2}
            </Link>
            <Link href="/demo" target="_blank"
              className="px-8 py-4 rounded-full font-semibold border transition hover:border-purple-500"
              style={{ borderColor: '#a855f730', color: '#aaa' }}>
              {lang === 'id' ? 'Lihat Demo' : 'View Demo'}
            </Link>
          </motion.div>
        </div>
      </section>



      {/* Features */}
      <section className="py-24 px-6" style={{ backgroundColor: 'rgba(168,85,247,0.03)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: ac }}>{t.whyTitle}</p>
            <h2 className="text-3xl md:text-4xl font-bold">{t.whySubtitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {f.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: 'rgba(168,85,247,0.05)', borderColor: '#a855f720' }}>
                <div className="mb-3 text-purple-300"><FeatureIcon name={feat.icon} /></div>
                <h3 className="font-bold mb-2 text-white">{feat.title}</h3>
                <p className="text-sm text-gray-400">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: ac }}>Templates</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.templateTitle}<br />{t.templateTitle2}</h2>
          <p className="text-gray-400 mb-12">{t.templateSub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tmpl.map((tp, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168,85,247,0.15)' }}
                className="p-8 rounded-2xl border cursor-pointer transition-all"
                style={{ backgroundColor: '#0f0f2a', borderColor: '#a855f730' }}>
                <p className="text-xl font-bold mb-3 text-white">{tp.name}</p>
                <p className="text-sm text-gray-400">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t.ctaBottom}<br />{t.ctaBottom2}
          </h2>
          <p className="text-gray-400 mb-10">{t.ctaBottomSub}</p>
          <Link href="/register"
            className="inline-block px-10 py-4 rounded-full font-semibold text-white text-lg transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>
            {t.ctaBottomBtn}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t text-xs text-gray-600" style={{ borderColor: '#a855f720' }}>
        (c) 2026 PortfolioKit. {t.footer}
      </footer>
    </div>
  );
}


