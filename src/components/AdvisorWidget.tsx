'use client';
import { useState, useRef, useEffect } from 'react';
import api, { initAuth, getToken } from '@/lib/api';
import MessageText, { ElapsedSeconds } from '@/components/MessageText';
import { clearAdvisorChats, loadAdvisorChat, saveAdvisorChat } from '@/lib/advisor-chat-store';

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
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** "notice" = a plain system message (AI unavailable, errors), rendered differently from an answer. */
  tone?: 'notice';
  preview?: { section: string; data: PreviewData };
  /** Still being written (streaming answer, "Drafting…" notice): never stored, so leaving mid-answer keeps no half reply. */
  pending?: true;
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
  'Suggest certificates for me',
  'Generate my bio',
  'Create a hero section',
  'Generate my services',
  'Suggest experience for me',
  "What's missing from my portfolio?",
  'How do I make my portfolio stand out?',
  'Tips for the contact section',
  'How do I get testimonials?',
  'What makes a good portfolio design?',
  'How can recruiters find my portfolio?',
  'What should a good bio include?',
];

/** The message an API error carries (e.g. why a section is not drafted), if any. */
function apiErrorMessage(err: unknown): string | null {
  const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof msg === 'string' && msg && msg !== 'Unauthorized' ? msg : null;
}

const pickSuggestions =() => [...ALL_SUGGESTED].sort(() => Math.random() - 0.5).slice(0, 4);

const SERVICES_HIDDEN_HINT = 'Services is not on your portfolio yet. In the Builder, use **Add section → Services** to show it.';

const GREETING: Message = { role: 'assistant', content: 'I can check how complete your portfolio is, suggest what to add, and help fill in some sections.\n\nUse the button below to check your portfolio, or ask a question.', preview: { section: 'boom', data: null } };

interface AdvisorWidgetProps {
  inline?: boolean;
  /** Dashboard only: keeps this account's conversation for the browser tab (see advisor-chat-store). */
  userId?: number;
  /** Dashboard only: whether the Services section is in the layout and turned on. */
  servicesInLayout?: boolean;
  /** Dashboard only: puts the Services section on the page after services were saved. */
  onServicesSaved?: () => void;
}

