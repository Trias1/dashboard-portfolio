'use client';
import { useState } from 'react';
import axios from 'axios';
import CVUpload from '@/components/builder/CVUpload';
import type { CvAppliedSection } from '@/components/builder/CVUpload';
import api from '@/lib/api';
import { Section, SECTION_ORDER } from '@/lib/sections';
import { getErrorMessage } from '@/lib/utils';
import type { DashboardPortfolio } from '@/types';

const isCustomSectionKey = (key: CvAppliedSection): key is `custom:${string}` => key.startsWith('custom:');

const TEMPLATES = [
  { id: 'ats', label: 'ATS (untuk melamar kerja)', desc: 'Hitam-putih, satu kolom, judul bagian standar. Paling mudah dibaca sistem rekrutmen.' },
  { id: 'professional', label: 'Professional', desc: 'Satu kolom dengan aksen biru tua.' },
  { id: 'modern', label: 'Dua kolom', desc: 'Tanggal di kolom kiri, isi di kanan.' },
  { id: 'executive', label: 'Executive', desc: 'Serif, header di tengah. Kesan formal.' },
];

const INCLUDED = ['Nama, jabatan, dan bio (About)', 'Kontak, LinkedIn, GitHub', 'Pengalaman kerja', 'Pendidikan', 'Skills', 'Project (8 terbaru)', 'Sertifikat dan sertifikasi', 'Organisasi, penghargaan, bahasa', 'Bagian custom lainnya'];

interface Props {
  portfolio: DashboardPortfolio | null;
  setSections: (fn: (prev: Section[]) => Section[]) => void;
  loadPreview: () => void;
}

/** Error bodies come back as text (responseType "text"), so parse the JSON message ourselves. */
function cvErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') return 'Server terlalu lama merespons. Coba lagi.';
    const data: unknown = err.response?.data;
    if (typeof data === 'string') {
      try { const j = JSON.parse(data); if (j?.message) return String(j.message); } catch { /* not JSON */ }
    } else if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
    if (err.response?.status === 401) return 'Sesi kamu sudah habis. Masuk lagi lalu coba ulang.';
  }
  return getErrorMessage(err, 'Gagal membuat CV.');
}

