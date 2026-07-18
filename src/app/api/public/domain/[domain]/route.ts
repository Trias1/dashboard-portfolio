import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ domain: string }> }) {
  try {
    const { domain } = await params;
    const { data } = await getSupabaseAdmin().from('portfolios').select('slug').eq('custom_domain', domain).eq('is_published', true).maybeSingle();
    if (!data) return errorResponse('Portfolio not found', 404);
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}