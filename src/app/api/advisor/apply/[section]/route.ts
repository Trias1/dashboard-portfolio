import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { saveOwnerRow } from '@/lib/supabase/owner-row';
import { AI_ENABLED } from '@/lib/features';
import { errorResponse, getErrorMessage, readJsonBody, successResponse } from '@/lib/utils';
import { isDraftSection, normalizeDraft, splitSkills, type BioDraft, type HeroDraft, type ServicesDraft, type SkillsDraft } from '@/lib/advisor-drafts';

function servicesShown(raw: unknown): boolean {
  let order: unknown = raw;
  if (typeof raw === 'string') { try { order = JSON.parse(raw); } catch { order = null; } }
  if (!Array.isArray(order)) return false;
  return order.some((s) => s && typeof s === 'object' && String((s as { type?: unknown }).type ?? '').split('-')[0] === 'services' && (s as { enabled?: unknown }).enabled !== false);
}

/**
 * Saves an Advisor draft the user accepted. The draft is validated again here (the client could send
 * anything) and saved without touching other content: bio and hero update only their own fields,
 * skills merge into categories with the same title, services are added only when the title is new.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    if (!AI_ENABLED) return new Response('Not found', { status: 404 });
    const auth = await requireAuth(request);
    const { section } = await params;
    if (!isDraftSection(section)) return errorResponse('This section cannot be saved from the Advisor.', 422);
    const body = await readJsonBody(request);
    const draft = body ? normalizeDraft(section, body.data) : null;
    if (!draft) return errorResponse('Nothing to save.', 400);

    const db = getSupabaseAdmin();
    const owner_id = auth.id;
    let saved = 0;

    if (section === 'bio' || section === 'hero') {
      const table = section === 'bio' ? 'about' : 'hero';
      const fields = section === 'bio'
        ? { bio: (draft as BioDraft).bio }
        : { headline: (draft as HeroDraft).headline, subheadline: (draft as HeroDraft).subheadline };
      await saveOwnerRow(table, owner_id, fields, { touch: true });
      saved = 1;
    } else if (section === 'skills') {
      const { data: rows, error: readError } = await db.from('skills').select('id, title, skills').eq('owner_id', owner_id);
      if (readError) throw readError;
      for (const cat of (draft as SkillsDraft).categories) {
        const match = (rows || []).find((r) => (r.title || '').trim().toLowerCase() === cat.title.toLowerCase());
        if (match) {
          const merged = splitSkills([...splitSkills(match.skills), ...splitSkills(cat.skills)]).join(', ');
          if (merged === match.skills) continue;
          const { error } = await db.from('skills').update({ skills: merged }).eq('id', match.id).eq('owner_id', owner_id);
          if (error) throw error;
        } else {
          const { error } = await db.from('skills').insert({ title: cat.title, skills: cat.skills, owner_id });
          if (error) throw error;
        }
        saved++;
      }
    } else {
      const { data: rows, error: readError } = await db.from('services').select('title').eq('owner_id', owner_id);
      if (readError) throw readError;
      const taken = new Set((rows || []).map((r) => (r.title || '').trim().toLowerCase()));
      const fresh = (draft as ServicesDraft).filter((s) => !taken.has(s.title.toLowerCase()));
      if (fresh.length) {
        const { error } = await db.from('services').insert(fresh.map((s) => ({ title: s.title, description: s.description, owner_id })));
        if (error) throw error;
      }
      saved = fresh.length;
      // Services is opt-in: tell the client when the section isn't on the page, so it can add it or say how
      const { data: portfolio } = await db.from('portfolios').select('sections_order').eq('owner_id', owner_id).limit(1).maybeSingle();
      return successResponse({ saved, shown: servicesShown(portfolio?.sections_order) });
    }
    return successResponse({ saved });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
