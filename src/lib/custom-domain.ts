export function normalizeCustomDomain(value: string | null | undefined) {
  return (value || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/\.$/, '');
}

export function isInternalHostname(hostname: string) {
  const host = normalizeCustomDomain(hostname);
  const baseUrl = normalizeCustomDomain(process.env.NEXT_PUBLIC_BASE_URL);
  return !host || host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.vercel.app') || host === 'vercel.app' || (!!baseUrl && host === baseUrl);
}
