import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse, successResponse, getErrorMessage } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';
import PDF2JSON from 'pdf2json';
import Groq from 'groq-sdk';
import type { ParsedCv, ParsedCvItem } from '@/types/api';
import {
  cleanExtractedText, estimateConfidence, extractByKeyword, extractExperienceFromRawText,
  mergeResults, normalizeAiResult, pagesToText, parseAiJson, sanitizeJson, CV_LIST_KEYS,
} from '@/lib/cv-parser';

const PDF_TIMEOUT_MS = 20_000;
const AI_TIMEOUT_MS = 30_000;

type AiStatus = 'ok' | 'not_configured' | 'failed';

function pdfToText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('PDF parse timeout')), PDF_TIMEOUT_MS);
    const pdfParser = new PDF2JSON();
    pdfParser.on('pdfParser_dataError', (err) => { clearTimeout(timer); reject(err instanceof Error ? err : new Error(String(err?.parserError || err))); });
    pdfParser.on('pdfParser_dataReady', (data) => {
      clearTimeout(timer);
      try { resolve(pagesToText(data.Pages || [])); } catch (e) { reject(e); }
    });
    try { pdfParser.parseBuffer(buffer); } catch (e) { clearTimeout(timer); reject(e); }
  });
}

function buildPrompt(rawText: string) {
  return `You are a universal CV parser for ALL professions (doctor, lawyer, teacher, developer, designer, accountant, nurse, etc.).
Return ONLY valid JSON - no explanation, no markdown.

Parse this CV into this EXACT JSON structure:

{
  "about": { "name": "", "title": "", "bio": "" },
  "hero": { "headline": "", "subheadline": "" },
  "contact": { "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "experiences": [{ "company": "", "position": "", "start_date": "", "end_date": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "field": "", "start_date": "", "end_date": "", "gpa": "" }],
  "skills": [{ "title": "", "skills": "" }],
  "projects": [{ "title": "", "customer": "", "assignmentBy": "", "startDate": "", "endDate": "", "status": "", "description": "", "tech_stack": "", "demo_url": "", "github_url": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "credential_url": "" }],
  "specializationAreas": [{ "area": "", "description": "" }],
  "languages": [{ "language": "", "proficiency": "" }],
  "awards": [{ "title": "", "issuer": "", "date": "", "description": "" }],
  "organizations": [{ "name": "", "role": "", "start_date": "", "end_date": "", "description": "" }],
  "customSections": [{ "title": "", "type": "text", "content": { "body": "" } }]
}

GUIDELINES:
- Extract EVERY section you find in the CV. Map each to the closest schema field.
- "experiences" = work history, employment, professional experience (any profession)
- "education" = schools, universities, degrees, academic qualifications
- "skills" = technical skills, soft skills, competencies (group by category if possible; "skills" is a comma-separated string)
- "certifications" = certificates, licenses, professional certifications, training completion
- "specializationAreas" = areas of expertise, specialization, fields of practice
- "languages" = human languages with proficiency level
- "awards" = achievements, honors, recognitions
- "organizations" = professional memberships, associations, organizational affiliations
- "customSections" = anything that doesn't fit above: publications, volunteer, interests, references, etc.
- "Customer Experience" sections: each entry is a project - put them in projects[], NOT in customSections
- Projects with same title but different customers: set different "customer" field values, DO NOT merge them
- Dates: keep "Mon YYYY" or "YYYY" as written; use "Present" for ongoing roles.
- Put job description bullet points in "description", one per line.

Fill as much as possible. Use empty strings for missing fields. Keep arrays empty if no data.

CV:
${rawText.substring(0, 15000)}`;
}

