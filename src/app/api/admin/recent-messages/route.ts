import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { decryptMessage } from '@/lib/field-crypto';

/** Latest contact-form messages across all portfolios, with the portfolio slug they were sent to. */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const db = getSupabaseAdmin();
    // contact_messages has no foreign key to portfolios, so the slug is looked up separately (owner_id → portfolio).
    const { data: messages } = await db
      .from('contact_messages')
      .select('id, name, email, message, is_read, created_at, owner_id')
      .order('created_at', { ascending: false })
      .limit(10);
    const ownerIds = [...new Set((messages || []).map((m) => m.owner_id))];
    const { data: portfolios } = ownerIds.length
      ? await db.from('portfolios').select('owner_id, slug').in('owner_id', ownerIds)
      : { data: [] as { owner_id: number; slug: string }[] };
    const slugByOwner = new Map((portfolios || []).map((p) => [p.owner_id, p.slug]));
    return successResponse((messages || []).map((m) => ({ ...decryptMessage(m), portfolios: { slug: slugByOwner.get(m.owner_id) || null } })));
  } catch (err) {
    return errorResponse(getErrorMessage(err), getErrorMessage(err) === 'Forbidden' ? 403 : 401);
  }
}
