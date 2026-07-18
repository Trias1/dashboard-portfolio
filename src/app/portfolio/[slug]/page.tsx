'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { themes, getThemeById, normalizeThemeId } from '@/lib/sections';
import ModernTemplate from '@/templates/modern';
import CreativeTemplate from '@/templates/creative';
import MinimalTemplate from '@/templates/minimal';
import BoldTemplate from '@/templates/bold';
import ClassicTemplate from '@/templates/classic';
import NeonTemplate from '@/templates/neon';
import GlassTemplate from '@/templates/glass';
import NatureTemplate from '@/templates/nature';
import VibrantTemplate from '@/templates/vibrant';
import RetroTemplate from '@/templates/retro';
import ImmersiveTemplate from '@/templates/immersive';
import PlayfulTemplate from '@/templates/playful';
import DeveloperTemplate from '@/templates/developer';
import SwissTemplate from '@/templates/swiss';
import WhiteTemplate from '@/templates/white';
import AgencyTemplate from '@/templates/agency';
import BoldPersonaTemplate from '@/templates/boldpersona';
import EducationPlatformTemplate from '@/templates/education-platform';
import FintechCryptoTemplate from '@/templates/fintech-crypto';
import PaymentGatewayTemplate from '@/templates/payment-gateway';
import DefiYieldTemplate from '@/templates/defi-yield';
import CreativeAgencyLandingTemplate from '@/templates/creative-agency';
import GamingPlatformTemplate from '@/templates/gaming-platform';
import NftCyberpunkTemplate from '@/templates/nft-cyberpunk';
import DeveloperToolsTemplate from '@/templates/developer-tools';
import ChatWidget from '@/components/ChatWidget';
import AdvisorFloating from '@/components/AdvisorFloating';
import OrderSections from '@/components/OrderSections';

function setMeta(title: string, description: string, image?: string) {
  document.title = title;
  const set = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null;
    if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
    el.content = content;
  };
  set('description', description);
  set('og:title', title);
  set('og:description', description);
  set('twitter:title', title);
  set('twitter:description', description);
  if (image) { set('og:image', image); set('twitter:image', image); }
}

