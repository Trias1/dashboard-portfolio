import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

const VERCEL_API = 'https://api.vercel.com';

function getMessage(event: any) {
  return event.text || event.message || event.payload?.text || event.payload?.message || event.type || 'Vercel event';
}

function getLevel(event: any) {
  const value = String(event.level || event.payload?.level || event.type || '').toLowerCase();
  if (value.includes('error') || value.includes('fail')) return 'error';
  if (value.includes('warn')) return 'warning';
  return 'info';
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const token = process.env.VERCEL_TOKEN_PROD || process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!token || !projectId) return errorResponse('Vercel logging is not configured', 503);

    const scope = teamId ? `&teamId=${encodeURIComponent(teamId)}` : '';
    const deploymentsResponse = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=1${scope}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!deploymentsResponse.ok) return errorResponse('Unable to fetch Vercel deployments', 502);

    const deployments = await deploymentsResponse.json();
    const deployment = deployments.deployments?.[0];
    if (!deployment?.uid) return successResponse([]);

    const eventsResponse = await fetch(
      `${VERCEL_API}/v3/deployments/${encodeURIComponent(deployment.uid)}/events?limit=50${scope}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!eventsResponse.ok) return errorResponse('Unable to fetch Vercel logs', 502);

    const events = await eventsResponse.json();
    const rows = (Array.isArray(events) ? events : events.events || []).slice(-50).reverse().map((event: any, index: number) => ({
      id: String(event.id || `${deployment.uid}-${index}`),
      timestamp: event.createdAt || event.timestamp || event.date || new Date().toISOString(),
      level: getLevel(event),
      deployment: deployment.url || deployment.uid,
      route: event.route || event.path || event.requestPath || null,
      status: event.statusCode || event.status || null,
      message: String(getMessage(event)).slice(0, 1000),
    }));

    return successResponse(rows);
  } catch (error: any) {
    return errorResponse(error?.message === 'Forbidden' ? 'Forbidden' : 'Unable to load Vercel logs', error?.message === 'Forbidden' ? 403 : 401);
  }
}
