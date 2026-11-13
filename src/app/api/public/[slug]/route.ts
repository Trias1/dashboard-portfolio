import { NextRequest } from 'next/server';
import { loadPublicPortfolio } from '@/lib/public-portfolio';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Portfolio data as JSON. The public page renders on the server and no longer calls this; the dashboard uses it
 * (with ?preview=true and its Bearer token) to load the owner's draft. Visits are counted by POST .../visit.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const search = request.nextUrl.searchParams;
    const data = await loadPublicPortfolio(slug, {
      preview: search.get('preview') === 'true',
      request,
      demo: { template: search.get('template'), theme: search.get('theme') },
    });
    if (!data) return errorResponse('Portfolio not found or not published', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