async function parseWithAi(rawText: string): Promise<{ status: AiStatus; data: ParsedCv | null; detail?: string }> {
  const apiKey = process.env.NINE_ROUTER_API_KEY;
  if (!apiKey) return { status: 'not_configured', data: null };
  try {
    const groq = new Groq({
      apiKey,
      baseURL: process.env.NINE_ROUTER_BASE_URL || 'https://router.zeen.my.id/v1',
      timeout: AI_TIMEOUT_MS,
      maxRetries: 0,
    });
    const completion = await groq.chat.completions.create({
      model: process.env.NINE_ROUTER_MODEL || 'Projects',
      messages: [{ role: 'user', content: buildPrompt(rawText) }],
      temperature: 0.1,
      max_tokens: 8000,
    });
    const aiText = completion.choices?.[0]?.message?.content || '';
    const parsed = aiText ? parseAiJson(aiText) : null;
    if (!parsed) {
      console.error('[CV Parse] AI returned no usable JSON (length %d)', aiText.length);
      return { status: 'failed', data: null, detail: 'invalid_json' };
    }
    return { status: 'ok', data: normalizeAiResult(parsed) };
  } catch (aiErr) {
    const status = typeof aiErr === 'object' && aiErr !== null && 'status' in aiErr ? String(aiErr.status) : 'unknown';
    console.error(`[CV Parse] AI request failed [${status}]: ${getErrorMessage(aiErr)}`);
    return { status: 'failed', data: null, detail: status };
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rl = await checkRateLimit(`ai:${auth.id}`, 'ai');
    if (!rl.allowed) return errorResponse('Terlalu banyak permintaan. Coba lagi beberapa menit lagi.', 429);

    const formData = await request.formData();
    const file = formData.get('cv') || formData.get('file');
    if (!file || typeof file === 'string') return errorResponse('Tidak ada file yang diunggah.', 400);
    if (file.size > 10 * 1024 * 1024) return errorResponse('File terlalu besar (maksimal 10 MB).', 400);

    const name = (file.name || '').toLowerCase();
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    const isText = file.type === 'text/plain' || name.endsWith('.txt');
    if (!isPdf && !isText) return errorResponse('Format file tidak didukung. Unggah CV dalam bentuk PDF.', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = '';
    if (isPdf) {
      if (buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
        return errorResponse('File ini bukan PDF yang valid. Coba ekspor ulang CV ke PDF.', 400);
      }
      try {
        rawText = await pdfToText(buffer);
      } catch (pdfErr) {
        // Previously fell back to buffer.toString(), which "parsed" raw PDF bytes into garbage.
        console.error('[CV Parse] PDF extraction failed:', getErrorMessage(pdfErr));
        return errorResponse('PDF tidak bisa dibaca. File mungkin terkunci (password) atau rusak.', 422);
      }
    } else {
      rawText = buffer.toString('utf-8');
    }
    rawText = cleanExtractedText(rawText).trim();

    if (rawText.length < 50) {
      return errorResponse('Teks tidak bisa diambil dari PDF ini. Kemungkinan CV berupa gambar/hasil scan. Ekspor ulang CV dari Word atau Google Docs sebagai PDF, lalu coba lagi.', 422);
    }
    console.log('[CV Parse] extracted %d chars', rawText.length);

    const ai = await parseWithAi(rawText);
    const keywordResult = extractByKeyword(rawText);
    const sectionSplits = keywordResult._sections || {};
    delete keywordResult._sections;
    delete keywordResult._sectionKeywordsFound;

    const parsed = mergeResults(ai.data, keywordResult);

    if (!(parsed.experiences as unknown[] | undefined)?.length) {
      const rawExperiences = extractExperienceFromRawText(rawText);
      if (rawExperiences.length) parsed.experiences = rawExperiences;
    }

    // Drop custom text sections that only repeat content already captured in main sections.
    const mainTextSet = new Set<string>();
    for (const key of CV_LIST_KEYS) {
      if (key === 'customSections') continue;
      for (const item of (parsed[key] || [])) {
        if (typeof item === 'string') continue;
        for (const t of [item.title, item.name, item.area, item.position, item.company, item.institution, item.description, item.skills]) {
          if (t) mainTextSet.add(String(t).toLowerCase().trim().slice(0, 300));
        }
      }
    }
    parsed.customSections = (parsed.customSections || []).filter((cs) => {
      if (typeof cs === 'string') return false;
      if (!cs.title) return false;
      const body = typeof cs.content?.body === 'string' ? cs.content.body.toLowerCase().trim() : '';
      if (!body) return true;
      for (const mainText of mainTextSet) {
        if (mainText.length > 15 && body.includes(mainText)) return false;
      }
      return true;
    });

    // Same project title for different customers: make titles unique.
    const titleGroups: Record<string, ParsedCvItem[]> = {};
    for (const p of (parsed.projects || [])) {
      if (typeof p !== 'string' && p.title) (titleGroups[String(p.title)] ||= []).push(p);
    }
    for (const [title, items] of Object.entries(titleGroups)) {
      if (items.length > 1) for (const item of items) if (item.customer) item.title = `${title} - ${item.customer}`;
    }

    const { score, warnings } = estimateConfidence(parsed, rawText);
    parsed.confidence = score;
    parsed.warnings = warnings;

    const notice = ai.status === 'ok'
      ? null
      : ai.status === 'not_configured'
        ? 'AI belum dikonfigurasi di server, jadi CV dibaca dengan pencocokan kata kunci. Hasilnya bisa kurang lengkap — cek dulu sebelum menyimpan.'
        : 'Layanan AI sedang tidak bisa dihubungi, jadi CV dibaca dengan pencocokan kata kunci. Hasilnya bisa kurang lengkap — cek dulu sebelum menyimpan.';

    return successResponse({
      success: true,
      data: sanitizeJson(parsed),
      chars_extracted: rawText.length,
      raw_text_preview: rawText.substring(0, 4000),
      raw_text_length: rawText.length,
      ai_used: ai.status === 'ok',
      ai_status: ai.status,
      notice,
      section_debug: { keyword_section_splits: Object.keys(sectionSplits) },
    });
  } catch (err) { return errorResponse(getErrorMessage(err)); }
}
