'use client';
import { useState, useRef, useEffect } from 'react';
import api, { initAuth, getToken } from '@/lib/api';

interface GeneratedSkillCategory {
  title?: string;
  skills?: string;
}

interface GeneratedListItem {
  icon?: string;
  title?: string;
  description?: string;
  message?: string;
  name?: string;
  position?: string;
}

interface GeneratedObject {
  categories?: GeneratedSkillCategory[];
  bio?: string;
  headline?: string;
  subheadline?: string;
  title?: string;
  description?: string;
  tech_stack?: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/** Payload returned by /api/advisor/generate/[section] under "generated". */
type GeneratedPayload = GeneratedObject | GeneratedListItem[];

interface GeneratedResult {
  section: string;
  data: GeneratedPayload;
  previewText: string;
}

type PreviewData = GeneratedPayload | GeneratedResult[] | null;

interface AdvisorStreamEvent {
  score?: number;
  total?: number;
  token?: string;
  done?: boolean;
}

interface ExistingSectionFlags {
  hasBio?: boolean;
  hasHero?: boolean;
  hasSkills?: boolean;
  hasExperience?: boolean;
  hasProjects?: boolean;
  hasServices?: boolean;
  hasTestimonials?: boolean;
  hasCertificates?: boolean;
  hasContact?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** "notice" = a plain system message (AI unavailable, errors), rendered differently from an answer. */
  tone?: 'notice';
  preview?: { section: string; data: PreviewData };
}

function asObject(payload: GeneratedPayload): GeneratedObject {
  return Array.isArray(payload) ? {} : payload;
}

/** The generate endpoint is expected to return `{ generated }`; anything else (an SSE string, an error) means it isn't available. */
function isGeneratedPayload(value: unknown): value is GeneratedPayload {
  return !!value && typeof value === 'object';
}

/** Fallback text /api/advisor sends when its own upstream request fails. */
const SERVER_FAILURE = /^sorry, something went wrong\.?$/i;
const AI_UNAVAILABLE = "Advisor can't answer right now: the AI service isn't set up or is unavailable. You can still fill in every section by hand in the Builder.";
const GENERATE_UNAVAILABLE = "Auto-fill isn't available for this section (the AI service isn't active). Fill it in by hand in the Builder.";

const ALL_SUGGESTED = [
  'Fill all my empty sections',
  'Analyze my portfolio',
  'Fill in my skills section',
  'Generate testimonials for my portfolio',
  'Suggest certificates for me',
  'Generate my experience',
  'Generate my bio',
  'Create a hero section',
  'Generate my services',
  'Suggest experience for me',
  'Generate a project for my portfolio',
  "What's missing from my portfolio?",
  'How do I make my portfolio stand out?',
  'Tips for the contact section',
  'How do I get testimonials?',
  'What makes a good portfolio design?',
  'How can recruiters find my portfolio?',
  'What should a good bio include?',
];

const pickSuggestions = () => [...ALL_SUGGESTED].sort(() => Math.random() - 0.5).slice(0, 4);

export default function AdvisorWidget({ inline = false }: { inline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'I can check how complete your portfolio is, suggest what to add, and help fill in some sections.\n\nUse the button below to check your portfolio, or ask a question.', preview: { section: 'boom', data: null } }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [score, setScore] = useState<{score: number, total: number} | null>(null);
  // Shuffle and take 4; reshuffled whenever a new reply starts.
  const [suggested, setSuggested] = useState(pickSuggestions);
  const reshuffleSuggestions = () => setSuggested(pickSuggestions());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Detect section intent from the message
  const detectSection = (msg: string): string | null => {
    const lower = msg.toLowerCase();
    if (lower.includes('skill')) return 'skills';
    if (lower.includes('bio') || lower.includes('tentang') || lower.includes('about')) return 'bio';
    if (lower.includes('hero') || lower.includes('headline')) return 'hero';
    if (lower.includes('service') || lower.includes('layanan')) return 'services';
    if (lower.includes('experience') || lower.includes('pengalaman')) return 'experience';
    if (lower.includes('project') || lower.includes('proyek')) return 'projects';
    if (lower.includes('testimoni') || lower.includes('testimonial')) return 'testimonials';
    if (lower.includes('sertifikat') || lower.includes('certificate') || lower.includes('certif')) return 'gallery';
    if (lower.includes('kerja')) return 'experience';
    return null;
  };

  const isAutoFillAll = (msg: string): boolean => {
    const lower = msg.toLowerCase();
    return lower.includes('rapihkan') || lower.includes('lengkapi semua') ||
           lower.includes('boom') || lower.includes('isi semua') ||
           lower.includes('complete all') || lower.includes('fill all') ||
           lower.includes('auto fill') || lower.includes('autofill');
  };

  const replaceLast = (msg: Message) => setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1] = msg;
    return updated;
  });

  const generateSection = async (section: string) => {
    reshuffleSuggestions();
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: `Drafting the ${section} section…`, tone: 'notice' }]);
    try {
      if (!getToken()) await initAuth();
      const res = await api.post<{ generated?: unknown }>(`/api/advisor/generate/${section}`);
      const generated = res.data?.generated;
      if (!isGeneratedPayload(generated)) {
        replaceLast({ role: 'assistant', content: GENERATE_UNAVAILABLE, tone: 'notice' });
        return;
      }
      const obj = asObject(generated);

      let previewText = '';
      if (section === 'skills' && obj.categories) {
        previewText = obj.categories.map((c) => `**${c.title}:** ${c.skills}`).join('\n');
      } else if (section === 'bio') {
        previewText = obj.bio || '';
      } else if (section === 'hero') {
        previewText = `**Headline:** ${obj.headline}\n**Subheadline:** ${obj.subheadline}`;
      } else if (section === 'services') {
        if (!Array.isArray(generated)) throw new Error('Unexpected services payload');
        previewText = generated.map((s) => `**${s.title}:** ${s.description}`).join('\n');
      }

      replaceLast({
        role: 'assistant',
        content: `Suggestion for **${section}**:\n\n${previewText}\n\nIf it looks right, save it to your portfolio.`,
        preview: { section, data: generated },
      });
    } catch {
      replaceLast({ role: 'assistant', content: GENERATE_UNAVAILABLE, tone: 'notice' });
    } finally {
      setLoading(false);
    }
  };

  const applySection = async (section: string, data: PreviewData, msgIndex: number) => {
    setApplying(section);
    try {
      // "boom" = check and fill everything
      if (section === 'boom') {
        setApplying(null);
        await generateAll();
        return;
      }
      if (section === 'all' && Array.isArray(data)) {
        let failed = 0;
        for (const item of data as GeneratedResult[]) {
          try {
            await api.post(`/api/advisor/apply/${item.section}`, { data: item.data });
          } catch { failed++; }
        }
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = {
            ...updated[msgIndex],
            content: updated[msgIndex].content + (failed
              ? `\n\n${failed} section(s) could not be saved. Fill them in by hand in the Builder.`
              : '\n\n**All sections saved.** Refresh the preview to see them.'),
            preview: undefined
          };
          return updated;
        });
        setApplying(null);
        return;
      }
      await api.post(`/api/advisor/apply/${section}`, { data });
      setMessages(prev => {
        const updated = [...prev];
        updated[msgIndex] = {
          ...updated[msgIndex],
          content: updated[msgIndex].content + '\n\n**Saved.** Refresh the preview to see the change.',
          preview: undefined
        };
        return updated;
      });
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not save. Try again, or fill in this section by hand in the Builder.', tone: 'notice' }]);
    } finally {
      setApplying(null);
    }
  };

  const generateAll = async () => {
    reshuffleSuggestions();
    setLoading(true);
    // Check what already exists first
    let existingData: ExistingSectionFlags = {};
    try {
      const [aboutRes, heroRes, skillsRes, expRes, projRes] = await Promise.all([
        api.get('/api/about'),
        api.get('/api/hero'),
        api.get('/api/skills'),
        api.get('/api/experience'),
        api.get('/api/projects'),
      ]);
      existingData = {
        hasBio: !!(aboutRes.data?.bio),
        hasHero: !!(heroRes.data?.headline),
        hasSkills: !!(skillsRes.data?.length),
        hasExperience: !!(expRes.data?.length),
        hasProjects: !!(projRes.data?.length),
      };
    } catch {}

    const allSections = ['bio', 'hero', 'skills', 'services', 'projects', 'experience', 'testimonials', 'gallery', 'contact'];

    // Only generate optional sections; important ones are listed for the user to fill.
    const importantSections = ['bio', 'hero', 'experience', 'skills', 'projects', 'contact'];

    const missingSections: string[] = [];
    const sectionsToGenerate = allSections.filter(s => {
      if (s === 'bio' && existingData.hasBio) return false;
      if (s === 'hero' && existingData.hasHero) return false;
      if (s === 'skills' && existingData.hasSkills) return false;
      if (s === 'experience' && existingData.hasExperience) return false;
      if (s === 'projects' && existingData.hasProjects) return false;
      if (s === 'services' && existingData.hasServices) return false;
      if (s === 'testimonials' && existingData.hasTestimonials) return false;
      if (s === 'gallery' && existingData.hasCertificates) return false;
      if (s === 'contact' && existingData.hasContact) return false;
      if (importantSections.includes(s)) {
        missingSections.push(s);
        return false;
      }
      return true;
    });

    const sectionLabels: Record<string,string> = {
      bio: 'Bio/About', hero: 'Hero Headline', experience: 'Work Experience',
      skills: 'Skills', projects: 'Projects', contact: 'Contact'
    };

    if (sectionsToGenerate.length === 0 && missingSections.length === 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Every portfolio section is filled in.\n\nWant help improving one? Try something like "improve my bio".'
      }]);
      setLoading(false);
      return;
    }

    if (missingSections.length > 0) {
      const missingLabels = missingSections.map(s => `* **${sectionLabels[s] || s}**`).join('\n');
      const dummyMsg = sectionsToGenerate.length > 0 ? `\n\nMeanwhile, I'll draft examples for the optional sections that are still empty.` : '';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Key sections still empty:**\n\n${missingLabels}\n\nFill these in the Builder with your real details.${dummyMsg}`
      }]);
      if (sectionsToGenerate.length === 0) {
        setLoading(false);
        return;
      }
    }

    const skipped = allSections.filter(s => !sectionsToGenerate.includes(s));
    const skipMsg = skipped.length > 0 ? `\n\nAlready filled (skipped): ${skipped.join(', ')}` : '';

    setMessages(prev => [...prev, {
      role: 'assistant',
      tone: 'notice',
      content: `Drafting ${sectionsToGenerate.length} sections…${skipMsg}`
    }]);

    const results: GeneratedResult[] = [];

    for (const section of sectionsToGenerate) {
      try {
        if (!getToken()) await initAuth();
        const res = await api.post<{ generated?: unknown }>(`/api/advisor/generate/${section}`);
        const generated = res.data?.generated;
        if (!isGeneratedPayload(generated)) continue;
        const obj = asObject(generated);

        let previewText = '';
        if (section === 'skills' && obj.categories) {
          previewText = obj.categories.map((c) => `**${c.title}:** ${c.skills}`).join('\n');
        } else if (section === 'bio') {
          previewText = obj.bio || '';
        } else if (section === 'hero') {
          previewText = `**Headline:** ${obj.headline}\n**Subheadline:** ${obj.subheadline}`;
        } else if (section === 'services') {
          previewText = Array.isArray(generated) ? generated.map((s) => `**${s.title}:** ${s.description}`).join('\n') : '';
        } else if (section === 'projects') {
          previewText = `**${obj.title}**\n${obj.description}\nTech: ${obj.tech_stack}`;
        } else if (section === 'experience') {
          previewText = `**${obj.position}** at ${obj.company}\n${obj.description}`;
        } else if (section === 'testimonials') {
          previewText = Array.isArray(generated) ? generated.map((t) => `"${t.message}" — **${t.name}**, ${t.position}`).join('\n\n') : '';
        } else if (section === 'gallery') {
          previewText = Array.isArray(generated) ? generated.map((g) => `**${g.title}**\n${g.description}`).join('\n\n') : '';
        } else if (section === 'contact') {
          previewText = [obj.email, obj.phone, obj.location].filter(Boolean).join('\n');
        }
        results.push({ section, data: generated, previewText });
      } catch {}
    }

    if (results.length === 0) {
      // Before, this still said "everything generated" and showed an apply button for nothing.
      setMessages(prev => [...prev, { role: 'assistant', content: GENERATE_UNAVAILABLE, tone: 'notice' }]);
      setLoading(false);
      return;
    }

    const summaryText = results.map(r => `**${r.section === 'gallery' ? 'CERTIFICATE' : r.section.toUpperCase()}:**\n${r.previewText}`).join('\n\n---\n\n');

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Suggestions for ${results.length} sections:\n\n${summaryText}\n\nCheck them, then save them all to your portfolio.`,
      preview: { section: 'all', data: results }
    }]);
    setLoading(false);
  };

  const sendMessage = async (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    if (isAutoFillAll(userMsg)) {
      await generateAll();
      return;
    }

    const section = detectSection(userMsg);
    const isGenerateIntent = userMsg.toLowerCase().includes('isi') ||
      userMsg.toLowerCase().includes('generate') ||
      userMsg.toLowerCase().includes('buat') ||
      userMsg.toLowerCase().includes('create') ||
      userMsg.toLowerCase().includes('tambah') ||
      userMsg.toLowerCase().includes('fill');

    if (section && isGenerateIntent) {
      await generateSection(section);
      return;
    }

    reshuffleSuggestions();
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let fullContent = '';
    try {
      if (!getToken()) await initAuth();
      const token = getToken();
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: userMsg, history: messages.filter(m => m.tone !== 'notice').slice(-6).map(({ role, content }) => ({ role, content })) })
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const rawLines = buffer.split('\n');
        buffer = rawLines.pop() || '';
        for (const line of rawLines.filter(l => l.startsWith('data: '))) {
          try {
            const json: AdvisorStreamEvent = JSON.parse(line.slice(6));
            if (json.score !== undefined) setScore({ score: json.score, total: json.total as number });
            if (json.token) {
              fullContent += json.token;
              const snapshot = fullContent;
              replaceLast({ role: 'assistant', content: snapshot });
            }
            if (json.done) setLoading(false);
          } catch {}
        }
      }
      // The route streams nothing when the AI key is missing, and a canned "Sorry…" token when the upstream call throws.
      if (!fullContent.trim() || SERVER_FAILURE.test(fullContent.trim())) replaceLast({ role: 'assistant', content: AI_UNAVAILABLE, tone: 'notice' });
    } catch {
      replaceLast({ role: 'assistant', content: fullContent ? `${fullContent}\n\n(The answer was cut off.)` : AI_UNAVAILABLE, tone: fullContent ? undefined : 'notice' });
    } finally {
      setLoading(false);
    }
  };

  const scorePercent = score && score.total ? Math.round(score.score / score.total * 100) : null;

  const renderContent = (text: string) => {
    // Render **bold** as React elements (no raw HTML from LLM output)
    return text.split('\n').map((line, i) => {
      if (!line) return <div key={i} className="h-2" aria-hidden="true" />;
      if (line.trim() === '---') return <hr key={i} className="my-2 border-rule" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i}>
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part))}
        </p>
      );
    });
  };

  const last = messages[messages.length - 1];

  return (
    <div className={`flex h-full flex-col bg-paper text-ink ${inline ? '' : 'min-h-0'}`}>
      <header className="flex flex-shrink-0 flex-wrap items-end justify-between gap-3 border-b border-rule px-5 py-4 sm:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Advisor</h2>
          <p className="mt-0.5 text-sm text-ink-soft">Suggestions for completing your portfolio. Answers are AI-generated; check them before saving.</p>
        </div>
        {scorePercent !== null && (
          <div className="flex items-center gap-3" aria-label={`Portfolio ${scorePercent} percent complete`}>
            <span className="text-xs text-ink-soft">Completeness</span>
            <div className="h-1 w-28 overflow-hidden rounded-full bg-paper-deep">
              <div className="h-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${scorePercent}%` }} />
            </div>
            <span className="font-mono text-sm tabular-nums">{scorePercent}%</span>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8">
          {messages.map((msg, i) => {
            if (msg.role === 'assistant' && !msg.content && loading && i === messages.length - 1) return null;
            return (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                ) : msg.tone === 'notice' ? (
                  <div role="status" className="max-w-[90%] rounded-md border border-rule bg-paper-deep px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">{msg.content}</div>
                ) : (
                  <div className="max-w-[90%]">
                    <p className="mb-1 text-xs font-medium text-ink-soft">Advisor</p>
                    <div className="border-l-2 border-rule pl-3.5 text-sm leading-relaxed">{renderContent(msg.content)}</div>
                    {msg.preview && (
                      <button
                        type="button"
                        onClick={() => applySection(msg.preview!.section, msg.preview!.data, i)}
                        disabled={applying !== null || loading}
                        className="mt-3 ml-3.5 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
                        {applying !== null ? 'Saving…' : msg.preview.section === 'all' ? 'Save all to portfolio' : msg.preview.section === 'boom' ? 'Check my portfolio' : 'Save to portfolio'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && last?.role === 'assistant' && last.content === '' && (
            <p className="text-[13px] text-ink-soft" role="status">Advisor is writing…</p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions + input */}
      <div className="flex-shrink-0 border-t border-rule bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-4 sm:px-8">
          {!loading && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {suggested.map(q => (
                <button key={q} type="button" onClick={() => sendMessage(q)}
                  className="rounded-md border border-rule bg-white px-2.5 py-1 text-[13px] text-ink-soft transition-colors hover:border-ink-soft hover:text-ink">
                  {q}
                </button>
              ))}
            </div>
          )}
          <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <label htmlFor="advisor-input" className="sr-only">Question for the Advisor</label>
            <input id="advisor-input" ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={'e.g. "What\'s missing from my portfolio?"'}
              disabled={loading}
              className="min-w-0 flex-1 rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:opacity-60"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="shrink-0 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Waiting…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
