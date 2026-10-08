// Pure CV text helpers used by /api/cv/parse. No Next/Supabase imports so they can be unit-tested with plain node.
import type { CvListKey, KeywordCvResult, ParsedCv, ParsedCvEntry, ParsedCvItem } from '@/types/api';

export const CV_LIST_KEYS: CvListKey[] = [
  'experiences', 'education', 'skills', 'projects', 'certifications',
  'specializationAreas', 'languages', 'awards', 'organizations', 'customSections',
];

/* ------------------------------------------------------------------ */
/* PDF text → lines                                                    */
/* ------------------------------------------------------------------ */

export interface PdfTextRun { x: number; y: number; R?: { T: string }[] }
export interface PdfPageLike { Texts?: PdfTextRun[] }

// pdf2json <3 URI-encoded every run, v4 returns raw text. Raw text may contain a literal "%"
// ("grew revenue 30%"), which made decodeURIComponent throw inside the parser callback and hang the request.
function safeDecode(s: string) {
  if (!/%[0-9a-f]{2}/i.test(s)) return s;
  try { return decodeURIComponent(s); } catch { return s; }
}

export function cleanExtractedText(text: string) {
  return text
    .normalize('NFKC') // ligatures (ﬁ → fi), full-width chars
    .replace(/\u0000/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/[​-‍﻿]/g, '')
    .replace(/\r\n?/g, '\n');
}

/** Rebuild visual lines from pdf2json runs (group by y, order by x). The old code joined a whole page into one line. */
export function pagesToText(pages: PdfPageLike[]): string {
  return pages.map((page) => {
    const runs = (page.Texts || [])
      .map((t) => ({ x: Number(t.x) || 0, y: Number(t.y) || 0, text: safeDecode((t.R || []).map((r) => r.T).join('')) }))
      .filter((r) => r.text.trim());
    runs.sort((a, b) => a.y - b.y || a.x - b.x);
    const lines: { y: number; parts: { x: number; text: string }[] }[] = [];
    for (const r of runs) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(r.y - last.y) < 0.35) last.parts.push(r);
      else lines.push({ y: r.y, parts: [r] });
    }
    return lines
      .map((l) => l.parts.sort((a, b) => a.x - b.x).map((p) => p.text).join(' ').replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');
  }).join('\n');
}

/* ------------------------------------------------------------------ */
/* AI JSON                                                             */
/* ------------------------------------------------------------------ */

export function sanitizeJson(obj: unknown): unknown {
  if (typeof obj === 'string') return obj.replace(/\u0000/g, '');
  if (Array.isArray(obj)) return obj.map(sanitizeJson);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) result[k] = sanitizeJson(v);
    return result;
  }
  return obj;
}

/** Parse the model's reply into an object. Returns null when nothing usable could be recovered. */
export function parseAiJson(raw: string): ParsedCv | null {
  const tryParse = (s: string): ParsedCv | null => {
    try {
      const v: unknown = JSON.parse(s);
      return v && typeof v === 'object' && !Array.isArray(v) ? (v as ParsedCv) : null;
    } catch { return null; }
  };
  const direct = tryParse(raw);
  if (direct) return direct;

  let cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  // Models often wrap JSON in prose: keep only the outermost object.
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1) return null;
  cleaned = last > first ? cleaned.slice(first, last + 1) : cleaned.slice(first);
  const sliced = tryParse(cleaned);
  if (sliced) return sliced;

  // Truncated output: drop trailing commas, close open strings/brackets.
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1').replace(/,\s*$/, '');
  if (((cleaned.match(/(?<!\\)"/g) || []).length) % 2 !== 0) cleaned += '"';
  const stack: string[] = [];
  let inStr = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '"' && cleaned[i - 1] !== '\\') inStr = !inStr;
    if (inStr) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack.length) stack.pop();
  }
  return tryParse(cleaned + stack.reverse().join(''));
}

const str = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

