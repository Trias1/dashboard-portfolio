import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { AI_ENABLED } from '@/lib/features';
import { cleanSetting, getAppSettings, saveAppSetting, type SettingName, CACHE_MS } from '@/lib/app-settings';
import { logAdminAction } from '@/lib/admin-audit';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

const NAMES: SettingName[] = ['signupsOpen', 'aiEnabled', 'announcement', 'reservedSlugs'];
const status = (err: unknown) => (getErrorMessage(err) === 'Forbidden' ? 403 : getErrorMessage(err) === 'Unauthorized' ? 401 : 500);

/** Every switch, plus whether the table exists and whether the deploy allows AI at all. */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const { error } = await getSupabaseAdmin().from('app_settings').select('key').limit(1);
    return successResponse({
      settings: await getAppSettings(),
      missingTable: !!error && (error.code === '42P01' || error.code === 'PGRST205'),
      aiAllowedByDeploy: AI_ENABLED,
      cacheSeconds: CACHE_MS / 1000,
    });
  } catch (err) {
    return errorResponse(getErrorMessage(err), status(err));
  }
}

/** `{ name, value }`: change one switch. For reserved slugs it also says which live portfolios already use one. */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const name = body.name as SettingName;
    if (!NAMES.includes(name)) return errorResponse('Unknown setting', 400);
    const value = cleanSetting(name, body.value);
    if (value === null && name !== 'announcement') return errorResponse('That value is not valid for this setting', 400);

    const before = (await getAppSettings())[name];
    try {
      await saveAppSetting(name, value as never, auth.id);
    } catch (saveError) {
      const code = (saveError as { code?: string }).code;
      if (code === '42P01' || code === 'PGRST205') return errorResponse('Run migration 010 in Supabase first (app_settings is missing)', 409);
      throw saveError;
    }
    await logAdminAction({ actorId: auth.id, action: 'settings-change', details: { name, from: before, to: value } });

    let inUse: string[] = [];
    if (name === 'reservedSlugs' && Array.isArray(value) && value.length) {
      const { data } = await getSupabaseAdmin().from('portfolios').select('slug').in('slug', value as string[]);
      inUse = (data || []).map((p) => p.slug);
    }
    return successResponse({ message: 'Saved', value, inUse });
  } catch (err) {
    return errorResponse(getErrorMessage(err), status(err));
  }
}
