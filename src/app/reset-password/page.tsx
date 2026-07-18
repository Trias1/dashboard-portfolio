'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const theme = { bg: '#0a0a1a', accent: '#a855f7', card: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match / Password tidak cocok'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters / Minimal 8 karakter'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password / Gagal reset password');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
      <div className="text-center">
        <div className="text-6xl mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">Token tidak valid</h2>
        <Link href="/forgot-password" className="text-sm" style={{ color: theme.accent }}>Request ulang</Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}></motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Password berhasil direset!</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Redirect ke login dalam 3 detik...</p>
        <Link href="/login" className="text-sm mt-4 inline-block font-medium" style={{ color: theme.accent }}>Login sekarang to </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: theme.accent }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }} whileHover={{ scale: 1.1, rotate: -5 }}>P</motion.div>
            <span className="font-bold text-xl text-white">PortfolioKit</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Buat Password Baru</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Minimal 8 karakter</p>
        </div>

        <motion.div className="relative rounded-2xl p-[1px]" style={{ background: `linear-gradient(135deg, ${theme.accent}, transparent, ${theme.accent})` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-8 backdrop-blur-xl" style={{ backgroundColor: theme.bg }}>
            {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/20 bg-red-500/10">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Password Baru</label>
                <input type="password" placeholder="Min. 8 karakter" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition focus:ring-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, outlineColor: theme.accent }}
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Konfirmasi Password</label>
                <input type="password" placeholder="Ulangi password" value={confirm}
                  onChange={e => setConfirm(e.target.value)}
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
                ) : 'Simpan Password Baru'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>;
}
