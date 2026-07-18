import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CLIENTE_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const from = request.nextUrl.searchParams.get('state') || 'portfolio';

    if (!code) return Response.redirect(new URL('/login?error=no_code', BASE_URL));

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code, client_id: CLIENTE_ID, client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return Response.redirect(new URL('/login?error=token_failed', BASE_URL));

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();

    const email = profile.email;
    const name = profile.name;

    // Check existing user
    let { data: user } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      // Create new user
      const { data: newUser } = await getSupabaseAdmin()
        .from('users')
        .insert({ name, email, password: 'google-oauth', role: 'admin', is_verified: true })
        .select('*')
        .single();

      if (newUser) {
        user = newUser;
        const slug = generateSlug(name, user.id);
        await getSupabaseAdmin().from('portfolios').insert({
          owner_id: user.id, title: `${name}'s Portfolio`, slug,
        });
        await getSupabaseAdmin().from('about').insert({ owner_id: user.id, name, title: '', bio: '' });
        await getSupabaseAdmin().from('hero').insert({ owner_id: user.id, headline: `Hi, I'm ${name}`, subheadline: '', cta_text: 'View My Work' });
        await getSupabaseAdmin().from('contact_info').insert({ owner_id: user.id, email });
      }
    }

    if (!user) return Response.redirect(new URL('/login?error=user_creation_failed', BASE_URL));

    const accessToken = await signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await signRefreshToken({ id: user.id });
    await setAuthCookies(accessToken, refreshToken);

    const userParam = encodeURIComponent(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));

    if (from === 'clipper') {
      return Response.redirect(new URL(`/auth/callback?token=${accessToken}&user=${userParam}`, BASE_URL));
    }
    return Response.redirect(new URL(`/auth/callback?token=${accessToken}&user=${userParam}`, BASE_URL));
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    return Response.redirect(new URL('/login?error=oauth_failed', BASE_URL));
  }
}
