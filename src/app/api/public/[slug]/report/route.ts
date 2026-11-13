import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { findPublicPortfolio } from '@/lib/public-access';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse, readJsonBody, invalidBodyResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Keep in step with REASONS in src/components/ReportPortfolio.tsx
const REPORT_REASONS = ['spam', 'impersonation', 'offensive', 'other'] as const;
const MAX_DETAILS = 500;

/**
 * "Report this portfolio" from the public page. Goes to the superadmin's report queue (migration 009).
 * Anonymous; the IP is only kept as an HMAC so one person filing many reports can be spotted.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ip = getClientId(request);
    const rl = await checkRateLimit(`report:${ip}`, 'report');
    if (!rl.allowed) return errorResponse('Too many reports from here. Try again later.', 429);

    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const reason = typeof body.reason === 'string' && (REPORT_REASONS as readonly string[]).includes(body.reason) ? body.reason : null;
    if (!reason) return errorResponse('Pick a reason', 400);
    const details = typeof body.details === 'string' ? body.details.trim().slice(0, MAX_DETAILS) : '';
    if (reason === 'other' && !details) return errorResponse('Tell us briefly what is wrong', 400);

    const portfolio = await findPublicPortfolio(slug);
    if (!portfolio || slug === 'demo') return errorResponse('Portfolio not found', 404);

    const secret = process.env.JWT_SECRET || '';
    const reporter_hash = crypto.createHmac('sha256', secret).update(`report:${ip}`).digest('hex').slice(0, 32);
    const { error } = await getSupabaseAdmin().from('portfolio_reports').insert({
      portfolio_id: portfolio.id, reason, details: details || null, reporter_hash,
    });
    if (error) {
      console.error('[report] not stored', error.code || error.message);
      return errorResponse('Your report could not be sent. Try again later.', 503);
    }
    return successResponse({ message: 'Thanks. An admin will look at it.' }, 201);
  } catch {
    return errorResponse('Your report could not be sent. Try again later.', 503);
  }
}
