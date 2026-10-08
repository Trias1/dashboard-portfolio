'use client';

import { useState, useRef } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { SectionType } from '@/lib/sections';
import type { JsonValue } from '@/types';

/** Section keys reported back after applying a CV: a builder section type, or `custom:<Title>`. */
export type CvAppliedSection = SectionType | `custom:${string}`;

interface ParsedCV {
  about: { name: string; title: string; bio: string };
  hero: { headline: string; subheadline: string };
  contact: { email: string; phone: string; location: string; linkedin: string; website: string };
  experiences: { company: string; position: string; start_date: string; end_date: string; description: string }[];
  education: { institution: string; degree: string; field: string; start_date: string; end_date: string; gpa: string }[];
  skills: { title: string; skills: string }[];
  projects: { title: string; customer?: string; assignmentBy?: string; startDate?: string; endDate?: string; status?: string; description: string; tech_stack: string; demo_url: string; github_url: string }[];
  certifications: { name: string; issuer: string; date: string; credential_url: string }[];
  // The keyword parser used to return plain strings here; the preview printed nothing for them.
  specializationAreas: ({ area: string; description: string } | string)[];
  languages: { language: string; proficiency: string }[];
  awards: { title: string; issuer: string; date: string; description: string }[];
  organizations: { name: string; role: string; start_date: string; end_date: string; description: string }[];
  customSections: { title: string; type: string; content?: { body?: string; [key: string]: JsonValue | undefined } | null }[];
  confidence?: number;
  warnings?: string[];
}

type SectionKey = 'experiences' | 'education' | 'skills' | 'projects' | 'certifications' | 'specializationAreas' | 'languages' | 'awards' | 'organizations' | 'customSections';
type SingleKey = 'about' | 'hero' | 'contact';

type CvApplyPayload = Partial<Pick<ParsedCV, SectionKey>> & {
  replace: boolean;
  about?: ParsedCV['about'];
  hero?: ParsedCV['hero'];
  contact?: ParsedCV['contact'];
};

const SECTION_KEYS: SectionKey[] = ['experiences', 'education', 'skills', 'projects', 'certifications', 'specializationAreas', 'languages', 'awards', 'organizations', 'customSections'];
const MAX_SIZE = 10 * 1024 * 1024;

const range = (a?: string, b?: string) => [a, b].filter(Boolean).join(' – ');

