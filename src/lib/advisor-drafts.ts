/**
 * Advisor drafts: the sections the Advisor may write for a user, the shape of each draft, and the
 * checks both the generate route (on model output) and the apply route (on what the client sends
 * back) run before anything is shown or saved.
 *
 * Only sections that can be written from the user's own data are drafted. Experience, projects,
 * testimonials, certificates and contact details have to be real, so the Advisor never invents them.
 */

export const DRAFTABLE_SECTIONS = ['bio', 'hero', 'skills', 'services'] as const;
export type DraftSection = (typeof DRAFTABLE_SECTIONS)[number];

export type BioDraft = { bio: string };
export type HeroDraft = { headline: string; subheadline: string };
export type SkillsDraft = { categories: { title: string; skills: string }[] };
export type ServicesDraft = { title: string; description: string }[];
export type Draft = BioDraft | HeroDraft | SkillsDraft | ServicesDraft;

export const isDraftSection = (s: string): s is DraftSection => (DRAFTABLE_SECTIONS as readonly string[]).includes(s);

/** Why a section is not drafted, shown to the user instead of a suggestion. */
export const NOT_DRAFTED: Record<string, string> = {
  experience: 'Work experience has to be your real history, so the Advisor won\'t write it. Add it in the Builder, then ask the Advisor to improve the wording.',
  projects: 'Projects have to be work you actually did, so the Advisor won\'t invent one. Add it in the Builder, or import it from GitHub.',
  testimonials: 'Testimonials have to come from real people, so the Advisor won\'t write them. Ask a client or colleague for a short quote and add it in the Builder.',
  gallery: 'Certificates have to be ones you actually hold, so the Advisor won\'t make them up. Add yours in the Builder. You can ask the Advisor which certificates are worth getting.',
  contact: 'Contact details have to be yours, so fill them in in the Builder.',
};

const LIMITS = { bio: 1200, headline: 120, subheadline: 300, categoryTitle: 60, skill: 40, skillsPerCategory: 15, categories: 6, serviceTitle: 80, serviceDescription: 400, services: 6 };

const line = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');
const stripMarkdown = (s: string) => s.replace(/\*\*|__|`/g, '').replace(/^#+\s*/gm, '');

/** Splits a skills value (comma list or array) into unique, trimmed names. */
export function splitSkills(value: unknown): string[] {
  const parts = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const name = line(typeof p === 'string' ? stripMarkdown(p) : '', LIMITS.skill);
    if (name && !seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); out.push(name); }
  }
  return out;
}

/** Validates and trims a draft for a section; returns null when nothing usable is left. */
export function normalizeDraft(section: DraftSection, raw: unknown): Draft | null {
  const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  switch (section) {
    case 'bio': {
      const bio = text(typeof raw === 'string' ? raw : obj.bio, LIMITS.bio);
      return bio ? { bio: stripMarkdown(bio) } : null;
    }
    case 'hero': {
      const headline = stripMarkdown(line(obj.headline, LIMITS.headline));
      const subheadline = stripMarkdown(line(obj.subheadline, LIMITS.subheadline));
      return headline ? { headline, subheadline } : null;
    }
    case 'skills': {
      const list = Array.isArray(obj.categories) ? obj.categories : Array.isArray(raw) ? raw : [];
      const categories = list
        .map((c) => {
          const rec = c && typeof c === 'object' ? (c as Record<string, unknown>) : {};
          return { title: stripMarkdown(line(rec.title, LIMITS.categoryTitle)), skills: splitSkills(rec.skills).slice(0, LIMITS.skillsPerCategory).join(', ') };
        })
        .filter((c) => c.title && c.skills)
        .slice(0, LIMITS.categories);
      return categories.length ? { categories } : null;
    }
    case 'services': {
      const list = Array.isArray(raw) ? raw : Array.isArray(obj.services) ? obj.services : [];
      const services = list
        .map((s) => {
          const rec = s && typeof s === 'object' ? (s as Record<string, unknown>) : {};
          return { title: stripMarkdown(line(rec.title, LIMITS.serviceTitle)), description: stripMarkdown(line(rec.description, LIMITS.serviceDescription)) };
        })
        .filter((s) => s.title && s.description)
        .slice(0, LIMITS.services);
      return services.length ? services : null;
    }
  }
}

/**
 * Pulls the first complete JSON object or array out of a model reply. Models wrap it in ``` fences
 * or add prose before and after (which may itself contain brackets), so the value is found by
 * matching brackets outside of strings rather than by the first and last bracket in the text.
 */
export function parseModelJson(reply: string): unknown {
  const text = reply.replace(/```(?:json)?/gi, '');
  const nextOpen = (from: number) => {
    for (let i = from; i < text.length; i++) if (text[i] === '{' || text[i] === '[') return i;
    return -1;
  };
  // Try each opening bracket in turn until one starts a value that parses
  for (let start = nextOpen(0); start >= 0; start = nextOpen(start + 1)) {
    let depth = 0;
    let inString = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        if (ch === '\\') i++;
        else if (ch === '"') inString = false;
      } else if (ch === '"') inString = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') {
        if (--depth === 0) {
          try { return JSON.parse(text.slice(start, i + 1)); } catch { break; }
        }
      }
    }
  }
  return null;
}

/** Instruction and expected JSON shape for each draftable section. */
export const DRAFT_PROMPTS: Record<DraftSection, string> = {
  bio: 'Write a professional "About" bio of 2 to 3 sentences, first person.\nReturn JSON: {"bio": "…"}',
  hero: 'Write a hero headline (at most 10 words) and a one-sentence subheadline.\nReturn JSON: {"headline": "…", "subheadline": "…"}',
  skills: 'Group the skills, tools and technologies that appear in the data into 2 to 5 categories.\nReturn JSON: {"categories": [{"title": "Category", "skills": "Skill A, Skill B"}]}',
  services: 'Suggest 3 to 5 services this person can offer, based on their actual experience and projects.\nReturn JSON: [{"title": "…", "description": "One sentence."}]',
};

export const DRAFT_RULES = `You write portfolio content from the person's own data, given below as JSON.
Rules:
- Use only facts present in the data. Never invent employers, clients, job titles, certificates, awards, years or numbers.
- If the data is thin, keep the text short and general rather than making things up.
- Write in the same language as the existing portfolio text (English if there is none).
- Plain text inside the JSON: no markdown, no emoji.
- Reply with the JSON only.`;
