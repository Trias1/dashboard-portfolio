import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY!;
const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL || "https://router.zeen.my.id/v1";

export async function POST(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { section } = await params;
    const userId = auth.id;

    const [aboutRes, heroRes, skillsRes, expRes, projRes, servicesRes] = await Promise.all([
      getSupabaseAdmin().from('about').select('*').eq('owner_id', userId).maybeSingle(),
      getSupabaseAdmin().from('hero').select('*').eq('owner_id', userId).maybeSingle(),
      getSupabaseAdmin().from('skills').select('*').eq('owner_id', userId),
      getSupabaseAdmin().from('experience').select('*').eq('owner_id', userId),
      getSupabaseAdmin().from('projects').select('*').eq('owner_id', userId),
      getSupabaseAdmin().from('services').select('*').eq('owner_id', userId),
    ]);

    const about = aboutRes.data || {};
    const hero = heroRes.data || {};

    const systemPrompts: Record<string, string> = {
      bio: `Generate a professional bio for ${about.name || 'this person'} (${about.title || 'professional'}). Keep it 2-3 sentences.`,
      headline: `Generate a catchy hero headline for ${about.name || 'a professional'} in tech. Short, impactful, max 10 words.`,
      services: `Suggest 4-5 relevant services for ${about.name || 'a tech professional'} based on current portfolio data.`,
    };

    const systemPrompt = systemPrompts[section] || `Generate content for "${section}" section.`;

    const groqRes = await fetch(`${NINE_ROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NINE_ROUTER_API_KEY}` },
      body: JSON.stringify({
        model: process.env.NINE_ROUTER_MODEL || 'Projects',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate the content now.' }],
        max_tokens: 400,
      }),
    });

    const json = await groqRes.json();
    const content = json.choices?.[0]?.message?.content || '';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content, done: true })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (err: any) {
    return new Response(`data: ${JSON.stringify({ token: 'Error generating content', done: true })}\n\n`, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}






