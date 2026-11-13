import { getSupabaseAdmin } from './supabase/admin';

export type AdminActionName =
  | 'role-change' | 'deactivate' | 'activate' | 'takedown' | 'restore'
  | 'resend-verification' | 'send-reset' | 'delete-account' | 'force-logout' | 'report-dismiss' | 'cleanup'
  | 'settings-change' | 'backup-download';

/**
 * Record a superadmin action (table admin_actions, migration 008). Never throws: a missing table or a failed
 * insert is logged to the server log and the action itself still goes through.
 */
export async function logAdminAction(entry: {
  /** null for the system (the daily cleanup). */
  actorId: number | null;
  action: AdminActionName;
  targetUserId?: number | null;
  targetLabel?: string | null;
  details?: Record<string, unknown> | null;
}) {
  try {
    const { error } = await getSupabaseAdmin().from('admin_actions').insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_user_id: entry.targetUserId ?? null,
      target_label: entry.targetLabel ? entry.targetLabel.slice(0, 254) : null,
      details: entry.details ?? null,
    });
    if (error) console.error('[admin audit] not recorded', entry.action, error.code || error.message);
  } catch (error) {
    console.error('[admin audit] not recorded', entry.action, error instanceof Error ? error.message : error);
  }
}
