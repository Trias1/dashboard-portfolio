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

// ============================================================
// Dashboard
// ============================================================

/** Logged-in dashboard user (from /api/auth/me, or the partial copy cached in localStorage). */
export interface DashboardUser {
  id?: number;
  name?: string;
  email?: string;
  role?: UserRole;
  photo_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
}

/** Response of PUT /api/auth/profile. */
export interface ProfileUpdateResponse {
  name: string;
  email: string;
  photo_url?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currentPassword?: string;
  photo_url: string;
}

/** A builder section entry as persisted in `portfolios.sections_order`. */
export interface DashboardSectionEntry {
  id: string;
  type: string;
  label: string;
  icon: string;
  enabled: boolean;
  deletable?: boolean;
}

/** Portfolio row as returned by /api/portfolios/* to the dashboard. */
export interface DashboardPortfolio {
  id: number;
  owner_id?: number;
  title: string;
  slug: string;
  template?: string;
  theme?: string | null;
  /** Stored as JSON; older rows may hold a serialized string. */
  sections_order?: DashboardSectionEntry[] | string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeOption {
  id: string;
  label: string;
  icon: string;
  bg: string;
  accent: string;
}

export interface CustomCard {
  title?: string;
  desc?: string;
  icon?: string;
}

export interface CustomLink {
  label?: string;
  url?: string;
}

/** `content` of a custom-section row (shape depends on the custom sub-type). */
export interface CustomSectionContent {
  // free text / generic
  body?: string;
  title?: string;
  description?: string;
  items?: string[];
  cards?: CustomCard[];
  links?: CustomLink[];
  // education
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string | number;
  // certification
  name?: string;
  issuer?: string;
  issueMonth?: string;
  issueYear?: string;
  expiryMonth?: string;
  expiryYear?: string;
  noExpiry?: boolean;
  credentialId?: string;
  credentialUrl?: string;
  credential_url?: string;
  skills?: string[];
  imageUrl?: string;
  // language
  language?: string;
  proficiency?: string;
  // award
  date?: string;
  // organization
  role?: string;
  // specialization
  area?: string;
}

/**
 * Editor form state in the dashboard builder. One shape covers every section
 * editor (about, hero, experience, projects, services, testimonials, skills,
 * contact, gallery, custom); each editor only reads/writes its own fields.
 */
export interface EditFormData {
  id?: number;
  // shared
  title?: string;
  name?: string;
  description?: string;
  photo_url?: string | null;
  image_url?: string | null;
  github_url?: string;
  // about
  bio?: string;
  cv_url?: string;
  // hero
  greeting?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  cta_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  background_url?: string;
  // experience
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string | null;
  still_working?: boolean;
  // projects
  tech_stack?: string;
  demo_url?: string;
  // services
  icon?: string;
  // testimonials
  message?: string;
  // skills (comma separated)
  skills?: string;
  // contact
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  // gallery
  issued_date?: string;
  file_url?: string;
  // custom
  type?: string;
  content?: CustomSectionContent;
}

/** A stored row as returned by the section list endpoints (custom `content` may still be serialized). */
export type StoredSectionItem = Omit<EditFormData, 'content'> & {
  content?: CustomSectionContent | string | null;
};

/** Keys of `T` whose (non-null) value type is a string — used by generic text-field helpers. */
export type StringFieldKey<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never;
}[keyof T];

export interface PresenceUser {
  id: number;
  name?: string | null;
  email?: string | null;
  created_at?: string | null;
  last_seen_at?: string | null;
  last_device?: string | null;
  is_active?: boolean;
}

export interface AdminPortfolioSummary {
  id: number;
  title?: string | null;
  slug: string;
  template?: string | null;
  is_published: boolean;
  updated_at?: string;
  owner_id?: number;
}

/** Response of GET /api/admin/stats. */
export interface AdminStats {
  users: number;
  usersOnline: number;
  usersOffline: number;
  portfolios: number;
  published: number;
  draft: number;
  messages: number;
  templateCounts: Record<string, number>;
  recentPortfolios: AdminPortfolioSummary[];
  onlineUsers: PresenceUser[];
  offlineUsers: PresenceUser[];
}

/** Row of GET /api/admin/vercel-logs. */
export interface VercelLogEntry {
  id: string;
  timestamp: string;
  level: string;
  deployment: string;
  route: string | null;
  status: number | string | null;
  message: string;
}

/** Row of GET /api/users. */
export interface ManagedUser {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
}

export interface VisitChartPoint {
  date: string;
  count: number | string;
}

/** Response of GET /api/portfolios/visits. */
export interface VisitStats {
  total: number;
  today: number;
  week: number;
  chart: VisitChartPoint[];
  from?: string;
  to?: string;
}

export interface GitHubProfilePreview {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
}

export interface GitHubProjectPreview {
  name: string;
  title: string;
  description: string;
  tech_stack: string;
  github_url: string;
  demo_url: string;
  stars: number;
  fork: boolean;
}

/** Response of GET /api/github/preview. */
export interface GitHubPreview {
  profile: GitHubProfilePreview;
  languages: string[];
  projects: GitHubProjectPreview[];
}

export interface GitHubImportOptions {
  bio: boolean;
  skills: boolean;
  projects: boolean;
}


