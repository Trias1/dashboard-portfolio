'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  slug: string;
  accentColor: string;
  ownerName?: string;
}

export default function ChatWidget({ slug, accentColor, ownerName }: ChatWidgetProps) {
  const [isIframe, setIsIframe] = useState(true);
  useEffect(() => { setIsIframe(window.self !== window.top); }, []);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi!  I'm an AI assistant for ${ownerName || 'this portfolio'}. Ask me anything about their skills, experience, or projects!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  if (isIframe) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    // Tambah empty assistant message untuk streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch(`/api/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6)
        })
      });

      if (!res.ok) throw new Error('Failed');

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
            if (json.token) {
              fullContent += json.token;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                return updated;
              });
            }
            if (json.done) setLoading(false);
            if (json.error) throw new Error(json.error);
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const ac = accentColor;

  const suggested = ['What are the skills?', 'Work experience?', 'Recent projects?', 'How to contact?'];

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ height: '500px', backgroundColor: '#0f0f1a', border: `1px solid ${ac}30` }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ backgroundColor: `${ac}15`, borderBottom: `1px solid ${ac}20` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: ac }}>AI</div>
                <div>
                  <p className="text-white text-sm font-semibold">Portfolio Assistant</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-gray-400">Powered by Groq AI</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition"></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mr-2 mt-1"
                      style={{ backgroundColor: ac }}>AI</div>
                  )}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                    style={{
                      backgroundColor: msg.role === 'user' ? ac : 'rgba(255,255,255,0.07)',
                      color: 'white',
                      whiteSpace: 'pre-wrap'
                    }}>
                    {msg.content}
                    {/* Cursor blink saat streaming */}
                    {loading && i === messages.length - 1 && msg.role === 'assistant' && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}></motion.span>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots kalau belum ada token */}
              {loading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mr-2"
                    style={{ backgroundColor: ac }}>AI</div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ac }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {suggested.map(q => (
                  <button key={q} onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full border transition hover:opacity-80"
                    style={{ borderColor: `${ac}40`, color: ac, backgroundColor: `${ac}10` }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 flex-shrink-0">
              <div className="flex gap-2 items-center p-2 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${ac}20` }}>
                <input ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 disabled:opacity-50"
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                  style={{ backgroundColor: ac }}>
                  <span className="text-white text-sm"></span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl relative"
        style={{ backgroundColor: ac, boxShadow: `0 0 20px ${ac}60` }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}></motion.span>
            : <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}></motion.span>
          }
        </AnimatePresence>
        {!open && (
          <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0f0f1a]"
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        )}
      </motion.button>
    </div>
  );
}