/** Coerce whatever the model returned into the shape the client expects (arrays always arrays, strings always strings). */
export function normalizeAiResult(input: ParsedCv): ParsedCv {
  const out: ParsedCv = {};
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
  const about = obj(input.about), hero = obj(input.hero), contact = obj(input.contact);
  out.about = { name: str(about.name), title: str(about.title), bio: str(about.bio) };
  out.hero = { headline: str(hero.headline), subheadline: str(hero.subheadline) };
  out.contact = { email: str(contact.email), phone: str(contact.phone), location: str(contact.location), linkedin: str(contact.linkedin), website: str(contact.website) };
  for (const key of CV_LIST_KEYS) {
    const arr = Array.isArray(input[key]) ? (input[key] as unknown[]) : [];
    out[key] = arr
      .map((item): ParsedCvEntry | null => {
        if (typeof item === 'string') {
          const s = item.trim();
          if (!s) return null;
          if (key === 'specializationAreas') return { area: s, description: '' };
          if (key === 'languages') return { language: s, proficiency: '' };
          if (key === 'skills') return { title: 'Skills', skills: s };
          return null;
        }
        if (!item || typeof item !== 'object') return null;
        const rec: ParsedCvItem = {};
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          if (k === 'content') rec.content = obj(v);
          else if (Array.isArray(v)) rec[k] = v.map(str).filter(Boolean).join(', ');
          else rec[k] = str(v);
        }
        return rec;
      })
      .filter((x): x is ParsedCvEntry => x !== null);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Keyword (non-AI) parser                                             */
/* ------------------------------------------------------------------ */

const BULLET_RX = /^\s*(?:[•●○◦▪■□►▸‣⁃·∙*]|[-–—](?=\s)|o(?=\s))\s*/;
const MONTH = '(?:jan(?:uary|uari)?|feb(?:ruary|ruari)?|mar(?:ch|et)?|apr(?:il)?|may|mei|jun(?:e|i)?|jul(?:y|i)?|aug(?:ust)?|agu(?:stus)?|agt|sep(?:t(?:ember)?)?|oct(?:ober)?|okt(?:ober)?|nov(?:ember)?|dec(?:ember)?|des(?:ember)?)\\.?';
const DATE_POINT = `(?:(?:${MONTH}\\s+)?\\d{4}|\\d{1,2}[/.]\\d{4})`;
const DATE_END = `(?:${DATE_POINT}|present|now|current|today|sekarang|saat\\s+ini|kini)`;
export const DATE_RANGE_RX = new RegExp(`(${DATE_POINT})\\s*(?:-|–|—|to|until|sampai|hingga|s\\.?\\s?d\\.?)\\s*(${DATE_END})`, 'i');
const DATE_RANGE_RX_G = new RegExp(DATE_RANGE_RX.source, 'gi');
const SINGLE_DATE_RX = new RegExp(`\\b(${MONTH}\\s+\\d{4}|(?:19|20)\\d{2})\\b`, 'i');

const SECTION_HEADERS: { rx: RegExp; name: string }[] = [
  { rx: /^(?:pengalaman\s+organisasi|organi[sz]ations?|organisasi|membership|keanggotaan|affiliations?|volunteer(?:ing)?\s+&?\s*organi[sz]ations?)/i, name: 'organizations' },
  { rx: /^(?:customer\s+experience|project\s+experience|projects?|portfolio|proyek|pengalaman\s+proyek)/i, name: 'projects' },
  { rx: /^(?:riwayat\s+)?(?:education(?:al)?(?:\s+background)?|academic(?:\s+background)?|qualifications?|pendidikan)/i, name: 'education' },
  { rx: /^(?:riwayat\s+)?(?:job\s+experience|work\s+experience|working\s+experience|professional\s+experience|experiences?|work\s*history|employment(?:\s+history)?|career\s+history|professional\s+background|pengalaman\s+kerja|pengalaman\s+profesional|pekerjaan|pengalaman)/i, name: 'experience' },
  { rx: /^(?:technical\s+skills?|core\s+skills?|key\s+skills?|skills?|competenc(?:ies|y)|keahlian|kemampuan|kompetensi|expertise|tools)/i, name: 'skills' },
  { rx: /^(?:certifications?|certificates?|sertifikasi|sertifikat|licenses?|lisensi)/i, name: 'certification' },
  { rx: /^(?:specializations?|areas?\s+of\s+expertise|spesialisasi|specialis)/i, name: 'specialization' },
  { rx: /^(?:languages?|bahasa)/i, name: 'languages' },
  { rx: /^(?:awards?|achievements?|honou?rs|penghargaan|prestasi)/i, name: 'awards' },
  { rx: /^(?:publications?|research|penelitian|publikasi)/i, name: 'publications' },
  { rx: /^(?:trainings?|courses?|workshops?|pelatihan|kursus)/i, name: 'training' },
  { rx: /^(?:volunteer(?:ing)?|voluntary|relawan)/i, name: 'volunteer' },
  { rx: /^(?:interests?|hobbies?|hobi|minat)/i, name: 'interests' },
  { rx: /^(?:references?|referensi)/i, name: 'references' },
  { rx: /^(?:career\s+objective|objective|professional\s+summary|summary|profile|about\s+me|profil|ringkasan|tentang\s+saya)/i, name: 'summary' },
  { rx: /^(?:contact(?:\s+info(?:rmation)?)?|personal\s+(?:data|details|information)|data\s+(?:diri|pribadi)|kontak|informasi\s+pribadi)/i, name: 'contact' },
];
const HEADER_EXTRA_WORD = /^(?:&|and|dan|\/|-|history|experiences?|skills?|tools|summary|background|qualifications?|kerja|formal|profesional|professional|technical|teknis|keahlian|key|core|relevant|selected|personal|work|career|riwayat|information|info|details|me|saya|areas?|highlights|certifications?|courses?)$/i;

/** Returns the canonical section name if `line` is a section heading, else null. */
export function matchHeader(line: string): string | null {
  const stripped = line.replace(BULLET_RX, '').trim();
  const endsColon = /[:：]\s*$/.test(stripped);
  const clean = stripped.replace(/[:：]\s*$/, '').trim();
  if (!clean || clean.length > 45 || /\d|@|https?:/i.test(clean)) return null;
  for (const sh of SECTION_HEADERS) {
    const m = clean.match(sh.rx);
    if (!m) continue;
    const after = clean.slice(m[0].length);
    if (/^[a-z]/i.test(after)) continue; // "Skilled in…" is not the "Skills" heading
    const rest = after.trim();
    if (!rest) return sh.name;
    const words = rest.split(/\s+/);
    if (words.length <= 3 && (endsColon || words.every((w) => HEADER_EXTRA_WORD.test(w)))) return sh.name;
  }
  return null;
}

interface Block { head: string[]; desc: string[]; start: string; end: string }

/** Group a section's lines into entries: a short non-bullet line after a description, or a second date range, starts a new entry. */
export function groupBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  const fresh = (): Block => { const b = { head: [], desc: [], start: '', end: '' }; blocks.push(b); return b; };
  for (const raw of lines) {
    const bullet = BULLET_RX.test(raw);
    const line = raw.replace(BULLET_RX, '').trim();
    if (!line) continue;
    const dm = line.match(DATE_RANGE_RX);
    const headLike = !bullet && line.length <= 90;
    if (!cur) cur = fresh();
    else if (headLike) {
      const prev = cur.desc[cur.desc.length - 1] || '';
      const continuation = !!prev && !/[.;:!?)]$/.test(prev) && /^[a-z(]/.test(line);
      if ((cur.desc.length > 0 && !continuation && !(dm && !cur.start)) || (dm && cur.start)) cur = fresh();
    }
    if (dm && !cur.start) { cur.start = dm[1].trim(); cur.end = dm[2].trim(); }
    if (bullet || !headLike || cur.head.length >= 3) cur.desc.push(line);
    else cur.head.push(line);
  }
  return blocks.filter((b) => b.head.length || b.desc.length);
}

