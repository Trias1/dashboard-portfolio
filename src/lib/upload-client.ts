import api from '@/lib/api';

/** A problem the user can fix (e.g. the file is too big); its message is shown as is. */
export class UploadError extends Error {}

/** Same limit the server applies to images (src/lib/upload-validation.ts). */
export const MAX_IMAGE_MB = 5;

/**
 * Uploads an image to storage and returns its public URL, which is what the section routes accept.
 * (Sending the image itself as a base64 data URL was rejected: those fields must be web links.)
 */
export async function uploadImage(file: File, folder: 'photos' | 'projects'): Promise<string> {
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new UploadError(`Images can be at most ${MAX_IMAGE_MB} MB`);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const res = await api.post<{ url: string }>('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  if (!res.data?.url) throw new Error('Upload failed');
  return res.data.url;
}
