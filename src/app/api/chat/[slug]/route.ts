import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY!;
const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL || "https://router.zeen.my.id/v1";
const NINE_ROUTER_MODEL = process.env.NINE_ROUTER_MODEL || 'Projects';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { message, history = [] } = await request.json();
    if (!message) return new Response('Message required', { status: 400 });

    const { data: portfolio } = await getSupabaseAdmin().from('portfolios').select('owner_id, title').eq('slug', slug).maybeSingle();
    if (!portfolio) return new Response('Portfolio not found', { status: 404 });

    const ownerId = portfolio.owner_id;
    const [about, hero, experience, projects, services, skills, contact] = await Promise.all([
      getSupabaseAdmin().from('about').select('*').eq('owner_id', ownerId).maybeSingle(),
      getSupabaseAdmin().from('hero').select('*').eq('owner_id', ownerId).maybeSingle(),
      getSupabaseAdmin().from('experience').select('*').eq('owner_id', ownerId).order('start_date', { ascending: false }),
      getSupabaseAdmin().from('projects').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      getSupabaseAdmin().from('services').select('*').eq('owner_id', ownerId),
      getSupabaseAdmin().from('skills').select('*').eq('owner_id', ownerId),
      getSupabaseAdmin().from('contact_info').select('*').eq('owner_id', ownerId).maybeSingle(),
    ]);

    const a = about.data || {};
    const h = hero.data || {};
    const exp = experience.data || [];
    const proj = projects.data || [];
    const svc = services.data || [];
    const sk = skills.data || [];
    const ct = contact.data || {};

    const context = `You are an AI assistant for ${a.name || portfolio.title}'s portfolio website.
Answer questions about this person based on the info below. Be friendly and concise.
Name: ${a.name || '-'}
Title: ${a.title || h.subheadline || '-'}
Bio: ${a.bio || '-'}
Skills: ${sk.map((s: any) => s.skills).join(', ') || '-'}
Experience: ${exp.map((e: any) => `${e.position} at ${e.company}`).join('; ') || '-'}
Projects: ${proj.map((p: any) => p.title).join(', ') || '-'}
Contact: ${ct.email || '-'}`;

    const messages = [
      { role: 'system', content: context },
      ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const groqRes = await fetch(`${NINE_ROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NINE_ROUTER_API_KEY}` },
      body: JSON.stringify({ model: NINE_ROUTER_MODEL, messages, stream: true, max_tokens: 512, temperature: 0.7 }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return new Response(`data: ${JSON.stringify({ error: err })}\n\n`, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body!.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                continue;
              }
              try {
                const json = JSON.parse(data);
                const token = json.choices?.[0]?.delta?.content;
                if (token) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
              } catch {}
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (err: any) {
    return new Response(`data: ${JSON.stringify({ error: err.message })}\n\n`, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}






