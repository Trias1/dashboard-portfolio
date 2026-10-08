import { useCallback, useState } from 'react';
import api from '@/lib/api';
import { defaultSections, Section, themes } from '@/lib/sections';
import type { DashboardPortfolio, TemplateData, ThemeOption } from '@/types';

export function useDashboardPortfolio() {
  const [portfolio, setPortfolio] = useState<DashboardPortfolio | null>(null);
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(themes[0]);
  const [previewData, setPreviewData] = useState<TemplateData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreview = useCallback(async (slug?: string) => {
    const targetSlug = slug || portfolio?.slug;
    if (!targetSlug) return;
    setPreviewLoading(true);
    try {
      const response = await api.get<TemplateData>(`/api/public/${targetSlug}?preview=true`);
      setPreviewData(response.data);
    } catch (error) {
      console.error('Preview load failed', error);
    } finally {
      setPreviewLoading(false);
    }
  }, [portfolio?.slug]);

  return {
    portfolio, setPortfolio,
    sections, setSections, activeSection, setActiveSection,
    selectedTheme, setSelectedTheme,
    previewData, previewLoading, loadPreview,
  };
}
