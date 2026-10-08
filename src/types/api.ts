// ============================================================
// Shared types for API route handlers (src/app/api/**)
// Minimal shapes for request bodies, DB rows and 3rd-party payloads.
// ============================================================

import type { JsonValue } from './index';

// ---------- Generic ----------

/** Loose JSON object (e.g. parsed DB JSON column or AI output). */
export type JsonRecord = Record<string, unknown>;

/** Entry of portfolios.sections_order (stored as JSON array or JSON string). */
export interface SectionOrderEntry {
  id?: string;
  type?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

// ---------- Chat / Advisor ----------

/** Client-supplied chat history item (untrusted, validated at runtime). */
export interface ChatHistoryInput {
  role?: unknown;
  content?: unknown;
}

// ---------- DB rows (subset of columns actually read) ----------

export interface SkillGroupRow {
  id?: number;
  title?: string;
  skills?: string;
  owner_id?: number;
}

export interface IdRow {
  id: number;
}

export interface TitleRow {
  title: string;
}

/** custom_sections.content: JSON object, or a JSON string in legacy rows. */
export interface CustomSectionContent {
  items?: unknown[];
  [key: string]: unknown;
}

export interface CustomSectionRow {
  id?: number | string;
  title?: string;
  type?: string;
  content?: CustomSectionContent | string | null;
  sort_order?: number;
  owner_id?: number;
  [key: string]: unknown;
}

/** Custom section as returned by the public portfolio API (content parsed / grouped). */
export interface CustomSectionOutput {
  id?: number | string;
  title?: string;
  type?: string;
  original_type?: string;
  content: CustomSectionContent;
  [key: string]: unknown;
}

// ---------- GitHub API ----------

export interface GitHubUser {
  name: string | null;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  fork: boolean;
}

// ---------- Vercel API ----------

export interface VercelDeployment {
  uid?: string;
  url?: string;
}

export interface VercelEvent {
  id?: string | number;
  type?: string;
  text?: string;
  message?: string;
  level?: string;
  payload?: { text?: string; message?: string; level?: string };
  createdAt?: number | string;
  timestamp?: number | string;
  date?: number | string;
  route?: string;
  path?: string;
  requestPath?: string;
  statusCode?: number;
  status?: number;
}

// ---------- CV apply (POST /api/cv/apply body) ----------

export interface CvExperienceInput {
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface CvSkillInput {
  title?: string;
  skills?: string;
}

export interface CvProjectInput {
  title?: string;
  description?: string;
  customer?: string;
  assignmentBy?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  tech_stack?: string;
  demo_url?: string;
  github_url?: string;
}

export interface CvEducationInput {
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string | number;
}

export interface CvCertificationInput {
  name?: string;
  issuer?: string;
  date?: string;
  credential_url?: string;
}

export interface CvLanguageInput {
  language?: string;
  proficiency?: string;
}

export interface CvAwardInput {
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface CvOrganizationInput {
  name?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface CvSpecializationInput {
  area?: string;
  description?: string;
}

export interface CvCustomSectionInput {
  title?: string;
  type?: string;
  content?: JsonValue;
}

export interface CvApplyBody {
  replace?: boolean;
  about?: { name?: string; title?: string; bio?: string };
  hero?: { headline?: string; subheadline?: string };
  contact?: { email?: string; phone?: string; location?: string };
  experiences?: CvExperienceInput[];
  experience?: CvExperienceInput[];
  education?: CvEducationInput[];
  skills?: CvSkillInput[];
  projects?: CvProjectInput[];
  certifications?: CvCertificationInput[];
  specializationAreas?: (CvSpecializationInput | string)[];
  languages?: CvLanguageInput[];
  awards?: CvAwardInput[];
  organizations?: CvOrganizationInput[];
  customSections?: CvCustomSectionInput[];
  custom_sections?: CvCustomSectionInput[];
}

// ---------- CV parse (AI / keyword extraction result) ----------

export interface ParsedCvItem {
  title?: string;
  name?: string;
  area?: string;
  position?: string;
  company?: string;
  institution?: string;
  description?: string;
  skills?: string;
  customer?: string;
  content?: { body?: unknown; [key: string]: unknown };
  [key: string]: unknown;
}

/** Specialization areas may be plain strings (keyword fallback). */
export type ParsedCvEntry = ParsedCvItem | string;

export type CvListKey =
  | 'experiences' | 'education' | 'skills' | 'projects' | 'certifications'
  | 'specializationAreas' | 'languages' | 'awards' | 'organizations' | 'customSections';

export interface ParsedCv extends Partial<Record<CvListKey, ParsedCvEntry[]>> {
  about?: { name?: string; title?: string; bio?: string };
  hero?: { headline?: string; subheadline?: string };
  contact?: { email?: string; phone?: string; location?: string; linkedin?: string; website?: string };
  confidence?: number;
  warnings?: string[];
  _sectionKeywordsFound?: string[];
  _sections?: Record<string, string>;
  [key: string]: unknown;
}

/** Keyword-extraction result: every list is always present. */
export type KeywordCvResult = ParsedCv & Record<CvListKey, ParsedCvEntry[]>;
