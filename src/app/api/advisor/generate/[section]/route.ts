import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { AI_ENABLED } from '@/lib/features';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/utils';
import { DRAFT_PROMPTS, DRAFT_RULES, NOT_DRAFTED, isDraftSection, normalizeDraft, parseModelJson } from '@/lib/advisor-drafts';

const NINE_ROUTER_API_KEY = process.env.NINE_ROUTER_API_KEY!;
const NINE_ROUTER_BASE_URL = process.env.NINE_ROUTER_BASE_URL || "https://router.zeen.my.id/v1";
const MAX_CONTEXT_CHARS = 6000;

/** Drafts one section from the user's own portfolio data; replies { generated } for the Advisor to preview. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    if (!AI_ENABLED) return new Response('Not found', { status: 404 });
    const auth = await requireAuth(request);
    const { section } = await params;
    if (!isDraftSection(section)) {
      return errorResponse(NOT_DRAFTED[section] || 'The Advisor can draft the bio, hero, skills and services sections.', 422);
    }
    const rl = await checkRateLimit(`ai:${auth.id}`, 'ai');
    if (!rl.allowed) return errorResponse('Too many AI requests. Please try again later.', 429);

    const db = getSupabaseAdmin();
    const [about, hero, skills, experience, projects, services] = await Promise.all([
      db.from('about').select('name, title, bio').eq('owner_id', auth.id).maybeSingle(),
      db.from('hero').select('headline, subheadline').eq('owner_id', auth.id).maybeSingle(),
      db.from('skills').select('title, skills').eq('owner_id', auth.id),
      db.from('experience').select('position, company, description').eq('owner_id', auth.id),
      db.from('projects').select('title, description, tech_stack').eq('owner_id', auth.id),
      db.from('services').select('title, description').eq('owner_id', auth.id),
    ]);
    const context = JSON.stringify({
      about: about.data, hero: hero.data, skills: skills.data, experience: experience.data, projects: projects.data, services: services.data,
    }).slice(0, MAX_CONTEXT_CHARS);

    const upstream = await fetch(`${NINE_ROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NINE_ROUTER_API_KEY}` },
      body: JSON.stringify({
        model: process.env.NINE_ROUTER_MODEL || 'Projects',
        messages: [
          { role: 'system', content: `${DRAFT_RULES}\n\nTask: ${DRAFT_PROMPTS[section]}` },
          { role: 'user', content: `Portfolio data:\n${context}` },
        ],
        max_tokens: 700,
        temperature: 0.4,
        // 9Router streams unless told otherwise; this route needs the whole reply as one JSON body
        stream: false,
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!upstream.ok) {
      console.error('[advisor/generate] upstream error', upstream.status);
      return errorResponse('The AI service is unavailable right now.', 502);
    }
    const json = await upstream.json().catch(() => null);
    const generated = normalizeDraft(section, parseModelJson(json?.choices?.[0]?.message?.content || ''));
    if (!generated) return errorResponse('The AI reply could not be used. Try again.', 502);
    return successResponse({ generated });
  } catch (err) {
    // requireAuth throws 'Unauthorized': a 401 lets the client refresh the session and retry
    if (getErrorMessage(err) === 'Unauthorized') return Response.json({ message: 'Unauthorized' }, { status: 401 });
    console.error('[advisor/generate]', getErrorMessage(err));
    return errorResponse('The AI service is unavailable right now.', 502);
  }
}