const stripDates = (s: string) => s
  .replace(DATE_RANGE_RX_G, ' ')
  .replace(/\(\s*\)/g, ' ')
  .replace(/(?:\s*[|,–—-]\s*){2,}/g, ', ')
  .replace(/(?:\s*[|,–—-]\s*)+$/g, '')
  .replace(/^(?:\s*[|,–—-]\s*)+/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const COMPANY_RX = /\b(?:PT|CV|UD|Tbk|LLC|Inc|Ltd|Corp(?:oration)?|Company|GmbH|Pte|Group|Bank|Studio|Agency|Hospital|Rumah\s+Sakit|RS|RSUD|Puskesmas|Klinik|Dinas|Kementerian|Universit(?:y|as))\b/i;
const SCHOOL_RX = /universit|institut|college|school|sekolah|politeknik|polytechnic|academy|akademi|\bsma\b|\bsmk\b|\bsmp\b|\bman\b|stmik|stie|\bstt\b/i;
const DEGREE_RX = /bachelor|master|\bs[123]\b|\bd[1234]\b|diploma|sarjana|magister|doktor|ph\.?\s?d|b\.?\s?sc|m\.?\s?sc|\bb\.?\s?a\b|\bm\.?\s?a\b|\bb\.?\s?eng|\bmba\b|associate|s\.\s?kom|s\.\s?t\b|s\.\s?e\b|high\s+school/i;

function splitPair(text: string): [string, string] {
  const at = text.split(/\s+(?:at|di|@)\s+/i);
  if (at.length >= 2) return [at[0].trim(), at.slice(1).join(' ').trim()];
  const sep = text.split(/\s+[|–—-]\s+|\s*\|\s*|,\s+/);
  if (sep.length >= 2) return [sep[0].trim(), sep.slice(1).join(', ').trim()];
  return [text.trim(), ''];
}

function blockToExperience(b: Block): ParsedCvItem {
  const head = b.head.map(stripDates).filter(Boolean);
  let [position, company] = splitPair(head[0] || '');
  if (!company && head[1]) company = head[1];
  else if (head[1]) b.desc.unshift(head[1]);
  // "PT Maju Jaya" on the first line, role on the second
  if (COMPANY_RX.test(position) && !COMPANY_RX.test(company)) [position, company] = [company, position];
  for (const extra of head.slice(2)) b.desc.unshift(extra);
  return { position, company, start_date: b.start, end_date: b.end, description: b.desc.join('\n') };
}

function blockToEducation(b: Block): ParsedCvItem {
  const all = [...b.head, ...b.desc].join(' | ');
  const gpaMatch = all.match(/(?:GPA|IPK)\s*[:=]?\s*([\d.,]+(?:\s*\/\s*[\d.,]+)?)/i);
  const parts = b.head
    .map((h) => stripDates(h.replace(/(?:GPA|IPK)\s*[:=]?\s*[\d.,]+(?:\s*\/\s*[\d.,]+)?/i, '')))
    .flatMap((h) => h.split(/\s*[|]\s*|,\s+(?=\S)|\s+[–—-]\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
  let institution = parts.find((p) => SCHOOL_RX.test(p)) || '';
  let degree = parts.find((p) => p !== institution && DEGREE_RX.test(p)) || '';
  const rest = parts.filter((p) => p !== institution && p !== degree);
  if (!institution) institution = rest.shift() || '';
  let field = '';
  if (!degree) degree = rest.shift() || '';
  else field = rest.shift() || '';
  const inMatch = degree.match(/^(.*?)\s+(?:in|of|jurusan|program\s+studi|prodi)\s+(.+)$/i);
  if (inMatch && !field) { degree = inMatch[1].trim(); field = inMatch[2].trim(); }
  const shortDegree = degree.match(/^(S[123]|D[1-4]|B\.?\s?Sc|M\.?\s?Sc|B\.?\s?Eng|MBA|BA|MA|Ph\.?\s?D)\.?\s+(.+)$/i);
  if (shortDegree && !field) { degree = shortDegree[1]; field = shortDegree[2].trim(); }
  const yearOnly = !b.start ? all.match(/\b((?:19|20)\d{2})\b/) : null;
  return {
    institution, degree, field,
    start_date: b.start || '', end_date: b.end || yearOnly?.[1] || '',
    gpa: gpaMatch?.[1]?.trim() || '',
  };
}

function blockToProject(b: Block): ParsedCvItem {
  const head = b.head.map(stripDates).filter(Boolean);
  const [title, customer] = splitPair(head[0] || b.desc[0] || '');
  for (const extra of head.slice(1)) b.desc.unshift(extra);
  return {
    title, customer, assignmentBy: '', startDate: b.start, endDate: b.end, status: '',
    description: b.desc.join('\n'), tech_stack: '', demo_url: '', github_url: '',
  };
}

function lineItems(text: string) {
  return text.split('\n').map((l) => l.replace(BULLET_RX, '').trim()).filter(Boolean);
}

function datedLine(line: string) {
  const range = line.match(DATE_RANGE_RX);
  const single = range ? null : line.match(SINGLE_DATE_RX);
  const rest = stripDates(line.replace(single?.[0] ?? '\u0000', ' ')).replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  return { rest, start: range?.[1] || '', end: range?.[2] || '', date: range ? range[1] : single?.[1] || '' };
}

function splitTitleIssuer(text: string): [string, string] {
  const m = text.match(/^(.*?)\s*(?:\s[–—-]\s|\s\|\s|\bby\b|\bfrom\b|\boleh\b|\bdari\b|,\s)\s*(.+)$/i);
  return m ? [m[1].trim(), m[2].trim()] : [text.trim(), ''];
}

const PHONE_CANDIDATE_RX = /(?:\+|\(?0)[\d\s().-]{7,20}\d/g;

export function extractContact(rawText: string, name?: string) {
  const contact: { email?: string; phone?: string; location?: string; linkedin?: string; website?: string } = {};
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (email) contact.email = email[0];
  for (const m of rawText.matchAll(PHONE_CANDIDATE_RX)) {
    const digits = m[0].replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) { contact.phone = m[0].trim(); break; }
  }
  const linkedin = rawText.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/[^\s|,;]+/i);
  if (linkedin) contact.linkedin = linkedin[0].replace(/[).]+$/, '');
  for (const m of rawText.matchAll(/(?:https?:\/\/|www\.)[^\s|,;]+|\b[a-z0-9-]+\.(?:github\.io|vercel\.app|netlify\.app|dev|me|id|com)(?:\/[^\s|,;]*)?\b|github\.com\/[^\s|,;]+/gi)) {
    const url = m[0].replace(/[).]+$/, '');
    if (/linkedin\.com/i.test(url) || (contact.email && contact.email.toLowerCase().includes(url.toLowerCase()))) continue;
    contact.website = url;
    break;
  }
  // Location: a short segment of a contact line (split on | • ·) that is not an email/phone/url/name.
  const head = rawText.split('\n').slice(0, 8);
  for (const line of head) {
    if (!/[|•·]/.test(line) && !(contact.email && line.includes(contact.email))) continue;
    for (const seg of line.split(/\s*[|•·]\s*/)) {
      const s = seg.trim();
      if (!s || s.length > 40 || /@|\d{4,}|https?:|www\.|linkedin|github/i.test(s)) continue;
      if (name && s.toLowerCase() === name.toLowerCase()) continue;
      if (/^[A-Z][\p{L}.' -]+(?:,\s*[\p{L}.' -]+)?$/u.test(s)) { contact.location = s; break; }
    }
    if (contact.location) break;
  }
  return contact;
}

