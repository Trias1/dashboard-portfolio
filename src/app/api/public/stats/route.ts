import { listPublicPortfolios } from '@/lib/public-access';
import { successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = (await listPublicPortfolios()).length;
    return successResponse({ portfolios: count || 0 });
  } catch {
    return successResponse({ portfolios: 0 });
  }
}
