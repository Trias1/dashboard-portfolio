'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tone?: 'notice';
}

/** Fallback text /api/advisor sends when its own upstream request fails. */
const SERVER_FAILURE = /^sorry, something went wrong\.?$/i;
const AI_UNAVAILABLE = "Advisor can't answer right now: the AI service isn't set up or is unavailable.";

/** Black or white text, whichever reads better on the accent. */
function textOn(hex: string) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return '#fff';
  const full = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#141414' : '#fff';
}

function ChatGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>;
}

export default function AdvisorFloating({ accentColor }: { accentColor: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ask how to improve this portfolio or which sections to add.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<{score: number, total: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ac = accentColor || '#1f45c9';
  const onAc = textOn(ac);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open]);

  const replaceLast = (msg: Message) => setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1] = msg;
    return updated;
  });

  const sendMessage = async (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const history = messages.filter(m => m.tone !== 'notice').slice(-6).map(({ role, content }) => ({ role, content }));
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '' }]);
    setLoading(true);

    let fullContent = '';
    try {
      // Make sure there is a token; refresh if needed
      const { initAuth, getToken } = await import('@/lib/api');
      if (!getToken()) await initAuth();
      const token = getToken();

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: userMsg, history })
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
            const json = JSON.parse(line.slice(6));
            if (json.score !== undefined) setScore({ score: json.score, total: json.total });
            if (json.token) {
              fullContent += json.token;
              replaceLast({ role: 'assistant', content: fullContent });
            }
            if (json.done) setLoading(false);
          } catch {}
        }
      }
      // The route streams nothing when the AI key is missing, and a canned "Sorry…" token when the upstream call throws.
      if (!fullContent.trim() || SERVER_FAILURE.test(fullContent.trim())) replaceLast({ role: 'assistant', content: AI_UNAVAILABLE, tone: 'notice' });
    } catch {
      replaceLast(fullContent
        ? { role: 'assistant', content: `${fullContent}\n\n(The answer was cut off.)` }
        : { role: 'assistant', content: AI_UNAVAILABLE, tone: 'notice' });
    } finally {
      setLoading(false);
    }
  };

  const scorePercent = score && score.total ? Math.round(score.score / score.total * 100) : null;
  const suggested = ['Analyze my portfolio', 'What should I add?', 'Improve my bio'];
  const last = messages[messages.length - 1];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[999] flex flex-col items-end gap-3 font-sans sm:inset-x-auto sm:bottom-6 sm:right-6">
      {open && (
        <div role="dialog" aria-label="Portfolio Advisor"
          className="flex h-[min(480px,calc(100dvh-6rem))] w-full flex-col overflow-hidden rounded-lg border border-[#dcdcd5] bg-white text-[#141414] shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:w-96">
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#dcdcd5] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Portfolio Advisor</p>
              {scorePercent !== null ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-[#efefe9]">
                    <div className="h-full" style={{ width: `${scorePercent}%`, backgroundColor: ac }} />
                  </div>
                  <span className="font-mono text-xs text-[#55555a]">{scorePercent}% complete</span>
                </div>
              ) : (
                <p className="text-xs text-[#55555a]">Only you can see this in preview mode</p>
              )}
            </div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#55555a] transition-colors hover:bg-[#efefe9] hover:text-[#141414] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141414]" aria-label="Close advisor">
              <CloseGlyph className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((msg, i) => {
              if (msg.role === 'assistant' && !msg.content) return null;
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[82%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed" style={{ backgroundColor: ac, color: onAc }}>{msg.content}</div>
                  </div>
                );
              }
              return msg.tone === 'notice'
                ? <div key={i} role="status" className="rounded-md border border-[#dcdcd5] bg-[#fafaf7] px-3 py-2 text-[13px] leading-relaxed text-[#55555a]">{msg.content}</div>
                : <div key={i} className="max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>;
            })}
            {loading && last?.content === '' && <p className="text-[13px] text-[#55555a]" role="status">Writing…</p>}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {suggested.map(q => (
                <button key={q} type="button" onClick={() => sendMessage(q)}
                  className="rounded-md border border-[#dcdcd5] px-2.5 py-1 text-[13px] text-[#55555a] transition-colors hover:border-[#55555a] hover:text-[#141414]">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className="flex flex-shrink-0 items-center gap-2 border-t border-[#dcdcd5] p-3" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <label htmlFor="advisor-floating-input" className="sr-only">Question for the Advisor</label>
            <input id="advisor-floating-input" ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={loading}
              className="min-w-0 flex-1 rounded-md border border-[#dcdcd5] bg-white px-3 py-2 text-sm text-[#141414] placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-[#141414] disabled:opacity-60"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: ac, color: onAc }}>
              Send
            </button>
          </form>
        </div>
      )}

      <button type="button" onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
        style={{ backgroundColor: ac, color: onAc }}
        aria-expanded={open}
        aria-label={open ? 'Close portfolio advisor' : 'Open portfolio advisor'}>
        {open ? <CloseGlyph className="h-5 w-5" /> : <ChatGlyph className="h-5 w-5" />}
      </button>
    </div>
  );
}
