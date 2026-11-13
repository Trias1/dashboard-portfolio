import { getSupabaseAdmin } from './supabase/admin';
import { AI_ENABLED } from './features';
import { normalizeSlug } from './slug';

/**
 * Switches a superadmin flips from the Settings panel (table app_settings, migration 010), read by the server
 * with a short cache. Missing keys, a missing table or a failed read all mean the defaults, so nothing breaks
 * before the migration runs. Each server instance caches for CACHE_MS, so a change can take that long to reach
 * every visitor.
 */
export type Announcement = { text: string; level: 'info' | 'warning' };
export type AppSettings = {
  /** New accounts (email sign-up and first Google sign-in). Existing accounts can always sign in. */
  signupsOpen: boolean;
  /** Runtime off switch for the Advisor and the visitor chat; NEXT_PUBLIC_AI_ENABLED must also be true. */
  aiEnabled: boolean;
  /** Banner on every member's dashboard. */
  announcement: Announcement | null;
  /** Slugs nobody may pick, on top of the built-in list in src/lib/slug.ts. */
  reservedSlugs: string[];
};

export const DEFAULT_SETTINGS: AppSettings = { signupsOpen: true, aiEnabled: true, announcement: null, reservedSlugs: [] };

const KEYS = { signupsOpen: 'signups_open', aiEnabled: 'ai_enabled', announcement: 'announcement', reservedSlugs: 'reserved_slugs' } as const;
export type SettingName = keyof typeof KEYS;
export const CACHE_MS = 30_000;
export const MAX_ANNOUNCEMENT = 280;
export const MAX_RESERVED = 200;

let cache: { at: number; value: AppSettings } | null = null;

/** Check and clean one value; returns null when it isn't valid for that setting. */
export function cleanSetting<K extends SettingName>(name: K, value: unknown): AppSettings[K] | null {
  switch (name) {
    case 'signupsOpen':
    case 'aiEnabled':
      return (typeof value === 'boolean' ? value : null) as AppSettings[K] | null;
    case 'announcement': {
      if (value === null) return null as AppSettings[K] | null;
      const v = value as Partial<Announcement> | null;
      const text = typeof v?.text === 'string' ? v.text.trim().slice(0, MAX_ANNOUNCEMENT) : '';
      if (!text) return null;
      return { text, level: v?.level === 'warning' ? 'warning' : 'info' } as AppSettings[K];
    }
    case 'reservedSlugs': {
      if (!Array.isArray(value)) return null;
      const slugs = [...new Set(value.filter((s): s is string => typeof s === 'string').map(normalizeSlug).filter(Boolean))];
      return slugs.slice(0, MAX_RESERVED) as AppSettings[K];
    }
    default:
      return null;
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  const value: AppSettings = { ...DEFAULT_SETTINGS };
  try {
    const { data, error } = await getSupabaseAdmin().from('app_settings').select('key, value');
    if (!error) {
      for (const [name, key] of Object.entries(KEYS) as [SettingName, string][]) {
        const row = (data || []).find((r) => r.key === key);
        if (!row) continue;
        const cleaned = cleanSetting(name, row.value);
        // A stored null announcement is valid (no banner); anything else invalid keeps the default.
        if (cleaned !== null || name === 'announcement') (value as Record<string, unknown>)[name] = cleaned;
      }
    }
  } catch { /* defaults */ }
  cache = { at: Date.now(), value };
  return value;
}

/** Store one setting; the caller has already validated it with cleanSetting. Clears this instance's cache. */
export async function saveAppSetting<K extends SettingName>(name: K, value: AppSettings[K], adminId: number) {
  const table = getSupabaseAdmin().from('app_settings');
  // value is jsonb not null: a null setting (no announcement) is stored as no row, which reads back as the default.
  const { error } = value === null
    ? await table.delete().eq('key', KEYS[name])
    : await table.upsert({ key: KEYS[name], value, updated_at: new Date().toISOString(), updated_by: adminId });
  cache = null;
  if (error) throw Object.assign(new Error(`Could not save the setting (${error.code || 'db'})`), { code: error.code });
}

/** AI features are on only when the deploy allows them (env) and the switch is on. */
export async function aiAvailable(): Promise<boolean> {
  return AI_ENABLED && (await getAppSettings()).aiEnabled;
}

/** Whether `slug` is on the admin's extra reserved list. */
export async function isAdminReserved(slug: string): Promise<boolean> {
  return (await getAppSettings()).reservedSlugs.includes(slug);
}