export function extractByKeyword(rawText: string): KeywordCvResult {
  const lines = rawText.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const result: KeywordCvResult = {
    experiences: [], education: [], skills: [], projects: [],
    certifications: [], specializationAreas: [], languages: [],
    awards: [], organizations: [], customSections: [],
  };

  // Name: first short line that is not a heading / contact detail. Title: the next such line.
  let nameIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i];
    if (matchHeader(l) || /@|https?:|www\.|\d{3,}/i.test(l)) continue;
    const firstSeg = l.split(/\s*[|•·]\s*/)[0].trim();
    if (firstSeg.length >= 3 && firstSeg.length <= 60 && firstSeg.split(/\s+/).length <= 6) {
      nameIdx = i;
      const segs = l.split(/\s*[|•·]\s*/).map((s) => s.trim()).filter(Boolean);
      result.about = { name: segs[0], title: segs[1] || '', bio: '' };
      break;
    }
  }
  if (nameIdx >= 0 && !result.about?.title) {
    const next = lines[nameIdx + 1];
    if (next && next.length < 100 && !matchHeader(next) && !/@|https?:|www\.|\d{5,}|^\+/i.test(next)) {
      result.about = { ...result.about, title: next.split(/\s*[|•·]\s*/)[0].trim() };
    }
  }
  if (result.about?.title) result.hero = { headline: result.about.title, subheadline: '' };
  const contact = extractContact(rawText, result.about?.name);
  if (Object.keys(contact).length) result.contact = contact;

  // Split into sections
  const sections: Record<string, string[]> = {};
  let current: string | null = null;
  for (const line of lines) {
    const header = matchHeader(line);
    if (header) { current = header; sections[current] = sections[current] || []; continue; }
    if (current) sections[current].push(line);
  }

  // Fallback for PDFs that come out as running text: "Skills: Python, SQL Education: …"
  if (Object.keys(sections).length === 0) {
    const inline = /\b(education|pendidikan|experience|pengalaman|skills?|keahlian|certifications?|projects?|languages?|awards?|organi[sz]ations?|training|summary)\s*:/gi;
    const flat = lines.join('\n');
    const hits = [...flat.matchAll(inline)];
    hits.forEach((h, i) => {
      const name = matchHeader(h[1]);
      if (!name) return;
      const body = flat.slice((h.index || 0) + h[0].length, i + 1 < hits.length ? hits[i + 1].index : flat.length);
      sections[name] = (sections[name] || []).concat(body.split('\n').map((s) => s.trim()).filter(Boolean));
    });
  }

  const sectionText = (k: string) => (sections[k] || []).join('\n');

  if (sections.experience?.length) {
    result.experiences = groupBlocks(sections.experience).map(blockToExperience).filter((e) => e.position || e.company);
  }
  if (sections.education?.length) {
    result.education = groupBlocks(sections.education).map(blockToEducation).filter((e) => e.institution || e.degree);
  }
  if (sections.projects?.length) {
    result.projects = groupBlocks(sections.projects).map(blockToProject).filter((p) => p.title);
  }

  if (sections.skills?.length) {
    const cats: ParsedCvItem[] = [];
    const loose: string[] = [];
    for (const l of lineItems(sectionText('skills'))) {
      const cm = l.match(/^([\p{L}\s/&+-]{2,40}?)\s*[:：]\s*(.+)$/u);
      if (cm) cats.push({ title: cm[1].trim(), skills: cm[2].replace(/\s*[;•|]\s*/g, ', ').trim() });
      else loose.push(...l.split(/\s*[,;•|]\s*/).map((s) => s.trim()).filter(Boolean));
    }
    if (loose.length) cats.push({ title: cats.length ? 'Other' : 'Skills', skills: [...new Set(loose)].join(', ') });
    result.skills = cats;
  }

  if (sections.certification?.length) {
    result.certifications = lineItems(sectionText('certification')).map((l) => {
      const d = datedLine(l);
      const [name, issuer] = splitTitleIssuer(d.rest);
      return { name, issuer, date: d.date, credential_url: '' };
    }).filter((c) => c.name);
  }

  if (sections.languages?.length) {
    for (const l of lineItems(sectionText('languages'))) {
      for (const item of l.split(/\s*[,;•|]\s*/).filter(Boolean)) {
        const m = item.match(/^([\p{L}\s]+?)\s*(?:[:：–—-]|\()\s*([^)]+)\)?$/u);
        result.languages.push(m ? { language: m[1].trim(), proficiency: m[2].trim() } : { language: item.trim(), proficiency: '' });
      }
    }
  }

  if (sections.awards?.length) {
    result.awards = lineItems(sectionText('awards')).map((l) => {
      const d = datedLine(l);
      const [title, issuer] = splitTitleIssuer(d.rest);
      return { title, issuer, date: d.date, description: '' };
    }).filter((a) => a.title);
  }

  if (sections.organizations?.length) {
    result.organizations = groupBlocks(sections.organizations).map((b) => {
      const head = b.head.map(stripDates).filter(Boolean);
      const first = head[0] || b.desc[0] || '';
      const asMatch = first.match(/^(.*?)\s+(?:as|sebagai)\s+(.+)$/i);
      let [name, role] = asMatch ? [asMatch[1], asMatch[2]] : splitPair(first);
      if (!role && head[1]) role = head[1];
      if (COMPANY_RX.test(role) && !COMPANY_RX.test(name)) [name, role] = [role, name];
      return { name: name.trim(), role: role.trim(), start_date: b.start, end_date: b.end, description: b.desc.join('\n') };
    }).filter((o) => o.name);
  }

  if (sections.specialization?.length) {
    result.specializationAreas = lineItems(sectionText('specialization'))
      .flatMap((l) => (l.length < 80 && l.includes(',') ? l.split(/\s*,\s*/) : [l]))
      .map((area) => ({ area, description: '' }));
  }

  // Summary goes to the bio; the rest become plain text sections.
  if (sections.summary?.length) {
    const bio = sections.summary.map((l) => l.replace(BULLET_RX, '').trim()).join(' ').replace(/\s{2,}/g, ' ').trim();
    result.about = { name: result.about?.name || '', title: result.about?.title || '', bio };
  }
  const textSections: Record<string, string> = {
    publications: 'Publications', training: 'Training & Courses', volunteer: 'Volunteer Experience',
    interests: 'Interests', references: 'References',
  };
  for (const [key, label] of Object.entries(textSections)) {
    const body = sectionText(key).trim();
    if (body) result.customSections.push({ title: label, type: 'text', content: { body } });
  }

  result._sections = Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.join('\n')]));
  return result;
}

