import { NextRequest } from 'next/server';
import { AI_ENABLED } from '@/lib/features';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ChatHistoryInput } from '@/types/api';

const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY!;
const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL || "https://router.zeen.my.id/v1";
const NINE_ROUTER_MODEL = process.env.NINE_ROUTER_MODEL || 'Projects';

export async function POST(request: NextRequest) {
  if (!AI_ENABLED) return new Response("Not found", { status: 404 });
  try {
    const auth = await requireAuth(request);
    const { message, history = [] } = await request.json();
    if (!message || typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return new Response(`data: ${JSON.stringify({ token: 'Message is empty or too long (max 2000 characters).', done: true })}\n\n`, {
        status: 400, headers: { 'Content-Type': 'text/event-stream' },
      });
    }
    const rl = await checkRateLimit(`ai:${auth.id}`, 'ai');
    if (!rl.allowed) {
      return new Response(`data: ${JSON.stringify({ token: 'Too many AI requests. Please try again later.', done: true })}\n\n`, {
        status: 429, headers: { 'Content-Type': 'text/event-stream' },
      });
    }

    const [aboutRes, heroRes, skillsRes, servicesRes, expRes, projRes] = await Promise.all([
      getSupabaseAdmin().from('about').select('*').eq('owner_id', auth.id).maybeSingle(),
      getSupabaseAdmin().from('hero').select('*').eq('owner_id', auth.id).maybeSingle(),
      getSupabaseAdmin().from('skills').select('*').eq('owner_id', auth.id),
      getSupabaseAdmin().from('services').select('*').eq('owner_id', auth.id),
      getSupabaseAdmin().from('experience').select('*').eq('owner_id', auth.id),
      getSupabaseAdmin().from('projects').select('*').eq('owner_id', auth.id),
    ]);

    const about = aboutRes.data || {};
    const hero = heroRes.data || {};
    const skills = skillsRes.data || [];
    const services = servicesRes.data || [];
    const experience = expRes.data || [];
    const projects = projRes.data || [];

    const sections = [about.name, hero.headline, skills.length > 0, services.length > 0, experience.length > 0, projects.length > 0];
    const score = sections.filter(Boolean).length;
    const total = sections.length;

    const systemPrompt = `You are a Portfolio Advisor AI helping ${about.name || 'a user'} improve their portfolio.
Portfolio completeness: ${score}/${total}. Be helpful and concise.`;

    const groqRes = await fetch(`${NINE_ROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NINE_ROUTER_API_KEY}` },
      body: JSON.stringify({
        model: NINE_ROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(history) ? history : []).slice(-6)
            .filter((m: ChatHistoryInput | null): m is ChatHistoryInput & { content: string } => !!m && typeof m.content === 'string')
            .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 2000) })),
          { role: 'user', content: message },
        ],
        stream: true, max_tokens: 600,
      }),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ score, total })}\n\n`));
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
        } catch {} finally { controller.close(); }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch {
    return new Response(`data: ${JSON.stringify({ token: 'Sorry, something went wrong.', done: true })}\n\n`, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}







