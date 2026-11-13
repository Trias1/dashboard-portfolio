import { NextRequest } from 'next/server';
import { findPublicPortfolio } from '@/lib/public-access';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await findPublicPortfolio(slug);
    if (!data) return errorResponse('Portfolio not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}