'use client';
import { motion } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';

type LandingVariant = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  style: 'clay' | 'glass' | 'minimal' | 'cyber' | 'brutal' | 'gaming' | 'nft' | 'devtools';
  stats: string[];
  featureTitle: string;
  previewTitle: string;
  previewItems: string[];
  trust: string[];
};

const variants: Record<string, LandingVariant> = {
  education: {
    eyebrow: 'Playful Learning Platform',
    title: 'Belajar terasa ringan, seru, dan terukur.',
    subtitle: 'Landing edukasi dengan claymorphism cards, katalog kursus, progress tracking, testimoni siswa, dan CTA enrollment yang kuat.',
    primaryCta: 'Enroll sekarang',
    secondaryCta: 'Lihat katalog',
    style: 'clay',
    stats: ['12K+ learners', '94% completion', '4.9 rating'],
    featureTitle: 'Course catalog preview',
    previewTitle: 'Progress tracking demo',
    previewItems: ['Interactive lessons', 'Weekly learning streak', 'Certificate-ready path'],
    trust: ['Teacher verified', 'Project based', 'Mobile friendly'],
  },
  fintech: {
    eyebrow: 'Secure Crypto Finance',
    title: 'Trading, wallet, dan insight crypto dalam satu dashboard aman.',
    subtitle: 'Dark fintech landing dengan glass cards, preview chart real-time, keamanan, wallet integration, dan trust indicators.',
    primaryCta: 'Connect wallet',
    secondaryCta: 'Security docs',
    style: 'glass',
    stats: ['$2.4B secured', '99.99% uptime', 'SOC2 ready'],
    featureTitle: 'Security highlights',
    previewTitle: 'Real-time price preview',
    previewItems: ['BTC +4.8%', 'ETH +2.1%', 'SOL +8.3%'],
    trust: ['MPC custody', '2FA protected', 'Audited smart flow'],
  },
  payment: {
    eyebrow: 'Payment Gateway',
    title: 'Checkout cepat untuk tim produk dan developer.',
    subtitle: 'Minimal conversion landing dengan code preview, pricing tiers, sertifikasi keamanan, dan link dokumentasi developer.',
    primaryCta: 'Start integration',
    secondaryCta: 'Read docs',
    style: 'minimal',
    stats: ['1.2s checkout', '135 currencies', 'No setup fee'],
    featureTitle: 'Pricing tiers',
    previewTitle: 'Integration code preview',
    previewItems: ['npm install gateway-sdk', 'createCheckoutSession()', 'webhook verified'],
    trust: ['PCI DSS', 'ISO 27001', '3DS ready'],
  },
  defi: {
    eyebrow: 'DeFi Yield Farming',
    title: 'Farm yield neon dengan data APY yang jelas.',
    subtitle: 'Cyberpunk DeFi landing dengan APY calculator, liquidity pools, tokenomics, dan wallet connect.',
    primaryCta: 'Connect wallet',
    secondaryCta: 'Explore pools',
    style: 'cyber',
    stats: ['42.8% APY', '$84M TVL', '12 pools'],
    featureTitle: 'Liquidity pools',
    previewTitle: 'APY calculator',
    previewItems: ['Stake amount: 2,500', 'Projected yield: 42.8%', 'Rewards: Auto-compound'],
    trust: ['Audited contracts', 'Timelock', 'DAO governed'],
  },
  agency: {
    eyebrow: 'Bold Creative Agency',
    title: 'Campaign yang berani, visual yang susah dilupakan.',
    subtitle: 'Brutalist creative landing dengan motion-driven sections, case studies, team showcase, dan contact CTA.',
    primaryCta: 'Start a project',
    secondaryCta: 'View cases',
    style: 'brutal',
    stats: ['38 launches', '11 awards', '4 global teams'],
    featureTitle: 'Case study previews',
    previewTitle: 'Motion storyboard',
    previewItems: ['Brand sprint', 'Launch film', 'Interactive campaign'],
    trust: ['Strategy', 'Design', 'Production'],
  },
  gaming: {
    eyebrow: 'Immersive Gaming Platform',
    title: 'Masuk ke arena retro-futuristic penuh neon.',
    subtitle: 'Gaming platform landing dengan 3D feel, showcase carousel, community features, dan download CTA.',
    primaryCta: 'Download launcher',
    secondaryCta: 'Join community',
    style: 'gaming',
    stats: ['2M players', '120 arenas', '24/7 events'],
    featureTitle: 'Game showcase carousel',
    previewTitle: 'Community hub',
    previewItems: ['Squad matchmaking', 'Live tournaments', 'Creator rooms'],
    trust: ['Cross-platform', 'Low latency', 'Anti-cheat'],
  },
  nft: {
    eyebrow: 'Cyberpunk NFT Marketplace',
    title: 'Gallery NFT neon untuk creator dan collector.',
    subtitle: 'NFT landing dengan glassmorphism cards, featured gallery, wallet demo, creator spotlight, dan marketplace preview.',
    primaryCta: 'Connect wallet',
    secondaryCta: 'Browse drops',
    style: 'nft',
    stats: ['8K NFTs', '420 creators', '3 chains'],
    featureTitle: 'Featured NFT gallery',
    previewTitle: 'Marketplace preview',
    previewItems: ['Mint live drop', 'Creator royalties', 'Bid in seconds'],
    trust: ['Verified creators', 'On-chain provenance', 'Royalty engine'],
  },
  devtools: {
    eyebrow: 'Developer Tools',
    title: 'Tooling minimal untuk build, ship, dan observe lebih cepat.',
    subtitle: 'Developer tools landing dengan dark mode, snippets, comparison table, integration logos, dan documentation CTA.',
    primaryCta: 'Open docs',
    secondaryCta: 'Compare features',
    style: 'devtools',
    stats: ['8 SDKs', '50ms API', '99.9% SLA'],
    featureTitle: 'Feature comparison',
    previewTitle: 'Code snippet preview',
    previewItems: ['await client.deploy()', 'logs.stream()', 'metrics.query()'],
    trust: ['TypeScript', 'REST API', 'Webhooks'],
  },
};

