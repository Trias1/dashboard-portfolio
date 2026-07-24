'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getApiErrorMessage } from '@/lib/api';

const themes = [
  { name: 'Dark bawaan', id: 'dark-space', bg: '#0a0a1a', accent: '#8b5cf6', card: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  { name: 'White', id: 'white', bg: '#ffffff', accent: '#6366f1', card: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
];

function getInitialTheme() {
  if (typeof window === 'undefined') return themes[0];
  try {
    const saved = localStorage.getItem('lang-theme') || localStorage.getItem('portfolio-theme');
    const parsed = saved ? JSON.parse(saved) : null;
    return themes.find(theme => theme.id === parsed?.id || theme.name === parsed?.label || theme.name === parsed?.name || theme.accent === parsed?.accent) || themes[0];
  } catch {
    return themes[0];
  }
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/register', { name: form.name, email: form.email, password: form.password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Register failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition focus:ring-1`;
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, outlineColor: theme.accent };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme.bg }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>&quot;</motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Check your email!</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          We sent a verification link to <span style={{ color: theme.accent }}>{form.email}</span>
        </p>
        <Link href="/login" className="text-sm font-medium transition hover:opacity-80" style={{ color: theme.accent }}> Back to Login</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: theme.accent }}
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: theme.accent }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ backgroundColor: theme.accent }} whileHover={{ scale: 1.1, rotate: -5 }}>P</motion.div>
            <span className="font-bold text-xl text-white">PortfolioKit</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Free forever. No credit card needed.</p>
        </div>

        <motion.div className="relative rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${theme.accent}, transparent, ${theme.accent})` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-8 backdrop-blur-xl" style={{ backgroundColor: theme.bg }}>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/20 bg-red-500/10">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Full Name</label>
                <input type="text" placeholder="Alex Rivera" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
                <input type="password" placeholder="Min. 8 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Confirm Password</label>
                <input type="password" placeholder="" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01, boxShadow: `0 0 20px ${theme.accent}50` }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: theme.accent }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : 'Create Account'}
              </motion.button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: theme.border }} />
                </div>
                <div className="relative text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ backgroundColor: theme.bg, padding: '0 8px' }}>or</span>
                </div>
              </div>

              <a href="/api/auth/google"
                className="w-full py-3 rounded-xl font-medium text-sm text-white border flex items-center justify-center gap-2 transition hover:opacity-80"
                style={{ borderColor: theme.border, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </a>
            </form>
          </div>
        </motion.div>

        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium transition hover:opacity-80" style={{ color: theme.accent }}>Login</Link>
        </p>

        <div className="flex justify-center gap-2 mt-6">
          {themes.map(t => (
            <motion.button key={t.name} onClick={() => { setTheme(t); localStorage.setItem('lang-theme', JSON.stringify({ id: t.id, label: t.name, accent: t.accent })); }}
              title={t.name} whileHover={{ scale: 1.2 }}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{ backgroundColor: t.accent, borderColor: theme.name === t.name ? 'white' : 'transparent' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
