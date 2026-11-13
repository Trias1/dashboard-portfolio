import { getAppSettings, aiAvailable } from '@/lib/app-settings';

export const dynamic = 'force-dynamic';

/** What the pages need to know about the Settings switches. Reserved slugs stay server-side. */
export async function GET() {
  const settings = await getAppSettings();
  return Response.json(
    { signupsOpen: settings.signupsOpen, aiEnabled: await aiAvailable(), announcement: settings.announcement },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
