import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count } = await getSupabaseAdmin()
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);
    return successResponse({ portfolios: count || 0 });
  } catch {
    return successResponse({ portfolios: 0 });
  }
}
