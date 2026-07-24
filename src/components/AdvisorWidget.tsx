'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api, { initAuth, getToken } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  preview?: { section: string; data: any };
}

function AdvisorAvatar({ small = false }: { small?: boolean }) {
  return (
    <div className={`${small ? 'h-8 w-8 rounded-xl' : 'h-11 w-11 rounded-2xl'} relative flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-purple-500 via-violet-600 to-cyan-500 shadow-lg shadow-purple-950/40`}>
      <svg viewBox="0 0 24 24" fill="none" className={small ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true">
        <path d="M12 3l1.15 3.1L16 7.25l-2.85 1.15L12 11.5l-1.15-3.1L8 7.25l2.85-1.15L12 3Z" fill="white" />
        <path d="M6.5 12l.75 2.25L9.5 15l-2.25.75L6.5 18l-.75-2.25L3.5 15l2.25-.75L6.5 12Zm11 1 .65 1.85L20 15.5l-1.85.65L17.5 18l-.65-1.85L15 15.5l1.85-.65L17.5 13Z" fill="white" fillOpacity=".85" />
      </svg>
      {!small ? <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-[#0a0a1a] bg-emerald-400" aria-label="Online" /> : null}
    </div>
  );
}

export default function AdvisorWidget({ inline = false }: { inline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: ' Hi! I\'m your Portfolio Advisor.\n\nI can help you:\n* Analyze your portfolio completeness\n* Suggest what content to add\n* **Auto-fill sections** for you!\n\nKlik tombol di bawah untuk langsung merapihkan portfolio kamu, atau tanya apa saja!', preview: { section: 'boom', data: null } }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [score, setScore] = useState<{score: number, total: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Detect section intent dari message
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
    if (lower.includes('experience') || lower.includes('pengalaman') || lower.includes('kerja')) return 'experience';
    return null;
  };

  const isAutoFillAll = (msg: string): boolean => {
    const lower = msg.toLowerCase();
    return lower.includes('rapihkan') || lower.includes('lengkapi semua') || 
           lower.includes('boom') || lower.includes('isi semua') ||
           lower.includes('complete all') || lower.includes('fill all') ||
           lower.includes('auto fill') || lower.includes('autofill');
  };

  const generateSection = async (section: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: ` Generating ${section} content...` }]);
    try {
      if (!getToken()) await initAuth();
      const res = await api.post(`/api/advisor/generate/${section}`);
      const { generated } = res.data;
      
      // Format preview text
      let previewText = '';
      if (section === 'skills' && generated.categories) {
        previewText = generated.categories.map((c: any) => `**${c.title}:** ${c.skills}`).join('\n');
      } else if (section === 'bio') {
        previewText = generated.bio;
      } else if (section === 'hero') {
        previewText = `**Headline:** ${generated.headline}\n**Subheadline:** ${generated.subheadline}`;
      } else if (section === 'services') {
        previewText = generated.map((s: any) => `${s.icon} **${s.title}:** ${s.description}`).join('\n');
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: ` Here's what I generated for your **${section}** section:\n\n${previewText}\n\nLooks good? Click "Pakai Ini" to save!`,
          preview: { section, data: generated }
        };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: ' Failed to generate. Please try again.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const applySection = async (section: string, data: any, msgIndex: number) => {
    setApplying(section);
    try {
      // Handle boom  -  langsung generate all
      if (section === 'boom') {
        setApplying(null);
        await generateAll();
        return;
      }
      // Handle apply all
      if (section === 'all' && Array.isArray(data)) {
        for (const item of data) {
          try {
            await api.post(`/api/advisor/apply/${item.section}`, { data: item.data });
          } catch {}
        }
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = {
            ...updated[msgIndex],
            content: updated[msgIndex].content + '\n\n **Semua section berhasil disimpan!** Refresh preview untuk melihat hasilnya.',
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
          content: updated[msgIndex].content + '\n\n **Saved successfully!** Refresh preview to see changes.',
          preview: undefined
        };
        return updated;
      });
    } catch {
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  const generateAll = async () => {
    setLoading(true);
    // Fetch data existing dulu
    let existingData: any = {};
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
    
    // Hanya generate yang kosong
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
      // Kalau section penting kosong, catat tapi jangan generate
      if (importantSections.includes(s)) {
        missingSections.push(s);
        return false;
      }
      return true;
    });

    const sectionLabels: Record<string,string> = {
      bio: 'Bio/About', hero: 'Hero Headline', experience: 'Pengalaman Kerja',
      skills: 'Skills', projects: 'Projects', contact: 'Kontak'
    };

    if (sectionsToGenerate.length === 0 && missingSections.length === 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ' Portfolio kamu sudah lengkap! Semua section sudah terisi.\n\nMau saya improve section tertentu? Ketik misalnya "improve bio saya" atau "enhance skills section".'
      }]);
      setLoading(false);
      return;
    }

    if (missingSections.length > 0) {
      const missingLabels = missingSections.map(s => `* **${sectionLabels[s] || s}**`).join('\n');
      const dummyCount = sectionsToGenerate.length;
      const dummyMsg = dummyCount > 0 ? `\n\nSambil itu, saya akan generate contoh untuk section opsional yang kosong.` : '';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ` **Beberapa section penting belum diisi:**\n\n${missingLabels}\n\nSilakan isi section tersebut di Builder terlebih dahulu agar portfolio kamu terlihat profesional dan akurat.${dummyMsg}`
      }]);
      if (dummyCount === 0) {
        setLoading(false);
        return;
      }
    }

    const skipped = allSections.filter(s => !sectionsToGenerate.includes(s));
    const skipMsg = skipped.length > 0 ? `\n\nOK Section yang sudah ada (skip): ${skipped.join(', ')}` : '';

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: ` **Generating ${sectionsToGenerate.length} section yang belum lengkap...**${skipMsg}\n\nMohon tunggu sebentar...`
    }]);

    const sections = sectionsToGenerate;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: ' **Sedang merapihkan portfolio Anda...**\n\nAI akan generate semua section yang belum lengkap. Mohon tunggu sebentar...' 
    }]);

    const results: { section: string; data: any; previewText: string }[] = [];

    for (const section of sections) {
      try {
        if (!getToken()) await initAuth();
        const res = await api.post(`/api/advisor/generate/${section}`);
        const { generated } = res.data;
        
        let previewText = '';
        if (section === 'skills' && generated.categories) {
          previewText = generated.categories.map((c: any) => `**${c.title}:** ${c.skills}`).join('\n');
        } else if (section === 'bio') {
          previewText = generated.bio;
        } else if (section === 'hero') {
          previewText = `**Headline:** ${generated.headline}\n**Subheadline:** ${generated.subheadline}`;
        } else if (section === 'services') {
          previewText = Array.isArray(generated) ? generated.map((s: any) => `${s.icon} **${s.title}:** ${s.description}`).join('\n') : '';
        } else if (section === 'projects') {
          previewText = `**${generated.title}**\n${generated.description}\nTech: ${generated.tech_stack}`;
        } else if (section === 'experience') {
          previewText = `**${generated.position}** at ${generated.company}\n${generated.description}`;
        } else if (section === 'testimonials') {
          previewText = Array.isArray(generated) ? generated.map((t: any) => ` "${t.message}"  -  **${t.name}**, ${t.position}`).join('\n\n') : '';
        } else if (section === 'gallery') {
          previewText = Array.isArray(generated) ? generated.map((g: any) => ` **${g.title}**\n${g.description}`).join('\n\n') : '';
        } else if (section === 'contact') {
          previewText = ` ${generated.email}\n ${generated.phone}\n ${generated.location}`;
        }
        results.push({ section, data: generated, previewText });
      } catch {}
    }

    // Tampilkan semua hasil sekaligus dengan satu tombol apply all
    const summaryText = results.map(r => ` **${r.section === 'gallery' ? 'CERTIFICATE' : r.section.toUpperCase()}:**\n${r.previewText}`).join('\n\n---\n\n');
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: ` **Semua section sudah di-generate!**\n\n${summaryText}\n\n---\nKlik **"Terapkan Semua"** untuk save ke portfolio!`,
      preview: { section: 'all', data: results }
    }]);
    setLoading(false);
  };

  const sendMessage = async (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    // Check apakah auto fill all
    if (isAutoFillAll(userMsg)) {
      await generateAll();
      return;
    }

    // Check apakah ada intent generate section
    const section = detectSection(userMsg);
    const isGenerateIntent = userMsg.toLowerCase().includes('isi') || 
      userMsg.toLowerCase().includes('generate') || 
      userMsg.toLowerCase().includes('buat') ||
      userMsg.toLowerCase().includes('tambah') ||
      userMsg.toLowerCase().includes('fill');

    if (section && isGenerateIntent) {
      await generateSection(section);
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
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

  const allSuggested = [
    ' Rapihkan & lengkapi portfolio saya',
    ' Analyze my portfolio',
    ' Isi bagian skills saya',
    ' Generate testimonials untuk portfolio',
    ' Suggest certificate untuk saya',
    ' Generate experience saya',
    ' Generate my bio',
    ' Buat hero section',
    ' Generate services saya',
    ' Suggest experience saya',
    ' Generate project untuk portfolio',
    ' Apa yang kurang dari portfolio saya?',
    ' Gimana cara buat portfolio lebih menarik?',
    ' Tips untuk contact section',
    ' Cara dapat testimonial?',
    ' Tips design portfolio yang bagus?',
    ' Gimana cara portfolio mudah ditemukan recruiter?',
    ' Apa yang harus ada di bio yang menarik?',
  ];
  // Shuffle dan ambil 4 random setiap kali render
  const [suggested, setSuggested] = useState(() => 
    [...allSuggested].sort(() => Math.random() - 0.5).slice(0, 4)
  );
  // Reshuffle setiap kali ada pesan baru dari AI
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length-1].role === 'assistant') {
      setSuggested([...allSuggested].sort(() => Math.random() - 0.5).slice(0, 4));
    }
  }, [messages.length]);

  const scorePercent = score ? Math.round(score.score / score.total * 100) : null;
  const scoreColor = scorePercent ? (scorePercent >= 80 ? '#22c55e' : scorePercent >= 50 ? '#f59e0b' : '#ef4444') : '#a855f7';

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a1a]">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-purple-900/20 px-6 py-4">
        <AdvisorAvatar />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-white">Portfolio Advisor</h2>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">Online</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-400">AI-powered portfolio assistant</p>
        </div>
      </div>

      {/* Completeness bar  -  compact */}
      {scorePercent !== null && (
        <div className="flex-shrink-0 px-6 py-2 border-b border-purple-900/20 flex items-center gap-3">
          <span className="text-xs text-gray-400">Portfolio Completeness:</span>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: scoreColor }}
              initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span className="text-xs font-bold" style={{ color: scoreColor }}>{scorePercent}%</span>
          <span className="text-lg">{scorePercent >= 80 ? '' : scorePercent >= 50 ? '' : ''}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="mr-3 mt-1"><AdvisorAvatar small /></div>
            )}
            <div className="max-w-[80%]">
              <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                style={{
                  backgroundColor: msg.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: msg.role === 'assistant' ? '1px solid rgba(168,85,247,0.15)' : 'none'
                }}>
                <div className="space-y-1">{renderContent(msg.content)}</div>
                {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}></motion.span>
                )}
              </div>
              {/* Preview action button */}
              {msg.preview && (
                <button
                  onClick={() => applySection(msg.preview!.section, msg.preview!.data, i)}
                  disabled={applying !== null}
                  className="mt-2 w-full py-2 px-4 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: msg.preview.section === 'all' ? '#059669' : msg.preview.section === 'boom' ? '#7c3aed' : '#7c3aed', color: 'white', background: msg.preview.section === 'boom' ? 'linear-gradient(135deg, #7c3aed, #059669)' : undefined }}>
                  {applying !== null ? ' Saving...' : msg.preview.section === 'all' ? ' Terapkan Semua ke Portfolio!' : msg.preview.section === 'boom' ? ' Rapihkan Portfolio Saya Sekarang!' : ' Pakai Ini  -  Save ke Portfolio'}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="mr-3"><AdvisorAvatar small /></div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm border border-purple-900/20" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-purple-500"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested  -  selalu tampil, random 4 */}
      {!loading && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggested.slice(0, messages.length === 1 ? 4 : 4).map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              disabled={loading}
              className="text-xs px-4 py-2 rounded-full border transition hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-purple-400/20 bg-white/[0.04] p-2.5 transition focus-within:border-purple-400/60 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.08)]">
          <input ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder='Try: "Isi bagian skills saya"'
            disabled={loading}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 disabled:opacity-50"
          />
          <button type="button" onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-lg shadow-purple-950/40 transition hover:-translate-y-0.5 hover:shadow-purple-900/60 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={loading ? 'Sending message' : 'Send message'}>
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="m5 12 14-7-4.5 14-3-5.5L5 12Z" fill="currentColor" />
                <path d="m11.5 13.5 7-8.5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
