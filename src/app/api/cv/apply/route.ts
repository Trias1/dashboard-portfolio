import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/utils';

function normalizeField(data: any, newKey: string, oldKey: string) {
  return data?.[newKey]?.length ? data[newKey] : data?.[oldKey]?.length ? data[oldKey] : [];
}

function normalizeDate(value: any) {
  if (!value || /present|now|sekarang/i.test(String(value))) return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}$/.test(text)) return `${text}-01`;
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
    jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
  };
  const match = text.match(/([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const month = months[match[1].toLowerCase()];
    if (month) return `${match[2]}-${month}-01`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const userId = auth.id;
    const replace = body.replace === true; // default false (merge)

    // Normalize: accept old field names (experience, skills) and new names (experiences, education, etc.)
    const about = body.about || {};
    const hero = body.hero || {};
    const contact = body.contact || {};
    const experiences = normalizeField(body, 'experiences', 'experience');
    const education = normalizeField(body, 'education', 'education');
    const skills = normalizeField(body, 'skills', 'skills');
    const projects = normalizeField(body, 'projects', 'projects');
    const certifications = normalizeField(body, 'certifications', 'certifications');
    const specializationAreas = body.specializationAreas || [];
    const languages = body.languages || [];
    const awards = body.awards || [];
    const organizations = body.organizations || [];
    const customSections = body.customSections || body.custom_sections || [];

    //  -  -  About  -  - 
    if (about.name || about.title || about.bio) {
      const { data: ex } = await getSupabaseAdmin().from('about').select('id').eq('owner_id', userId).maybeSingle();
      const updateData: any = {};
      if (about.name) updateData.name = about.name;
      if (about.title) updateData.title = about.title;
      if (about.bio) updateData.bio = about.bio;
      updateData.updated_at = new Date().toISOString();
      if (ex) {
        await getSupabaseAdmin().from('about').update(updateData).eq('owner_id', userId);
      } else {
        await getSupabaseAdmin().from('about').insert({
          name: about.name || '', title: about.title || '', bio: about.bio || '', owner_id: userId,
        });
      }
    }

    //  -  -  Hero  -  - 
    if (hero.headline || hero.subheadline) {
      const { data: hx } = await getSupabaseAdmin().from('hero').select('id').eq('owner_id', userId).maybeSingle();
      const updateData: any = {};
      if (hero.headline) updateData.headline = hero.headline;
      if (hero.subheadline) updateData.subheadline = hero.subheadline;
      if (hx) {
        await getSupabaseAdmin().from('hero').update(updateData).eq('owner_id', userId);
      } else {
        await getSupabaseAdmin().from('hero').insert({ headline: hero.headline || '', subheadline: hero.subheadline || '', owner_id: userId });
      }
    }

    //  -  -  Contact  -  - 
    if (contact.email || contact.phone || contact.location) {
      const { data: cx } = await getSupabaseAdmin().from('contact_info').select('id').eq('owner_id', userId).maybeSingle();
      const updateData: any = {};
      if (contact.email) updateData.email = contact.email;
      if (contact.phone) updateData.phone = contact.phone;
      if (contact.location) updateData.location = contact.location;
      if (cx) {
        await getSupabaseAdmin().from('contact_info').update(updateData).eq('owner_id', userId);
      } else {
        await getSupabaseAdmin().from('contact_info').insert({ email: contact.email || '', phone: contact.phone || '', location: contact.location || '', owner_id: userId });
      }
    }

    //  -  -  Experiences  -  - 
    let expCount = 0;
    if (experiences.length) {
      if (replace) {
        await getSupabaseAdmin().from('experience').delete().eq('owner_id', userId);
      }
      for (const exp of experiences) {
        if (!exp.company && !exp.position) continue;
        await getSupabaseAdmin().from('experience').insert({
          company: exp.company || '', position: exp.position || '',
          start_date: normalizeDate(exp.start_date), end_date: normalizeDate(exp.end_date),
          description: exp.description || '', owner_id: userId,
        });
        expCount++;
      }
    }
    if (replace && !experiences.length) {
      await getSupabaseAdmin().from('experience').delete().eq('owner_id', userId);
    }
    console.log(` [CV Apply] Inserted ${expCount} experiences`);

    //  -  -  Skills  -  - 
    let skillCount = 0;
    if (skills.length) {
      if (replace) {
        await getSupabaseAdmin().from('skills').delete().eq('owner_id', userId);
      }
      for (const sk of skills) {
        if (!sk.skills) continue;
        await getSupabaseAdmin().from('skills').insert({ title: sk.title || 'Skills', skills: sk.skills, owner_id: userId });
        skillCount++;
      }
    }
    if (replace && !skills.length) {
      await getSupabaseAdmin().from('skills').delete().eq('owner_id', userId);
    }
    console.log(` [CV Apply] Inserted ${skillCount} skill groups`);

    //  -  -  Projects  -  - 
    let projectCount = 0;
    if (projects.length) {
      if (replace) {
        await getSupabaseAdmin().from('projects').delete().eq('owner_id', userId);
      }
      const { data: existingProjects } = replace ? { data: [] } : await getSupabaseAdmin().from('projects').select('title').eq('owner_id', userId);
      const existingTitles = new Set((existingProjects || []).map((p: any) => p.title.toLowerCase().trim()));
      for (const proj of projects) {
        if (!proj.title) continue;
        if (existingTitles.has(proj.title.toLowerCase().trim())) continue;
        let desc = proj.description || '';
        if (proj.customer || proj.assignmentBy || proj.startDate || proj.endDate || proj.status) {
          const meta: string[] = [];
          if (proj.customer) meta.push(`Customer: ${proj.customer}`);
          if (proj.assignmentBy) meta.push(`Assignment: ${proj.assignmentBy}`);
          if (proj.startDate) meta.push(`Start: ${proj.startDate}`);
          if (proj.endDate) meta.push(`End: ${proj.endDate}`);
          if (proj.status) meta.push(`Status: ${proj.status}`);
          const metaStr = meta.join(' | ');
          desc = desc ? `${desc}\n\n${metaStr}` : metaStr;
        }
        await getSupabaseAdmin().from('projects').insert({
          title: proj.title, description: desc,
          tech_stack: proj.tech_stack || '', demo_url: proj.demo_url || '',
          github_url: proj.github_url || '', owner_id: userId,
        });
        projectCount++;
        existingTitles.add(proj.title.toLowerCase().trim());
      }
    }
    if (replace && !projects.length) {
      await getSupabaseAdmin().from('projects').delete().eq('owner_id', userId);
    }
    console.log(` [CV Apply] Inserted ${projectCount} projects`);

    //  -  -  Custom Sections (education, certifications, languages, awards, organizations, specializationAreas, custom)  -  - 
    const allCustom: any[] = [];

    for (const ed of education) {
      if (ed.institution || ed.degree) {
        allCustom.push({ title: 'Education', type: 'education', content: ed });
      }
    }

    for (const cert of certifications) {
      if (cert.name) {
        const content: any = { name: cert.name, issuer: cert.issuer || '' };
        if (cert.date) {
          const dateMatch = String(cert.date).match(/([A-Za-z]+)?\s*(\d{4})/);
          if (dateMatch) {
            const months: Record<string, string> = {
              january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',
              july:'07',august:'08',september:'09',october:'10',november:'11',december:'12',
              jan:'01',feb:'02',mar:'03',apr:'04',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'
            };
            const m = months[dateMatch[1]?.toLowerCase()];
            if (m) content.issueMonth = m;
            content.issueYear = dateMatch[2];
          } else {
            content.issueYear = String(cert.date).replace(/[^0-9]/g, '').slice(0, 4);
          }
        }
        if (cert.credential_url) content.credentialUrl = cert.credential_url;
        allCustom.push({ title: 'Certifications', type: 'certification', content });
      }
    }

    for (const lang of languages) {
      if (lang.language) {
        allCustom.push({ title: 'Languages', type: 'language', content: lang });
      }
    }

    for (const award of awards) {
      if (award.title) {
        allCustom.push({ title: 'Awards', type: 'award', content: award });
      }
    }

    for (const org of organizations) {
      if (org.name) {
        allCustom.push({ title: 'Organizations', type: 'organization', content: org });
      }
    }

    for (const sa of specializationAreas) {
      if (sa.area || typeof sa === 'string') {
        allCustom.push({
          title: 'Specialization Areas',
          type: 'specialization',
          content: { body: typeof sa === 'string' ? sa : (sa.area + (sa.description ? `: ${sa.description}` : '')) },
        });
      }
    }

    for (const cs of customSections) {
      if (cs.title) {
        allCustom.push({ title: cs.title, type: cs.type || 'text', content: cs.content || { body: '' } });
      }
    }

    if (allCustom.length || replace) {
      if (replace) {
        await getSupabaseAdmin().from('custom_sections').delete().eq('owner_id', userId);
        console.log(` [CV Apply] Deleted ALL custom sections for user ${userId}`);
      } else {
        const types = [...new Set(allCustom.map(c => c.type))];
        for (const t of types) {
          const { count, error } = await getSupabaseAdmin()
            .from('custom_sections')
            .delete({ count: 'exact' })
            .eq('owner_id', userId)
            .eq('type', t);
          if (error) throw error;
          console.log(` [CV Apply] Deleted ${count || 0} custom sections of type '${t}'`);
        }
      }

      for (const cs of allCustom) {
        await getSupabaseAdmin().from('custom_sections').insert({
          title: cs.title,
          type: cs.type || 'text',
          content: JSON.stringify(cs.content || { body: '' }),
          owner_id: userId,
        });
      }
      console.log(` [CV Apply] Inserted ${allCustom.length} custom sections`);
      const typeCounts: Record<string, number> = {};
      allCustom.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
      console.log(` [CV Apply] Custom section breakdown:`, JSON.stringify(typeCounts));
    }

    //  -  -  Build applied sections list  -  - 
    const newSections: string[] = [];
    if (experiences.length) newSections.push('experience');
    if (skills.length) newSections.push('skills');
    if (projects.length) newSections.push('projects');
    if (hero.headline || hero.subheadline) newSections.push('hero');
    if (contact.email || contact.phone || contact.location) newSections.push('contact');
    if (education.length) newSections.push('custom:Education');
    if (certifications.length) newSections.push('custom:Certifications');
    if (languages.length) newSections.push('custom:Languages');
    if (awards.length) newSections.push('custom:Awards');
    if (organizations.length) newSections.push('custom:Organizations');
    if (specializationAreas.length) newSections.push('custom:Specialization Areas');
    for (const cs of customSections) {
      if (cs.title) newSections.push(`custom:${cs.title}`);
    }

    return successResponse({
      success: true,
      message: `Portfolio updated from CV (${replace ? 'replace' : 'merge'} mode)`,
      sections: newSections,
      mode: replace ? 'replace' : 'merge',
      custom_count: allCustom.length,
    });
  } catch (err: any) { return errorResponse(err.message); }
}
