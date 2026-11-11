import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import type { IdRow, SectionOrderEntry } from '@/types/api';

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

    let rowsDeleted = 0;

    // Delete from section data table
    if (baseType === 'custom') {
      // One custom section = the rows titled with its label, matched here in code, exactly (ignoring case and
      // surrounding spaces). A LIKE pattern built from the label treated %, _ and * as wildcards, and without
      // a label it matched every custom section the user has.
      const label = typeof body.label === 'string' ? body.label.trim().toLowerCase() : '';
      if (!label) return errorResponse('Missing section label', 400);
      const { data: rows, error: selectError } = await getSupabaseAdmin().from('custom_sections').select('id, title').eq('owner_id', userId);
      if (selectError) throw selectError;
      const toDelete = (rows || []).filter((row: IdRow & { title?: string | null }) => (row.title || '').trim().toLowerCase() === label);
      if (toDelete.length > 0) {
        const ids = toDelete.map((r: IdRow) => r.id);
        const { error: delError } = await getSupabaseAdmin().from('custom_sections').delete().in('id', ids).eq('owner_id', userId);
        if (delError) throw delError;
        rowsDeleted = ids.length;
      }
    } else {
      const mapping = sectionTableMap[baseType];
      if (!mapping) return errorResponse(`Unknown section type: ${baseType}`, 400);
      const result = await getSupabaseAdmin().from(mapping.table).delete().eq(mapping.key, userId);
      if (result.error) throw result.error;
      rowsDeleted = 1;
    }

    // Remove section from portfolio sections_order
    if (body.portfolioId) {
      const targetId = body.sectionId || sectionType;
      const { data: portfolio } = await getSupabaseAdmin().from('portfolios').select('sections_order').eq('id', body.portfolioId).eq('owner_id', userId).single();
      if (portfolio?.sections_order) {
        let sectionsOrder: SectionOrderEntry[] = typeof portfolio.sections_order === 'string' ? JSON.parse(portfolio.sections_order) : portfolio.sections_order;
        sectionsOrder = sectionsOrder.filter((s) => s.id !== targetId);
        const { error: updError } = await getSupabaseAdmin().from('portfolios').update({
          sections_order: JSON.stringify(sectionsOrder),
          updated_at: new Date().toISOString(),
        }).eq('id', body.portfolioId).eq('owner_id', userId);
        if (updError) throw updError;
      }
    }

    return successResponse({ message: `${baseType} section${baseType === 'custom' && body.label ? ` "${body.label}"` : ''} deleted`, rowsDeleted });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
