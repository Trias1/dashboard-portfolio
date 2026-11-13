import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { hasSudo, issueSudoChallenge, requireSuperAdmin, SUDO_MINUTES, verifySudoChallenge } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendAdminConfirmCode } from '@/lib/mailer';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

/**
 * Step-up for destructive admin actions (delete account, change a role).
 * `{ action: 'status' }` says whether it's already confirmed, `'send'` mails a code to the admin's own address,
 * `'verify', code` checks it and opens a SUDO_MINUTES window.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();

    if (body.action === 'status') return successResponse({ confirmed: await hasSudo(auth.id) });

    const { data: admin } = await getSupabaseAdmin().from('users').select('email').eq('id', auth.id).maybeSingle();
    if (!admin?.email) return errorResponse('Forbidden', 403);

    if (body.action === 'send') {
      const rl = await checkRateLimit(`sudo-send:${auth.id}`, 'otp');
      if (!rl.allowed) return errorResponse('Too many codes for now. Try again in 15 minutes.', 429);
      const code = crypto.randomInt(100000, 1000000).toString();
      await issueSudoChallenge(auth.id, admin.email, code);
      try {
        await sendAdminConfirmCode(admin.email, code);
      } catch (mailError) {
        console.error('[admin sudo] mail failed', getErrorMessage(mailError));
        return errorResponse('The code could not be sent. Try again later.', 502);
      }
      return successResponse({ message: `Code sent to ${admin.email}` });
    }

    if (body.action === 'verify') {
      const rl = await checkRateLimit(`sudo-verify:${auth.id}:${getClientId(request)}`, 'otp');
      if (!rl.allowed) return errorResponse('Too many tries. Ask for a new code in 15 minutes.', 429);
      const code = typeof body.code === 'string' ? body.code.trim() : '';
      if (!(await verifySudoChallenge(auth.id, admin.email, code))) return errorResponse("That code isn't right or has expired", 400);
      return successResponse({ message: `Confirmed for ${SUDO_MINUTES} minutes` });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    const message = getErrorMessage(err);
    return errorResponse(message, message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500);
  }
}
