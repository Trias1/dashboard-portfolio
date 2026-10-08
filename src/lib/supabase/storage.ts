import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from './admin';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

export const UPLOAD_FOLDERS = ['general', 'photos', 'projects', 'gallery', 'cv', 'services', 'testimonials'] as const;
export type UploadFolder = typeof UPLOAD_FOLDERS[number];

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === 'string' && (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

/**
 * Upload a file. The stored name is `${prefix}-${uuid}.${ext}`; prefix and ext are
 * sanitized and the folder must be one of UPLOAD_FOLDERS. Never overwrites (upsert: false).
 */
export async function uploadFile(buffer: Buffer, fileName: string, contentType: string, folder: UploadFolder = 'general'): Promise<string> {
  if (!isUploadFolder(folder)) throw new Error('Invalid upload folder');
  const supabase = getSupabaseAdmin();
  const dot = fileName.lastIndexOf('.');
  const rawPrefix = dot > 0 ? fileName.slice(0, dot) : fileName;
  const rawExt = dot > 0 ? fileName.slice(dot + 1) : 'bin';
  const prefix = rawPrefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'file';
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase() || 'bin';
  const filePath = `${folder}/${prefix}-${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, { contentType, upsert: false });
  if (error) {
    console.error('Storage upload failed:', error.message);
    throw new Error('Upload failed');
  }
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return urlData.publicUrl;
}

/**
 * Delete a file from the bucket by its public URL. When ownerId is given, only files whose
 * name was generated for that owner (`<folder>/<kind>-<ownerId>-...`) are deleted, so a
 * user-supplied URL cannot be used to delete someone else's upload.
 */
export async function deleteFile(fileUrl: string, ownerId?: string | number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const prefix = baseUrl + '/storage/v1/object/public/' + BUCKET_NAME + '/';
  if (!fileUrl.startsWith(prefix)) return;
  const filePath = fileUrl.replace(prefix, '');
  if (filePath.includes('..') || filePath.includes('?') || filePath.includes('#')) return;
  if (ownerId !== undefined) {
    const baseName = filePath.split('/').pop() || '';
    if (!new RegExp(`^[a-z]+-${String(ownerId).replace(/[^a-zA-Z0-9_-]/g, '')}-`).test(baseName)) return;
  }
  await supabase.storage.from(BUCKET_NAME).remove([filePath]);
}
