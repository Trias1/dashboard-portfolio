import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage, readJsonBody, invalidBodyResponse } from '@/lib/utils';

const messageId = (raw: string) => (/^\d{1,18}$/.test(raw) ? raw : null);

/** Mark one of your messages read or unread: { is_read: boolean }. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const id = messageId((await params).id);
    if (!id) return errorResponse('Message not found', 404);
    const body = await readJsonBody(request);
    if (!body) return invalidBodyResponse();
    if (typeof body.is_read !== 'boolean') return errorResponse('is_read must be true or false', 400);
    const { data } = await getSupabaseAdmin()
      .from('contact_messages')
      .update({ is_read: body.is_read })
      .eq('id', id)
      .eq('owner_id', auth.id)
      .select('id, is_read')
      .maybeSingle();
    if (!data) return errorResponse('Message not found', 404);
    return successResponse(data);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}

/** Delete one of your messages. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    const id = messageId((await params).id);
    if (!id) return errorResponse('Message not found', 404);
    const { data } = await getSupabaseAdmin()
      .from('contact_messages')
      .delete()
      .eq('id', id)
      .eq('owner_id', auth.id)
      .select('id');
    if (!data?.length) return errorResponse('Message not found', 404);
    return successResponse({ deleted: true });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
