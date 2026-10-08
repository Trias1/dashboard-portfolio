import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { sendContactNotification } from '@/lib/mailer';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(`message:${getClientId(request)}`, 'message');
    if (!rl.allowed) return errorResponse('Terlalu banyak pesan. Coba lagi nanti.', 429);

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (!name || !email || !message || !slug) return errorResponse('Semua field harus diisi', 400);
    if (name.length > MAX_NAME_LENGTH) return errorResponse(`Nama maksimal ${MAX_NAME_LENGTH} karakter`, 400);
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return errorResponse('Format email tidak valid', 400);
    if (message.length > MAX_MESSAGE_LENGTH) return errorResponse(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter`, 400);

    const { data: portfolio } = await getSupabaseAdmin()
      .from('portfolios')
      .select('owner_id')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (!portfolio) return errorResponse('Portfolio not found', 404);
    const owner_id = portfolio.owner_id;

    await getSupabaseAdmin().from('contact_messages').insert({ name, email, message, owner_id });

    // Notify owner at their account email (users.email), not the free-form public contact_info.email,
    // so the contact form cannot be abused to relay mail to arbitrary third-party addresses.
    const { data: owner } = await getSupabaseAdmin().from('users').select('email').eq('id', owner_id).maybeSingle();
    if (owner?.email) {
      try {
        await sendContactNotification(owner.email, name, email, message);
      } catch (err: any) {
        console.error('[SMTP Error] Failed to send contact email:', err);
        // Return error so the user knows it failed, preventing silent data loss.
        return errorResponse('Pesan tersimpan, tetapi gagal meneruskan ke email pemilik.', 502);
      }
    }

    return successResponse({ message: 'Pesan berhasil dikirim!' }, 201);
  } catch (err: any) { return errorResponse(err.message); }
}
