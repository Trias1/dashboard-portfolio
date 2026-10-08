import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import type { CvApplyBody } from '@/types/api';

interface CustomSectionDraft {
  title: string;
  type: string;
  content: Record<string, unknown>;
}

interface ExistingCustomRow {
  id: number | string;
  title: string | null;
  type: string | null;
  content: unknown;
}

/** List types produced by the CV import; in replace mode their old rows are swapped out. */
const TYPED_CUSTOM = new Set(['education', 'certification', 'language', 'award', 'organization', 'specialization']);

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
  // Indonesian
  januari: '01', februari: '02', maret: '03', mei: '05', juni: '06', juli: '07', agustus: '08', agu: '08', agt: '08', okt: '10', oktober: '10', des: '12', desember: '12',
};

function normalizeDate(value: unknown) {
  if (!value || /present|now|current|sekarang|saat\s+ini|kini/i.test(String(value))) return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}$/.test(text)) return `${text}-01`;
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  const numeric = text.match(/^(\d{1,2})[/.-](\d{4})$/);
  if (numeric && +numeric[1] >= 1 && +numeric[1] <= 12) return `${numeric[2]}-${numeric[1].padStart(2, '0')}-01`;
  const match = text.match(/([A-Za-z]+)\.?\s+(\d{4})/);
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    if (month) return `${match[2]}-${month}-01`;
  }
  const year = text.match(/\b(19|20)\d{2}\b/);
  return year ? `${year[0]}-01-01` : null;
}

const norm = (v: unknown) => String(v ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const clean = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

function parseContent(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try { const v = JSON.parse(raw); return v && typeof v === 'object' ? v : { body: raw }; } catch { return { body: raw }; }
  }
  return {};
}

