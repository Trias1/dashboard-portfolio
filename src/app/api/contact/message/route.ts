import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { sendContactNotification } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'message');
    if (!rl.allowed) return errorResponse('Terlalu banyak pesan. Coba lagi dalam 1 jam.', 429);

    const { name, email, message, slug } = await request.json();
    if (!name || !email || !message || !slug) return errorResponse('Semua field harus diisi', 400);

    const { data: portfolio } = await getSupabaseAdmin()
      .from('portfolios')
      .select('owner_id')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (!portfolio) return errorResponse('Portfolio not found', 404);
    const owner_id = portfolio.owner_id;

    await getSupabaseAdmin().from('contact_messages').insert({ name, email, message, owner_id });

    // Notify owner
    const { data: contactInfo } = await getSupabaseAdmin().from('contact_info').select('email').eq('owner_id', owner_id).maybeSingle();
    if (contactInfo?.email) {
      sendContactNotification(contactInfo.email, name, email, message).catch((err) => {
        console.error('[SMTP Error] Failed to send contact email:', err);
      });
    }

    return successResponse({ message: 'Pesan berhasil dikirim!' }, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
