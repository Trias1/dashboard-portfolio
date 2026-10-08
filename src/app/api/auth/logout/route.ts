import { cookies } from 'next/headers';
import { clearAuthCookies } from '@/lib/auth';
import { endSession } from '@/lib/sessions';
import { successResponse } from '@/lib/utils';

export async function POST() {
  try {
    // Revoke the session server-side so a copied refresh token stops working too.
    await endSession((await cookies()).get('refreshToken')?.value);
  } catch (err) {
    console.error('[auth logout] revoke failed', err instanceof Error ? err.message : err);
  }
  await clearAuthCookies();
  return successResponse({ message: 'Logged out successfully' });
}
