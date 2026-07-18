'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim email');
    } finally { setLoading(false); }
  };

  const theme = { bg: '#0a0a1a', accent: '#a855f7', card: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme.bg }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}></motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Cek email kamu!</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Jika email <span style={{ color: theme.accent }}>{email}</span> terdaftar, link reset password sudah dikirim.
        </p>
        <Link href="/login" className="text-sm font-medium transition hover:opacity-80" style={{ color: theme.accent }}>Kembali ke Login</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: theme.accent }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }} whileHover={{ scale: 1.1, rotate: -5 }}>P</motion.div>
            <span className="font-bold text-xl text-white">PortfolioKit</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Lupa Password?</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Masukkan email kamu, kami kirimkan link reset.</p>
        </div>

        <motion.div className="relative rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${theme.accent}, transparent, ${theme.accent})` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-8 backdrop-blur-xl" style={{ backgroundColor: theme.bg }}>
            {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/20 bg-red-500/10">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition focus:ring-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, outlineColor: theme.accent }}
                  required />
              </div>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01, boxShadow: `0 0 20px ${theme.accent}50` }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accent }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : 'Kirim Link Reset'}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Ingat password?{' '}
          <Link href="/login" className="font-medium hover:opacity-80" style={{ color: theme.accent }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

