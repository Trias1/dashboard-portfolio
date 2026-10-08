// Builds the printable CV (HTML) from stored portfolio data. Pure function: no Next/Supabase imports.
// All CSS is scoped under .cv-doc and lives inside the .cv-doc element so the client can hand that element
// to html2pdf (which clones only the element, not <head>) and still get the same layout.

export type CvTemplate = 'ats' | 'professional' | 'modern' | 'executive';

type Row = Record<string, unknown>;

export interface CvSourceData {
  about?: Row | null;
  hero?: Row | null;
  contact?: Row | null;
  experience?: Row[];
  skills?: Row[];
  projects?: Row[];
  certificates?: Row[];
  custom?: Row[];
}

const TEMPLATES: Record<CvTemplate, { accent: string; font: string; headFont: string }> = {
  // Plain black, single column, no side-by-side layout: what applicant tracking systems parse most reliably.
  ats: { accent: '#111111', font: "Arial, 'Helvetica Neue', Helvetica, sans-serif", headFont: "Arial, 'Helvetica Neue', Helvetica, sans-serif" },
  professional: { accent: '#1e3a8a', font: "Arial, 'Helvetica Neue', Helvetica, sans-serif", headFont: "Arial, 'Helvetica Neue', Helvetica, sans-serif" },
  modern: { accent: '#0f766e', font: "Arial, 'Helvetica Neue', Helvetica, sans-serif", headFont: "Arial, 'Helvetica Neue', Helvetica, sans-serif" },
  executive: { accent: '#7a2e2e', font: "Georgia, 'Times New Roman', Times, serif", headFont: "Georgia, 'Times New Roman', Times, serif" },
};

export function resolveTemplate(t: string | null | undefined): CvTemplate {
  return t === 'professional' || t === 'modern' || t === 'executive' ? t : 'ats';
}

