// Server-side upload validation: MIME allowlist + magic-byte detection.
// The stored extension / content type are derived from the detected type,
// never from the client-provided file name or MIME type.

export type DetectedFileType = {
  mime: string;
  ext: string;
  kind: 'image' | 'pdf' | 'doc';
};

const MB = 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * MB;
export const MAX_DOCUMENT_BYTES = 10 * MB;

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

export function detectFileType(buf: Buffer): DetectedFileType | null {
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png', kind: 'image' };
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg', kind: 'image' };
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38]) && (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61) return { mime: 'image/gif', ext: 'gif', kind: 'image' };
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return { mime: 'image/webp', ext: 'webp', kind: 'image' };
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: 'application/pdf', ext: 'pdf', kind: 'pdf' };
  // Legacy Word (OLE compound file)
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return { mime: 'application/msword', ext: 'doc', kind: 'doc' };
  // DOCX (ZIP container that contains a word/ part)
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && buf.subarray(0, Math.min(buf.length, 64 * 1024)).includes('word/')) {
    return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', kind: 'doc' };
  }
  return null;
}

export type UploadValidationResult =
  | { ok: true; buffer: Buffer; type: DetectedFileType }
  | { ok: false; error: string };

/**
 * Validate an uploaded File against an allowlist of kinds.
 * Images are capped at 5MB, PDF/DOC at 10MB.
 */
export async function validateUpload(file: unknown, allowedKinds: DetectedFileType['kind'][]): Promise<UploadValidationResult> {
  if (!file || typeof file === 'string' || typeof (file as File).arrayBuffer !== 'function') {
    return { ok: false, error: 'No file uploaded' };
  }
  const f = file as File;
  const maxAllowed = allowedKinds.some((k) => k !== 'image') ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;
  if (f.size === 0) return { ok: false, error: 'Empty file' };
  if (f.size > maxAllowed) return { ok: false, error: `File too large (max ${maxAllowed / MB}MB)` };

  const buffer = Buffer.from(await f.arrayBuffer());
  const type = detectFileType(buffer);
  if (!type || !allowedKinds.includes(type.kind)) {
    return { ok: false, error: 'Unsupported file type' };
  }
  const limit = type.kind === 'image' ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (buffer.length > limit) return { ok: false, error: `File too large (max ${limit / MB}MB)` };
  return { ok: true, buffer, type };
}

/** Accept only absolute http(s) URLs (blocks javascript:, data:, etc.). */
export function sanitizeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch { return null; }
}
