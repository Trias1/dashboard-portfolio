import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import type { VercelDeployment, VercelEvent } from '@/types/api';

const VERCEL_API = 'https://api.vercel.com';

/** Env values are often pasted with quotes or a trailing space/newline; Vercel then rejects the token or IDs. */
const cleanEnv = (v: string | undefined) => (v ?? '').trim().replace(/^["']+|["']+$/g, '').trim();

function getMessage(event: VercelEvent) {
  return event.text || event.message || event.payload?.text || event.payload?.message || event.type || 'Vercel event';
}

function getLevel(event: VercelEvent) {
  const value = String(event.level || event.payload?.level || event.type || '').toLowerCase();
  if (value.includes('error') || value.includes('fail')) return 'error';
  if (value.includes('warn')) return 'warning';
  return 'info';
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const token = cleanEnv(process.env.VERCEL_TOKEN_PROD) || cleanEnv(process.env.VERCEL_TOKEN);
    const projectId = cleanEnv(process.env.VERCEL_PROJECT_ID);
    const teamId = cleanEnv(process.env.VERCEL_TEAM_ID);

    if (!token || !projectId) return errorResponse('Vercel logging is not configured', 503);

    const scope = teamId ? `&teamId=${encodeURIComponent(teamId)}` : '';
    const deploymentsResponse = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=1${scope}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!deploymentsResponse.ok) {
      // The status tells what to fix: 401/403 = token expired, revoked or without access to this team/project.
      const hint = deploymentsResponse.status === 401 || deploymentsResponse.status === 403 ? ' — the Vercel token is invalid, expired or has no access to this project' : '';
      return errorResponse(`Unable to fetch Vercel deployments (Vercel answered ${deploymentsResponse.status})${hint}`, 502);
    }

    const deployments: { deployments?: VercelDeployment[] } = await deploymentsResponse.json();
    const deployment = deployments.deployments?.[0];
    if (!deployment?.uid) return successResponse([]);

    const eventsResponse = await fetch(
      `${VERCEL_API}/v3/deployments/${encodeURIComponent(deployment.uid)}/events?limit=50${scope}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!eventsResponse.ok) return errorResponse(`Unable to fetch Vercel logs (Vercel answered ${eventsResponse.status})`, 502);

    const events: VercelEvent[] | { events?: VercelEvent[] } = await eventsResponse.json();
    const rows = (Array.isArray(events) ? events : events.events || []).slice(-50).reverse().map((event: VercelEvent, index: number) => ({
      id: String(event.id || `${deployment.uid}-${index}`),
      timestamp: event.createdAt || event.timestamp || event.date || new Date().toISOString(),
      level: getLevel(event),
      deployment: deployment.url || deployment.uid,
      route: event.route || event.path || event.requestPath || null,
      status: event.statusCode || event.status || null,
      message: String(getMessage(event)).slice(0, 1000),
    }));

    return successResponse(rows);
  } catch (error) {
    return errorResponse(getErrorMessage(error) === 'Forbidden' ? 'Forbidden' : 'Unable to load Vercel logs', getErrorMessage(error) === 'Forbidden' ? 403 : 401);
  }
}
