import { NextRequest } from 'next/server';
import { hasSudo, requireSuperAdmin, sudoRequired } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/paged';
import { logAdminAction } from '@/lib/admin-audit';
import { errorResponse, getErrorMessage } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Every table as one JSON file. Secrets are left out (password hashes, reset/verification tokens), so restoring
 * means everyone sets a new password with "Forgot password". Contact messages stay encrypted with
 * MESSAGES_ENC_KEY, which is not in the file. Short-lived tables (sessions, rate limits) are skipped.
 * Uploaded files are not included, only their links. Needs the emailed code (it holds everyone's data).
 */
const TABLES: { name: string; order: string; omit?: string[] }[] = [
  { name: 'users', order: 'id', omit: ['password', 'reset_token', 'reset_token_expires', 'verification_token', 'verification_expires'] },
  { name: 'portfolios', order: 'id' },
  { name: 'hero', order: 'id' },
  { name: 'about', order: 'id' },
  { name: 'experience', order: 'id' },
  { name: 'projects', order: 'id' },
  { name: 'skills', order: 'id' },
  { name: 'services', order: 'id' },
  { name: 'gallery', order: 'id' },
  { name: 'testimonials', order: 'id' },
  { name: 'custom_sections', order: 'id' },
  { name: 'contact_info', order: 'id' },
  { name: 'contact_messages', order: 'id' },
  { name: 'notification_emails', order: 'owner_id', omit: ['token_hash', 'token_expires'] },
  { name: 'portfolio_visits', order: 'id' },
  { name: 'portfolio_reports', order: 'id', omit: ['reporter_hash'] },
  { name: 'admin_actions', order: 'id' },
  { name: 'app_settings', order: 'key' },
];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    if (!(await hasSudo(auth.id))) return sudoRequired();
    const db = getSupabaseAdmin();
    const tables: Record<string, unknown[]> = {};
    const skipped: string[] = [];
    for (const table of TABLES) {
      try {
        const rows = await fetchAllRows<Record<string, unknown>>((from, to) => db.from(table.name).select('*').order(table.order).range(from, to), 1_000_000);
        tables[table.name] = table.omit ? rows.map((row) => Object.fromEntries(Object.entries(row).filter(([k]) => !table.omit!.includes(k)))) : rows;
      } catch {
        skipped.push(table.name); // e.g. a table whose migration hasn't run
      }
    }
    const createdAt = new Date().toISOString();
    const counts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]));
    await logAdminAction({ actorId: auth.id, action: 'backup-download', details: { counts, skipped } });
    const file = JSON.stringify({
      app: 'PortfolioKit', createdAt, note: 'No password hashes or tokens. Contact messages are encrypted with MESSAGES_ENC_KEY. Uploaded files are not included.',
      counts, skipped, tables,
    });
    return new Response(file, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="portfoliokit-backup-${createdAt.slice(0, 10)}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = getErrorMessage(err);
    return errorResponse(message, message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500);
  }
}
