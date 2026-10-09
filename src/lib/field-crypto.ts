import crypto from 'crypto';

/**
 * At-rest encryption for private text fields (contact-form messages): AES-256-GCM with a key that lives in the
 * app's env (MESSAGES_ENC_KEY, 32 bytes as base64 or hex), separate from the database. A leaked database or
 * database key alone shows only ciphertext.
 *
 * Stored format: "enc:v1:" + base64(iv[12] | authTag[16] | ciphertext). Values without the prefix are older
 * plaintext rows and are returned unchanged, so reads keep working while rows are being migrated.
 */

const PREFIX = 'enc:v1:';
let cachedKey: Buffer | null | undefined;

function key(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;
  const raw = (process.env.MESSAGES_ENC_KEY || '').trim();
  let k: Buffer | null = null;
  if (/^[0-9a-f]{64}$/i.test(raw)) k = Buffer.from(raw, 'hex');
  else if (raw) {
    const b = Buffer.from(raw, 'base64');
    if (b.length === 32) k = b;
  }
  if (raw && !k) console.error('[field-crypto] MESSAGES_ENC_KEY must be 32 bytes (base64 or 64 hex chars)');
  cachedKey = k;
  return k;
}

export const isEncrypted = (value: unknown): boolean => typeof value === 'string' && value.startsWith(PREFIX);

/** Encrypt a value for storage. Without a configured key the value is stored as-is (and an error is logged once). */
export function encryptField(value: string): string {
  const k = key();
  if (!k) {
    if (process.env.NODE_ENV === 'production') console.error('[field-crypto] MESSAGES_ENC_KEY is not set; storing plaintext');
    return value;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', k, iv);
  const ct = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64');
}

/** Decrypt a stored value. Plaintext (legacy) values pass through; undecryptable ones come back as a placeholder. */
export function decryptField(value: unknown): string {
  if (typeof value !== 'string') return '';
  if (!value.startsWith(PREFIX)) return value;
  const k = key();
  if (!k) return '[encrypted]';
  try {
    const buf = Buffer.from(value.slice(PREFIX.length), 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', k, buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
  } catch {
    return '[encrypted]';
  }
}

/** Decrypt the private fields of a contact message row. */
export function decryptMessage<T extends { name?: unknown; email?: unknown; message?: unknown }>(row: T): T {
  return { ...row, name: decryptField(row.name), email: decryptField(row.email), message: decryptField(row.message) };
}