export default function CVUpload({ onApplied }: { onApplied?: (newSections?: CvAppliedSection[]) => void }) {
  const [step, setStep] = useState<'idle' | 'uploading' | 'preview' | 'applying' | 'done'>('idle');
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [charsExtracted, setCharsExtracted] = useState(0);
  const [aiUsed, setAiUsed] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [fileName, setFileName] = useState('');
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({});
  const [appliedSummary, setAppliedSummary] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const count = (arr: unknown[] | undefined | null) => arr?.length || 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setNotice('');
    if (file.size > MAX_SIZE) { setError('File terlalu besar (maksimal 10 MB).'); e.target.value = ''; return; }
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { setError('Unggah CV dalam format PDF.'); e.target.value = ''; return; }
    setFileName(file.name);
    setStep('uploading');
    try {
      const formData = new FormData();
      formData.append('cv', file);
      // Keyword parsing is fast; AI parsing can take a while, so allow up to 60s.
      // The shared axios instance defaults to JSON; multipart must be explicit (axios adds the boundary).
      const res = await api.post('/api/cv/parse', formData, { timeout: 60000, headers: { 'Content-Type': 'multipart/form-data' } });
      const data = res.data?.data as ParsedCV | undefined;
      if (!data) throw new Error('empty');
      for (const key of SECTION_KEYS) if (!Array.isArray(data[key])) (data[key] as unknown[]) = [];
      setParsed(data);
      setCharsExtracted(res.data.chars_extracted || 0);
      setAiUsed(res.data.ai_used === true);
      setNotice(typeof res.data.notice === 'string' ? res.data.notice : '');
      setRawText(res.data.raw_text_preview || '');

      const enabled: Record<string, boolean> = {
        about: !!(data.about?.name || data.about?.title || data.about?.bio),
        hero: !!(data.hero?.headline || data.hero?.subheadline),
        contact: !!(data.contact && Object.values(data.contact).some(Boolean)),
      };
      for (const key of SECTION_KEYS) enabled[key] = count(data[key]) > 0;
      setEnabledSections(enabled);
      setStep('preview');
    } catch (err) {
      setError(getApiErrorMessage(err, 'CV gagal dibaca. Periksa koneksi lalu coba lagi.'));
      setStep('idle');
    }
  };

  const toggleSection = (key: string) => setEnabledSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleApply = async () => {
    if (!parsed) return;
    setError('');
    setStep('applying');
    // Unticked sections are left out entirely so the server doesn't touch them (even in replace mode).
    const payload: CvApplyPayload = { replace: replaceMode };
    for (const key of ['about', 'hero', 'contact'] as SingleKey[]) {
      if (enabledSections[key]) (payload[key] as ParsedCV[SingleKey]) = parsed[key];
    }
    for (const key of SECTION_KEYS) {
      if (enabledSections[key] && count(parsed[key])) (payload[key] as unknown[]) = parsed[key];
    }
    try {
      const res = await api.post('/api/cv/apply', payload);
      const counts = res.data?.counts as Record<string, number> | undefined;
      const summary: string[] = [];
      if (counts) {
        if (counts.experience) summary.push(`${counts.experience} pengalaman`);
        if (counts.projects) summary.push(`${counts.projects} project`);
        if (counts.skills) summary.push(`${counts.skills} grup skill`);
        if (counts.custom) summary.push(`${counts.custom} entri lain`);
      }
      setAppliedSummary(summary);
      setStep('done');

      const newSections: CvAppliedSection[] = [];
      if (payload.experiences?.length) newSections.push('experience');
      if (payload.skills?.length) newSections.push('skills');
      if (payload.projects?.length) newSections.push('projects');
      if (payload.education?.length) newSections.push('custom:Education');
      if (payload.certifications?.length) newSections.push('custom:Certifications');
      if (payload.languages?.length) newSections.push('custom:Languages');
      if (payload.awards?.length) newSections.push('custom:Awards');
      if (payload.organizations?.length) newSections.push('custom:Organizations');
      if (payload.specializationAreas?.length) newSections.push('custom:Specialization Areas');
      payload.customSections?.forEach((cs) => { if (cs.title) newSections.push(`custom:${cs.title}`); });
      onApplied?.([...new Set(newSections)]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menyimpan ke portfolio. Coba lagi.'));
      setStep('preview');
    }
  };

  const reset = () => {
    setStep('idle');
    setParsed(null);
    setError('');
    setNotice('');
    setRawText('');
    setShowRaw(false);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const selectedCount = Object.values(enabledSections).filter(Boolean).length;

  return (
    <div className="rounded-lg border border-rule bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Impor dari CV</h3>
          <p className="mt-0.5 text-[13px] text-ink-soft">Unggah CV (PDF), periksa hasil bacaannya, lalu simpan ke bagian portfolio yang kamu pilih.</p>
        </div>
        {step === 'preview' && (
          <button type="button" onClick={reset} className="shrink-0 text-[13px] text-ink-soft underline-offset-2 hover:text-ink hover:underline">Ganti file</button>
        )}
      </div>

      <div className="space-y-4 px-5 py-4">
        {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">{error}</div>}

        {step === 'idle' && (
          <label htmlFor="cv-upload-input"
            className="flex cursor-pointer flex-col items-start gap-1 rounded-md border border-dashed border-rule bg-paper px-4 py-6 transition-colors hover:border-ink-soft focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10">
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M5 20h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Pilih file PDF
            </span>
            <span className="text-[13px] text-ink-soft">Maks. 10 MB. CV hasil ekspor Word/Google Docs terbaca paling baik; CV hasil scan tidak bisa dibaca.</span>
            <input id="cv-upload-input" ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleUpload} />
          </label>
        )}

        {step === 'uploading' && (
          <p className="flex items-center gap-2 py-4 text-sm text-ink-soft" role="status">
            <Spinner /> Membaca {fileName ? <span className="font-mono text-[13px] text-ink">{fileName}</span> : 'CV'}…
          </p>
        )}

        {step === 'preview' && parsed && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              {fileName && <span className="font-mono text-ink">{fileName}</span>}
              <span><span className="font-mono">{charsExtracted.toLocaleString('id-ID')}</span> karakter terbaca</span>
              <span>Dibaca dengan {aiUsed ? 'AI' : 'kata kunci'}</span>
              {typeof parsed.confidence === 'number' && <Confidence score={parsed.confidence} />}
            </div>

            {notice && <div role="status" className="rounded-md border border-rule bg-paper px-3 py-2 text-[13px] text-ink">{notice}</div>}

            {!!parsed.warnings?.length && (
              <ul className="space-y-0.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                {parsed.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            )}

            <p className="text-[13px] text-ink-soft">Centang bagian yang mau disimpan. Bagian yang tidak dicentang tidak diubah.</p>

            <div className="divide-y divide-rule rounded-md border border-rule">
              <Section id="about" title="Tentang" enabled={enabledSections.about} onToggle={() => toggleSection('about')}>
                <Row label="Nama" value={parsed.about?.name} />
                <Row label="Jabatan" value={parsed.about?.title} />
                <Row label="Bio" value={parsed.about?.bio} multiline />
              </Section>
              <Section id="hero" title="Hero" enabled={enabledSections.hero} onToggle={() => toggleSection('hero')}>
                <Row label="Headline" value={parsed.hero?.headline} />
                <Row label="Subheadline" value={parsed.hero?.subheadline} />
              </Section>
              <Section id="contact" title="Kontak" enabled={enabledSections.contact} onToggle={() => toggleSection('contact')}>
                <Row label="Email" value={parsed.contact?.email} mono />
                <Row label="Telepon" value={parsed.contact?.phone} mono />
                <Row label="Lokasi" value={parsed.contact?.location} />
                <Row label="LinkedIn" value={parsed.contact?.linkedin} mono />
                <Row label="Website" value={parsed.contact?.website} mono />
              </Section>

              <ArraySection id="experiences" title="Pengalaman" count={count(parsed.experiences)} enabled={enabledSections.experiences} onToggle={() => toggleSection('experiences')}>
                {parsed.experiences.map((e, i) => (
                  <Item key={i} title={[e.position, e.company].filter(Boolean).join(' · ') || '(tanpa judul)'} meta={range(e.start_date, e.end_date)} body={e.description} />
                ))}
              </ArraySection>
              <ArraySection id="education" title="Pendidikan" count={count(parsed.education)} enabled={enabledSections.education} onToggle={() => toggleSection('education')}>
                {parsed.education.map((e, i) => (
                  <Item key={i} title={e.institution || '(tanpa nama)'} meta={range(e.start_date, e.end_date)} body={[e.degree, e.field, e.gpa ? `IPK/GPA ${e.gpa}` : ''].filter(Boolean).join(', ')} />
                ))}
              </ArraySection>
              <ArraySection id="skills" title="Skills" count={count(parsed.skills)} enabled={enabledSections.skills} onToggle={() => toggleSection('skills')}>
                {parsed.skills.map((s, i) => (
                  <p key={i} className="text-[13px] text-ink"><span className="font-medium">{s.title || 'Skills'}:</span> <span className="text-ink-soft">{s.skills}</span></p>
                ))}
              </ArraySection>
              <ArraySection id="projects" title="Project" count={count(parsed.projects)} enabled={enabledSections.projects} onToggle={() => toggleSection('projects')}>
                {parsed.projects.map((p, i) => (
                  <Item key={i} title={p.title} meta={range(p.startDate, p.endDate)}
                    body={[p.customer && `Klien: ${p.customer}`, p.assignmentBy && `Penugasan: ${p.assignmentBy}`, p.status && `Status: ${p.status}`, p.tech_stack].filter(Boolean).join(' · ')} />
                ))}
              </ArraySection>
              <ArraySection id="certifications" title="Sertifikasi" count={count(parsed.certifications)} enabled={enabledSections.certifications} onToggle={() => toggleSection('certifications')}>
                {parsed.certifications.map((c, i) => <Item key={i} title={c.name} meta={c.date} body={c.issuer} />)}
              </ArraySection>
              <ArraySection id="specializationAreas" title="Spesialisasi" count={count(parsed.specializationAreas)} enabled={enabledSections.specializationAreas} onToggle={() => toggleSection('specializationAreas')}>
                {parsed.specializationAreas.map((s, i) => typeof s === 'string'
                  ? <Item key={i} title={s} />
                  : <Item key={i} title={s.area} body={s.description} />)}
              </ArraySection>
              <ArraySection id="languages" title="Bahasa" count={count(parsed.languages)} enabled={enabledSections.languages} onToggle={() => toggleSection('languages')}>
                {parsed.languages.map((l, i) => <Item key={i} title={l.language} meta={l.proficiency} />)}
              </ArraySection>
              <ArraySection id="awards" title="Penghargaan" count={count(parsed.awards)} enabled={enabledSections.awards} onToggle={() => toggleSection('awards')}>
                {parsed.awards.map((a, i) => <Item key={i} title={a.title} meta={a.date} body={a.issuer} />)}
              </ArraySection>
              <ArraySection id="organizations" title="Organisasi" count={count(parsed.organizations)} enabled={enabledSections.organizations} onToggle={() => toggleSection('organizations')}>
                {parsed.organizations.map((o, i) => <Item key={i} title={o.name} meta={range(o.start_date, o.end_date)} body={o.role} />)}
              </ArraySection>
              <ArraySection id="customSections" title="Bagian lain" count={count(parsed.customSections)} enabled={enabledSections.customSections} onToggle={() => toggleSection('customSections')}>
                {parsed.customSections.map((cs, i) => <Item key={i} title={cs.title} body={typeof cs.content?.body === 'string' ? cs.content.body : ''} />)}
              </ArraySection>
            </div>

            {rawText && (
              <div>
                <button type="button" onClick={() => setShowRaw(!showRaw)} aria-expanded={showRaw}
                  className="text-[13px] text-ink-soft underline-offset-2 hover:text-ink hover:underline">
                  {showRaw ? 'Sembunyikan' : 'Lihat'} teks mentah dari PDF
                </button>
                {showRaw && (
                  <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-rule bg-paper p-3 font-mono text-[11px] leading-relaxed text-ink-soft">{rawText}</pre>
                )}
              </div>
            )}

            <div className="space-y-3 border-t border-rule pt-4">
              <label htmlFor="cv-replace-mode" className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink">
                <input type="checkbox" id="cv-replace-mode" checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1f45c9]" />
                <span>
                  Ganti data lama di bagian yang dicentang
                  <span className="block text-ink-soft">Kalau tidak dicentang, data dari CV ditambahkan dan entri yang sama dilewati.</span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleApply} disabled={selectedCount === 0}
                  className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
                  Simpan ke portfolio
                </button>
                <button type="button" onClick={reset} className="rounded-md border border-rule bg-white px-3.5 py-2 text-sm text-ink transition-colors hover:border-ink-soft">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'applying' && (
          <p className="flex items-center gap-2 py-4 text-sm text-ink-soft" role="status"><Spinner /> Menyimpan ke portfolio…</p>
        )}

        {step === 'done' && (
          <div role="status" className="space-y-2 py-1">
            <p className="text-sm font-medium text-ink">Data dari CV sudah disimpan.</p>
            <p className="text-[13px] text-ink-soft">
              {appliedSummary.length ? `Ditambahkan: ${appliedSummary.join(', ')}. ` : ''}
              Buka bagian terkait di Builder untuk merapikan isinya.
            </p>
            <button type="button" onClick={reset} className="text-[13px] text-accent underline-offset-2 hover:text-accent-dark hover:underline">Impor CV lain</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function Spinner() {
  return <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-rule border-t-ink motion-reduce:animate-none" />;
}

function Confidence({ score }: { score: number }) {
  const label = score >= 80 ? 'tinggi' : score >= 50 ? 'sedang' : 'rendah';
  return <span>Keyakinan {label} <span className="font-mono">({score}%)</span></span>;
}

function Section({ id, title, children, enabled, onToggle }: { id: string; title: string; children: React.ReactNode; enabled?: boolean; onToggle?: () => void }) {
  return (
    <div className="px-3 py-3">
      <label htmlFor={`cv-sec-${id}`} className="flex cursor-pointer items-center gap-2.5">
        <input id={`cv-sec-${id}`} type="checkbox" checked={!!enabled} onChange={onToggle} className="h-4 w-4 accent-[#1f45c9]" />
        <span className="text-[13px] font-semibold text-ink">{title}</span>
      </label>
      <div className={`mt-2 space-y-1.5 pl-[26px] ${enabled ? '' : 'opacity-50'}`}>{children}</div>
    </div>
  );
}

function ArraySection({ id, title, count, children, enabled, onToggle }: { id: string; title: string; count: number; children: React.ReactNode; enabled?: boolean; onToggle?: () => void }) {
  if (!count) return null;
  return <Section id={id} title={`${title} · ${count}`} enabled={enabled} onToggle={onToggle}>{children}</Section>;
}

function Item({ title, meta, body }: { title?: string; meta?: string; body?: string }) {
  return (
    <div className="text-[13px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-ink">{title || '—'}</span>
        {meta && <span className="shrink-0 font-mono text-[11px] text-ink-soft">{meta}</span>}
      </div>
      {body && <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-ink-soft">{body}</p>}
    </div>
  );
}

function Row({ label, value, multiline, mono }: { label: string; value?: string; multiline?: boolean; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className={`text-[13px] ${multiline ? '' : 'flex gap-2'}`}>
      <span className="w-20 shrink-0 text-ink-soft">{label}</span>
      <span className={`text-ink ${multiline ? 'mt-0.5 block leading-relaxed' : 'min-w-0 break-words'} ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</span>
    </div>
  );
}
