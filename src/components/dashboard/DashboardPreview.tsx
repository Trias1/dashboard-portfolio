'use client';

import api from '@/lib/api';
import { getThemeById, Section, themes } from '@/lib/sections';

const templates = ['modern','creative','minimal','bold','classic','neon','glass','nature','vibrant','retro','immersive','playful','developer','swiss','white','agency','boldpersona'];

interface DashboardPreviewProps {
  portfolio: any;
  previewData: any;
  previewLoading: boolean;
  sections: Section[];
  selectedTheme: any;
  toggleVersion: number;
  setPortfolio: (portfolio: any) => void;
  onThemeChange: (theme: any) => void;
  onRefresh: () => void;
}

export default function DashboardPreview({ portfolio, previewData, previewLoading, sections, selectedTheme, toggleVersion, setPortfolio, onThemeChange, onRefresh }: DashboardPreviewProps) {
  if (!portfolio) return <div className="flex h-full flex-col items-center justify-center px-8 text-center"><div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5 text-3xl">▤</div><h3 className="text-xl font-semibold text-white">Portfolio Builder</h3><p className="mt-2 max-w-sm text-sm text-slate-400">Drag sections to reorder, toggle visibility, and edit content from the builder.</p></div>;
  if (previewLoading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>;
  if (!previewData) return <div className="flex h-full items-center justify-center text-sm text-slate-500">No portfolio data available.</div>;

  const theme = getThemeById(portfolio.theme);
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 text-xs">
        <div><p className="font-medium text-white">Live preview</p><p className="text-slate-500">Template: {portfolio.template || 'modern'}</p></div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-1">{themes.map((item) => <button key={item.id} type="button" onClick={() => onThemeChange(item)} title={item.label} aria-label={`Use ${item.label} theme`} className={`h-5 w-5 rounded-full border-2 transition ${selectedTheme.id === item.id ? 'scale-110 border-white' : 'border-transparent'}`} style={{ backgroundColor: item.accent }} />)}</div>
          <select aria-label="Portfolio template" value={portfolio.template || 'modern'} disabled={portfolio.is_published} onChange={async (event) => {
            try {
              const response = await api.put(`/api/portfolios/${portfolio.id}`, { title: portfolio.title, theme: portfolio.theme, sections_order: portfolio.sections_order, is_published: portfolio.is_published, template: event.target.value });
              setPortfolio(response.data);
            } catch (error) {
              console.error('Template update failed', error);
            }
          }} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:text-slate-600 sm:w-44 sm:flex-none">{templates.map((value) => <option key={value} value={value}>{value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')}</option>)}</select>
          <button type="button" onClick={onRefresh} className="rounded-lg bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400">Refresh</button>
        </div>
      </div>
      {portfolio.slug ? <iframe title="Portfolio preview" key={`${portfolio.slug}-${portfolio.template}-${portfolio.theme}-${toggleVersion}`} src={`/portfolio/${portfolio.slug}?preview=true&v=${toggleVersion}&order=${encodeURIComponent(JSON.stringify(sections))}`} className="min-h-0 w-full flex-1 border-0" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No portfolio found</div>}
    </div>
  );
}
