import { useCallback, useState } from 'react';
import api from '@/lib/api';
import { defaultSections, Section, themes } from '@/lib/sections';

export function useDashboardPortfolio() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreview = useCallback(async (slug?: string) => {
    const targetSlug = slug || portfolio?.slug;
    if (!targetSlug) return;
    setPreviewLoading(true);
    try {
      const response = await api.get(`/api/public/${targetSlug}?preview=true`);
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
