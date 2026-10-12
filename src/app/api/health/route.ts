// Liveness check for the uptime monitor: never touches the database or any external service
export function GET() {
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
