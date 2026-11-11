import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Tables that hold one row per user (migration 007 makes owner_id unique on them). */
export type OwnerRowTable = 'about' | 'hero' | 'contact_info';

interface SaveOptions {
  /** Extra fields used only when the row has to be created (defaults for NOT NULL columns). */
  insertDefaults?: Record<string, unknown>;
  /** Set updated_at on update (about and hero have the column, contact_info doesn't). */
  touch?: boolean;
}

/**
 * Updates the user's single row in `table`, or creates it when there is none.
 * Two saves at once (a double-click) can both see "no row" and both insert: with the UNIQUE(owner_id)
 * index from migration 007 the second insert fails with 23505 and is retried as an update, so the
 * user never ends up with two rows. Without the index it behaves as before.
 */
export async function saveOwnerRow(table: OwnerRowTable, ownerId: string | number, fields: Record<string, unknown>, options: SaveOptions = {}) {
  const db = getSupabaseAdmin();
  const changes = options.touch ? { ...fields, updated_at: new Date().toISOString() } : fields;

  const update = () => db.from(table).update(changes).eq('owner_id', ownerId).select();
  const updated = await update();
  if (updated.error) throw updated.error;
  if (updated.data?.length) return updated.data[0] as Record<string, unknown>;

  const inserted = await db.from(table).insert({ ...options.insertDefaults, ...fields, owner_id: ownerId }).select().single();
  if (!inserted.error) return inserted.data as Record<string, unknown>;
  if (inserted.error.code !== '23505') throw inserted.error;

  // Another request created the row in between: write to that one.
  const retried = await update();
  if (retried.error) throw retried.error;
  return (retried.data?.[0] ?? null) as Record<string, unknown> | null;
}
