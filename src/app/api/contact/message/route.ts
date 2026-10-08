import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { sendContactNotification } from '@/lib/mailer';
import { notifyRecipient } from '@/lib/notify-email';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(`message:${getClientId(request)}`, 'message');
    if (!rl.allowed) return errorResponse('Too many messages. Please try again later.', 429);

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (!name || !email || !message || !slug) return errorResponse('Please fill in all fields', 400);
    if (name.length > MAX_NAME_LENGTH) return errorResponse(`Name can be at most ${MAX_NAME_LENGTH} characters`, 400);
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return errorResponse("That email address doesn't look right", 400);
    if (message.length > MAX_MESSAGE_LENGTH) return errorResponse(`Message can be at most ${MAX_MESSAGE_LENGTH} characters`, 400);

    const { data: portfolio } = await getSupabaseAdmin()
      .from('portfolios')
      .select('owner_id')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (!portfolio) return errorResponse('Portfolio not found', 404);
    const owner_id = portfolio.owner_id;

    await getSupabaseAdmin().from('contact_messages').insert({ name, email, message, owner_id });

    // Notify the owner at their confirmed notification email or their account email — never the free-form
    // public contact_info.email, so the contact form cannot be abused to relay mail to arbitrary addresses.
    const recipient = await notifyRecipient(owner_id);
    if (recipient) {
      try {
        await sendContactNotification(recipient, name, email, message);
      } catch (err) {
        console.error('[SMTP Error] Failed to send contact email:', err);
        // Return error so the user knows it failed, preventing silent data loss.
        return errorResponse("Your message was saved, but we couldn't forward it to the owner's email.", 502);
      }
    }

    return successResponse({ message: 'Message sent.' }, 201);
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