/** Old regex for "PT X, City | Fulltime … Role as a Full Time, Jan 2020 - Present" layouts, kept as a last resort. */
export function extractExperienceFromRawText(rawText: string) {
  const compact = rawText.replace(/\s+/g, ' ').trim();
  const match = compact.match(/(?:job\s+experience|work\s+experience|professional\s+experience|employment)([\s\S]*?)(?:\bEducation\b|\bProject\s+Experience\b|\bProjects?\b|\bCertificate\b|\bCertification\b|\bSkills\b)/i);
  if (!match?.[1]) return [];
  const body = match[1];
  const companyMatches = [...body.matchAll(/((?:PT|CV|UD|LLC|Inc\.?|Ltd\.?|Company)\s+[A-Z][A-Za-z0-9&.,\-\s()]+?)(?:,\s*[^|]+)?\s*\|\s*(?:Fulltime|Full-time|Contract|Bootcamp|Internship|Part-time|Online|Hybrid|Onsite)/gi)];
  const experiences: ParsedCvItem[] = [];
  for (let i = 0; i < companyMatches.length; i++) {
    const company = companyMatches[i][1].replace(/\s+/g, ' ').trim();
    const start = companyMatches[i].index || 0;
    const end = i + 1 < companyMatches.length ? (companyMatches[i + 1].index || body.length) : body.length;
    const block = body.slice(start, end).replace(/\s+/g, ' ');
    const roleMatches = [...block.matchAll(/([A-Z][A-Za-z/&\-\s]+?)\s+as\s+a\s+(?:Full\s*-?\s*Time|contract|part\s*-?\s*time|bootcamp|internship)[^,]*,\s*([A-Za-z]+\s+\d{4})\s*(?:-|–|to)\s*([A-Za-z]+\s+\d{4}|Present|Now|Sekarang)/gi)];
    for (let r = 0; r < roleMatches.length; r++) {
      const roleStart = (roleMatches[r].index || 0) + roleMatches[r][0].length;
      const roleEnd = r + 1 < roleMatches.length ? (roleMatches[r + 1].index || block.length) : block.length;
      experiences.push({
        company,
        position: roleMatches[r][1].replace(/\s+/g, ' ').trim(),
        start_date: roleMatches[r][2].trim(),
        end_date: roleMatches[r][3].trim(),
        description: block.slice(roleStart, roleEnd).replace(/\s*\*\s*/g, '\n* ').trim(),
      });
    }
  }
  return experiences;
}

