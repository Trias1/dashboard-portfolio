'use client';
import { useState } from 'react';
import CVUpload from '@/components/builder/CVUpload';
import api from '@/lib/api';
import { Section, SECTION_ORDER } from '@/lib/sections';

interface Props {
  portfolio: any;
  setSections: (fn: (prev: Section[]) => Section[]) => void;
  loadPreview: () => void;
}

export default function CVPanel({ portfolio, setSections, loadPreview }: Props) {
  const [cvTemplate, setCvTemplate] = useState('professional');
  const [cvLoading, setCvLoading] = useState(false);

  const handleApplied = async (newSections?: string[]) => {
    setSections(prev => prev.map(s => s.type === 'hero' ? { ...s, enabled: true } : s));
    loadPreview();
    if (newSections && newSections.length > 0 && portfolio) {
      setSections(prev => {
        let updated = [...prev];
        newSections.forEach(s => {
          const exists = s.startsWith('custom:')
            ? updated.find(sec => sec.label === s.replace('custom:', ''))
            : updated.find(sec => sec.type === s);
          if (exists) return;
          const section = s.startsWith('custom:')
            ? { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type: 'custom' as any, label: s.replace('custom:', ''), icon: '', enabled: true, deletable: true }
            : { id: `${s}-${Date.now()}`, type: s as any, label: s.charAt(0).toUpperCase() + s.slice(1), icon: '', enabled: true, deletable: true };
          const orderKey = s.startsWith('custom:')
            ? 'custom-' + s.replace('custom:', '').toLowerCase().replace(/\s+/g, '-')
            : s;
          const targetIdx = SECTION_ORDER.indexOf(orderKey);
          if (targetIdx === -1) { updated.push(section); return; }
          for (let i = targetIdx + 1; i < SECTION_ORDER.length; i++) {
            const key = SECTION_ORDER[i];
            const idx = key.startsWith('custom-')
              ? updated.findIndex((item: any) => item.type === 'custom' && ('custom-' + item.label.toLowerCase().replace(/\s+/g, '-')) === key)
              : updated.findIndex((item: any) => item.type === key);
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

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6"><CVUpload onApplied={handleApplied} /></div>
        <h2 className="text-2xl font-bold text-white mb-2"> CV Generator</h2>
        <p className="text-gray-400 text-sm mb-8">Generate CV profesional dari data portfolio kamu. Hasil download berupa PDF siap pakai.</p>
        <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Pilih Template CV</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'professional', label: ' Professional', desc: 'ATS-friendly, single column' },
              { id: 'modern', label: ' Modern', desc: 'Dark header, accent blue' },
              { id: 'executive', label: ' Executive', desc: 'Serif font, formal & elegant' },
            ].map(t => (
              <button key={t.id} onClick={() => setCvTemplate(t.id)}
                className="p-4 rounded-xl border text-left transition-all"
                style={{ borderColor: cvTemplate === t.id ? '#a855f7' : '#1a1a3a', backgroundColor: cvTemplate === t.id ? '#a855f720' : 'transparent' }}>
                <p className="font-bold text-white text-sm mb-1">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Data yang akan masuk ke CV</h3>
          <div className="space-y-2 text-xs text-gray-400">
            {[
              { label: 'Nama & Title', icon: '' },
              { label: 'Bio/Summary', icon: '' },
              { label: 'Pengalaman Kerja', icon: '' },
              { label: 'Skills', icon: '' },
              { label: 'Projects', icon: '' },
              { label: 'Sertifikat', icon: '' },
              { label: 'Info Kontak', icon: '' },
              { label: 'Custom Sections', icon: '' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto text-green-400">OK</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">* Pastikan data portfolio sudah lengkap untuk hasil CV terbaik</p>
        </div>
        <div className="bg-[#0f0f2a] border border-cyan-900/30 rounded-2xl p-4 mb-6 text-xs text-gray-400 space-y-1">
          <p className="text-cyan-300 font-medium">Cara pakai paling aman</p>
          <p>1. Upload CV PDF di panel atas kalau mau auto-parse isi CV ke portfolio.</p>
          <p>2. Upload file resume di menu About kalau mau tampil tombol download resume di halaman portfolio.</p>
          <p>3. Download CV di sini untuk menghasilkan versi CV dari data portfolio yang sudah tersimpan.</p>
        </div>
        <button onClick={async () => {
          let pdfIframe: HTMLIFrameElement | null = null;
          setCvLoading(true);
          try {
            const res = await api.get(`/api/cv/generate?template=${cvTemplate}`, {
              responseType: 'blob', timeout: 30000
            });
            const html = await res.data.text();
            const { default: html2pdf } = await import('html2pdf.js');

            pdfIframe = document.createElement('iframe');
            pdfIframe.style.position = 'fixed';
            pdfIframe.style.top = '-9999px';
            pdfIframe.style.left = '-9999px';
            pdfIframe.style.width = '800px';
            pdfIframe.style.height = '1123px';
            document.body.appendChild(pdfIframe);

            const doc = pdfIframe.contentDocument || pdfIframe.contentWindow!.document;
            doc.open();
            doc.write(html);
            doc.close();

            await new Promise(r => requestAnimationFrame(r));

            await html2pdf()
              .set({
                margin: [15, 15, 15, 15],
                filename: `CV_${cvTemplate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: false, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              })
              .from(pdfIframe.contentDocument!.body)
              .save();
          } catch (err: any) {
            alert(' Gagal generate CV: ' + (err.response?.data?.message || err.message));
          } finally {
            if (pdfIframe?.parentNode) pdfIframe.parentNode.removeChild(pdfIframe);
            setCvLoading(false);
          }
        }} disabled={cvLoading}
          className="w-full py-4 rounded-xl font-semibold text-white transition disabled:opacity-50 text-sm"
          style={{ background: cvLoading ? '#555' : 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>
          {cvLoading ? ' Generating PDF...' : ' Download CV (PDF)'}
        </button>
      </div>
    </div>
  );
}