function getDemoPortfolio(template = 'modern', theme = 'dark-space') {
  const normalizedTheme = normalizeThemeId(theme);
  return {
    portfolio: { id: 0, slug: 'demo', title: 'Demo Portfolio', template, theme: normalizedTheme, sections_order: [], is_published: true, custom_domain: null },
    hero: { headline: "Hi, I'm Alex Rivera", subheadline: 'Full-stack developer building polished web products', cta_text: 'View My Work' },
    about: {
      name: 'Alex Rivera',
      title: 'Full-stack Developer',
      bio: 'I build fast, accessible, and scalable web applications with React, Next.js, Node.js, and PostgreSQL. I enjoy turning complex problems into clean user experiences.',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    experience: [
      { company: 'Nova Labs', position: 'Senior Frontend Engineer', start_date: '2023-01-01', end_date: null, description: 'Led design system adoption and shipped customer-facing dashboards.' },
      { company: 'Orbit Studio', position: 'Full-stack Developer', start_date: '2020-06-01', end_date: '2022-12-01', description: 'Built APIs, admin panels, and deployment workflows for SaaS clients.' },
    ],
    projects: [
      { title: 'Analytics Dashboard', description: 'Realtime dashboard with charts, filters, and team reports.', tech_stack: 'Next.js, PostgreSQL, Recharts', demo_url: '#', github_url: '#' },
      { title: 'Portfolio Builder', description: 'No-code portfolio generator with multiple templates.', tech_stack: 'React, Node.js, Supabase', demo_url: '#', github_url: '#' },
    ],
    services: [
      { title: 'Web App Development', description: 'Custom full-stack applications from idea to launch.', icon: '✦' },
      { title: 'UI Engineering', description: 'Responsive, accessible, and delightful interfaces.', icon: '✦' },
    ],
    contact: { email: 'alex@example.com', phone: '+1 555 0100', location: 'Remote' },
    skills: [
      { title: 'Frontend', skills: 'React, Next.js, TypeScript, Tailwind CSS' },
      { title: 'Backend', skills: 'Node.js, PostgreSQL, Supabase, REST API' },
    ],
    testimonials: [{ name: 'Maya Chen', position: 'Product Manager', message: 'Alex ships quickly and keeps quality high.' }],
    gallery: [],
    custom: [],
  };
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [theme, setTheme] = useState(themes[0]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    const preview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
    setIsPreview(preview);
    api.get(`/api/public/${slug}${preview ? '?preview=true' : ''}`)
      .then(res => {
        setData(res.data);
        const name = res.data.about?.name || res.data.portfolio?.title || slug;
        const desc = res.data.about?.bio?.slice(0, 160) || res.data.hero?.subheadline || `${name}'s portfolio`;
        const img = res.data.about?.photo_url || '';
        setMeta(`${name} " Portfolio`, desc, img);
        const urlTheme = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('theme') : null;
        setTheme(getThemeById(urlTheme || res.data.portfolio?.theme));
      })
      .catch(() => {
        if (slug === 'demo') {
          const params = new URLSearchParams(window.location.search);
          const demoData = getDemoPortfolio(params.get('template') || 'modern', params.get('theme') || 'dark-space');
          setData(demoData);
          setNotFound(false);
          setMeta('Alex Rivera " Portfolio', demoData.about.bio, demoData.about.photo_url);
          setTheme(getThemeById(params.get('theme') || demoData.portfolio.theme));
          return;
        }
        setNotFound(true);
        setMeta('Portfolio Not Found', 'The requested portfolio does not exist or is not published.');
      })
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full border-purple-500 mx-auto" />
        <motion.p className="text-sm text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Loading portfolio...</motion.p>
      </div>
    </div>
  );
  if (notFound || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center max-w-md px-4">
        <motion.div className="text-7xl mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>*</motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">Portfolio Not Found</h1>
        <p className="text-gray-400 mb-8">The portfolio "{slug}" does not exist or is not published yet.</p>
        <a href="/" className="inline-block px-6 py-3 rounded-full font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: '#a855f7' }}> Back to Home</a>
      </div>
    </div>
  );
  const urlTemplate = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('template') : null;
  const templateName = urlTemplate || data.portfolio?.template || 'modern';
  const accentColor = theme.accent;
  if (isPreview && Array.isArray(data.custom) && data.custom.length > 0) {
    data.custom.forEach((section: any) => {
      const items = Array.isArray(section.content?.items) ? section.content.items : [section.content].filter(Boolean);
      console.log('[Template] section label', section.title || 'Custom Section');
      console.log('[Template] section type', section.original_type || section.type || 'text');
      console.log('[Template] items count', items.length);
      console.log('[Template] first item content', items[0] || null);
    });
  }
  const widget = isPreview
    ? <AdvisorFloating accentColor={accentColor} />
    : <ChatWidget slug={data.portfolio.slug} accentColor={accentColor} ownerName={data.about?.name} />;

  if (templateName === 'creative') return <OrderSections sections_order={data?.portfolio?.sections_order}><CreativeTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'minimal') return <OrderSections sections_order={data?.portfolio?.sections_order}><MinimalTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'bold') return <OrderSections sections_order={data?.portfolio?.sections_order}><BoldTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'classic') return <OrderSections sections_order={data?.portfolio?.sections_order}><ClassicTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'neon') return <OrderSections sections_order={data?.portfolio?.sections_order}><NeonTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'glass') return <OrderSections sections_order={data?.portfolio?.sections_order}><GlassTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'nature') return <OrderSections sections_order={data?.portfolio?.sections_order}><NatureTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'vibrant') return <OrderSections sections_order={data?.portfolio?.sections_order}><VibrantTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'retro') return <OrderSections sections_order={data?.portfolio?.sections_order}><RetroTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'immersive') return <OrderSections sections_order={data?.portfolio?.sections_order}><ImmersiveTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'playful') return <OrderSections sections_order={data?.portfolio?.sections_order}><PlayfulTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'developer') return <OrderSections sections_order={data?.portfolio?.sections_order}><DeveloperTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'swiss') return <OrderSections sections_order={data?.portfolio?.sections_order}><SwissTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'white') return <OrderSections sections_order={data?.portfolio?.sections_order}><WhiteTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'agency') return <OrderSections sections_order={data?.portfolio?.sections_order}><AgencyTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'boldpersona') return <OrderSections sections_order={data?.portfolio?.sections_order}><BoldPersonaTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'education-platform') return <OrderSections sections_order={data?.portfolio?.sections_order}><EducationPlatformTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'fintech-crypto') return <OrderSections sections_order={data?.portfolio?.sections_order}><FintechCryptoTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'payment-gateway') return <OrderSections sections_order={data?.portfolio?.sections_order}><PaymentGatewayTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'defi-yield') return <OrderSections sections_order={data?.portfolio?.sections_order}><DefiYieldTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'creative-agency') return <OrderSections sections_order={data?.portfolio?.sections_order}><CreativeAgencyLandingTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'gaming-platform') return <OrderSections sections_order={data?.portfolio?.sections_order}><GamingPlatformTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'nft-cyberpunk') return <OrderSections sections_order={data?.portfolio?.sections_order}><NftCyberpunkTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  if (templateName === 'developer-tools') return <OrderSections sections_order={data?.portfolio?.sections_order}><DeveloperToolsTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
  return <OrderSections sections_order={data?.portfolio?.sections_order}><ModernTemplate data={data} theme={theme} isPreview={isPreview} />{widget}</OrderSections>;
}