/** AI result first; every empty field/list is filled from the keyword parser. No blind concatenation (that duplicated every entry). */
export function mergeResults(ai: ParsedCv | null, kw: KeywordCvResult): ParsedCv {
  const base: ParsedCv = ai ? { ...ai } : {};
  const pick = <T extends Record<string, unknown>>(a: T | undefined, b: T | undefined): T => {
    const out: Record<string, unknown> = { ...(b || {}) };
    for (const [k, v] of Object.entries(a || {})) if (v) out[k] = v;
    return out as T;
  };
  base.about = pick(ai?.about, kw.about);
  base.hero = pick(ai?.hero, kw.hero);
  base.contact = pick(ai?.contact, kw.contact);
  for (const key of CV_LIST_KEYS) {
    const fromAi = ai?.[key];
    base[key] = Array.isArray(fromAi) && fromAi.length ? fromAi : kw[key] || [];
  }
  return base;
}

export function estimateConfidence(parsed: ParsedCv, rawText: string): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 50;
  const len = (k: CvListKey) => (Array.isArray(parsed[k]) ? (parsed[k] as unknown[]).length : 0);

  if (parsed.about?.name) score += 10; else warnings.push('Nama tidak ditemukan');
  if (parsed.contact?.email) score += 5; else warnings.push('Email tidak ditemukan');
  if (parsed.contact?.phone) score += 5;

  const checks: { key: CvListKey; rx: RegExp; label: string; plus: number; minus: number }[] = [
    { key: 'experiences', rx: /\b(experience|employment|pengalaman|pekerjaan)\b/i, label: 'Pengalaman kerja', plus: 15, minus: 10 },
    { key: 'education', rx: /\b(education|university|universitas|pendidikan|sarjana)\b/i, label: 'Pendidikan', plus: 10, minus: 10 },
    { key: 'skills', rx: /\b(skills?|keahlian|kemampuan|kompetensi)\b/i, label: 'Skills', plus: 5, minus: 5 },
    { key: 'certifications', rx: /\b(certifications?|certificates?|sertifikasi|sertifikat)\b/i, label: 'Sertifikasi', plus: 5, minus: 5 },
  ];
  for (const c of checks) {
    if (len(c.key)) score += c.key === 'experiences' ? Math.min(len(c.key) * 5, c.plus) : c.plus;
    else if (c.rx.test(rawText)) { warnings.push(`${c.label} terdeteksi di teks tapi gagal dibaca. Cek atau isi manual.`); score -= c.minus; }
  }
  if (rawText.length < 500) warnings.push(`Teks yang terbaca sangat pendek (${rawText.length} karakter). PDF mungkin berupa gambar/scan.`);

  const hasAnyData = parsed.about?.name || CV_LIST_KEYS.some((k) => len(k) > 0);
  if (!hasAnyData) {
    score = Math.min(score, 20);
    warnings.push('CV tidak dapat dibaca otomatis. Silakan isi manual.');
  }
  return { score: Math.max(5, Math.min(100, score)), warnings };
}
