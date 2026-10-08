import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendVerificationEmail } from '@/lib/mailer';
import { generateSlug, errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';
import { MIN_PASSWORD_LENGTH, normalizeEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rl = await checkRateLimit(getClientId(request), 'auth');
    if (!rl.allowed) return errorResponse('Too many requests', 429);

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!name || !email || !password) return errorResponse('Name, email, password required', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse('Invalid email address', 400);
    if (password.length < MIN_PASSWORD_LENGTH) return errorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);

    // Check existing user
    const { data: existing } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing) return errorResponse('Email already exists', 400);

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .insert({
        name, email,
        password: hashed,
        role: 'admin',
        is_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
      })
      .select('id, name, email, role')
      .single();

    if (error) return errorResponse(error.code === '23505' ? 'Email already exists' : 'Registration failed', error.code === '23505' ? 400 : 500);

    // Create portfolio
    const slug = generateSlug(name, user.id);
    await getSupabaseAdmin().from('portfolios').insert({
      owner_id: user.id,
      title: `${name}'s Portfolio`,
      slug,
    });

    // Init empty sections
    await getSupabaseAdmin().from('about').insert({ owner_id: user.id, name, title: '', bio: '' });
    await getSupabaseAdmin().from('hero').insert({ owner_id: user.id, headline: `Hi, I'm ${name}`, subheadline: '', cta_text: 'View My Work' });
    await getSupabaseAdmin().from('contact_info').insert({ owner_id: user.id, email });

    await sendVerificationEmail(email, name, verificationToken);

    return successResponse({ message: 'Registration successful! Please check your email to verify your account.' }, 201);
  } catch (err) {
    console.error('[register] failed', err instanceof Error ? { name: err.name, message: err.message } : err);
    return errorResponse('Registration failed', 500);
  }
}
