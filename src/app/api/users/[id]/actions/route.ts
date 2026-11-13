import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/admin-audit';
import { mailResetLink, mailVerificationLink } from '@/lib/account-links';
import { revokeAllSessions } from '@/lib/sessions';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

const MAX_REASON = 300;
const isMissingColumn = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === '42703' || error.code === 'PGRST204' || /taken_down_at|takedown_reason/.test(error.message || ''));

/**
 * One-off superadmin actions on an account:
 * - `takedown` { reason }: hide its portfolio from the public; the owner can't publish it again until `restore`.
 * - `restore`: undo a takedown (the owner's own published/draft state is unchanged).
 * - `resend-verification`: mail a new verification link to an unverified account.
 * - `send-reset`: mail a password reset link (same link as "Forgot password").
 * - `logout-all`: end every session of the account (their access token still works up to 15 minutes).
 * Mails are limited per account, so the panel can't be used to flood someone's inbox.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const rawId = (await params).id;
    const id = /^\d+$/.test(rawId) ? Number(rawId) : null;
    if (!id) return errorResponse('User not found', 404);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const action = body.action;

    const db = getSupabaseAdmin();
    const { data: user } = await db.from('users').select('id, name, email, is_verified').eq('id', id).maybeSingle();
    if (!user) return errorResponse('User not found', 404);

    if (action === 'takedown' || action === 'restore') {
      const { data: portfolio } = await db.from('portfolios').select('id, slug').eq('owner_id', id).limit(1).maybeSingle();
      if (!portfolio) return errorResponse('This account has no portfolio', 404);
      const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, MAX_REASON) : '';
      if (action === 'takedown' && !reason) return errorResponse('Give a short reason; the owner sees it in their dashboard', 400);
      const updates = action === 'takedown'
        ? { taken_down_at: new Date().toISOString(), takedown_reason: reason }
        : { taken_down_at: null, takedown_reason: null };
      const { error } = await db.from('portfolios').update(updates).eq('id', portfolio.id);
      if (isMissingColumn(error)) return errorResponse('Run migration 008 in Supabase first (takedown columns are missing)', 409);
      if (error) return errorResponse('That change could not be saved', 500);
      if (action === 'takedown') {
        // Open visitor reports about it are now handled (table from migration 009; skipped if it isn't there yet).
        await db.from('portfolio_reports').update({ status: 'actioned', resolved_at: new Date().toISOString(), resolved_by: auth.id })
          .eq('portfolio_id', portfolio.id).eq('status', 'open');
      }
      await logAdminAction({ actorId: auth.id, action, targetUserId: id, targetLabel: portfolio.slug, details: action === 'takedown' ? { reason } : null });
      return successResponse({ message: action === 'takedown' ? 'Portfolio taken down' : 'Portfolio restored' });
    }

    if (action === 'resend-verification' || action === 'send-reset') {
      if (action === 'resend-verification' && user.is_verified) return errorResponse('This account is already verified', 400);
      const rl = await checkRateLimit(`admin-mail:${id}`, 'otp');
      if (!rl.allowed) return errorResponse('Too many emails to this account for now. Try again in 15 minutes.', 429);
      try {
        if (action === 'send-reset') await mailResetLink(user);
        else await mailVerificationLink(user);
      } catch (mailError) {
        console.error('[admin mail]', action, getErrorMessage(mailError));
        return errorResponse('The email could not be sent. Try again later.', 502);
      }
      await logAdminAction({ actorId: auth.id, action, targetUserId: id, targetLabel: user.email });
      return successResponse({ message: action === 'send-reset' ? `Reset link sent to ${user.email}` : `Verification link sent to ${user.email}` });
    }

    if (action === 'logout-all') {
      if (id === auth.id) return errorResponse('Use "Log out" in your own account menu for this account', 400);
      await revokeAllSessions(id);
      await logAdminAction({ actorId: auth.id, action: 'force-logout', targetUserId: id, targetLabel: user.email });
      return successResponse({ message: `Signed ${user.email} out everywhere` });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    const message = getErrorMessage(err);
    return errorResponse(message, message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500);
  }
}