export function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const s = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2021-03-01" → "Mar 2021"; "2021" → "2021"; anything else is shown as written. (Old version printed "undefined 2021".) */
export function fmtDate(value: unknown) {
  const d = s(value);
  if (!d) return '';
  const m = d.match(/^(\d{4})(?:-(\d{2}))?(?:-\d{2})?(?:T.*)?$/);
  if (!m) return d;
  const month = m[2] ? parseInt(m[2], 10) : 0;
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${m[1]}` : m[1];
}

function range(start: unknown, end: unknown, ongoingIfNoEnd: boolean) {
  const a = fmtDate(start);
  const b = fmtDate(end) || (a && ongoingIfNoEnd ? 'Present' : '');
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

function parseContent(raw: unknown): Row {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Row;
  if (typeof raw === 'string' && raw && raw !== 'undefined' && raw !== 'null') {
    try {
      const v = JSON.parse(raw);
      return v && typeof v === 'object' && !Array.isArray(v) ? v : { body: raw };
    } catch { return { body: raw }; }
  }
  return {};
}

function bullets(text: unknown) {
  const lines = s(text).split('\n').map((l) => l.replace(/^\s*(?:[-*•●▪◦·]|\d+[.)])\s*/, '').trim()).filter(Boolean);
  if (!lines.length) return '';
  if (lines.length === 1) return `<p class="cv-text">${esc(lines[0])}</p>`;
  return `<div class="cv-list">${lines.map((l) => `<div class="cv-li"><span class="cv-dot">&#8226;</span><span>${esc(l)}</span></div>`).join('')}</div>`;
}

const cleanUrl = (u: unknown) => s(u).replace(/^https?:\/\//i, '').replace(/\/$/, '');

interface Entry { title: string; sub?: string; date?: string; body?: string }

function renderEntry(e: Entry, t: CvTemplate) {
  const title = `<div class="cv-title">${e.title}</div>`;
  const sub = e.sub ? `<div class="cv-sub">${e.sub}</div>` : '';
  const body = e.body || '';
  if (t === 'ats') {
    // Reading order = visual order; every piece is plain text on its own line.
    const date = e.date ? `<div class="cv-date">${esc(e.date)}</div>` : '';
    return `<div class="cv-entry">${title}${sub}${date}${body}</div>`;
  }
  if (t === 'modern') {
    return `<div class="cv-entry cv-row"><div class="cv-side">${e.date ? esc(e.date) : ''}</div><div class="cv-main">${title}${sub}${body}</div></div>`;
  }
  const date = e.date ? `<div class="cv-date">${esc(e.date)}</div>` : '';
  return `<div class="cv-entry"><div class="cv-head">${title}${date}</div>${sub}${body}</div>`;
}

/** Section title is kept on the same page as its first entry. */
function renderSection(title: string, entries: string[]) {
  if (!entries.length) return '';
  const [first, ...rest] = entries;
  return `<section class="cv-section"><div class="cv-keep"><h2 class="cv-h2">${esc(title)}</h2>${first}</div>${rest.join('')}</section>`;
}

function css(t: CvTemplate) {
  const { accent, font, headFont } = TEMPLATES[t];
  const exec = t === 'executive';
  return `
.cv-doc{all:initial;display:block;box-sizing:border-box;width:100%;max-width:182mm;margin:0 auto;background:#fff;color:#111;font-family:${font};font-size:10pt;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cv-doc *{box-sizing:border-box;margin:0;padding:0;border:0;font:inherit;color:inherit;text-decoration:none;list-style:none}
.cv-doc .cv-header{${exec ? 'text-align:center;' : ''}padding-bottom:${exec ? '10pt' : '8pt'};margin-bottom:4pt;border-bottom:${exec ? `0.75pt solid #222` : `1.5pt solid ${accent}`}}
.cv-doc .cv-name{font-family:${headFont};font-size:${exec ? '24pt' : '22pt'};font-weight:${exec ? '400' : '700'};line-height:1.1;letter-spacing:${exec ? '0.06em' : '-0.01em'};${exec ? 'text-transform:uppercase;' : ''}color:#111}
.cv-doc .cv-role{margin-top:3pt;font-size:11.5pt;color:${exec ? '#444' : accent};${exec ? 'font-style:italic;' : ''}}
.cv-doc .cv-contact{margin-top:5pt;font-size:9pt;color:#333}
.cv-doc .cv-contact span+span::before{content:"  |  ";white-space:pre;color:#999}
.cv-doc .cv-summary{margin-top:10pt;font-size:10pt;color:#222;white-space:pre-line;${exec ? 'text-align:center;font-style:italic;' : ''}}
.cv-doc .cv-section{margin-top:12pt}
.cv-doc .cv-h2{font-family:${headFont};font-size:9.5pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${exec ? '#111' : accent};padding-bottom:3pt;margin-bottom:6pt;border-bottom:0.75pt solid ${exec ? '#999' : '#c9c9c9'}}
.cv-doc .cv-keep,.cv-doc .cv-entry{page-break-inside:avoid;break-inside:avoid}
/* margin on every entry (not sibling selectors): html2pdf inserts spacer divs before entries, which would break "+" rules */
.cv-doc .cv-entry{margin-top:8pt}
.cv-doc .cv-h2+.cv-entry{margin-top:0}
.cv-doc .cv-head{display:flex;justify-content:space-between;align-items:baseline;gap:10pt}
.cv-doc .cv-title{font-weight:700;font-size:10.5pt;color:#111;min-width:0}
.cv-doc .cv-title .cv-at{font-weight:400}
.cv-doc .cv-date{flex:none;font-size:9pt;color:#444;white-space:nowrap;font-variant-numeric:tabular-nums;${exec ? 'font-style:italic;' : ''}}
.cv-doc .cv-sub{font-size:9.5pt;color:#444;${exec ? 'font-style:italic;' : ''}}
.cv-doc .cv-text{margin-top:3pt;color:#222;white-space:pre-line}
.cv-doc .cv-list{margin-top:3pt}
.cv-doc .cv-li{display:flex;gap:5pt;margin-top:1.5pt;color:#222}
.cv-doc .cv-dot{flex:none;color:${exec ? '#555' : accent}}
.cv-doc .cv-meta{margin-top:2pt;font-size:9pt;color:#555}
.cv-doc .cv-row{display:flex;gap:12pt}
.cv-doc .cv-side{flex:none;width:34mm;font-size:8.5pt;color:#555;padding-top:1pt;font-variant-numeric:tabular-nums}
.cv-doc .cv-main{flex:1;min-width:0}
.cv-doc .cv-skill{margin-bottom:3pt}
.cv-doc .cv-skill b{font-weight:700}
.cv-doc .cv-text,.cv-doc .cv-li,.cv-doc .cv-meta,.cv-doc .cv-contact{overflow-wrap:anywhere}
${t === 'ats' ? '.cv-doc.cv-ats .cv-date{display:block;margin-top:1pt;color:#333}.cv-doc.cv-ats .cv-h2{color:#111;border-bottom-color:#111}.cv-doc.cv-ats .cv-header{border-bottom:0.75pt solid #111}.cv-doc.cv-ats .cv-role{color:#111}.cv-doc.cv-ats .cv-dot{color:#111}' : ''}
@page{size:A4;margin:16mm 14mm}
html.cv-standalone{background:#ecebe7}
html.cv-standalone body{margin:0;padding:24px 0}
html.cv-standalone .cv-doc{max-width:210mm;min-height:297mm;padding:16mm 14mm;box-shadow:0 1px 3px rgba(0,0,0,.15)}
@media print{html.cv-standalone{background:#fff}html.cv-standalone body{padding:0}html.cv-standalone .cv-doc{max-width:none;min-height:0;padding:0;box-shadow:none}}
`;
}

export function buildCvHtml(data: CvSourceData, template: string): { html: string; name: string } {
  const t = resolveTemplate(template);
  const a = data.about || {};
  const h = data.hero || {};
  const c = data.contact || {};
  const name = s(a.name) || 'Your Name';
  const role = s(a.title) || s(h.headline) || s(h.subheadline);

  const contactParts = [
    s(c.email), s(c.phone), s(c.location),
    cleanUrl(c.linkedin_url), cleanUrl(c.github_url),
  ].filter(Boolean);

  // --- custom sections, grouped like the public page does ---
  const custom = (data.custom || []).map((r) => ({ title: s(r.title), type: s(r.type) || 'text', content: parseContent(r.content) }));
  const ofType = (type: string) => custom.filter((r) => r.type === type);

  const sections: string[] = [];

  // Experience
  sections.push(renderSection('Experience', (data.experience || []).map((e) => renderEntry({
    title: `${esc(s(e.position) || 'Role')}${s(e.company) && t !== 'modern' ? `<span class="cv-at">${t === 'ats' ? ' — ' : ', '}${esc(e.company)}</span>` : ''}`,
    sub: t === 'modern' && s(e.company) ? esc(e.company) : undefined,
    date: range(e.start_date, e.end_date, true),
    body: bullets(e.description),
  }, t))));

  // Education (custom rows of type "education")
  sections.push(renderSection('Education', ofType('education').map(({ content: ed }) => {
    const study = [s(ed.institution) ? s(ed.degree) : '', s(ed.field)].filter(Boolean).join(', ');
    const sub = [study, s(ed.gpa) ? `GPA ${s(ed.gpa)}` : ''].filter(Boolean).join(' · ');
    return renderEntry({
      title: esc(s(ed.institution) || s(ed.degree)),
      sub: sub ? esc(sub) : undefined,
      date: range(ed.start_date, ed.end_date, false),
    }, t);
  })));

  // Skills: "Category: a, b, c" lines — readable and ATS-friendly.
  const skillLines = (data.skills || []).map((sk) => {
    const items = s(sk.skills).split(',').map((x) => x.trim()).filter(Boolean);
    if (!items.length) return '';
    const label = s(sk.title);
    return `<div class="cv-skill">${label ? `<b>${esc(label)}:</b> ` : ''}${esc(items.join(', '))}</div>`;
  }).filter(Boolean);
  if (skillLines.length) {
    sections.push(t === 'modern'
      ? renderSection('Skills', [`<div class="cv-entry cv-row"><div class="cv-side"></div><div class="cv-main">${skillLines.join('')}</div></div>`])
      : renderSection('Skills', [`<div class="cv-entry">${skillLines.join('')}</div>`]));
  }

  // Projects
  sections.push(renderSection('Projects', (data.projects || []).map((p) => {
    const tech = s(p.tech_stack).split(',').map((x) => x.trim()).filter(Boolean).join(' · ');
    const links = [cleanUrl(p.demo_url), cleanUrl(p.github_url)].filter(Boolean).join('  |  ');
    return renderEntry({
      title: esc(s(p.title) || 'Project'),
      body: bullets(p.description) + (tech ? `<div class="cv-meta">${esc(tech)}</div>` : '') + (links ? `<div class="cv-meta">${esc(links)}</div>` : ''),
    }, t);
  })));

  // Certifications: gallery certificates + custom "certification" rows
  const certEntries = [
    ...(data.certificates || []).map((g) => renderEntry({
      title: esc(s(g.title) || 'Certificate'),
      sub: s(g.description) && s(g.description).length <= 120 ? esc(g.description) : undefined,
      date: fmtDate(g.issued_date),
    }, t)),
    ...ofType('certification').flatMap(({ content: ct }) => {
      // Older rows store a list under items; newer rows are one certificate each.
      const list = Array.isArray(ct.items) ? (ct.items as Row[]) : [ct];
      return list.map((it) => {
        const item = typeof it === 'object' && it ? it : { name: String(it) };
        const month = parseInt(s(item.issueMonth), 10);
        const date = s(item.issueYear) ? `${month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ` : ''}${s(item.issueYear)}` : s(item.date);
        return renderEntry({ title: esc(s(item.name) || s(item.title) || 'Certificate'), sub: esc(s(item.issuer)) || undefined, date }, t);
      });
    }),
  ];
  sections.push(renderSection('Certifications', certEntries));

  sections.push(renderSection('Organizations', ofType('organization').map(({ content: o }) => renderEntry({
    title: esc(s(o.name)), sub: esc(s(o.role)) || undefined, date: range(o.start_date, o.end_date, false), body: bullets(o.description),
  }, t))));

  sections.push(renderSection('Awards', ofType('award').map(({ content: aw }) => renderEntry({
    title: esc(s(aw.title)), sub: esc(s(aw.issuer)) || undefined, date: fmtDate(aw.date), body: bullets(aw.description),
  }, t))));

  const langs = ofType('language').map(({ content: l }) => `${esc(s(l.language))}${s(l.proficiency) ? ` (${esc(l.proficiency)})` : ''}`).filter(Boolean);
  if (langs.length) sections.push(renderSection('Languages', [renderEntry({ title: '', body: `<p class="cv-text">${langs.join(', ')}</p>` }, t)]));

  const specs = ofType('specialization').map(({ content: sp }) => s(sp.body) || [s(sp.area), s(sp.description)].filter(Boolean).join(': ')).filter(Boolean);
  if (specs.length) sections.push(renderSection('Specialization', [renderEntry({ title: '', body: bullets(specs.join('\n')) }, t)]));

  // Remaining custom sections (text / list / cards / links), one CV section per title.
  const typed = new Set(['education', 'certification', 'organization', 'award', 'language', 'specialization']);
  const otherTitles = [...new Set(custom.filter((r) => !typed.has(r.type)).map((r) => r.title || 'Additional Information'))];
  for (const title of otherTitles) {
    const rows = custom.filter((r) => !typed.has(r.type) && (r.title || 'Additional Information') === title);
    const parts = rows.map(({ content: cc }) => {
      const lines: string[] = [];
      if (s(cc.body)) lines.push(s(cc.body));
      if (Array.isArray(cc.items)) lines.push(...cc.items.map((i) => (typeof i === 'string' ? i : s((i as Row)?.title) || s((i as Row)?.name))).filter(Boolean));
      if (Array.isArray(cc.cards)) lines.push(...(cc.cards as Row[]).map((card) => [s(card.title), s(card.desc)].filter(Boolean).join(': ')).filter(Boolean));
      if (Array.isArray(cc.links)) lines.push(...(cc.links as Row[]).map((l) => [s(l.label), cleanUrl(l.url)].filter(Boolean).join(': ')).filter(Boolean));
      if (!lines.length && s(cc.description)) lines.push(s(cc.description));
      return lines.length ? renderEntry({ title: '', body: bullets(lines.join('\n')) }, t) : '';
    }).filter(Boolean);
    sections.push(renderSection(title, parts));
  }

  const header = `<header class="cv-header">
    <div class="cv-name">${esc(name)}</div>
    ${role ? `<div class="cv-role">${esc(role)}</div>` : ''}
    ${contactParts.length ? `<div class="cv-contact">${contactParts.map((p) => `<span>${esc(p)}</span>`).join('')}</div>` : ''}
  </header>
  ${s(a.bio) ? (t === 'ats' ? `<section class="cv-section"><h2 class="cv-h2">Summary</h2><p class="cv-text">${esc(a.bio)}</p></section>` : `<p class="cv-summary">${esc(a.bio)}</p>`) : ''}`;

  // Empty-title entries (languages, skills…) shouldn't print an empty bold line.
  const body = sections.filter(Boolean).join('\n').replace(/<div class="cv-title"><\/div>/g, '');

  const html = `<!DOCTYPE html>
<html lang="en" class="cv-standalone">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} - CV</title>
</head>
<body>
<div class="cv-doc cv-${t}">
<style>${css(t)}</style>
${header}
${body}
</div>
</body>
</html>`;
  return { html, name };
}
