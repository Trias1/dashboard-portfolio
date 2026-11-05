'use client';
import { useId, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import { readableOn } from '@/lib/contrast';

export default function ContactForm({ slug, accentColor, textColor = '#f1f5f9', subColor = '#94a3b8', align = 'center' }: {
  slug: string;
  accentColor: string;
  textColor?: string;
  subColor?: string;
  /** 'start' lines the form up with left-aligned text above it. */
  align?: 'center' | 'start';
}) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const uid = useId();
  // Light text means a dark background: there #dc2626 only reaches ~3.8:1, so use a lighter red (both ≥ 4.5:1)
  const errorColor = readableOn(textColor) === '#111111' ? '#f87171' : '#b91c1c';

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
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(getApiErrorMessage(err, 'Failed to send message'));
    }
  };

  // Neutral fields that inherit the template's text colour; the accent only marks focus and the button.
  const fieldClass = 'w-full rounded-md border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-colors focus-visible:ring-2';
  const fieldStyle = { borderColor: `${subColor}66`, color: textColor, ['--tw-ring-color' as string]: `${accentColor}55` };
  const labelClass = 'mb-1.5 block text-sm font-medium';

  return (
    <form onSubmit={handleSubmit} className={`${align === 'start' ? '' : 'mx-auto '}max-w-lg space-y-4 text-left`} style={{ color: textColor }}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={labelClass}>Name</label>
          <input id={`${uid}-name`} type="text" autoComplete="name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={fieldClass} style={fieldStyle} required />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={labelClass}>Email</label>
          <input id={`${uid}-email`} type="email" autoComplete="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={fieldClass} style={fieldStyle} required />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className={labelClass}>Message</label>
        <textarea id={`${uid}-message`} rows={5} value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          className={`${fieldClass} resize-y`} style={fieldStyle} required />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === 'sending' || status === 'sent'}
          className="rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
          style={{ backgroundColor: accentColor, color: readableOn(accentColor), outlineColor: accentColor }}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <span role="status" aria-live="polite" className="text-sm" style={{ color: status === 'error' ? errorColor : subColor }}>
          {status === 'sent' && 'Thanks — your message was sent.'}
          {status === 'error' && errorMsg}
        </span>
      </div>
    </form>
  );
}
