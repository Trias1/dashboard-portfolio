import { getSupabaseAdmin } from './admin';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

export async function uploadFile(buffer: Buffer, fileName: string, contentType: string, folder: string = 'general'): Promise<string> {
  const supabase = getSupabaseAdmin();
  const filePath = folder + '/' + fileName;
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, { contentType, upsert: true });
  if (error) throw new Error('Upload failed: ' + error.message);
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const prefix = baseUrl + '/storage/v1/object/public/' + BUCKET_NAME + '/';
  if (!fileUrl.startsWith(prefix)) return;
  const filePath = fileUrl.replace(prefix, '');
  await supabase.storage.from(BUCKET_NAME).remove([filePath]);
}