function palette(theme: any, style: LandingVariant['style']) {
  const isWhite = theme?.bg === '#ffffff';
  if (isWhite && style !== 'cyber' && style !== 'gaming' && style !== 'nft') {
    return { bg: '#f8fafc', panel: '#ffffff', panel2: '#eef2ff', text: '#0f172a', sub: '#475569', border: '#dbe4ff', accent: theme.accent || '#6366f1', glow: 'rgba(99,102,241,.20)' };
  }
  const accent = style === 'gaming' ? '#22d3ee' : style === 'cyber' || style === 'nft' ? '#f0abfc' : theme?.accent || '#a855f7';
  return { bg: '#070713', panel: 'rgba(255,255,255,.08)', panel2: 'rgba(168,85,247,.14)', text: '#ffffff', sub: '#b8b8c8', border: 'rgba(255,255,255,.16)', accent, glow: `${accent}40` };
}

function cardClass(style: LandingVariant['style']) {
  if (style === 'clay') return 'rounded-[2rem] border shadow-[8px_8px_0_rgba(15,23,42,.12)]';
  if (style === 'brutal') return 'rounded-none border-2 shadow-[10px_10px_0_rgba(0,0,0,.35)]';
  return 'rounded-3xl border backdrop-blur-xl shadow-2xl';
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .55, delay }}>{children}</motion.div>;
}