export default function AdvisorWidget({ inline = false, userId, servicesInLayout, onServicesSaved }: AdvisorWidgetProps) {
  // Read once on mount: the conversation from earlier in this browser tab, if any.
  const [restored] = useState(() => loadAdvisorChat<Message>(userId));
  const [messages, setMessages] = useState<Message[]>(() => restored?.messages ?? [GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [score, setScore] = useState<{score: number, total: number} | null>(() => restored?.score ?? null);
  // Shuffle and take 4; reshuffled whenever a new reply starts.
  const [suggested, setSuggested] = useState(pickSuggestions);
  const reshuffleSuggestions = () => setSuggested(pickSuggestions());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstScroll = useRef(true);
  const streamAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    // Jump straight to the end of a restored conversation; animate only for new messages.
    messagesEndRef.current?.scrollIntoView({ behavior: firstScroll.current ? 'auto' : 'smooth', block: 'end' });
    firstScroll.current = false;
  }, [messages]);

  useEffect(() => {
    if (userId === undefined) return;
    const done = messages.filter((m) => !m.pending);
    if (done.length === 1 && done[0] === GREETING && !score) clearAdvisorChats(userId);
    else saveAdvisorChat(userId, { messages: done, score });
  }, [messages, score, userId]);

  // Leaving the Advisor mid-answer stops reading the stream; the half answer isn't kept (see `pending`).
  useEffect(() => () => streamAbort.current?.abort(), []);

  const clearChat = () => {
    setMessages([GREETING]);
    setScore(null);
    clearAdvisorChats(userId);
    inputRef.current?.focus();
  };

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

  const previewTextFor = (section: string, generated: GeneratedPayload): string => {
    const obj = asObject(generated);
    if (section === 'skills') return (obj.categories || []).map((c) => `**${c.title}:** ${c.skills}`).join('\n');
    if (section === 'bio') return obj.bio || '';
    if (section === 'hero') return `**Headline:** ${obj.headline}\n**Subheadline:** ${obj.subheadline}`;
    if (section === 'services') return Array.isArray(generated) ? generated.map((s) => `**${s.title}:** ${s.description}`).join('\n') : '';
    return '';
  };

  const generateSection = async (section: string) => {
    reshuffleSuggestions();
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: `Drafting the ${section} section…`, tone: 'notice', pending: true }]);
    try {
      if (!getToken()) await initAuth();
      const res = await api.post<{ generated?: unknown }>(`/api/advisor/generate/${section}`);
      const generated = res.data?.generated;
      if (!isGeneratedPayload(generated)) {
        replaceLast({ role: 'assistant', content: GENERATE_UNAVAILABLE, tone: 'notice' });
        return;
      }
      const previewText = previewTextFor(section, generated);

      replaceLast({
        role: 'assistant',
        content: `Suggestion for **${section}**:\n\n${previewText}\n\nIf it looks right, save it to your portfolio.`,
        preview: { section, data: generated },
      });
    } catch (err) {
      replaceLast({ role: 'assistant', content: apiErrorMessage(err) || GENERATE_UNAVAILABLE, tone: 'notice' });
    } finally {
      setLoading(false);
    }
  };

  // Services is opt-in: on the dashboard the section is added for the user, elsewhere they're told how.
  const servicesFollowUp = () => {
    if (onServicesSaved) {
      onServicesSaved();
      return '\n\nThe **Services** section was added to your portfolio layout.';
    }
    return `\n\n${SERVICES_HIDDEN_HINT}`;
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
        let servicesNote = '';
        for (const item of data as GeneratedResult[]) {
          try {
            const res = await api.post<{ shown?: boolean }>(`/api/advisor/apply/${item.section}`, { data: item.data });
            if (item.section === 'services' && res.data?.shown === false) servicesNote = servicesFollowUp();
          } catch { failed++; }
        }
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = {
            ...updated[msgIndex],
            content: updated[msgIndex].content + (failed
              ? `\n\n${failed} section(s) could not be saved. Fill them in by hand in the Builder.`
              : '\n\n**All sections saved.** Refresh the preview to see them.') + servicesNote,
            preview: undefined
          };
          return updated;
        });
        setApplying(null);
        return;
      }
      const res = await api.post<{ saved?: number; shown?: boolean }>(`/api/advisor/apply/${section}`, { data });
      const nothingNew = res.data?.saved === 0;
      const servicesNote = section === 'services' && res.data?.shown === false ? servicesFollowUp() : '';
      setMessages(prev => {
        const updated = [...prev];
        updated[msgIndex] = {
          ...updated[msgIndex],
          content: updated[msgIndex].content + (nothingNew
            ? '\n\nThese are already in your portfolio, so nothing new was added.'
            : '\n\n**Saved.** Refresh the preview to see the change.') + servicesNote,
          preview: undefined
        };
        return updated;
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: apiErrorMessage(err) || 'Could not save. Try again, or fill in this section by hand in the Builder.', tone: 'notice' }]);
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
      const [aboutRes, heroRes, skillsRes, servicesRes, expRes, projRes] = await Promise.all([
        api.get('/api/about'),
        api.get('/api/hero'),
        api.get('/api/skills'),
        api.get('/api/services'),
        api.get('/api/experience'),
        api.get('/api/projects'),
      ]);
      existingData = {
        hasBio: !!(aboutRes.data?.bio),
        hasHero: !!(heroRes.data?.headline),
        hasSkills: !!(skillsRes.data?.length),
        hasServices: !!(servicesRes.data?.length),
        hasExperience: !!(expRes.data?.length),
        hasProjects: !!(projRes.data?.length),
      };
    } catch {}

    // Drafted from the user's own data; experience and projects have to be real, so they are only listed.
    // Services is opt-in: "fill all" leaves it out when the owner hasn't added the section (they can ask for it by name).
    const draftable: [string, boolean | undefined][] = [['bio', existingData.hasBio], ['hero', existingData.hasHero], ['skills', existingData.hasSkills]];
    if (servicesInLayout !== false) draftable.push(['services', existingData.hasServices]);
    const sectionsToGenerate = draftable.filter(([, has]) => !has).map(([s]) => s);
    const missingReal = [
      !existingData.hasExperience && '**Work experience**',
      !existingData.hasProjects && '**Projects**',
    ].filter(Boolean) as string[];

    if (missingReal.length > 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Still empty, and these need your real details:\n\n${missingReal.map((l) => `* ${l}`).join('\n')}\n\nAdd them in the Builder (projects can also come from GitHub import). The more real work you add, the better my drafts get.`
      }]);
    }

    if (sectionsToGenerate.length === 0) {
      if (missingReal.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Every section I can help with is filled in.\n\nWant help improving one? Try something like "improve my bio".'
        }]);
      }
      setLoading(false);
      return;
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      tone: 'notice',
      pending: true,
      content: `Drafting ${sectionsToGenerate.join(', ')} from your portfolio…`
    }]);

    const results: GeneratedResult[] = [];
    let reason: string | null = null;

    for (const section of sectionsToGenerate) {
      try {
        if (!getToken()) await initAuth();
        const res = await api.post<{ generated?: unknown }>(`/api/advisor/generate/${section}`);
        const generated = res.data?.generated;
        if (!isGeneratedPayload(generated)) continue;
        results.push({ section, data: generated, previewText: previewTextFor(section, generated) });
      } catch (err) {
        reason = reason || apiErrorMessage(err);
      }
    }

    if (results.length === 0) {
      setMessages(prev => [...prev, { role: 'assistant', content: reason || GENERATE_UNAVAILABLE, tone: 'notice' }]);
      setLoading(false);
      return;
    }

    const summaryText = results.map(r => `**${r.section.toUpperCase()}:**\n${r.previewText}`).join('\n\n---\n\n');

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Drafts for ${results.length} section${results.length === 1 ? '' : 's'}, written from your portfolio:\n\n${summaryText}\n\nCheck them, then save them to your portfolio.`,
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
    setMessages(prev => [...prev, { role: 'assistant', content: '', pending: true }]);

    let fullContent = '';
    const controller = new AbortController();
    streamAbort.current = controller;
    try {
      if (!getToken()) await initAuth();
      const token = getToken();
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: userMsg, history: messages.filter(m => m.tone !== 'notice' && !m.pending).slice(-6).map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
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
              replaceLast({ role: 'assistant', content: snapshot, pending: true });
            }
            if (json.done) setLoading(false);
          } catch {}
        }
      }
      // The route streams nothing when the AI key is missing, and a canned "Sorry…" token when the upstream call throws.
      if (!fullContent.trim() || SERVER_FAILURE.test(fullContent.trim())) replaceLast({ role: 'assistant', content: AI_UNAVAILABLE, tone: 'notice' });
      else replaceLast({ role: 'assistant', content: fullContent });
    } catch {
      replaceLast({ role: 'assistant', content: fullContent ? `${fullContent}\n\n(The answer was cut off.)` : AI_UNAVAILABLE, tone: fullContent ? undefined : 'notice' });
    } finally {
      if (streamAbort.current === controller) streamAbort.current = null;
      setLoading(false);
    }
  };

  const scorePercent = score && score.total ? Math.round(score.score / score.total * 100) : null;

  const last = messages[messages.length - 1];

  return (
    <div className={`flex h-full flex-col bg-paper text-ink ${inline ? '' : 'min-h-0'}`}>
      <header className="flex flex-shrink-0 flex-wrap items-end justify-between gap-3 border-b border-rule px-5 py-4 sm:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Advisor</h2>
          <p className="mt-0.5 text-sm text-ink-soft">Suggestions for completing your portfolio. Answers are AI-generated; check them before saving.</p>
        </div>
        <div className="flex items-center gap-5">
          {scorePercent !== null && (
            <div className="flex items-center gap-3" aria-label={`Portfolio ${scorePercent} percent complete`}>
              <span className="text-xs text-ink-soft">Completeness</span>
              <div className="h-1 w-28 overflow-hidden rounded-full bg-paper-deep">
                <div className="h-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${scorePercent}%` }} />
              </div>
              <span className="font-mono text-sm tabular-nums">{scorePercent}%</span>
            </div>
          )}
          {messages.length > 1 && (
            <button type="button" onClick={clearChat} disabled={loading || applying !== null}
              className="rounded-md px-1.5 py-1 text-xs text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50">
              Clear chat
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={loading}>
        <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8">
          {messages.map((msg, i) => {
            if (msg.role === 'assistant' && !msg.content && loading && i === messages.length - 1) return null;
            return (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                ) : msg.tone === 'notice' ? (
                  <div role="status" className="max-w-[90%] rounded-md border border-rule bg-paper-deep px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">{msg.content}{loading && i === messages.length - 1 && <ElapsedSeconds />}</div>
                ) : (
                  <div className="max-w-[90%]">
                    <p className="mb-1 text-xs font-medium text-ink-soft">Advisor</p>
                    <div className="border-l-2 border-rule pl-3.5 text-sm leading-relaxed"><MessageText text={msg.content} /></div>
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
            <p className="text-[13px] text-ink-soft" role="status">Advisor is writing…<ElapsedSeconds /></p>
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
              readOnly={loading}
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
