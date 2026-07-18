'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function ContactForm({ slug, accentColor, textColor = '#f1f5f9', subColor = '#94a3b8' }: {
  slug: string;
  accentColor: string;
  textColor?: string;
  subColor?: string;
}) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.post('/api/contact/message', { ...form, slug });
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to send message');
    }
  };

  const inputStyle = { backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20`, color: textColor, outlineColor: accentColor };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Your Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
          style={inputStyle} required />
        <input type="email" placeholder="Your Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
          style={inputStyle} required />
      </div>
      <textarea placeholder="Your Message" rows={4} value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition resize-none"
        style={inputStyle} required />
      <div className="flex items-center gap-3">
        <motion.button type="submit" disabled={status === 'sending' || status === 'sent'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
          style={{ backgroundColor: accentColor }}>
          {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent! OK' : 'Send Message'}
        </motion.button>
        <AnimatePresence>
          {status === 'sent' && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="text-sm" style={{ color: accentColor }}>
              Message sent!
            </motion.span>
          )}
          {status === 'error' && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="text-sm text-red-400">
              {errorMsg}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
