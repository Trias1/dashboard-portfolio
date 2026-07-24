'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AdvisorIcon({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={`${size === 'lg' ? 'h-11 w-11 rounded-2xl' : 'h-7 w-7 rounded-xl'} relative flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-purple-500 via-violet-600 to-cyan-500 shadow-lg shadow-purple-950/40`}>
      <svg viewBox="0 0 24 24" fill="none" className={size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} aria-hidden="true">
        <path d="M12 3l1.15 3.1L16 7.25l-2.85 1.15L12 11.5l-1.15-3.1L8 7.25l2.85-1.15L12 3Z" fill="white" />
        <path d="M6.5 12l.75 2.25L9.5 15l-2.25.75L6.5 18l-.75-2.25L3.5 15l2.25-.75L6.5 12Zm11 1 .65 1.85L20 15.5l-1.85.65L17.5 18l-.65-1.85L15 15.5l1.85-.65L17.5 13Z" fill="white" fillOpacity=".85" />
      </svg>
      {size === 'lg' ? <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-[#0f0f1a] bg-emerald-400" /> : null}
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AdvisorFloating({ accentColor }: { accentColor: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: ' Hi! I\'m your Portfolio Advisor.\n\nAsk me how to improve your portfolio or what to add!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<{score: number, total: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ac = accentColor || '#a855f7';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      // Pastikan token ada, refresh kalau perlu
      const { initAuth, getToken } = await import('@/lib/api');
      if (!getToken()) await initAuth();
      const token = getToken();

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: userMsg, history: messages.slice(-6) })
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.score !== undefined) setScore({ score: json.score, total: json.total });
            if (json.token) {
              fullContent += json.token;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                return updated;
              });
            }
            if (json.done) setLoading(false);
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const scorePercent = score ? Math.round(score.score / score.total * 100) : null;
  const scoreColor = scorePercent ? (scorePercent >= 80 ? '#22c55e' : scorePercent >= 50 ? '#f59e0b' : '#ef4444') : ac;
  const suggested = [' Analyze my portfolio', ' What should I add?', ' Improve my bio'];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[999] flex flex-col items-end gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex h-[min(480px,calc(100dvh-6rem))] w-full flex-col overflow-hidden rounded-2xl shadow-2xl sm:w-96"
            style={{ backgroundColor: '#0f0f1a', border: `1px solid ${ac}40` }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ backgroundColor: `${ac}15`, borderBottom: `1px solid ${ac}20` }}>
              <div className="flex items-center gap-3">
                <AdvisorIcon size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">Portfolio Advisor</p>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">Online</span>
                  </div>
                  {scorePercent !== null && (
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${scorePercent}%`, backgroundColor: scoreColor }} />
                      </div>
                      <span className="text-xs" style={{ color: scoreColor }}>{scorePercent}%</span>
                    </div>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white" aria-label="Close advisor">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mr-2 mt-1"><AdvisorIcon /></div>
                  )}
                  <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed sm:max-w-[75%] ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    style={{ backgroundColor: msg.role === 'user' ? ac : 'rgba(255,255,255,0.07)', color: 'white', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                    {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}></motion.span>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="mr-2"><AdvisorIcon /></div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: ac }}
                          animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {suggested.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border transition hover:opacity-80"
                    style={{ borderColor: `${ac}40`, color: ac, backgroundColor: `${ac}10` }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-3">
              <div className="flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-white/[0.05] p-2 transition focus-within:border-purple-400/60 focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.08)]">
                <input ref={inputRef} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask for advice..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 disabled:opacity-50"
                />
                <button type="button" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-lg shadow-purple-950/40 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={loading ? 'Sending message' : 'Send message'}>
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true"><path d="m5 12 14-7-4.5 14-3-5.5L5 12Z" fill="currentColor" /><path d="m11.5 13.5 7-8.5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <motion.button onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-cyan-500 shadow-2xl shadow-purple-950/50"
        aria-label={open ? 'Close portfolio advisor' : 'Open portfolio advisor'}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.svg key="x" viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></motion.svg>
            : <motion.div key="a" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><AdvisorIcon size="lg" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