export default function CVPanel({ portfolio, setSections, loadPreview }: Props) {
  const [cvTemplate, setCvTemplate] = useState('ats');
  const [busy, setBusy] = useState<null | 'pdf' | 'print'>(null);
  const [cvError, setCvError] = useState('');

  const handleApplied = async (newSections?: CvAppliedSection[]) => {
    setSections(prev => prev.map(s => s.type === 'hero' ? { ...s, enabled: true } : s));
    loadPreview();
    if (newSections && newSections.length > 0 && portfolio) {
      setSections(prev => {
        const updated = [...prev];
        newSections.forEach(s => {
          const exists = isCustomSectionKey(s)
            ? updated.find(sec => sec.label === s.replace('custom:', ''))
            : updated.find(sec => sec.type === s);
          if (exists) return;
          const label = isCustomSectionKey(s) ? s.replace('custom:', '') : s.charAt(0).toUpperCase() + s.slice(1);
          const icon = label.slice(0, 2).toUpperCase();
          const section: Section = isCustomSectionKey(s)
            ? { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type: 'custom', label, icon, enabled: true, deletable: true }
            : { id: `${s}-${Date.now()}`, type: s, label, icon, enabled: true, deletable: true };
          const orderKey = s.startsWith('custom:')
            ? 'custom-' + s.replace('custom:', '').toLowerCase().replace(/\s+/g, '-')
            : s;
          const targetIdx = SECTION_ORDER.indexOf(orderKey);
          if (targetIdx === -1) { updated.push(section); return; }
          for (let i = targetIdx + 1; i < SECTION_ORDER.length; i++) {
            const key = SECTION_ORDER[i];
            const idx = key.startsWith('custom-')
              ? updated.findIndex((item) => item.type === 'custom' && ('custom-' + item.label.toLowerCase().replace(/\s+/g, '-')) === key)
              : updated.findIndex((item) => item.type === key);
            if (idx !== -1) { updated.splice(idx, 0, section); return; }
          }
          updated.push(section);
        });
        localStorage.setItem('portfolio-sections', JSON.stringify(updated));
        if (portfolio) {
          api.put(`/api/portfolios/${portfolio.id}`, {
            title: portfolio.title, theme: portfolio.theme,
            is_published: portfolio.is_published, template: portfolio.template,
            sections_order: updated
          }).catch(() => {});
        }
        return updated;
      });
    }
  };

  const fetchCvHtml = async () => {
    const res = await api.get<string>(`/api/cv/generate?template=${encodeURIComponent(cvTemplate)}`, {
      responseType: 'text', timeout: 30000, transformResponse: (d) => d,
    });
    if (typeof res.data !== 'string' || !res.data.includes('cv-doc')) throw new Error('Respons server bukan dokumen CV.');
    return res.data;
  };

  // PDFs come from the browser's print engine ("Save as PDF"): the text stays real text, which applicant
  // tracking systems need. (html2pdf drew the CV as an image, so ATS saw an empty document.)
  // The window is opened synchronously so pop-up blockers allow it.
  const downloadPdf = async () => {
    setCvError('');
    const win = window.open('', '_blank');
    if (!win) { setCvError('Pop-up diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.'); return; }
    setBusy('pdf');
    try {
      const html = await fetchCvHtml();
      win.document.open();
      win.document.write(html);
      win.document.close();
      const print = () => { win.focus(); win.print(); };
      if (win.document.readyState === 'complete') setTimeout(print, 300);
      else win.addEventListener('load', () => setTimeout(print, 300), { once: true });
    } catch (err) {
      win.close();
      setCvError(cvErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // Browser print gives selectable text and exact margins (@page); open the tab synchronously so it isn't blocked.
  const openPrintable = async () => {
    setCvError('');
    const win = window.open('', '_blank');
    if (!win) { setCvError('Pop-up diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.'); return; }
    setBusy('print');
    try {
      const html = await fetchCvHtml();
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      win.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      win.close();
      setCvError(cvErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">CV</h2>
        <p className="mt-1 text-sm text-ink-soft">Isi portfolio dari CV yang sudah ada, atau buat CV PDF dari data portfolio.</p>

        <div className="mt-6"><CVUpload onApplied={handleApplied} /></div>

        <section className="mt-6 rounded-lg border border-rule bg-white" aria-labelledby="cv-generate-title">
          <div className="border-b border-rule px-5 py-4">
            <h3 id="cv-generate-title" className="text-sm font-semibold text-ink">Buat CV dari portfolio</h3>
            <p className="mt-0.5 text-[13px] text-ink-soft">CV dibuat dari data yang sudah tersimpan. Lengkapi dulu bagian yang masih kosong.</p>
          </div>

          <div className="grid gap-6 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink">Tata letak</legend>
              <div className="divide-y divide-rule rounded-md border border-rule">
                {TEMPLATES.map((t) => (
                  <label key={t.id} htmlFor={`cv-tpl-${t.id}`}
                    className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors ${cvTemplate === t.id ? 'bg-paper' : 'hover:bg-paper'}`}>
                    <input id={`cv-tpl-${t.id}`} type="radio" name="cv-template" value={t.id} checked={cvTemplate === t.id}
                      onChange={() => setCvTemplate(t.id)} className="mt-0.5 h-4 w-4 accent-[#1f45c9]" />
                    <span>
                      <span className="block text-sm font-medium text-ink">{t.label}</span>
                      <span className="block text-[13px] text-ink-soft">{t.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink">Yang dimasukkan</p>
              <ul className="space-y-1 text-[13px] text-ink-soft">
                {INCLUDED.map((item) => <li key={item} className="border-l border-rule pl-2.5">{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="space-y-3 border-t border-rule px-5 py-4">
            {cvError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">{cvError}</div>}
            {portfolio && !portfolio.is_published && (
              <div role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                Portfolio kamu belum terbit, jadi <b className="font-medium">link portfolio tidak dimasukkan ke CV</b>. Terbitkan dulu lewat tombol <b className="font-medium">Terbitkan</b> di bagian atas kalau ingin link-nya ikut tercantum, lalu unduh ulang CV-nya.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={downloadPdf} disabled={busy !== null}
                className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                {busy === 'pdf' ? 'Menyiapkan…' : 'Unduh PDF'}
              </button>
              <button type="button" onClick={openPrintable} disabled={busy !== null}
                className="rounded-md border border-rule bg-white px-3.5 py-2 text-sm text-ink transition-colors hover:border-ink-soft disabled:cursor-not-allowed disabled:opacity-60">
                {busy === 'print' ? 'Membuka…' : 'Buka versi cetak'}
              </button>
            </div>
            <p className="text-[12px] text-ink-soft">&ldquo;Unduh PDF&rdquo; membuka jendela cetak: pilih tujuan <b className="font-medium text-ink">Simpan sebagai PDF</b>. Hasilnya PDF berisi teks asli, jadi bisa dibaca sistem ATS saat melamar kerja. Matikan opsi &ldquo;Header dan footer&rdquo; di jendela cetak supaya tidak ada tanggal/URL di pinggir halaman.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
