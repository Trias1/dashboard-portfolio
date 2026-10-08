// Utility functions

export function generateSlug(name: string, id?: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return id ? `${base}-${id}` : base;
}

export function sanitizeStr(val: unknown): string {
  if (!val) return '';
  return String(val).trim();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0];
}

// Message from anything thrown (Error, string, Supabase/PostgREST error object, ...)
export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message;
  return fallback;
}

// Error response helper
// - Auth errors thrown by requireAuth/requireAdmin ('Unauthorized'/'Forbidden') that reach a
//   generic catch are mapped to 401/403 instead of 500.
// - Other 500s return a generic message so internal error details (DB/SDK errors) don't leak.
export function errorResponse(message: string, status: number = 500) {
  if (status === 500) {
    if (message === 'Unauthorized') return Response.json({ message }, { status: 401 });
    if (message === 'Forbidden') return Response.json({ message }, { status: 403 });
    console.error('[API 500]', message);
    return Response.json({ message: 'Internal server error' }, { status });
  }
  return Response.json({ message }, { status });
}

// Success response helper
export function successResponse(data: unknown, status: number = 200) {
  return Response.json(data, { status });
}
