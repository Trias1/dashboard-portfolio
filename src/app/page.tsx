'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const copy = {
  id: {
    login: 'Masuk',
    register: 'Daftar',
    kicker: 'Portfolio online, gratis',
    hero1: 'Portfolio yang menampilkan kerjamu,',
    hero2: 'bukan template-nya.',
    sub: 'Isi pengalaman, proyek, dan skill sekali. Pilih satu dari 17 tampilan, lalu bagikan link-nya ke klien atau HRD. Tidak perlu ngoding, tidak perlu kartu kredit.',
    cta: 'Bikin portfolio',
    demo: 'Lihat contohnya',
    published: (n: number) => `${n} portfolio sudah terbit di sini.`,
    howTitle: 'Cara kerjanya',
    steps: [
      { n: '01', title: 'Isi datamu', body: 'Profil, pengalaman, proyek, skill, sertifikat. Repo GitHub bisa diimpor langsung.' },
      { n: '02', title: 'Pilih tampilan', body: 'Ada 17 template. Ganti kapan saja, isinya ikut pindah tanpa diketik ulang.' },
      { n: '03', title: 'Terbitkan', body: 'Dapat link sendiri yang siap dibagikan. Bisa juga pakai domain milikmu.' },
    ],
    featTitle: 'Yang sudah ada di dalamnya',
    features: [
      ['Atur urutan bagian', 'Seret dan lepas: hero, tentang, pengalaman, proyek, kontak. Sembunyikan yang belum siap.'],
      ['Sertifikat PDF', 'Unggah PDF, tampil sebagai pratinjau yang rapi di halamanmu.'],
      ['Kontak langsung', 'Pengunjung bisa kirim pesan atau langsung chat WhatsApp.'],
      ['Statistik kunjungan', 'Lihat berapa orang yang membuka portfolio kamu, per hari.'],
      ['Enak di HP', 'Semua template dicek di layar kecil, karena kebanyakan orang membukanya dari HP.'],
      ['Domain sendiri', 'Sambungkan domain pribadi kalau sudah punya.'],
    ],
    tplTitle: '17 tampilan.',
    tplTitle2: 'Datamu tetap sama.',
    tplLink: 'Coba semuanya di demo →',
    closing: 'Bikin sekarang, rapikan pelan‑pelan.',
    closingSub: 'Simpan setengah jadi juga boleh. Halamanmu baru tampil ke publik setelah kamu terbitkan.',
    closingCta: 'Daftar gratis',
    footer: 'Dibuat oleh Trias.',
  },
  en: {
    login: 'Log in',
    register: 'Sign up',
    kicker: 'Online portfolio, free',
    hero1: 'A portfolio that shows your work,',
    hero2: 'not the template.',
    sub: 'Add your experience, projects, and skills once. Pick one of 17 layouts, then share the link with clients or recruiters. No code, no credit card.',
    cta: 'Build your portfolio',
    demo: 'See an example',
    published: (n: number) => `${n} portfolios published here so far.`,
    howTitle: 'How it works',
    steps: [
      { n: '01', title: 'Add your details', body: 'Profile, experience, projects, skills, certificates. GitHub repos import directly.' },
      { n: '02', title: 'Pick a layout', body: '17 templates. Switch any time and your content moves with you.' },
      { n: '03', title: 'Publish', body: 'Get your own shareable link, or connect a domain you own.' },
    ],
    featTitle: "What's already inside",
    features: [
      ['Reorder sections', 'Drag and drop hero, about, experience, projects, contact. Hide what isn\'t ready.'],
      ['PDF certificates', 'Upload a PDF and it shows as a clean preview on your page.'],
      ['Direct contact', 'Visitors can send a message or open a WhatsApp chat.'],
      ['Visit stats', 'See how many people opened your portfolio, per day.'],
      ['Works on phones', 'Every template is checked on small screens, since that\'s where most people open it.'],
      ['Custom domain', 'Connect your own domain if you have one.'],
    ],
    tplTitle: '17 layouts.',
    tplTitle2: 'Same content.',
    tplLink: 'Try them all in the demo →',
    closing: 'Start now, polish it later.',
    closingSub: 'Saving a half-finished page is fine. Nothing is public until you publish it.',
    closingCta: 'Sign up free',
    footer: 'Made by Trias.',
  },
};

