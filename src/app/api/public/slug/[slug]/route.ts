import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { data } = await getSupabaseAdmin().from('portfolios').select('slug').eq('slug', slug).eq('is_published', true).maybeSingle();
    if (!data) return errorResponse('Portfolio not found', 404);
    return successResponse(data);
  } catch (err: any) { return errorResponse(err.message); }
}
