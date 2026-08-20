// ============================================================
// PortfolioKit - Type Definitions
// ============================================================

export type UserRole = 'user' | 'admin' | 'superadmin';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  photo_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface Portfolio {
  id: number;
  owner_id: number;
  title: string;
  slug: string;
  template: string;
  theme?: JsonValue;
  sections_order?: JsonValue;
  is_published: boolean;
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

export interface About {
  id?: number;
  name?: string;
  title?: string;
  bio?: string;
  photo_url?: string;
  cv_url?: string;
  owner_id?: number;
}

export interface Hero {
  id?: number;
  greeting?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  cta_text?: string;
  cta_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  background_url?: string;
  owner_id?: number;
}

export interface Experience {
  id?: number;
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  owner_id?: number;
}

export interface Project {
  id?: number;
  title: string;
  description?: string;
  image_url?: string;
  tech_stack?: string;
  demo_url?: string;
  github_url?: string;
  owner_id?: number;
}

export interface GalleryItem {
  id?: number;
  title?: string;
  description?: string;
  image_url?: string;
  file_url?: string;
  issued_date?: string;
  owner_id?: number;
  created_at?: string;
}

export interface CustomSection {
  id?: number;
  title: string;
  type?: string;
  content?: JsonValue;
  sort_order?: number;
  owner_id?: number;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}
export interface TemplateSectionOrder {
  type: string;
  enabled?: boolean;
  label?: string;
  sort_order?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface TemplateItem {
  id?: number | string;
  name?: string;
  title?: string;
  label?: string;
  company?: string;
  position?: string;
  institution?: string;
  degree?: string;
  field?: string;
  language?: string;
  proficiency?: string;
  issuer?: string;
  date?: string;
  credential_url?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  content?: TemplateContent;
  items?: TemplateItem[];
  url?: string;
  icon?: string;
  desc?: string;
  message?: string;
  area?: string;
  original_type?: string;
  type?: string;
  photo_url?: string;
  issued_date?: string;
  skills?: string;
  tech_stack?: string;
  image_url?: string;
  file_url?: string;
  demo_url?: string;
  github_url?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  body?: string;
  gpa?: string | number;

}

export interface TemplateContent {
  name?: string;
  title?: string;
  institution?: string;
  degree?: string;
  field?: string;
  issuer?: string;
  date?: string;
  credential_url?: string;
  language?: string;
  proficiency?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string | number;
  body?: string;
  description?: string;
  area?: string;
  cards?: TemplateItem[];
  links?: TemplateItem[];
  blocks?: TemplateItem[];
  items?: string[];
}

export interface TemplatePortfolio {
  id?: number;
  owner_id?: number;
  title?: string;
  slug: string;
  template?: string;
  theme?: JsonValue;
  sections_order?: TemplateSectionOrder[];
  is_published?: boolean;
  custom_domain?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateData {
  portfolio: TemplatePortfolio;
  about?: About & { email?: string };
  hero?: Hero;
  experience?: TemplateItem[];
  projects?: TemplateItem[];
  services?: TemplateItem[];
  skills?: TemplateItem[];
  testimonials?: TemplateItem[];
  contact?: TemplateItem;
  gallery?: TemplateItem[];
  custom?: TemplateItem[];
  [key: string]: unknown;
}

export interface ThemeConfig {
  accent: string;
  bg: string;
  [key: string]: string;
}