const templates = {
  id: [
    ['Modern', 'Gelap dan dinamis'], ['Creative', 'Sidebar, nuansa editorial'], ['Minimal', 'Fokus ke tipografi'],
    ['Bold', 'Warna terang, kontras tinggi'], ['Classic', 'Kartu rapi dan terstruktur'], ['Neon', 'Grid ala cyberpunk'],
    ['Glass', 'Panel transparan'], ['Nature', 'Warna tanah yang hangat'], ['Vibrant', 'Penuh warna'],
    ['Retro', 'Monospace dan dot grid'], ['Immersive', 'Layar penuh, parallax'], ['Playful', 'Banyak interaksi kecil'],
    ['Developer', 'Gaya terminal'], ['Swiss', 'Blok warna dan grid tegas'], ['White', 'Terang dan bersih'],
    ['Agency', 'Ala studio kreatif'], ['BoldPersona', 'Huruf besar, sangat personal'],
  ],
  en: [
    ['Modern', 'Dark and dynamic'], ['Creative', 'Sidebar, editorial feel'], ['Minimal', 'Typography first'],
    ['Bold', 'Bright, high contrast'], ['Classic', 'Neat, structured cards'], ['Neon', 'Cyberpunk grid'],
    ['Glass', 'Translucent panels'], ['Nature', 'Warm earthy tones'], ['Vibrant', 'Full of colour'],
    ['Retro', 'Monospace and dot grid'], ['Immersive', 'Full screen, parallax'], ['Playful', 'Lots of small interactions'],
    ['Developer', 'Terminal style'], ['Swiss', 'Colour blocks, strict grid'], ['White', 'Bright and clean'],
    ['Agency', 'Creative studio look'], ['BoldPersona', 'Huge type, very personal'],
  ],
};

// A small hand-built sample page so visitors can picture the result.
function SamplePage() {
  return (
    <div className="relative mx-auto w-full max-w-sm rotate-[1.2deg] rounded-sm border border-rule bg-white p-6 shadow-[6px_8px_0_0_var(--color-paper-deep)]">
      <div className="flex items-center justify-between border-b border-rule pb-3 text-[11px] text-ink-soft">
        <span>rina.portfoliokit.id</span><span>Bandung</span>
      </div>
      <p className="mt-5 font-display font-semibold text-2xl leading-tight">Rina Aprilia</p>
      <p className="text-sm text-ink-soft">Ilustrator & desainer kemasan</p>
      <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
        Enam tahun menggambar untuk label kopi, buku anak, dan UMKM makanan di Jawa Barat.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
        <div className="aspect-[4/5] bg-[#dbe2f5]" /><div className="aspect-[4/5] bg-[#d9e7dc]" /><div className="aspect-[4/5] bg-[#f0e1cf]" />
      </div>
      <dl className="mt-5 space-y-1.5 text-[12px]">
        <div className="flex justify-between border-t border-rule pt-2"><dt>Kopi Lereng, kemasan</dt><dd className="text-ink-soft">2025</dd></div>
        <div className="flex justify-between border-t border-rule pt-2"><dt>Buku &quot;Si Kancil Pulang&quot;</dt><dd className="text-ink-soft">2024</dd></div>
      </dl>
      <span className="mt-5 inline-block rounded-sm bg-accent px-2.5 py-1 text-[11px] font-medium text-white">Hubungi via WhatsApp</span>
    </div>
  );
}

export default function LandingPage() {
  const [count, setCount] = useState(0);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = copy[lang];

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
            <button type="button" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              {lang === 'id' ? 'EN' : 'ID'}
            </button>
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
          <SamplePage />
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
            <ol className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {templates[lang].map(([name, desc], i) => (
                <li key={name} className="flex items-baseline gap-4 border-t border-rule py-3.5">
                  <span className="w-6 shrink-0 font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium">{name}</span>
                  <span className="ml-auto text-right text-sm text-ink-soft">{desc}</span>
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
