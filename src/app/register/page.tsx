'use client';
import { useState } from 'react';
import Link from 'next/link';
import api, { getApiErrorMessage } from '@/lib/api';
import AuthShell, { Field, GoogleButton, Notice, OrDivider, SubmitButton } from '@/components/AuthShell';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Konfirmasi password belum sama.'); return; }
    if (form.password.length < 8) { setError('Password minimal 8 karakter.'); return; }
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

  if (success) return (
    <AuthShell
      title="Satu langkah lagi"
      subtitle={<>Link verifikasi sudah dikirim ke <span className="font-medium text-ink">{form.email}</span>. Buka email itu, klik link-nya, lalu masuk.</>}
      footer={<>Tidak ada di inbox? Cek folder spam atau promosi.</>}>
      <Link href="/login"
        className="block w-full rounded-md bg-ink px-4 py-2.5 text-center text-[15px] font-medium text-paper transition-colors hover:bg-black">
        Ke halaman masuk
      </Link>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Buat akun"
      subtitle="Gratis. Tidak perlu kartu kredit."
      footer={<>Sudah punya akun? <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">Masuk</Link></>}>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="reg-name" label="Nama lengkap" type="text" autoComplete="name" placeholder="Nama yang tampil di portfolio"
          value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} />
        <Field id="reg-email" label="Email" type="email" autoComplete="email" placeholder="nama@email.com"
          value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} />
        <Field id="reg-password" label="Password" type="password" autoComplete="new-password" minLength={8}
          hint="Minimal 8 karakter." value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} />
        <Field id="reg-confirm" label="Ulangi password" type="password" autoComplete="new-password"
          value={form.confirmPassword} required onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
        <SubmitButton busy={loading}>Buat akun</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton label="Daftar dengan Google" />
    </AuthShell>
  );
}
