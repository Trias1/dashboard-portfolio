import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { errorResponse } from '@/lib/utils';

function esc(value: any) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBullets(text: string, color: string, font: string, size: string) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return `<p style="margin:4px 0 0;font-size:${size};color:${color};font-family:${font};line-height:1.55;white-space:pre-line">${esc(lines[0] || text)}</p>`;
  }
  return `<ul style="margin:4px 0 0;padding-left:18px;list-style-type:disc">${lines.map(l =>
    `<li style="margin-bottom:2px;font-size:${size};color:${color};font-family:${font};line-height:1.5">${esc(l)}</li>`
  ).join('')}</ul>`;
}

function fmtDate(d: string) {
  if (!d) return '';
  const p = d.slice(0, 7).split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(p[1]) - 1] + ' ' + p[0];
}

function headerCss(t: string, accent: string) {
  if (t === 'modern') return `background:${accent};padding:26px 32px 20px;color:#fff`;
  if (t === 'executive') return `text-align:center;padding-bottom:14px;margin-bottom:18px;border-bottom:1px solid #d6d3d1`;
  return `border-bottom:2px solid #1f2937;padding-bottom:8px;margin-bottom:16px`;
}

function pageCss(t: string) {
  if (t === 'modern') return `background:#fff;max-width:210mm;margin:0 auto`;
  return `max-width:210mm;margin:0 auto;background:#fff`;
}

function nameCss(t: string) {
  if (t === 'modern') return `font-size:26pt;font-weight:700;letter-spacing:-0.5px;margin-bottom:2px;color:#fff;font-family:Arial,Helvetica,sans-serif`;
  if (t === 'executive') return `font-size:28pt;font-weight:400;letter-spacing:2px;text-transform:uppercase;color:#1c1917;margin-bottom:4px;font-family:Georgia,'Times New Roman',serif`;
  return `font-size:24pt;font-weight:700;letter-spacing:-0.5px;color:#111827;margin-bottom:2px;font-family:Arial,Helvetica,sans-serif`;
}

function titleCss(t: string) {
  if (t === 'modern') return `font-size:11pt;color:#bfdbfe;margin-bottom:6px;font-family:Arial,Helvetica,sans-serif`;
  if (t === 'executive') return `font-size:11pt;color:#78716c;font-style:italic;margin-bottom:8px;font-family:Georgia,'Times New Roman',serif`;
  return `font-size:11pt;color:#4b5563;margin-bottom:6px;font-family:Arial,Helvetica,sans-serif`;
}

function contactCss(t: string) {
  if (t === 'modern') return `font-size:9.5pt;color:#cbd5e1;margin-top:6px;font-family:Arial,Helvetica,sans-serif`;
  if (t === 'executive') return `font-size:9.5pt;color:#57534e;margin-top:6px;font-family:Georgia,'Times New Roman',serif`;
  return `font-size:9.5pt;color:#4b5563;margin-top:6px;font-family:Arial,Helvetica,sans-serif`;
}

function summaryCss(t: string) {
  if (t === 'executive') return `margin:14px 0 18px;font-size:10.5pt;line-height:1.65;color:#44403c;text-align:center;white-space:pre-line;font-style:italic;font-family:Georgia,'Times New Roman',serif`;
  return `margin:12px 0 16px;font-size:10.5pt;line-height:1.55;color:#374151;white-space:pre-line;font-family:Arial,Helvetica,sans-serif`;
}

function sectionTitleCss(t: string, accent: string) {
  const base = `font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:4px;margin-bottom:10px`;
  const fonts = t === 'executive' ? `font-family:Georgia,'Times New Roman',serif` : `font-family:Arial,Helvetica,sans-serif`;
  if (t === 'modern') return `${base};color:${accent};border-bottom:2px solid ${accent};${fonts}`;
  if (t === 'executive') return `${base};color:#78716c;border-bottom:0.5px solid #d6d3d1;${fonts}`;
  return `${base};color:#111827;border-bottom:1.5px solid #d1d5db;${fonts}`;
}

function itemTitleCss(t: string) {
  const base = `font-weight:700;font-size:11pt;`;
  if (t === 'executive') return base + `color:#1c1917;font-family:Georgia,'Times New Roman',serif`;
  return base + `color:#111827;font-family:Arial,Helvetica,sans-serif`;
}