export default function LandingTemplate({ data, theme, variant }: { data: any; theme: any; isPreview?: boolean; variant: keyof typeof variants }) {
  const config = variants[variant];
  const colors = palette(theme, config.style);
  const { portfolio, about, projects = [], services = [], skills = [], testimonials = [], contact } = data;
  const name = about?.name || portfolio?.title || config.title;
  const title = about?.title || config.eyebrow;
  const bio = about?.bio || config.subtitle;
  const projectItems = projects.length ? projects.slice(0, 6) : config.previewItems.map((item, index) => ({ id: item, title: item, description: config.subtitle, tech_stack: config.trust[index % config.trust.length] }));
  const serviceItems = services.length ? services.slice(0, 3) : config.trust.map((item) => ({ id: item, title: item, description: `${item} built into the landing experience.` }));
  const skillItems = skills.length ? skills.slice(0, 10) : config.trust.map((name) => ({ id: name, name }));

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: colors.bg, color: colors.text }}>
      <section className="relative px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 20% 20%, ${colors.glow}, transparent 32%), radial-gradient(circle at 80% 10%, ${colors.accent}22, transparent 28%)` }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <Fade>
            <div>
              <span className="inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.25em]" style={{ borderColor: colors.border, color: colors.accent }}>{config.eyebrow}</span>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[.95] tracking-tight sm:text-6xl lg:text-7xl">{name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8" style={{ color: colors.sub }}>{bio}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#contact" className="rounded-full px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" style={{ background: colors.accent }}>{config.primaryCta}</a>
                <a href="#preview" className="rounded-full border px-6 py-3 text-center text-sm font-bold transition hover:-translate-y-0.5" style={{ borderColor: colors.border, color: colors.text }}>{config.secondaryCta}</a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {config.stats.map(stat => <div key={stat} className={cardClass(config.style) + ' px-4 py-3 text-center'} style={{ background: colors.panel, borderColor: colors.border }}><p className="text-sm font-black">{stat}</p></div>)}
              </div>
            </div>
          </Fade>
          <Fade delay={.1}>
            <div className={cardClass(config.style) + ' relative p-5 sm:p-7'} style={{ background: colors.panel, borderColor: colors.border }}>
              <div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-bold" style={{ color: colors.accent }}>{config.previewTitle}</p><p className="text-xs" style={{ color: colors.sub }}>{title}</p></div><div className="h-12 w-12 rounded-2xl" style={{ background: colors.accent, boxShadow: `0 0 30px ${colors.glow}` }} /></div>
              <div className="space-y-3">
                {config.previewItems.map((item, index) => <div key={item} className="flex items-center justify-between rounded-2xl border p-4" style={{ background: colors.panel2, borderColor: colors.border }}><span className="font-mono text-sm">{item}</span><span className="text-xs font-bold" style={{ color: colors.accent }}>{index === 0 ? 'LIVE' : `0${index + 1}`}</span></div>)}
              </div>
              <div className="mt-5 h-32 rounded-3xl border p-4" style={{ borderColor: colors.border, background: `linear-gradient(135deg, ${colors.accent}33, transparent)` }}>
                <div className="flex h-full items-end gap-2">{[35, 64, 48, 82, 58, 94, 72].map((height, index) => <div key={index} className="flex-1 rounded-t-xl" style={{ height: `${height}%`, background: colors.accent, opacity: .55 + index * .05 }} />)}</div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <section id="preview" className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Fade><div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[.22em]" style={{ color: colors.accent }}>{config.featureTitle}</p><h2 className="mt-2 text-3xl font-black sm:text-5xl">Built for conversion</h2></div><p className="max-w-xl" style={{ color: colors.sub }}>Responsive sections adapt to portfolio data while keeping the landing page purpose clear.</p></div></Fade>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projectItems.map((project: any, index: number) => <Fade key={project.id || project.title || index} delay={index * .04}><article className={cardClass(config.style) + ' h-full p-5'} style={{ background: colors.panel, borderColor: colors.border }}>{project.image_url && <img src={project.image_url} alt={project.title} className="mb-4 h-44 w-full rounded-2xl object-cover" />}<h3 className="text-xl font-black">{project.title}</h3><p className="mt-3 text-sm leading-6" style={{ color: colors.sub }}>{project.description}</p>{project.tech_stack && <div className="mt-4 flex flex-wrap gap-2">{project.tech_stack.split(',').map((tech: string) => <TechBadge key={tech} name={tech.trim()} accentColor={colors.accent} size="sm" variant="pill" />)}</div>}</article></Fade>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Fade><div className={cardClass(config.style) + ' p-6'} style={{ background: colors.panel, borderColor: colors.border }}><h2 className="text-3xl font-black">Trust indicators</h2><div className="mt-6 flex flex-wrap gap-2">{skillItems.map((skill: any) => <TechBadge key={skill.id || skill.name || skill} name={skill.name || skill.title || skill} accentColor={colors.accent} size="md" variant="outline" textColor={colors.text} />)}</div></div></Fade>
          <div className="grid gap-5 md:grid-cols-3">{serviceItems.map((service: any, index: number) => <Fade key={service.id || service.title || index} delay={index * .05}><div className={cardClass(config.style) + ' h-full p-5'} style={{ background: colors.panel, borderColor: colors.border }}><p className="text-3xl font-black" style={{ color: colors.accent }}>0{index + 1}</p><h3 className="mt-4 font-black">{service.title}</h3><p className="mt-2 text-sm leading-6" style={{ color: colors.sub }}>{service.description}</p></div></Fade>)}</div>
        </div>
      </section>

      {testimonials.length > 0 && <section className="px-5 py-14 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><h2 className="mb-7 text-3xl font-black">What people say</h2><div className="grid gap-5 md:grid-cols-3">{testimonials.slice(0, 3).map((item: any, index: number) => <Fade key={item.id || index}><blockquote className={cardClass(config.style) + ' p-5'} style={{ background: colors.panel, borderColor: colors.border }}><p style={{ color: colors.sub }}>"{item.content || item.message || item.testimonial}"</p><footer className="mt-4 font-bold">{item.name}</footer></blockquote></Fade>)}</div></div></section>}

      <section id="contact" className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border p-6 md:grid-cols-2 md:p-10" style={{ background: colors.panel, borderColor: colors.border }}>
          <div><p className="text-sm font-bold uppercase tracking-[.22em]" style={{ color: colors.accent }}>Enrollment CTA</p><h2 className="mt-2 text-3xl font-black sm:text-5xl">Ready to launch?</h2><p className="mt-4" style={{ color: colors.sub }}>{contact?.message || config.subtitle}</p></div>
          <ContactForm slug={portfolio?.slug || 'demo'} accentColor={colors.accent} />
        </div>
      </section>
    </main>
  );
}

