import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { name, email, password, photo_url } = await request.json();

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (photo_url !== undefined) updates.photo_url = photo_url;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .update(updates)
      .eq('id', auth.id)
      .select('id, name, email, role, photo_url')
      .single();

    if (error) return errorResponse(error.message, 500);
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.message === 'Unauthorized' ? 401 : 500);
  }
}