function itemSubCss(t: string) {
  if (t === 'executive') return `font-size:10.5pt;color:#57534e;font-style:italic;margin-top:1px;font-family:Georgia,'Times New Roman',serif`;
  return `font-size:10pt;color:#4b5563;margin-top:1px;font-family:Arial,Helvetica,sans-serif`;
}

function itemDateCss(t: string) {
  if (t === 'executive') return `font-size:9.5pt;color:#78716c;white-space:nowrap;font-family:Georgia,'Times New Roman',serif`;
  return `font-size:9.5pt;color:#6b7280;white-space:nowrap;font-weight:500;font-family:Arial,Helvetica,sans-serif`;
}

function chipCss(t: string, accent: string) {
  const base = `display:inline-block;padding:2px 7px;font-size:9pt;margin:2px 3px 2px 0`;
  if (t === 'modern') return `${base};background:#e0f2fe;color:#075985;border-radius:3px;font-family:Arial,Helvetica,sans-serif`;
  if (t === 'executive') return `${base};background:#fafaf9;color:#57534e;border:0.5px solid #d6d3d1;font-family:Georgia,'Times New Roman',serif`;
  return `${base};background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:2px;font-family:Arial,Helvetica,sans-serif`;
}

function bodyFont(t: string) {
  if (t === 'executive') return `font-family:Georgia,'Times New Roman',serif;font-size:11pt;color:#292524;line-height:1.6`;
  return `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#1f2937;line-height:1.5`;
}

function bodyContentWrap(t: string) {
  if (t === 'modern') return `padding:0 32px 28px`;
  return `padding:0`;
}

function contentTextColor(t: string) {
  return t === 'modern' ? '#1f2937' : '#1f2937';
}

