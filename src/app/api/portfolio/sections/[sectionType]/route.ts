import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

type SectionType = 'hero' | 'about' | 'experience' | 'projects' | 'skills' | 'services' | 'testimonials' | 'gallery' | 'contact' | 'custom';

const sectionTableMap: Record<string, { table: string; key: string }> = {
  hero: { table: 'hero', key: 'owner_id' },
  about: { table: 'about', key: 'owner_id' },
  experience: { table: 'experience', key: 'owner_id' },
  projects: { table: 'projects', key: 'owner_id' },
  skills: { table: 'skills', key: 'owner_id' },
  services: { table: 'services', key: 'owner_id' },
  testimonials: { table: 'testimonials', key: 'owner_id' },
  gallery: { table: 'gallery', key: 'owner_id' },
  contact: { table: 'contact_info', key: 'owner_id' },
};

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sectionType: string }> }) {
  try {
    const auth = await requireAuth(request);
    const { sectionType } = await params;
    const userId = auth.id;
    const body = await request.json().catch(() => ({}));
    const baseType = sectionType.split('-')[0] as SectionType;

    console.log('[DELETE API] sectionType:', sectionType, 'baseType:', baseType, 'userId:', userId, 'body:', JSON.stringify(body));

    let rowsDeleted = 0;

    // Delete from section data table
    if (baseType === 'custom') {
      const { label } = body;
      // Fetch matching custom section IDs first, then delete by ID
      let selectQuery = getSupabaseAdmin().from('custom_sections').select('id').eq('owner_id', userId);
      if (label) {
        selectQuery = selectQuery.ilike('title', label);
      }
      const { data: toDelete, error: selectError } = await selectQuery;
      console.log('[DELETE API] custom sections to delete:', JSON.stringify({ toDelete, selectError }));
      if (toDelete && toDelete.length > 0) {
        const ids = toDelete.map((r: any) => r.id);
        const { error: delError, count } = await getSupabaseAdmin().from('custom_sections').delete().in('id', ids);
        rowsDeleted = delError ? 0 : ids.length;
        console.log('[DELETE API] custom_sections deleted:', JSON.stringify({ ids, delError, count }));
      } else {
        console.log('[DELETE API] No custom sections found to delete');
      }
    } else {
      const mapping = sectionTableMap[baseType];
      if (!mapping) return errorResponse(`Unknown section type: ${baseType}`, 400);
      const result = await getSupabaseAdmin().from(mapping.table).delete().eq(mapping.key, userId);
      rowsDeleted = result.error ? 0 : 1;
      console.log('[DELETE API]', mapping.table, 'query result:', JSON.stringify(result));
    }

    // Remove section from portfolio sections_order
    if (body.portfolioId) {
      const targetId = body.sectionId || sectionType;
      console.log('[DELETE API] Updating sections_order for portfolio:', body.portfolioId, 'targetId:', targetId);
      const { data: portfolio, error: pErr } = await getSupabaseAdmin().from('portfolios').select('sections_order').eq('id', body.portfolioId).eq('owner_id', userId).single();
      console.log('[DELETE API] Portfolio fetch:', JSON.stringify({ portfolio, error: pErr }));
      if (portfolio?.sections_order) {
        let sectionsOrder: any[] = typeof portfolio.sections_order === 'string' ? JSON.parse(portfolio.sections_order) : portfolio.sections_order;
        console.log('[DELETE API] Before filter, sections_order count:', sectionsOrder.length, 'IDs:', sectionsOrder.map((s: any) => s.id));
        sectionsOrder = sectionsOrder.filter((s: any) => s.id !== targetId);
        console.log('[DELETE API] After filter, sections_order count:', sectionsOrder.length);
        const updResult = await getSupabaseAdmin().from('portfolios').update({
          sections_order: JSON.stringify(sectionsOrder),
          updated_at: new Date().toISOString(),
        }).eq('id', body.portfolioId).eq('owner_id', userId);
        console.log('[DELETE API] sections_order update result:', JSON.stringify(updResult));
      }
    } else {
      console.log('[DELETE API] No portfolioId in body, skipping sections_order update');
    }

    return successResponse({ message: `${baseType} section${baseType === 'custom' && body.label ? ` "${body.label}"` : ''} deleted`, rowsDeleted });
  } catch (err: any) {
    console.error('[DELETE API] Error:', err.message);
    return errorResponse(err.message);
  }
}
