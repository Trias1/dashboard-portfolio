import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return errorResponse('Unauthorized', 401);
    const userAgent = request.headers.get('user-agent') || '';
    const lastDevice = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : /tablet/i.test(userAgent) ? 'Tablet' : 'Desktop';
    const { error } = await getSupabaseAdmin().from('users').update({ last_seen_at: new Date().toISOString(), last_device: lastDevice }).eq('id', auth.id);
    if (error) throw error;
    return successResponse({ ok: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Unable to update presence', 500);
  }
}
