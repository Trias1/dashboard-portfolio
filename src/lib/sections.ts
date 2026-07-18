export type SectionType = 'hero' | 'about' | 'experience' | 'projects' | 'services' | 'testimonials' | 'contact' | 'skills' | 'gallery' | 'custom';

export interface Section {
  id: string;
  type: SectionType;
  label: string;
  icon: string;
  enabled: boolean;
  deletable?: boolean;
}

export const availableSections: Omit<Section, 'id' | 'enabled'>[] = [
  { type: 'hero', label: 'Hero', icon: 'H' },
  { type: 'about', label: 'About', icon: 'A' },
  { type: 'experience', label: 'Experience', icon: 'E', deletable: true },
  { type: 'projects', label: 'Projects', icon: 'P', deletable: true },
  { type: 'services', label: 'Services', icon: 'SV', deletable: true },
  { type: 'skills', label: 'Skills', icon: 'SK', deletable: true },
  { type: 'testimonials', label: 'Testimonials', icon: 'T', deletable: true },
  { type: 'gallery', label: 'Gallery', icon: 'G', deletable: true },
  { type: 'contact', label: 'Contact', icon: 'C', deletable: true },
  { type: 'custom', label: 'Custom Section', icon: 'CS', deletable: true },
];

export const SECTION_ORDER: string[] = [
  'hero', 'about', 'experience', 'projects', 'skills',
  'custom-education', 'custom-certifications', 'custom-specialization-areas', 'custom-languages',
  'custom-awards', 'custom-organizations',
  'services', 'gallery', 'testimonials', 'contact',
];

export const defaultSections: Section[] = [
  { id: 'hero', type: 'hero', label: 'Hero', icon: 'H', enabled: true },
  { id: 'about', type: 'about', label: 'About', icon: 'A', enabled: true },
  { id: 'experience-1', type: 'experience', label: 'Experience', icon: 'E', enabled: true, deletable: true },
  { id: 'projects-1', type: 'projects', label: 'Projects', icon: 'P', enabled: true, deletable: true },
  { id: 'skills-1', type: 'skills', label: 'Skills', icon: 'SK', enabled: true, deletable: true },
  { id: 'custom-education', type: 'custom', label: 'Education', icon: 'ED', enabled: true, deletable: true },
  { id: 'custom-certifications', type: 'custom', label: 'Certifications', icon: 'CE', enabled: true, deletable: true },
  { id: 'custom-specialization-areas', type: 'custom', label: 'Specialization Areas', icon: 'SA', enabled: true, deletable: true },
  { id: 'custom-languages', type: 'custom', label: 'Languages', icon: 'LG', enabled: true, deletable: true },
  { id: 'custom-awards', type: 'custom', label: 'Awards', icon: 'AW', enabled: true, deletable: true },
  { id: 'custom-organizations', type: 'custom', label: 'Organizations', icon: 'OR', enabled: true, deletable: true },
  { id: 'services-1', type: 'services', label: 'Services', icon: 'SV', enabled: false, deletable: true },
  { id: 'gallery-1', type: 'gallery', label: 'Gallery', icon: 'G', enabled: false, deletable: true },
  { id: 'testimonials-1', type: 'testimonials', label: 'Testimonials', icon: 'T', enabled: false, deletable: true },
  { id: 'contact', type: 'contact', label: 'Contact', icon: 'C', enabled: true, deletable: true },
];

export const themes = [
  { id: 'dark-space', label: 'Dark bawaan', icon: 'D', bg: '#0a0a1a', accent: '#a855f7' },
  { id: 'white', label: 'White', icon: 'W', bg: '#ffffff', accent: '#6366f1' },
];

export const normalizeThemeId = (themeId?: string | null) => {
  if (themeId === 'white' || themeId === 'minimal') return 'white';
  if (themeId === 'dark-space' || themeId === 'ocean' || themeId === 'forest' || themeId === 'sunset') return 'dark-space';
  return 'dark-space';
};

export const getThemeById = (themeId?: string | null) => themes.find(theme => theme.id === normalizeThemeId(themeId)) || themes[0];