function contentBodyCss(t: string) {
  const base = `font-size:10pt;line-height:1.5;`;
  if (t === 'executive') return base + `color:#44403c;font-family:Georgia,'Times New Roman',serif`;
  return base + `color:#374151;font-family:Arial,Helvetica,sans-serif`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const t = request.nextUrl.searchParams.get('template') || 'professional';
    const userId = auth.id;
    const accent = t === 'modern' ? '#1e3a5f' : t === 'executive' ? '#7c3aed' : '#111827';

    const [about, hero, experience, skills, projects, contact, certificates, customSections] = await Promise.all([
      getSupabaseAdmin().from('about').select('*').eq('owner_id', userId).maybeSingle(),
      getSupabaseAdmin().from('hero').select('*').eq('owner_id', userId).maybeSingle(),
      getSupabaseAdmin().from('experience').select('*').eq('owner_id', userId).order('start_date', { ascending: false }),
      getSupabaseAdmin().from('skills').select('*').eq('owner_id', userId),
      getSupabaseAdmin().from('projects').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(6),
      getSupabaseAdmin().from('contact_info').select('*').eq('owner_id', userId).maybeSingle(),
      getSupabaseAdmin().from('gallery').select('*').eq('owner_id', userId).order('issued_date', { ascending: false }),
      getSupabaseAdmin().from('custom_sections').select('*').eq('owner_id', userId).order('sort_order', { ascending: true }),
    ]);

    const a = about.data || {};
    const h = hero.data || {};
    const c = contact.data || {};
    const expList = experience.data || [];
    const skList = skills.data || [];
    const projList = projects.data || [];
    const certList = certificates.data || [];
    const custList = customSections.data || [];

    const contactParts = [c.email, c.phone, c.location].filter(Boolean);
    const contactHtml = contactParts.length
      ? `<div style="${contactCss(t)}">${contactParts.map(esc).join(' &nbsp;|&nbsp; ')}</div>`
      : '';

    const summaryHtml = a.bio
      ? `<div style="${summaryCss(t)}">${esc(a.bio)}</div>`
      : '';

    const experienceHtml = expList.length
      ? `<div style="margin-bottom:16px">` +
        `<div style="${sectionTitleCss(t, accent)}">Experience</div>` +
        expList.map(e => {
          const date = `${e.start_date ? fmtDate(e.start_date) : ''} - ${e.end_date ? fmtDate(e.end_date) : 'Present'}`;
          const desc = e.description ? formatBullets(e.description, contentTextColor(t), t === 'executive' ? "Georgia,'Times New Roman',serif" : 'Arial,Helvetica,sans-serif', '10pt') : '';
          return `<div style="margin-bottom:10px">` +
            `<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap">` +
            `<div style="flex:1"><div style="${itemTitleCss(t)}">${esc(e.position || 'Role')}${e.company ? ` <span style="font-weight:400">at ${esc(e.company)}</span>` : ''}</div></div>` +
            `<div style="${itemDateCss(t)}">${date}</div>` +
            `</div>${desc}</div>`;
        }).join('') +
        `</div>`
      : '';

    const skillsHtml = skList.length
      ? `<div style="margin-bottom:16px">` +
        `<div style="${sectionTitleCss(t, accent)}">Skills</div>` +
        skList.map(s => {
          const items = String(s.skills || '').split(',').map((sk: string) => sk.trim()).filter(Boolean);
          if (!items.length) return '';
          const title = s.title ? `<div style="font-weight:700;font-size:10pt;color:${contentTextColor(t)};margin-bottom:3px;font-family:${t === 'executive' ? "Georgia,'Times New Roman',serif" : 'Arial,Helvetica,sans-serif'}">${esc(s.title)}</div>` : '';
          const chips = items.map(sk => `<span style="${chipCss(t, accent)}">${esc(sk)}</span>`).join('');
          return `<div style="margin-bottom:6px">${title}<div>${chips}</div></div>`;
        }).filter(Boolean).join('') +
        `</div>`
      : '';

    const projectsHtml = projList.length
      ? `<div style="margin-bottom:16px">` +
        `<div style="${sectionTitleCss(t, accent)}">Projects</div>` +
        projList.map(p => {
          const desc = p.description ? formatBullets(p.description, contentTextColor(t), t === 'executive' ? "Georgia,'Times New Roman',serif" : 'Arial,Helvetica,sans-serif', '10pt') : '';
          const tech = p.tech_stack
            ? `<div style="margin-top:4px">${String(p.tech_stack).split(',').map((x: string) => x.trim()).filter(Boolean).map((x: string) => `<span style="${chipCss(t, accent)}">${esc(x)}</span>`).join('')}</div>`
            : '';
          return `<div style="margin-bottom:8px"><div style="${itemTitleCss(t)}">${esc(p.title)}</div>${desc}${tech}</div>`;
        }).join('') +
        `</div>`
      : '';

    const certHtml = certList.length
      ? `<div style="margin-bottom:16px">` +
        `<div style="${sectionTitleCss(t, accent)}">Certificates</div>` +
        certList.map(cert => {
          const date = cert.issued_date ? fmtDate(cert.issued_date) : '';
          const issuer = cert.issuer ? cert.issuer : '';
          return `<div style="margin-bottom:8px">` +
            `<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap">` +
            `<div style="flex:1"><div style="${itemTitleCss(t)}">${esc(cert.title || 'Certificate')}</div>${issuer ? `<div style="${itemSubCss(t)}">${esc(issuer)}</div>` : ''}</div>` +
            (date ? `<div style="${itemDateCss(t)}">${date}</div>` : '') +
            `</div></div>`;
        }).join('') +
        `</div>`
      : '';

    const custHtml = custList.length
      ? `<div style="margin-bottom:16px">` +
        `<div style="${sectionTitleCss(t, accent)}">Additional Information</div>` +
        custList.map(section => {
          const body = section.content?.body
            ? formatBullets(section.content.body, contentTextColor(t), t === 'executive' ? "Georgia,'Times New Roman',serif" : 'Arial,Helvetica,sans-serif', '10pt')
            : '';
          return `<div style="margin-bottom:8px"><div style="${itemTitleCss(t)}">${esc(section.title || 'Section')}</div>${body}</div>`;
        }).join('') +
        `</div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(a.name || 'CV')} - CV</title>
</head>
<body style="background:#fff;margin:0;padding:20px;${bodyFont(t)}">
<div style="${pageCss(t)};padding:0">
  <div style="${headerCss(t, accent)}">
    <div style="${nameCss(t)}">${esc(a.name || 'Your Name')}</div>
    <div style="${titleCss(t)}">${esc(h.subheadline || a.title || '')}</div>
    ${contactHtml}
    ${summaryHtml}
  </div>
  <div style="${bodyContentWrap(t)}">
    ${experienceHtml}
    ${skillsHtml}
    ${projectsHtml}
    ${certHtml}
    ${custHtml}
  </div>
</div>
</body>
</html>`;

    const filename = (a.name || 'CV').replace(/\s+/g, '_') + '_CV.html';

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (err: any) { return errorResponse(err.message, 401); }
}
