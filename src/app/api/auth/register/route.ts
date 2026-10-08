import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendAccountExistsNotice, sendVerificationEmail } from '@/lib/mailer';
import { generateSlug, errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { BCRYPT_COST, MIN_PASSWORD_LENGTH, hashToken, normalizeEmail } from '@/lib/auth';

// Same answer whether or not the email already has an account, so the form can't be used to look up users.
const DONE = { message: 'Registration received! Check your email to verify your account.' };
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!name || !email || !password) return errorResponse('Name, email, password required', 400);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse('Invalid email address', 400);
    if (password.length < MIN_PASSWORD_LENGTH) return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);

    // Per-address cap so the form can't be used to flood someone's inbox.
    const emailRl = await checkRateLimit(`register:${email}`, 'otp');
    if (!emailRl.allowed) return successResponse(DONE, 201);

    const db = getSupabaseAdmin();
    const { data: existing } = await db.from('users').select('id, name, is_verified').eq('email', email).maybeSingle();
    if (existing) {
      try {
        if (existing.is_verified) {
          await sendAccountExistsNotice(email, existing.name || name);
        } else {
          // Not confirmed yet: send a fresh link (the old one may be lost or expired). The stored password is kept.
          const token = crypto.randomBytes(32).toString('hex');
          await db.from('users').update({ verification_token: hashToken(token), verification_expires: new Date(Date.now() + VERIFY_TTL_MS).toISOString() }).eq('id', existing.id);
          await sendVerificationEmail(email, existing.name || name, token);
        }
      } catch (err) {
        console.error('[register] existing-account mail failed', err instanceof Error ? err.message : err);
      }
      return successResponse(DONE, 201);
    }

    const hashed = await bcrypt.hash(password, BCRYPT_COST);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { data: user, error } = await db
      .from('users')
      .insert({
        name, email,
        password: hashed,
        role: 'admin',
        is_verified: false,
        verification_token: hashToken(verificationToken),
        verification_expires: new Date(Date.now() + VERIFY_TTL_MS).toISOString(),
      })
      .select('id, name, email, role')
      .single();

    if (error) {
      if (error.code === '23505') return successResponse(DONE, 201); // registered in parallel
      return errorResponse('Registration failed', 500);
    }

    const slug = generateSlug(name, user.id);
    await db.from('portfolios').insert({ owner_id: user.id, title: `${name}'s Portfolio`, slug });
    await db.from('about').insert({ owner_id: user.id, name, title: '', bio: '' });
    await db.from('hero').insert({ owner_id: user.id, headline: `Hi, I'm ${name}`, subheadline: '', cta_text: 'View My Work' });
    await db.from('contact_info').insert({ owner_id: user.id, email });

    await sendVerificationEmail(email, name, verificationToken);

    return successResponse(DONE, 201);
  } catch (err) {
    console.error('[register] failed', err instanceof Error ? { name: err.name, message: err.message } : err);
    return errorResponse('Registration failed', 500);
  }
}
