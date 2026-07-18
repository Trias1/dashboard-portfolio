// Utility functions

export function generateSlug(name: string, id?: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return id ? `${base}-${id}` : base;
}

export function sanitizeStr(val: any): string {
  if (!val) return '';
  return String(val).trim();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0];
}

// Error response helper
export function errorResponse(message: string, status: number = 500) {
  return Response.json({ message }, { status });
}

// Success response helper
export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}
