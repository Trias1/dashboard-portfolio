import { NextRequest } from 'next/server';
import { hasSudo, requireSuperAdmin, sudoRequired } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revokeAllSessions } from '@/lib/sessions';
import { logAdminAction } from '@/lib/admin-audit';
import { deleteAccount } from '@/lib/delete-account';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

/** Roles a superadmin can give. `admin` is the ordinary member role every new account gets. */
const ROLES = ['admin', 'superadmin'] as const;

const parseId = (id: string) => (/^\d+$/.test(id) ? Number(id) : null);
const status = (err: unknown) => (getErrorMessage(err) === 'Forbidden' ? 403 : getErrorMessage(err) === 'Unauthorized' ? 401 : 500);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const id = parseId((await params).id);
    if (!id) return errorResponse('User not found', 404);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    const { role, is_active } = body as { role?: unknown; is_active?: unknown };
    const updates: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!ROLES.includes(role as typeof ROLES[number])) return errorResponse('Invalid role', 400);
      updates.role = role;
    }
    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') return errorResponse('Invalid is_active', 400);
      updates.is_active = is_active;
    }
    if (!Object.keys(updates).length) return errorResponse('Nothing to update', 400);
    // Giving or taking superadmin powers needs a fresh emailed code (deactivating doesn't: it's undone with one click).
    if (updates.role !== undefined && !(await hasSudo(auth.id))) return sudoRequired();
    // Don't lock yourself out of the admin panel.
    if (auth.id === id && ((updates.role && updates.role !== 'superadmin') || updates.is_active === false)) {
      return errorResponse("You can't demote or deactivate your own account", 400);
    }
    const db = getSupabaseAdmin();
    const { data: before } = await db.from('users').select('role, is_active').eq('id', id).maybeSingle();
    if (!before) return errorResponse('User not found', 404);
    const { data, error } = await db.from('users').update(updates).eq('id', id).select('id, name, email, role, is_active, is_verified').maybeSingle();
    if (error) return errorResponse('That change could not be saved', 500);
    if (!data) return errorResponse('User not found', 404);
    // Deactivated or role changed: end their sessions so it applies right away, not when tokens expire.
    if (updates.is_active === false || updates.role !== undefined) await revokeAllSessions(data.id);

    if (updates.role !== undefined && updates.role !== before.role) {
      await logAdminAction({ actorId: auth.id, action: 'role-change', targetUserId: id, targetLabel: data.email, details: { from: before.role, to: updates.role } });
    }
    if (updates.is_active !== undefined && updates.is_active !== before.is_active) {
      await logAdminAction({ actorId: auth.id, action: updates.is_active ? 'activate' : 'deactivate', targetUserId: id, targetLabel: data.email });
    }
    return successResponse(data);
  } catch (err) {
    return errorResponse(getErrorMessage(err), status(err));
  }
}

/** Permanent. The body must repeat the account's email, so a stray or replayed request can't delete anyone. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(request);
    const id = parseId((await params).id);
    if (!id) return errorResponse('User not found', 404);
    if (auth.id === id) return errorResponse("You can't delete your own account here", 400);
    const body = await readJsonBody(request);
    const confirmEmail = typeof body?.confirm_email === 'string' ? body.confirm_email.trim().toLowerCase() : '';

    const { data: user } = await getSupabaseAdmin().from('users').select('id, email').eq('id', id).maybeSingle();
    if (!user) return errorResponse('User not found', 404);
    if (!confirmEmail || confirmEmail !== String(user.email).toLowerCase()) {
      return errorResponse("Type the account's email exactly to confirm", 400);
    }

    if (!(await hasSudo(auth.id))) return sudoRequired();
    const { files } = await deleteAccount(id);
    await logAdminAction({ actorId: auth.id, action: 'delete-account', targetUserId: id, targetLabel: user.email, details: { files } });
    return successResponse({ message: 'Account deleted' });
  } catch (err) {
    const message = getErrorMessage(err);
    if (message === 'User not found') return errorResponse(message, 404);
    if (message.startsWith('Could not')) {
      // Names the step that failed (a table name and an error code, nothing private) so the admin knows where it stopped.
      console.error('[delete account]', message);
      return Response.json({ message: `${message}. Nothing after that step was deleted.` }, { status: 500 });
    }
    return errorResponse(message, status(err));
  }
}
