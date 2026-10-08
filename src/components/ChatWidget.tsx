'use client';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tone?: 'notice';
}

const subscribeNoop = () => () => {};
const getIsIframe = () => window.self !== window.top;
const getIsIframeServer = () => false;

interface ChatWidgetProps {
  slug: string;
  accentColor: string;
  ownerName?: string;
}

/** Black or white text, whichever reads better on the accent (templates pass any theme colour). */
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

export default function ChatWidget({ slug, accentColor, ownerName }: ChatWidgetProps) {
  const ac = accentColor || '#1f45c9';
  const onAc = textOn(ac);
  const who = ownerName || 'this person';
  const unavailable = `The assistant isn't available right now. Please use the contact details on this page to reach ${who}.`;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Ask about ${who}'s background, skills, or projects. Answers are generated from this portfolio.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Client-only check; the server snapshot (false) matches the initial client render during hydration.
  const isIframe = useSyncExternalStore(subscribeNoop, getIsIframe, getIsIframeServer);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open]);

  const sendMessage = async (presetMessage?: string) => {
    const text = presetMessage || input;
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    if (!presetMessage) setInput('');

    const history = messages.filter((m) => m.tone !== 'notice').map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    let fullContent = '';
    let failed = false;
    try {
      const res = await fetch(`/api/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      });

      if (!res.ok || !res.body) throw new Error('Network error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const rawLines = buffer.split('\n');
        buffer = rawLines.pop() || '';

        for (const line of rawLines.filter((l) => l.startsWith('data: '))) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            if (json.error) {
              failed = true;
            } else if (json.token) {
              fullContent += json.token;
              const snapshot = fullContent;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: snapshot };
                return updated;
              });
            }
          } catch {}
        }
      }
      if (failed || !fullContent.trim()) throw new Error('No answer');
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const fallback: Message = fullContent && !failed
          ? { role: 'assistant', content: `${fullContent}\n\n(The answer was cut off.)` }
          : { role: 'assistant', content: unavailable, tone: 'notice' };
        if (updated[updated.length - 1]?.role === 'assistant' && updated.length > messages.length + 1) updated[updated.length - 1] = fallback;
        else updated.push(fallback);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  if (isIframe) return null;

  const first = ownerName?.split(' ')[0];
  const suggested = [first ? `What are ${first}'s main skills?` : 'What are their main skills?', 'What is the latest project?', 'Summarize the work experience'];
  const last = messages[messages.length - 1];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[999] flex flex-col items-end gap-3 font-sans sm:inset-x-auto sm:bottom-6 sm:right-6">
      {open && (
        <div role="dialog" aria-label={`Ask about ${who}`}
          className="flex h-[min(480px,calc(100dvh-6rem))] w-full flex-col overflow-hidden rounded-lg border border-[#dcdcd5] bg-white text-[#141414] shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:w-96">
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#dcdcd5] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Ask about {who}</p>
              <p className="text-xs text-[#55555a]">Automated answers, may be incomplete</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#55555a] transition-colors hover:bg-[#efefe9] hover:text-[#141414] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141414]" aria-label="Close chat">
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
            {loading && (last?.role === 'user' || last?.content === '') && <p className="text-[13px] text-[#55555a]" role="status">Writing…</p>}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {suggested.map((q) => (
                <button key={q} type="button" onClick={() => sendMessage(q)}
                  className="rounded-md border border-[#dcdcd5] px-2.5 py-1 text-[13px] text-[#55555a] transition-colors hover:border-[#55555a] hover:text-[#141414]">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className="flex flex-shrink-0 items-center gap-2 border-t border-[#dcdcd5] p-3" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <label htmlFor="portfolio-chat-input" className="sr-only">Your question</label>
            <input id="portfolio-chat-input" ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
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
        aria-label={open ? 'Close chat' : `Ask about ${who}`}>
        {open ? <CloseGlyph className="h-5 w-5" /> : <ChatGlyph className="h-5 w-5" />}
      </button>
    </div>
  );
}