/** Identity of a custom row, used to skip duplicates when the same CV is imported twice. */
function customSignature(type: string, title: string, content: Record<string, unknown>) {
  const c = content;
  switch (type) {
    case 'education': return `education|${norm(c.institution)}|${norm(c.degree)}`;
    case 'certification': return `certification|${norm(c.name)}`;
    case 'language': return `language|${norm(c.language)}`;
    case 'award': return `award|${norm(c.title)}`;
    case 'organization': return `organization|${norm(c.name)}|${norm(c.role)}`;
    case 'specialization': return `specialization|${norm(c.body || c.area)}`;
    default: return `${type}|${norm(title)}|${norm(c.body).slice(0, 200)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body: CvApplyBody = await request.json();
    const userId = auth.id;
    const db = getSupabaseAdmin();
    const replace = body.replace === true; // default false (merge)
    const failed: string[] = [];
    const run = async (label: string, op: PromiseLike<{ error: unknown }>) => {
      const { error } = await op;
      if (error) {
        console.error(`[CV Apply] ${label} failed:`, getErrorMessage(error));
        if (!failed.includes(label)) failed.push(label);
        return false;
      }
      return true;
    };

    // A list that is absent means "user unticked this section" → leave the table alone, even in replace mode.
    // (Previously the client sent [] for unticked sections and replace mode wiped those tables.)
    const experiences = body.experiences ?? body.experience;
    const { education, skills, projects, certifications, specializationAreas, languages, awards, organizations } = body;
    const customSections = body.customSections ?? body.custom_sections;
    const about = body.about || {};
    const hero = body.hero || {};
    const contact = (body.contact || {}) as NonNullable<CvApplyBody['contact']> & { linkedin?: string; website?: string };

    // -- About --
    if (about.name || about.title || about.bio) {
      const { data: ex } = await db.from('about').select('id').eq('owner_id', userId).maybeSingle();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (about.name) updateData.name = about.name;
      if (about.title) updateData.title = about.title;
      if (about.bio) updateData.bio = about.bio;
      await run('about', ex
        ? db.from('about').update(updateData).eq('owner_id', userId)
        : db.from('about').insert({ name: about.name || '', title: about.title || '', bio: about.bio || '', owner_id: userId }));
    }

    // -- Hero --
    if (hero.headline || hero.subheadline) {
      const { data: hx } = await db.from('hero').select('id').eq('owner_id', userId).maybeSingle();
      const updateData: Record<string, unknown> = {};
      if (hero.headline) updateData.headline = hero.headline;
      if (hero.subheadline) updateData.subheadline = hero.subheadline;
      await run('hero', hx
        ? db.from('hero').update(updateData).eq('owner_id', userId)
        : db.from('hero').insert({ headline: hero.headline || '', subheadline: hero.subheadline || '', owner_id: userId }));
    }

    // -- Contact (linkedin/github were parsed but never saved before) --
    const website = clean(contact.website);
    const contactData: Record<string, string> = {};
    if (contact.email) contactData.email = contact.email;
    if (contact.phone) contactData.phone = contact.phone;
    if (contact.location) contactData.location = contact.location;
    if (contact.linkedin) contactData.linkedin_url = /^https?:\/\//i.test(contact.linkedin) ? contact.linkedin : `https://${contact.linkedin}`;
    if (/github\.com/i.test(website)) contactData.github_url = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    if (Object.keys(contactData).length) {
      const { data: cx } = await db.from('contact_info').select('id').eq('owner_id', userId).maybeSingle();
      await run('contact', cx
        ? db.from('contact_info').update(contactData).eq('owner_id', userId)
        : db.from('contact_info').insert({ email: '', phone: '', location: '', ...contactData, owner_id: userId }));
    }

    // -- Experience --
    let expCount = 0;
    if (Array.isArray(experiences)) {
      if (replace) await run('experience', db.from('experience').delete().eq('owner_id', userId));
      const { data: existing } = replace ? { data: [] } : await db.from('experience').select('company, position').eq('owner_id', userId);
      const seen = new Set((existing || []).map((e: { company?: string | null; position?: string | null }) => `${norm(e.company)}|${norm(e.position)}`));
      const rows = experiences
        .filter((exp) => exp && (exp.company || exp.position))
        .filter((exp) => {
          const key = `${norm(exp.company)}|${norm(exp.position)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((exp) => ({
          company: clean(exp.company), position: clean(exp.position),
          start_date: normalizeDate(exp.start_date), end_date: normalizeDate(exp.end_date),
          description: clean(exp.description), owner_id: userId,
        }));
      if (rows.length && await run('experience', db.from('experience').insert(rows))) expCount = rows.length;
    }

    // -- Skills: merge into a group with the same title instead of duplicating it --
    let skillCount = 0;
    if (Array.isArray(skills)) {
      if (replace) await run('skills', db.from('skills').delete().eq('owner_id', userId));
      const { data: existing } = replace ? { data: [] } : await db.from('skills').select('id, title, skills').eq('owner_id', userId);
      const byTitle = new Map((existing || []).map((r: { id: number; title: string | null; skills: string | null }) => [norm(r.title), r]));
      const inserts: { title: string; skills: string; owner_id: string | number }[] = [];
      for (const sk of skills) {
        const list = clean(sk?.skills);
        if (!list) continue;
        const title = clean(sk.title) || 'Skills';
        const prev = byTitle.get(norm(title));
        if (prev) {
          const merged = [...new Set([...String(prev.skills || '').split(','), ...list.split(',')].map((s) => s.trim()).filter(Boolean))];
          if (await run('skills', db.from('skills').update({ skills: merged.join(', ') }).eq('id', prev.id))) skillCount++;
        } else {
          inserts.push({ title, skills: list, owner_id: userId });
          byTitle.set(norm(title), { id: -1, title, skills: list });
        }
      }
      if (inserts.length && await run('skills', db.from('skills').insert(inserts))) skillCount += inserts.length;
    }

    // -- Projects --
    let projectCount = 0;
    if (Array.isArray(projects)) {
      if (replace) await run('projects', db.from('projects').delete().eq('owner_id', userId));
      const { data: existingProjects } = replace ? { data: [] } : await db.from('projects').select('title').eq('owner_id', userId);
      const existingTitles = new Set((existingProjects || []).map((p: { title: string | null }) => norm(p.title)));
      const rows = [];
      for (const proj of projects) {
        if (!proj?.title || existingTitles.has(norm(proj.title))) continue;
        let desc = clean(proj.description);
        const meta: string[] = [];
        if (proj.customer) meta.push(`Customer: ${proj.customer}`);
        if (proj.assignmentBy) meta.push(`Assignment: ${proj.assignmentBy}`);
        if (proj.startDate || proj.endDate) meta.push(`Period: ${[proj.startDate, proj.endDate].filter(Boolean).join(' - ')}`);
        if (proj.status) meta.push(`Status: ${proj.status}`);
        if (meta.length) desc = desc ? `${desc}\n\n${meta.join(' | ')}` : meta.join(' | ');
        rows.push({
          title: clean(proj.title), description: desc,
          tech_stack: clean(proj.tech_stack), demo_url: clean(proj.demo_url),
          github_url: clean(proj.github_url), owner_id: userId,
        });
        existingTitles.add(norm(proj.title));
      }
      if (rows.length && await run('projects', db.from('projects').insert(rows))) projectCount = rows.length;
    }

    // -- Custom sections (education, certifications, languages, awards, organizations, specialization, free text) --
    const allCustom: CustomSectionDraft[] = [];
    for (const ed of education || []) {
      if (ed?.institution || ed?.degree) {
        allCustom.push({ title: 'Education', type: 'education', content: {
          institution: clean(ed.institution), degree: clean(ed.degree), field: clean(ed.field),
          start_date: clean(ed.start_date), end_date: clean(ed.end_date), gpa: clean(ed.gpa),
        } });
      }
    }
    for (const cert of certifications || []) {
      if (!cert?.name) continue;
      const content: Record<string, unknown> = { name: clean(cert.name), issuer: clean(cert.issuer) };
      if (cert.date) {
        const iso = normalizeDate(cert.date);
        if (iso) {
          content.issueYear = iso.slice(0, 4);
          // Only keep the month when the source actually had one (normalizeDate pads year-only dates with -01).
          if (!/^\s*\d{4}\s*$/.test(String(cert.date))) content.issueMonth = iso.slice(5, 7);
        }
      }
      if (cert.credential_url) content.credentialUrl = cert.credential_url;
      allCustom.push({ title: 'Certifications', type: 'certification', content });
    }
    for (const lang of languages || []) {
      if (lang?.language) allCustom.push({ title: 'Languages', type: 'language', content: { language: clean(lang.language), proficiency: clean(lang.proficiency) } });
    }
    for (const award of awards || []) {
      if (award?.title) allCustom.push({ title: 'Awards', type: 'award', content: { title: clean(award.title), issuer: clean(award.issuer), date: clean(award.date), description: clean(award.description) } });
    }
    for (const org of organizations || []) {
      if (org?.name) {
        allCustom.push({ title: 'Organizations', type: 'organization', content: {
          name: clean(org.name), role: clean(org.role), start_date: clean(org.start_date), end_date: clean(org.end_date), description: clean(org.description),
        } });
      }
    }
    for (const sa of specializationAreas || []) {
      const text = typeof sa === 'string' ? sa.trim() : sa?.area ? sa.area + (sa.description ? `: ${sa.description}` : '') : '';
      if (text) allCustom.push({ title: 'Specialization Areas', type: 'specialization', content: { body: text } });
    }
    for (const cs of customSections || []) {
      if (cs?.title) allCustom.push({ title: cs.title, type: cs.type || 'text', content: parseContent(cs.content ?? { body: '' }) });
    }

    let customInserted = 0;
    if (allCustom.length) {
      const { data: existingRows } = await db.from('custom_sections').select('id, title, type, content').eq('owner_id', userId);
      const existing: ExistingCustomRow[] = existingRows || [];
      const importedTypes = new Set(allCustom.map((c) => c.type).filter((t) => TYPED_CUSTOM.has(t)));
      const importedTitles = new Set(allCustom.filter((c) => !TYPED_CUSTOM.has(c.type)).map((c) => norm(c.title)));
      let keep = existing;
      if (replace) {
        // Only swap out what this import provides; the user's other custom sections stay.
        const toDelete = existing.filter((r) => (r.type && importedTypes.has(r.type)) || (!TYPED_CUSTOM.has(r.type || '') && importedTitles.has(norm(r.title))));
        if (toDelete.length) await run('custom sections', db.from('custom_sections').delete().eq('owner_id', userId).in('id', toDelete.map((r) => r.id)));
        keep = existing.filter((r) => !toDelete.includes(r));
      }
      const seen = new Set(keep.map((r) => customSignature(r.type || 'text', r.title || '', parseContent(r.content))));
      const rows = [];
      for (const cs of allCustom) {
        const sig = customSignature(cs.type, cs.title, cs.content);
        if (seen.has(sig)) continue;
        seen.add(sig);
        rows.push({ title: cs.title, type: cs.type, content: JSON.stringify(cs.content), owner_id: userId });
      }
      if (rows.length && await run('custom sections', db.from('custom_sections').insert(rows))) customInserted = rows.length;
    }

    console.log(`[CV Apply] user ${userId}: ${expCount} experience, ${skillCount} skill groups, ${projectCount} projects, ${customInserted} custom rows (${replace ? 'replace' : 'merge'})`);

    // -- Applied sections list --
    const newSections: string[] = [];
    if (experiences?.length) newSections.push('experience');
    if (skills?.length) newSections.push('skills');
    if (projects?.length) newSections.push('projects');
    if (hero.headline || hero.subheadline) newSections.push('hero');
    if (Object.keys(contactData).length) newSections.push('contact');
    for (const title of [...new Set(allCustom.map((c) => c.title))]) newSections.push(`custom:${title}`);

    if (failed.length) {
      return errorResponse(`Sebagian data gagal disimpan (${failed.join(', ')}). Data lain sudah tersimpan; coba simpan ulang atau isi bagian itu manual.`, 422);
    }

    return successResponse({
      success: true,
      message: `Portfolio updated from CV (${replace ? 'replace' : 'merge'} mode)`,
      sections: newSections,
      mode: replace ? 'replace' : 'merge',
      counts: { experience: expCount, skills: skillCount, projects: projectCount, custom: customInserted },
      custom_count: customInserted,
    });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
