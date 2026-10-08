'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { getThemeById, Section, themes } from '@/lib/sections';
import type { DashboardPortfolio, TemplateData, ThemeOption } from '@/types';

const templates = ['modern','creative','minimal','bold','classic','neon','glass','nature','vibrant','retro','immersive','playful','developer','swiss','white','agency','boldpersona'];

const templateNotes: Record<string, string> = {
  modern: 'Large name, two-column work list',
  creative: 'Sidebar layout, image-led projects',
  minimal: 'One narrow column, text first',
  bold: 'Poster type, solid colour blocks',
  classic: 'Résumé style, dates on the left',
  neon: 'Dark page, one bright accent',
  glass: 'Frosted header over a backdrop',
  nature: 'Field-notebook, earthy tones',
  vibrant: 'Playful layout, solid colours',
  retro: 'Zine feel, monospace and rules',
  immersive: 'Full-bleed sections, big imagery',
  playful: 'Rounded type, sticker-like tags',
  developer: 'Terminal and README feel',
  swiss: 'Strict grid, flush-left, numerals',
  white: 'Editorial, white space, thin rules',
  agency: 'Studio site, case-study rows',
  boldpersona: 'Personal brand, huge name',
};

const templateName = (value: string) =>
  value === 'boldpersona' ? 'Bold Persona' : value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');

interface DashboardPreviewProps {
  portfolio: DashboardPortfolio | null;
  previewData: TemplateData | null;
  previewLoading: boolean;
  sections: Section[];
  selectedTheme: ThemeOption;
  toggleVersion: number;
  setPortfolio: (portfolio: DashboardPortfolio) => void;
  onThemeChange: (theme: ThemeOption) => void;
  onRefresh: () => void;
}

export default function DashboardPreview({ portfolio, previewData, previewLoading, sections, selectedTheme, toggleVersion, setPortfolio, onThemeChange, onRefresh }: DashboardPreviewProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  if (!portfolio) return (
    <div className="flex h-full flex-col justify-center bg-paper px-8 py-12">
      <div className="max-w-sm">
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">Preview</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">Your page shows up here once a portfolio exists. Reorder sections on the left, switch them on or off, and click one to edit it.</p>
      </div>
    </div>
  );
  if (previewLoading) return (
    <div className="flex h-full items-center justify-center bg-paper" role="status" aria-label="Loading preview">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ink-soft motion-reduce:animate-none" />
    </div>
  );
  if (!previewData) return <div className="flex h-full items-center justify-center bg-paper text-sm text-ink-soft">No portfolio data yet.</div>;

  const theme = getThemeById(portfolio.theme);
  const currentTemplate = portfolio.template || 'modern';
  const templateLocked = portfolio.is_published;

  const changeTemplate = async (value: string) => {
    try {
      const response = await api.put<DashboardPortfolio>(`/api/portfolios/${portfolio.id}`, { title: portfolio.title, theme: portfolio.theme, sections_order: portfolio.sections_order, is_published: portfolio.is_published, template: value });
      setPortfolio(response.data);
    } catch (error) {
      console.error('Template update failed', error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-paper">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule bg-paper px-4 py-2 text-xs">
        <span className="font-medium text-ink">Preview</span>

        <div ref={pickerRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-label="Portfolio template"
            disabled={templateLocked}
            title={templateLocked ? 'Unpublish first to change the template' : 'Change template'}
            onClick={() => setPickerOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-white px-2.5 py-1.5 text-ink transition-colors hover:border-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-soft disabled:hover:border-rule"
          >
            <span className="text-ink-soft">Template</span>
            <span className="font-medium">{templateName(currentTemplate)}</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 text-ink-soft transition-transform duration-150 ${pickerOpen ? 'rotate-180' : ''}`}>
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {pickerOpen && !templateLocked && (
            <div className="absolute left-0 top-full z-40 mt-1.5 w-[min(34rem,calc(100vw-2rem))] rounded-md border border-rule bg-white shadow-[0_10px_28px_rgba(20,20,20,0.10)]">
              <div className="flex items-baseline justify-between border-b border-rule px-3 py-2">
                <p className="text-xs font-medium text-ink">Choose a template</p>
                <p className="font-mono text-[11px] text-ink-soft">{templates.length} layouts</p>
              </div>
              <ul role="listbox" aria-label="Templates" className="grid max-h-[60vh] overflow-y-auto p-1 sm:grid-cols-2">
                {templates.map((value) => {
                  const selected = value === currentTemplate;
                  return (
                    <li key={value} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={async () => {
                          setPickerOpen(false);
                          if (!selected) await changeTemplate(value);
                        }}
                        className={`flex w-full items-start gap-2 rounded px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/15 ${selected ? 'bg-paper shadow-[inset_2px_0_0_var(--color-accent)]' : 'hover:bg-paper'}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm ${selected ? 'font-medium text-ink' : 'text-ink'}`}>{templateName(value)}</span>
                          <span className="block truncate text-xs text-ink-soft">{templateNotes[value]}</span>
                        </span>
                        {selected && (
                          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent">
                            <path d="M3.5 8.5l3 3 6-7" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div role="group" aria-label="Preview theme" className="flex overflow-hidden rounded-md border border-rule bg-white">
          {themes.map((item) => {
            const active = selectedTheme.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onThemeChange(item)}
                aria-pressed={active}
                aria-label={`Use ${item.label} theme`}
                title={item.label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-colors ${active ? 'bg-paper-deep text-ink' : 'text-ink-soft hover:text-ink'}`}
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ backgroundColor: item.bg }} />
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-rule bg-white px-2.5 py-1.5 font-medium text-ink transition-colors hover:border-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="M13 8a5 5 0 1 1-1.5-3.5 M13 2.5v3h-3" />
          </svg>
          Refresh
        </button>
        {templateLocked && (
          <p className="w-full text-[11px] text-ink-soft">The template is locked while the page is live. Unpublish to change it.</p>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3 md:p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-rule bg-white" style={{ backgroundColor: theme.bg }}>
          {portfolio.slug ? <iframe title="Portfolio preview" key={`${portfolio.slug}-${portfolio.template}-${portfolio.theme}-${toggleVersion}`} src={`/portfolio/${portfolio.slug}?preview=true&v=${toggleVersion}&order=${encodeURIComponent(JSON.stringify(sections))}`} className="min-h-0 w-full flex-1 border-0" /> : <div className="flex h-full items-center justify-center bg-white text-sm text-ink-soft">No portfolio found.</div>}
        </div>
      </div>
    </div>
  );
}
