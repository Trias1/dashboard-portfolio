// ============================================================
// PortfolioKit - Type Definitions
// ============================================================

export type UserRole = 'user' | 'admin' | 'superadmin';

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
  theme?: any;
  sections_order?: any;
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
  content?: any;
  sort_order?: number;
  owner_id?: number;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}
