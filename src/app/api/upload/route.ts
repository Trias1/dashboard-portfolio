import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadFile } from '@/lib/supabase/storage';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) return errorResponse('No file uploaded', 400);

    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${folder}-${auth.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const publicUrl = await uploadFile(buffer, fileName, file.type, folder);

    return successResponse({ url: publicUrl, fileName, size: file.size });
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
