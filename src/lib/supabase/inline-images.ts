import { checkRateLimit } from '@/lib/rate-limit';
import { isImageDataUrl, parseImageDataUrl, type DetectedFileType } from '@/lib/upload-validation';
import { deleteFile, uploadFile, type UploadFolder } from './storage';

type InlineImage = { field: string; buffer: Buffer; type: DetectedFileType };

/**
 * Older rows kept photos as base64 data URLs inside the row (`data:image/jpeg;base64,...`). The editor sends that
 * value back on every save, and section routes only accept web links, so the whole section could not be saved.
 *
 * Step 1 (before checkSectionBody): take those images out of the body (the field is left empty so the link check
 * passes) and check they are real images. Step 2 (after the body is valid): upload them and put the URLs back.
 * Uploading last means a body that fails validation leaves no file behind.
 */
export function takeInlineImages(body: unknown, fields: string[]): { images: InlineImage[] } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { images: [] };
  const record = body as Record<string, unknown>;
  const images: InlineImage[] = [];
  for (const field of fields) {
    if (!isImageDataUrl(record[field])) continue;
    const parsed = parseImageDataUrl(record[field]);
    if (!parsed) return { error: `${field.replace(/_/g, ' ')} is not a supported image (PNG, JPEG, GIF or WebP up to 5MB). Upload it again.` };
    images.push({ field, ...parsed });
    record[field] = '';
  }
  return { images };
}

/**
 * Upload the images from takeInlineImages and set their public URLs on the body. Files are named like normal
 * uploads (`<folder>-<ownerId>-...`), so deleteFile's owner check applies to them. Returns the stored URLs
 * (so a caller can remove them if the write then fails), or an error message for the client.
 */
export async function putInlineImages(
  body: unknown,
  images: InlineImage[],
  ownerId: string | number,
  folder: UploadFolder,
): Promise<{ urls: string[] } | { error: string }> {
  if (!images.length) return { urls: [] };
  const rl = await checkRateLimit(`upload:${ownerId}`, 'upload');
  if (!rl.allowed) return { error: 'Too many uploads. Please try again later.' };
  const record = body as Record<string, unknown>;
  const urls: string[] = [];
  for (const image of images) {
    const url = await uploadFile(image.buffer, `${folder}-${ownerId}.${image.type.ext}`, image.type.mime, folder);
    record[image.field] = url;
    urls.push(url);
  }
  return { urls };
}

/** Remove files putInlineImages stored when the row write did not happen (e.g. the row isn't the caller's). */
export async function dropInlineImages(urls: string[], ownerId: string | number): Promise<void> {
  await Promise.all(urls.map((url) => deleteFile(url, ownerId).catch(() => undefined)));
}
