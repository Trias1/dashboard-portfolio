import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import PDF2JSON from 'pdf2json';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.NINE_ROUTER_API_KEY || '', baseURL: process.env.NINE_ROUTER_BASE_URL || 'https://router.zeen.my.id/v1' });

function pdfParse(buffer: Buffer): Promise<{ text: string }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDF2JSON();
    pdfParser.on('pdfParser_dataError', (err: any) => reject(err));
    pdfParser.on('pdfParser_dataReady', (data: any) => {
      const text = (data.Pages || []).map((page: any) =>
        (page.Texts || []).map((t: any) =>
          decodeURIComponent((t.R || []).map((r: any) => r.T).join(''))
        ).join(' ')
      ).join('\n');
      resolve({ text });
    });
    pdfParser.parseBuffer(buffer);
  });
}

function sanitizeJson(obj: any): any {
  if (typeof obj === 'string') return obj.replace(/\u0000/g, '');
  if (Array.isArray(obj)) return obj.map(sanitizeJson);
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) result[k] = sanitizeJson(v);
    return result;
  }
  return obj;
}

function repairJson(raw: string): any {
  try { return JSON.parse(raw); } catch {}

  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

  const openC = (cleaned.match(/\{/g) || []).length;
  const closeC = (cleaned.match(/\}/g) || []).length;
  const openA = (cleaned.match(/\[/g) || []).length;
  const closeA = (cleaned.match(/\]/g) || []).length;

  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  const quoteCount = (cleaned.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) cleaned += '"';

  for (let i = 0; i < openC - closeC; i++) cleaned += '}';
  for (let i = 0; i < openA - closeA; i++) cleaned += ']';

  try { return JSON.parse(cleaned); } catch {}

  const parsed: any = {};
  const nameMatch = raw.match(/name["']?\s*[:=]\s*["']([^"']+)/i);
  if (nameMatch) parsed.about = { name: nameMatch[1] };
  const emailMatch = raw.match(/email["']?\s*[:=]\s*["']([^"']+@[^"']+)["']/i);
  if (emailMatch) { parsed.contact = { email: emailMatch[1] }; }
  return parsed;
}

function extractByKeyword(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const fallback: any = {
    experiences: [], education: [], skills: [], projects: [],
    certifications: [], specializationAreas: [], languages: [],
    awards: [], organizations: [], customSections: [],
  };

  // Detect section keywords in raw text (for debug)
  const sectionKeywordsFoundInText: string[] = [];
  const keywordChecks = [
    { rx: /\b(experience|work|employment|pengalaman)\b/i, name: 'Experience' },
    { rx: /\b(education|university|school|pendidikan|universitas)\b/i, name: 'Education' },
    { rx: /\b(skills?|keahlian|kemampuan)\b/i, name: 'Skills' },
    { rx: /\b(certification|certificate|sertifikasi|sertifikat)\b/i, name: 'Certification' },
    { rx: /\b(specialization|specialis|spesialisasi)\b/i, name: 'Specialization' },
    { rx: /\b(projects?|portfolio|proyek)\b/i, name: 'Projects' },
    { rx: /\b(languages?|bahasa)\b/i, name: 'Languages' },
    { rx: /\b(awards?|achievement|penghargaan)\b/i, name: 'Awards' },
    { rx: /\b(organizations?|organisasi|anggota)\b/i, name: 'Organizations' },
    { rx: /\b(training|courses?|pelatihan)\b/i, name: 'Training' },
  ];
  for (const c of keywordChecks) {
    if (c.rx.test(rawText)) sectionKeywordsFoundInText.push(c.name);
  }

  // Name: first substantial line (not a section header)
  const skipHeaders = /^(education|experience|work\s*history|employment|skills|projects|certification|certificates|specialization|expertise|languages|achievements|awards|interests|references|training|courses|publications|volunteer|objective|summary|profile|contact|personal\s*data|additional)/i;
  for (const line of lines) {
    if (line.length > 2 && line.length < 80 && !skipHeaders.test(line) && !line.match(/@|http|phone|tel|email|\d{5,}/i)) {
      fallback.about = { name: line, title: '', bio: '' };
      break;
    }
  }

  // Email
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) fallback.contact = { email: emailMatch[1] };

  // Phone
  const phoneMatch = rawText.match(/(?:\+?62|0)[0-9]{8,15}/);
  if (phoneMatch) {
    if (!fallback.contact) fallback.contact = {};
    fallback.contact.phone = phoneMatch[0];
  }

  // Title: line after name
  if (fallback.about?.name) {
    const nameIdx = lines.findIndex((l: string) =>
      l.toLowerCase().includes(fallback.about.name.toLowerCase())
    );
    if (nameIdx >= 0 && nameIdx + 1 < lines.length) {
      const next = lines[nameIdx + 1].trim();
      if (next.length < 120 && !next.match(/@|http|phone|tel|email|^\d/i)) {
        fallback.hero = { headline: next, subheadline: '' };
      }
    }
  }

  // Section detection  -  universal, prefix-tolerant, ANY profession
  // Match BOTH exact header lines AND lines that START with a recognized header
  const sectionHeaders = [
    { rx: /^(?:education|educational|academic|qualification|pendidikan)/i, name: 'education' },
    { rx: /^(?:job\s+experience|work\s+experience|customer\s+experience|work\s*history|employment|professional\s+background|professional\s+experience|pengalaman\s+kerja|pengalaman)/i, name: 'experience' },
    { rx: /^(?:skills?|competenc(?:ies|y)|keahlian|kemampuan|expertise)/i, name: 'skills' },
    { rx: /^(?:projects?|project\s+experience|portfolio|proyek)/i, name: 'projects' },
    { rx: /^(?:certification|certifications|certificate|certificates|sertifikasi|sertifikat|licenses?|lisensi)/i, name: 'certification' },
    { rx: /^(?:specialization|specializations|specialis|spesialisasi|area\s+of\s+expertise)/i, name: 'specialization' },
    { rx: /^(?:languages?|bahasa)/i, name: 'languages' },
    { rx: /^(?:awards?|achievements?|honors|penghargaan)/i, name: 'awards' },
    { rx: /^(?:organizations?|membership|organisasi|keanggotaan|affiliation|anggota)/i, name: 'organizations' },
    { rx: /^(?:publications?|research|penelitian|publikasi)/i, name: 'publications' },
    { rx: /^(?:training|trainings|courses?|workshop|pelatihan)/i, name: 'training' },
    { rx: /^(?:volunteer|volunteering|voluntary|relawan)/i, name: 'volunteer' },
    { rx: /^(?:interests?|hobbies?|hobi)/i, name: 'interests' },
    { rx: /^(?:references?|referensi)/i, name: 'references' },
    { rx: /^(?:objective|career\s+objective|summary|professional\s+summary|profil|ringkasan)/i, name: 'summary' },
  ];

  let currentSection: string | null = null;
  const sections: Record<string, string> = {};

  // Log first 20 lines for debugging
  console.log('[CV Parse] First 20 lines:', JSON.stringify(lines.slice(0, 20)));

  for (const line of lines) {
    const clean = line.replace(/^[\s*\-\*#oOK\d.)]*\s*/, '').trim();
    if (!clean || clean.length < 2) continue;
    let matched = false;

    // 1. Primary match: line starts with a known header keyword
    for (const sh of sectionHeaders) {
      if (sh.rx.test(clean)) {
        currentSection = sh.name;
        sections[currentSection] = sections[currentSection] || '';
        matched = true;
        break;
      }
    }

    // 2. Secondary match: line CONTAINS a header keyword as first word (after prefix removal)
    if (!matched) {
      const firstWord = clean.split(/[\s:,;]/)[0]?.toLowerCase() || '';
      for (const sh of sectionHeaders) {
        // Extract the primary keyword from each header pattern
        const primaryKeyword = sh.rx.source.replace(/^\^\(\\?:\\?:?/, '').replace(/\\[bB].*$/, '').split('|')[0].replace(/\\s\+\*/g, '');
        if (firstWord === primaryKeyword.toLowerCase() || firstWord === primaryKeyword.toLowerCase() + 's' || firstWord === primaryKeyword.toLowerCase().replace(/s$/, '')) {
          currentSection = sh.name;
          sections[currentSection] = sections[currentSection] || '';
          matched = true;
          break;
        }
      }
    }

    if (!matched && currentSection && clean.length > 2) {
      sections[currentSection] += (sections[currentSection] ? '\n' : '') + clean;
    }
  }

  // 3. If still no sections found, try aggressive scan  -  look for ANY keyword match in each line
  if (Object.keys(sections).length === 0) {
    console.log('[CV Parse] Primary detection failed, trying aggressive header scan...');
    const nameMap: Record<string, string> = { education: 'education', experience: 'experience', skill: 'skills', certification: 'certification', project: 'projects', language: 'languages', award: 'awards', organization: 'organizations', specialization: 'specialization', training: 'training', summary: 'summary', objective: 'objective' };
    // Build a regex that finds section keywords in running text
    const headerInTextRx = /\b(education|experience|skills?|certification|certifications?|projects?|languages?|awards?|organizations?|specialization|training|summary|objective)\b\s*(?::|-)/i;
    for (const line of lines) {
      const clean = line.replace(/^[\s*\-\*#oOK\d.)]*\s*/, '').trim();
      if (!clean) continue;
      const anyMatch = clean.match(headerInTextRx);
      if (anyMatch) {
        const found = anyMatch[1].toLowerCase().replace(/s$/, '');
        const canonicalName = nameMap[found];
        if (canonicalName) {
          currentSection = canonicalName;
          sections[currentSection] = sections[currentSection] || '';
          const contentAfter = clean.slice(anyMatch.index! + anyMatch[0].length).trim();
          if (contentAfter) {
            sections[currentSection] += contentAfter;
          }
        }
      } else if (currentSection && clean.length > 2) {
        sections[currentSection] += (sections[currentSection] ? '\n' : '') + clean;
      }
    }
  }

  console.log('[CV Parse] Keyword sections detected:', Object.keys(sections));

  // Map experience
  if (sections.experience) {
    const expLines = sections.experience.split('\n').filter(Boolean);
    for (const el of expLines) {
      const companyMatch = el.match(/(?:at|di|@)\s+(.+)/i);
      const dateMatch = el.match(/(\d{4})\s*[-\-to]+\s*(\d{4}|present|now|sekarang)/i);
      fallback.experiences.push({
        position: el.replace(/at\s+.+/i, '').replace(/di\s+.+/i, '').replace(/@\s+.+/i, '').trim(),
        company: companyMatch?.[1]?.trim() || '',
        start_date: dateMatch?.[1] || '',
        end_date: dateMatch?.[2] || '',
        description: '',
      });
    }
  }

  // Map skills  -  flat or categorized
  if (sections.skills) {
    const skillLines = sections.skills.split('\n').filter(Boolean);
    const categoryRx = /^([A-Za-z\s/]+?)[:;]\s*(.+)/;
    const cats: any[] = [];
    for (const sl of skillLines) {
      const cm = sl.match(categoryRx);
      if (cm) {
        cats.push({ title: cm[1].trim(), skills: cm[2].trim() });
      }
    }
    if (cats.length) {
      fallback.skills = cats;
    } else {
      fallback.skills = [{ title: 'Skills', skills: sections.skills.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim() }];
    }
  }

  // Map education
  if (sections.education) {
    const edLines = sections.education.split('\n').filter(Boolean);
    for (const el of edLines) {
      const yearsMatch = el.match(/(\d{4})\s*[-\-]+\s*(\d{4}|present|now)/i);
      fallback.education.push({
        institution: el.replace(/\(?\d{4}[^)]*\)?/g, '').trim(),
        degree: '',
        field: '',
        start_date: yearsMatch?.[1] || '',
        end_date: yearsMatch?.[2] || '',
      });
    }
  }

  // Map certifications
  if (sections.certification) {
    const certLines = sections.certification.split('\n').filter(Boolean);
    for (const cl of certLines) {
      const yearMatch = cl.match(/(\d{4})/);
      fallback.certifications.push({
        name: cl.replace(/\(?\d{4}[^)]*\)?/g, '').trim(),
        issuer: '',
        date: yearMatch?.[1] || '',
      });
    }
  }

  // Map languages
  if (sections.languages) {
    const langLines = sections.languages.split('\n').filter(Boolean);
    for (const ll of langLines) {
      const parts = ll.split(/[:\--]/).map((s: string) => s.trim());
      if (parts.length >= 2) {
        fallback.languages.push({ language: parts[0], proficiency: parts[1] });
      } else {
        fallback.languages.push({ language: ll.trim(), proficiency: '' });
      }
    }
  }

  // Map awards
  if (sections.awards) {
    const awardLines = sections.awards.split('\n').filter(Boolean);
    for (const al of awardLines) {
      const yearMatch = al.match(/(\d{4})/);
      fallback.awards.push({
        title: al.replace(/\(?\d{4}[^)]*\)?/g, '').trim(),
        issuer: '',
        date: yearMatch?.[1] || '',
      });
    }
  }

  // Map organizations
  if (sections.organizations) {
    const orgLines = sections.organizations.split('\n').filter(Boolean);
    for (const ol of orgLines) {
      const roleMatch = ol.match(/as\s+(.+)/i);
      const yearsMatch = ol.match(/(\d{4})\s*[-\-]+\s*(\d{4}|present|now)/i);
      fallback.organizations.push({
        name: ol.replace(/as\s+.+/i, '').replace(/\(?\d{4}[^)]*\)?/g, '').trim(),
        role: roleMatch?.[1]?.trim() || '',
        start_date: yearsMatch?.[1] || '',
        end_date: yearsMatch?.[2] || '',
      });
    }
  }

  // Map projects (including customer_experience content)
  if (sections.projects) {
    const projLines = sections.projects.split('\n').filter(Boolean);
    for (const pl of projLines) {
      // Format: "Title - Customer" or "Title - Customer"
      const [titlePart, ...rest] = pl.split(/[- - -]/).map((s: string) => s.trim());
      const customer = rest.join(' - ').trim();
      const dateMatch = pl.match(/(\d{4})\s*[-\-to]+\s*(\d{4}|present|now|sekarang)/i);
      fallback.projects.push({
        title: titlePart || pl,
        customer: customer || '',
        assignmentBy: '',
        startDate: dateMatch?.[1] || '',
        endDate: dateMatch?.[2] || '',
        status: '',
        description: pl,
        tech_stack: '',
        demo_url: '',
        github_url: '',
      });
    }
  }

  // Map specialization areas
  if (sections.specialization) {
    const specLines = sections.specialization.split('\n').filter(Boolean);
    fallback.specializationAreas = specLines.map((s: string) => s.replace(/^[*\-\*]\s*/, '').trim()).filter(Boolean);
  }

  // Remaining known sections as customSections
  const remaining: Record<string, string> = {
    objective: 'Objective',
    summary: 'Professional Summary',
    publications: 'Publications',
    training: 'Training & Courses',
    volunteer: 'Volunteer Experience',
    interests: 'Interests',
    references: 'References',
  };
  for (const [key, label] of Object.entries(remaining)) {
    if (sections[key]?.trim()) {
      fallback.customSections.push({ title: label, type: 'text', content: { body: sections[key].trim() } });
    }
  }

  // Add debug info to fallback object for logging
  fallback._sectionKeywordsFound = sectionKeywordsFoundInText;
  fallback._sections = sections;

  return fallback;
}

function extractExperienceFromRawText(rawText: string) {
  const compact = rawText.replace(/\s+/g, ' ').trim();
  const match = compact.match(/(?:job\s+experience|work\s+experience|professional\s+experience|employment)([\s\S]*?)(?:\bEducation\b|\bProject\s+Experience\b|\bProjects?\b|\bCertificate\b|\bCertification\b|\bSkills\b)/i);
  if (!match?.[1]) return [];

  const body = match[1];
  const companyMatches = [...body.matchAll(/((?:PT|CV|UD|LLC|Inc\.?|Ltd\.?|Company)\s+[A-Z][A-Za-z0-9&.,\-\s()]+?)(?:,\s*[^|]+)?\s*\|\s*(?:Fulltime|Full-time|Contract|Bootcamp|Internship|Part-time|Online|Hybrid|Onsite)/gi)];
  const experiences: any[] = [];

  for (let i = 0; i < companyMatches.length; i++) {
    const company = companyMatches[i][1].replace(/\s+/g, ' ').trim();
    const start = companyMatches[i].index || 0;
    const end = i + 1 < companyMatches.length ? (companyMatches[i + 1].index || body.length) : body.length;
    const block = body.slice(start, end).replace(/\s+/g, ' ');
    const roleMatches = [...block.matchAll(/([A-Z][A-Za-z/&\-\s]+?)\s+as\s+a\s+(?:Full\s*-?\s*Time|contract|part\s*-?\s*time|bootcamp|internship)[^,]*,\s*([A-Za-z]+\s+\d{4})\s*(?:-|to)\s*([A-Za-z]+\s+\d{4}|Present|Now|Sekarang)/gi)];

    for (let r = 0; r < roleMatches.length; r++) {
      const roleStart = (roleMatches[r].index || 0) + roleMatches[r][0].length;
      const roleEnd = r + 1 < roleMatches.length ? (roleMatches[r + 1].index || block.length) : block.length;
      const description = block.slice(roleStart, roleEnd).replace(/\s*\*\s*/g, '\n* ').trim();
      experiences.push({
        company,
        position: roleMatches[r][1].replace(/\s+/g, ' ').trim(),
        start_date: roleMatches[r][2].trim(),
        end_date: roleMatches[r][3].trim(),
        description,
      });
    }
  }

  return experiences;
}

function estimateConfidence(parsed: any, rawText: string): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 50;
  const low = rawText.toLowerCase();

  if (parsed.about?.name) { score += 10; } else { warnings.push('Nama tidak ditemukan'); }
  if (parsed.contact?.email) { score += 5; } else if (!low.includes('@')) { warnings.push('Email tidak ditemukan'); }
  if (parsed.contact?.phone) { score += 5; }

  // Experience
  const hasExpKeywords = /\b(experience|work|employment|job|pengalaman|bekerja|perusahaan)\b/i.test(rawText);
  if (parsed.experiences?.length) {
    score += Math.min(parsed.experiences.length * 5, 15);
  } else if (hasExpKeywords) {
    warnings.push('Pengalaman kerja terdeteksi di teks tapi gagal diparse');
    score -= 10;
  } else {
    warnings.push('Pengalaman kerja tidak ditemukan di CV');
  }

  // Education
  const hasEduKeywords = /\b(education|university|school|degree|sarjana|s1|s2|s3|pendidikan|universitas)\b/i.test(rawText);
  if (parsed.education?.length) {
    score += 10;
  } else if (hasEduKeywords) {
    warnings.push('Pendidikan terdeteksi di teks tapi gagal diparse');
    score -= 10;
  } else {
    warnings.push('Pendidikan tidak ditemukan di CV');
  }

  // Skills
  const hasSkillKeywords = /\b(skills|skill|keahlian|kemampuan|kompetensi)\b/i.test(rawText);
  if (parsed.skills?.length) {
    score += 5;
  } else if (hasSkillKeywords) {
    warnings.push('Skills terdeteksi di teks tapi gagal diparse');
    score -= 5;
  }

  // Certifications
  const hasCertKeywords = /\b(certification|certificate|certified|sertifikasi|sertifikat|license)\b/i.test(rawText);
  if (parsed.certifications?.length) {
    score += 5;
  } else if (hasCertKeywords) {
    warnings.push('Sertifikasi terdeteksi di teks tapi gagal diparse');
    score -= 5;
  }

  if (rawText.length < 500) warnings.push('Teks yang diekstrak sangat pendek (' + rawText.length + ' chars), format PDF mungkin tidak didukung penuh');

  // Count section keywords found in raw text
  const sectionKeywordChecks = [
    /\b(experience|work|employment|pengalaman)\b/i,
    /\b(education|university|school|pendidikan|universitas)\b/i,
    /\b(skills?|keahlian|kemampuan)\b/i,
    /\b(certification|certificate|sertifikasi|sertifikat)\b/i,
    /\b(specialization|specialis|spesialisasi)\b/i,
    /\b(projects?|portfolio|proyek)\b/i,
    /\b(languages?|bahasa)\b/i,
    /\b(awards?|achievement|penghargaan)\b/i,
    /\b(organizations?|organisasi|anggota)\b/i,
  ];
  const foundKeywordCount = sectionKeywordChecks.filter(r => r.test(rawText)).length;

  // Only cap at 20 if truly no data AND no section keywords found
  const hasAnyData = parsed.about?.name || parsed.education?.length || parsed.experiences?.length ||
    parsed.skills?.length || parsed.certifications?.length || parsed.projects?.length;
  if (!hasAnyData && foundKeywordCount === 0) {
    score = Math.min(score, 20);
    warnings.push('CV tidak dapat diparse secara otomatis. Silakan isi manual.');
  } else if (!hasAnyData && foundKeywordCount > 0) {
    // Section keywords found but parsing failed  -  keep score moderate, don't crash to 20
    score = Math.max(score, 35);
    warnings.push('Section terdeteksi di teks tapi gagal diparse. Lihat raw text debug.');
  }

  return { score: Math.max(score, 5), warnings };
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const formData = await request.formData();
    const file = (formData.get('cv') || formData.get('file')) as File | null;
    if (!file) return errorResponse('No file uploaded', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = '';
    let charsExtracted = 0;

    try {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text?.trim() || '';
    } catch {
      rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ').trim();
    }

    charsExtracted = rawText.length;

    if (!rawText || rawText.length < 50) {
      return errorResponse('PDF text could not be extracted or is too short', 400);
    }

    console.log('[CV Parse] Raw text length:', rawText.length);
    console.log('[CV Parse] Raw text full:\n' + rawText);

    // Try AI parsing via Groq
    let parsed: any = {};
    let aiUsed = false;
    let aiRawResponse = '';
    if (process.env.NINE_ROUTER_API_KEY) {
      try {
        console.log('[CV Parse] Calling Groq AI...');
        const promptText = `You are a universal CV parser for ALL professions (doctor, lawyer, teacher, developer, designer, accountant, nurse, etc.).
Return ONLY valid JSON  -  no explanation, no markdown.

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
- "skills" = technical skills, soft skills, competencies (group by category if possible)
- "certifications" = certificates, licenses, professional certifications, training completion
- "specializationAreas" = areas of expertise, specialization, fields of practice (e.g. "Cardiology", "Corporate Law", "React Development")
- "languages" = human languages with proficiency level
- "awards" = achievements, honors, recognitions
- "organizations" = professional memberships, associations, organizational affiliations
- "customSections" = anything that doesn't fit above: publications, volunteer, interests, references, etc.
- "Customer Experience" sections: each entry is a project  -  put them in projects[], NOT in customSections
- Projects with same title but different customers: set different "customer" field values, DO NOT merge them into one

EXAMPLES:
- Doctor: experiences = hospitals/clinics, education = medical school, certifications = medical license, specializationAreas = cardiology
- Lawyer: experiences = law firms, education = law school, certifications = bar admission, specializationAreas = corporate law
- Teacher: experiences = schools, education = teaching degree, certifications = teaching license
- Developer: experiences = tech companies, skills = programming languages, projects = apps/websites

Fill as much as possible. Use empty strings for missing fields. Keep arrays empty if no data.

CV:
${rawText.substring(0, 15000)}`;

        console.log('[CV Parse] Nine Router API key present:', !!process.env.NINE_ROUTER_API_KEY);
        const completion = await groq.chat.completions.create({
          model: process.env.NINE_ROUTER_MODEL || 'Projects',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.1,
          max_tokens: 8000,
        });

        const aiText = completion.choices?.[0]?.message?.content || '';
        aiRawResponse = aiText;
        console.log('[CV Parse] Nine Router response length:', aiText.length);
        console.log('[CV Parse] Nine Router raw response:\n' + aiText);
        if (aiText) {
          try {
            parsed = repairJson(aiText);
            console.log('[CV Parse] repairJson success, parsed keys:', Object.keys(parsed));
            aiUsed = true;
          } catch (repairErr: any) {
            console.error('[CV Parse] repairJson failed:', repairErr.message, 'response was:', aiText);
          }
        } else {
          console.error('[CV Parse] Groq returned empty response');
        }
      } catch (aiErr: any) {
        const status = aiErr.status || aiErr.code || 'unknown';
        const message = aiErr.message || String(aiErr);
        console.error(`[CV Parse] Nine Router API error [${status}]: ${message}`);
        if (aiErr.response?.data) {
          console.error('[CV Parse] Groq error details:', JSON.stringify(aiErr.response.data));
        }
        if (status === 401) console.error('[CV Parse] NINE_ROUTER_API_KEY invalid or missing');
        else if (status === 429) console.error('[CV Parse] Rate limited by Groq');
        else if (status === 400) console.error('[CV Parse] Bad request to Groq (model error?)');
      }
    } else {
      console.log('[CV Parse] NINE_ROUTER_API_KEY not set, skipping AI');
    }

    // Keyword extraction  -  ALWAYS run as supplement (not just fallback)
    const keywordResult = extractByKeyword(rawText);

    // Merge strategy:
    // 1. If AI failed entirely, use keyword result as base
    // 2. Always supplement: keyword result fills any section AI missed or returned empty
    if (!aiUsed || !parsed.about?.name) {
      parsed = { ...keywordResult, ...parsed, about: { ...keywordResult.about, ...parsed.about }, contact: { ...keywordResult.contact, ...parsed.contact } };
    } else {
      // Supplement EVERY section  -  keyword result adds to what AI found
      for (const key of ['experiences', 'education', 'skills', 'projects', 'certifications', 'specializationAreas', 'languages', 'awards', 'organizations', 'customSections']) {
        const aiArr = parsed[key] || [];
        const kwArr = keywordResult[key] || [];
        if (kwArr.length > 0 && aiArr.length === 0) {
          parsed[key] = kwArr;
        } else if (kwArr.length > 0 && aiArr.length > 0) {
          // Merge: add keyword items that don't duplicate AI items
          const aiTitles = new Set(aiArr.map((item: any) => JSON.stringify(item)));
          for (const kwItem of kwArr) {
            if (!aiTitles.has(JSON.stringify(kwItem))) {
              aiArr.push(kwItem);
            }
          }
          parsed[key] = aiArr;
        }
      }
      // Fill missing about/contact from keyword result
      if (!parsed.about?.name && keywordResult.about?.name) parsed.about = { ...keywordResult.about, ...parsed.about };
      if (!parsed.contact?.email && keywordResult.contact?.email) parsed.contact = { ...parsed.contact, ...keywordResult.contact };
    }

    // Ensure all fields exist
    const defaultFields = { experiences: [], education: [], skills: [], projects: [], certifications: [], specializationAreas: [], languages: [], awards: [], organizations: [], customSections: [] };
    for (const [key, val] of Object.entries(defaultFields)) {
      if (!parsed[key]) parsed[key] = val;
    }
    if (!parsed.about) parsed.about = { name: '', title: '', bio: '' };
    if (!parsed.hero) parsed.hero = { headline: '', subheadline: '' };
    if (!parsed.contact) parsed.contact = { email: '', phone: '', location: '', linkedin: '', website: '' };

    if (!parsed.experiences?.length) {
      const rawExperiences = extractExperienceFromRawText(rawText);
      if (rawExperiences.length) {
        parsed.experiences = rawExperiences;
        console.log(`[CV Parse] Raw text experience fallback extracted ${rawExperiences.length} items`);
      }
    }

    // Post-processing: dedup customSections that overlap with main sections
    const mainTextSet = new Set<string>();
    for (const key of ['experiences', 'projects', 'education', 'skills', 'certifications', 'specializationAreas', 'languages', 'awards', 'organizations']) {
      for (const item of (parsed[key] || [])) {
        const texts = [item.title, item.name, item.area, item.position, item.company, item.institution, item.description, item.skills].filter(Boolean);
        for (const t of texts) mainTextSet.add(String(t).toLowerCase().trim().slice(0, 300));
      }
    }
    parsed.customSections = (parsed.customSections || []).filter((cs: any) => {
      const body = typeof cs.content?.body === 'string' ? cs.content.body.toLowerCase().trim() : '';
      if (!body) return true;
      for (const mainText of mainTextSet) {
        if (mainText.length > 15 && body.includes(mainText)) return false;
      }
      return true;
    });

    // Post-processing: dedup project titles  -  append customer for uniqueness
    const titleGroups: Record<string, any[]> = {};
    for (const p of (parsed.projects || [])) {
      if (p.title) {
        titleGroups[p.title] = titleGroups[p.title] || [];
        titleGroups[p.title].push(p);
      }
    }
    for (const [title, items] of Object.entries(titleGroups)) {
      if (items.length > 1) {
        for (const item of items) {
          if (item.customer) {
            item.title = `${title}  -  ${item.customer}`;
          }
        }
      }
    }

    // Confidence & warnings
    const { score, warnings } = estimateConfidence(parsed, rawText);
    parsed.confidence = score;
    parsed.warnings = warnings;

    // Detect which section keywords exist in raw text (for debugging)
    const sectionKeywordsFound: string[] = [];
    const allChecks = [
      /\b(experience|work|employment|pengalaman)\b/i,
      /\b(education|university|school|pendidikan|universitas)\b/i,
      /\b(skills|keahlian|kemampuan)\b/i,
      /\b(certification|certificate|sertifikasi|sertifikat)\b/i,
      /\b(specialization|specialis|spesialisasi)\b/i,
      /\b(project|portfolio|proyek)\b/i,
      /\b(languages?|bahasa)\b/i,
      /\b(awards?|achievement|penghargaan)\b/i,
      /\b(organization|organisasi|anggota)\b/i,
      /\b(training|course|pelatihan)\b/i,
    ];
    const sectionNames = ['Experience', 'Education', 'Skills', 'Certification', 'Specialization', 'Projects', 'Languages', 'Awards', 'Organizations', 'Training'];
    for (let i = 0; i < allChecks.length; i++) {
      if (allChecks[i].test(rawText)) sectionKeywordsFound.push(sectionNames[i]);
    }

    // Strip internal debug keys from parsed data before sending
    delete parsed._sectionKeywordsFound;
    delete parsed._sections;

    // Include full raw text and section split debug
    const sectionDebug = keywordResult?._sections || {};
    const kwSectionKeys = keywordResult?._sectionKeywordsFound || [];

    return successResponse({
      success: true,
      data: sanitizeJson(parsed),
      chars_extracted: charsExtracted,
      raw_text_preview: rawText.substring(0, 4000),
      raw_text_full: rawText,  // always send full text
      raw_text_length: rawText.length,
      ai_used: aiUsed,
      ai_raw_response: aiRawResponse || undefined,
      section_keywords_found: sectionKeywordsFound,
      section_debug: {
        keyword_fallback_sections: Object.keys(keywordResult).filter(k => !k.startsWith('_')),
        raw_sections_found: kwSectionKeys,
        keyword_section_splits: sectionDebug,
      },
    });
  } catch (err: any) { return errorResponse(err.message); }
}





