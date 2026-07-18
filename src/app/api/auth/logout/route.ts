import { clearAuthCookies } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export async function POST() {
  await clearAuthCookies();
  return successResponse({ message: 'Logged out successfully' });
}
