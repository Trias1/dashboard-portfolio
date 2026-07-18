'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';

interface ParsedCV {
  about: { name: string; title: string; bio: string };
  hero: { headline: string; subheadline: string };
  contact: { email: string; phone: string; location: string; linkedin: string; website: string };
  experiences: { company: string; position: string; start_date: string; end_date: string; description: string }[];
  education: { institution: string; degree: string; field: string; start_date: string; end_date: string; gpa: string }[];
  skills: { title: string; skills: string }[];
  projects: { title: string; customer?: string; assignmentBy?: string; startDate?: string; endDate?: string; status?: string; description: string; tech_stack: string; demo_url: string; github_url: string }[];
  certifications: { name: string; issuer: string; date: string; credential_url: string }[];
  specializationAreas: { area: string; description: string }[];
  languages: { language: string; proficiency: string }[];
  awards: { title: string; issuer: string; date: string; description: string }[];
  organizations: { name: string; role: string; start_date: string; end_date: string; description: string }[];
  customSections: { title: string; type: string; content: any }[];
  confidence: number;
  warnings: string[];
}

type SectionKey = 'experiences' | 'education' | 'skills' | 'projects' | 'certifications' | 'specializationAreas' | 'languages' | 'awards' | 'organizations' | 'customSections';

const SECTION_LABELS: Record<string, string> = {
  experiences: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  specializationAreas: 'Specialization',
  languages: 'Languages',
  awards: 'Awards',
  organizations: 'Organizations',
  customSections: 'Other',
};

export default function CVUpload({ onApplied }: { onApplied?: (newSections?: string[]) => void }) {
  const [step, setStep] = useState<'idle'|'uploading'|'preview'|'applying'|'done'>('idle');
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [error, setError] = useState('');
  const [charsExtracted, setCharsExtracted] = useState(0);
  const [aiUsed, setAiUsed] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const count = (arr: any[] | undefined | null) => arr?.length || 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setStep('uploading');
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const res = await api.post('/api/cv/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data.data as ParsedCV;
      setParsed(data);
      setCharsExtracted(res.data.chars_extracted || 0);
      setAiUsed(res.data.ai_used !== false);
      setRawText(res.data.raw_text_preview || '');

      // Enable sections that have data
      const enabled: Record<string, boolean> = { about: true, hero: true, contact: true };
      for (const key of Object.keys(SECTION_LABELS)) {
        const arr = (data as any)[key];
        enabled[key] = Array.isArray(arr) && arr.length > 0;
      }
      setEnabledSections(enabled);
      setStep('preview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      setStep('idle');
    }
  };

  const toggleSection = (key: string) => {
    setEnabledSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = async () => {
    if (!parsed) return;
    setStep('applying');
    console.log('[CV Upload] Before apply  -  payload counts:', {
      education: parsed.education?.length || 0,
      certifications: parsed.certifications?.length || 0,
      specializationAreas: parsed.specializationAreas?.length || 0,
      languages: parsed.languages?.length || 0,
      awards: parsed.awards?.length || 0,
      organizations: parsed.organizations?.length || 0,
      experiences: parsed.experiences?.length || 0,
      skills: parsed.skills?.length || 0,
      projects: parsed.projects?.length || 0,
      customSections: parsed.customSections?.length || 0,
    });
    try {
      // Build payload with only enabled sections
      const payload: any = {
        replace: replaceMode,
        about: enabledSections.about ? parsed.about : undefined,
        hero: enabledSections.hero ? parsed.hero : undefined,
        contact: enabledSections.contact ? parsed.contact : undefined,
        experiences: enabledSections.experiences ? parsed.experiences : [],
        education: enabledSections.education ? parsed.education : [],
        skills: enabledSections.skills ? parsed.skills : [],
        projects: enabledSections.projects ? parsed.projects : [],
        certifications: enabledSections.certifications ? parsed.certifications : [],
        specializationAreas: enabledSections.specializationAreas ? parsed.specializationAreas : [],
        languages: enabledSections.languages ? parsed.languages : [],
        awards: enabledSections.awards ? parsed.awards : [],
        organizations: enabledSections.organizations ? parsed.organizations : [],
        customSections: enabledSections.customSections ? parsed.customSections : [],
      };

      console.log('[CV Upload] Apply payload counts:', {
        education: payload.education?.length || 0,
        certifications: payload.certifications?.length || 0,
        specializationAreas: payload.specializationAreas?.length || 0,
        languages: payload.languages?.length || 0,
        awards: payload.awards?.length || 0,
        organizations: payload.organizations?.length || 0,
        experiences: payload.experiences?.length || 0,
        skills: payload.skills?.length || 0,
        projects: payload.projects?.length || 0,
      });

      await api.post('/api/cv/apply', payload);
      setStep('done');

      const newSections: string[] = [];
      if (payload.experiences?.length) newSections.push('experience');
      if (payload.skills?.length) newSections.push('skills');
      if (payload.projects?.length) newSections.push('projects');
      if (payload.education?.length) newSections.push('custom:Education');
      if (payload.certifications?.length) newSections.push('custom:Certifications');
      if (payload.languages?.length) newSections.push('custom:Languages');
      if (payload.awards?.length) newSections.push('custom:Awards');
      if (payload.organizations?.length) newSections.push('custom:Organizations');
      if (payload.specializationAreas?.length) newSections.push('custom:Specialization Areas');
      if (payload.customSections?.length) {
        payload.customSections.forEach((cs: any) => newSections.push(`custom:${cs.title}`));
      }
      onApplied?.(newSections);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Apply failed');
      setStep('preview');
    }
  };

  const reset = () => {
    setStep('idle');
    setParsed(null);
    setError('');
    setRawText('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h3 className="text-white font-semibold text-sm">CV to Portfolio</h3>
          <p className="text-gray-400 text-xs">Upload PDF CV &rarr; AI parse &rarr; review &rarr; apply</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-lg px-3 py-2">{error}</div>
      )}

      {step === 'idle' && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg p-6 cursor-pointer transition-colors">
          <span className="text-3xl mb-2"></span>
          <span className="text-gray-300 text-sm font-medium">Klik untuk upload CV (PDF)</span>
          <span className="text-gray-500 text-xs mt-1">Max 10MB  -  Semua profesi didukung</span>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {step === 'uploading' && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Extracting & parsing CV dengan AI...</p>
        </div>
      )}

      {step === 'preview' && parsed && (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-green-400 text-xs">{charsExtracted} karakter diekstrak{aiUsed ? ' (AI)' : ' (fallback)'}</span>
            <div className="flex items-center gap-2">
              <ConfidenceBadge score={parsed.confidence} />
              <button onClick={reset} className="text-gray-500 text-xs hover:text-gray-300">Reset</button>
            </div>
          </div>

          {/* Warnings */}
          {parsed.warnings?.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-lg px-3 py-2 space-y-0.5">
              {parsed.warnings.map((w, i) => (
                <p key={i} className="text-yellow-300 text-xs"> {w}</p>
              ))}
            </div>
          )}

          {/* About */}
          <Section title="About" enabled={enabledSections.about} onToggle={() => toggleSection('about')}>
            <Row label="Name" value={parsed.about?.name} />
            <Row label="Title" value={parsed.about?.title} />
            <Row label="Bio" value={parsed.about?.bio} multiline />
          </Section>

          {/* Hero */}
          <Section title="Hero" enabled={enabledSections.hero} onToggle={() => toggleSection('hero')}>
            <Row label="Headline" value={parsed.hero?.headline} />
            <Row label="Subheadline" value={parsed.hero?.subheadline} />
          </Section>

          {/* Contact */}
          <Section title="Contact" enabled={enabledSections.contact} onToggle={() => toggleSection('contact')}>
            <Row label="Email" value={parsed.contact?.email} />
            <Row label="Phone" value={parsed.contact?.phone} />
            <Row label="Location" value={parsed.contact?.location} />
            <Row label="LinkedIn" value={parsed.contact?.linkedin} />
            <Row label="Website" value={parsed.contact?.website} />
          </Section>

          {/* Experiences */}
          <ArraySection title="Experience" count={count(parsed.experiences)} enabled={enabledSections.experiences} onToggle={() => toggleSection('experiences')}>
            {parsed.experiences?.map((e, i) => (
              <div key={i} className="text-xs text-gray-300 border-l-2 border-purple-700 pl-2 mb-2">
                <div className="font-medium">{e.position || '?'}{e.company ? ` @ ${e.company}` : ''}</div>
                <div className="text-gray-500">{e.start_date && e.end_date ? `${e.start_date}  -  ${e.end_date}` : e.start_date || e.end_date || ''}</div>
                {e.description && <div className="text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{e.description}</div>}
              </div>
            ))}
          </ArraySection>

          {/* Education */}
          <ArraySection title="Education" count={count(parsed.education)} enabled={enabledSections.education} onToggle={() => toggleSection('education')}>
            {parsed.education?.map((e, i) => (
              <div key={i} className="text-xs text-gray-300 border-l-2 border-blue-700 pl-2 mb-2">
                <div className="font-medium">{e.institution || '?'}</div>
                <div className="text-gray-500">{[e.degree, e.field].filter(Boolean).join('  -  ') || ''}</div>
                {e.start_date && <div className="text-gray-500">{e.start_date}{e.end_date ? `  -  ${e.end_date}` : ''}</div>}
              </div>
            ))}
          </ArraySection>

          {/* Skills */}
          <ArraySection title="Skills" count={count(parsed.skills)} enabled={enabledSections.skills} onToggle={() => toggleSection('skills')}>
            {parsed.skills?.map((s, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="text-purple-400 font-medium">{s.title}:</span> {s.skills}
              </div>
            ))}
          </ArraySection>

          {/* Projects */}
          <ArraySection title="Projects" count={count(parsed.projects)} enabled={enabledSections.projects} onToggle={() => toggleSection('projects')}>
            {parsed.projects?.map((p, i) => (
              <div key={i} className="text-xs text-gray-300 border-l-2 border-cyan-700 pl-2 mb-2">
                <div className="font-medium">{p.title}</div>
                {p.customer && <div className="text-gray-500">Client: {p.customer}</div>}
                {p.assignmentBy && <div className="text-gray-500">Assignment: {p.assignmentBy}</div>}
                {(p.startDate || p.endDate) && <div className="text-gray-500">{p.startDate}{p.startDate && p.endDate ? '  -  ' : ''}{p.endDate}</div>}
                {p.status && <div className="text-gray-500">Status: {p.status}</div>}
                {p.tech_stack && <div className="text-gray-500">{p.tech_stack}</div>}
              </div>
            ))}
          </ArraySection>

          {/* Certifications */}
          <ArraySection title="Certifications" count={count(parsed.certifications)} enabled={enabledSections.certifications} onToggle={() => toggleSection('certifications')}>
            {parsed.certifications?.map((c, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="font-medium">{c.name}</span>
                {c.issuer && <span className="text-gray-500">  -  {c.issuer}</span>}
                {c.date && <span className="text-gray-500"> ({c.date})</span>}
              </div>
            ))}
          </ArraySection>

          {/* Specialization Areas */}
          <ArraySection title="Specialization" count={count(parsed.specializationAreas)} enabled={enabledSections.specializationAreas} onToggle={() => toggleSection('specializationAreas')}>
            {parsed.specializationAreas?.map((s, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="text-purple-400 font-medium">{s.area}</span>
                {s.description && <span className="text-gray-500">  -  {s.description}</span>}
              </div>
            ))}
          </ArraySection>

          {/* Languages */}
          <ArraySection title="Languages" count={count(parsed.languages)} enabled={enabledSections.languages} onToggle={() => toggleSection('languages')}>
            {parsed.languages?.map((l, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="font-medium">{l.language}</span>
                {l.proficiency && <span className="text-gray-500"> ({l.proficiency})</span>}
              </div>
            ))}
          </ArraySection>

          {/* Awards */}
          <ArraySection title="Awards" count={count(parsed.awards)} enabled={enabledSections.awards} onToggle={() => toggleSection('awards')}>
            {parsed.awards?.map((a, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="font-medium">{a.title}</span>
                {a.issuer && <span className="text-gray-500">  -  {a.issuer}</span>}
                {a.date && <span className="text-gray-500"> ({a.date})</span>}
              </div>
            ))}
          </ArraySection>

          {/* Organizations */}
          <ArraySection title="Organizations" count={count(parsed.organizations)} enabled={enabledSections.organizations} onToggle={() => toggleSection('organizations')}>
            {parsed.organizations?.map((o, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="font-medium">{o.name}</span>
                {o.role && <span className="text-gray-500">  -  {o.role}</span>}
              </div>
            ))}
          </ArraySection>

          {/* Custom Sections */}
          <ArraySection title="Other Sections" count={count(parsed.customSections)} enabled={enabledSections.customSections} onToggle={() => toggleSection('customSections')}>
            {parsed.customSections?.map((cs, i) => (
              <div key={i} className="text-xs text-gray-300 mb-1">
                <span className="text-purple-400 font-medium">{cs.title}</span>
                {cs.content?.body && <div className="text-gray-400 mt-0.5 line-clamp-2">{cs.content.body}</div>}
              </div>
            ))}
          </ArraySection>

          {/* Raw text debug */}
          {rawText && (
            <div className="bg-gray-950 rounded-lg overflow-hidden">
              <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 w-full text-left">
                <span>{showRaw ? '' : ''}</span> Raw extracted text ({rawText.length} chars)
              </button>
              {showRaw && (
                <pre className="px-3 pb-2 text-[10px] text-gray-500 max-h-40 overflow-y-auto whitespace-pre-wrap break-all font-mono">{rawText}</pre>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="replaceMode" checked={replaceMode} onChange={e => setReplaceMode(e.target.checked)} className="accent-purple-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="replaceMode" className="text-xs text-gray-400 cursor-pointer">
                Replace mode  -  hapus data lama sebelum import <span className="text-yellow-500">(tidak disarankan)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleApply} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                disabled={!Object.values(enabledSections).some(v => v)}>
                OK Apply ke Portfolio
              </button>
              <button onClick={reset} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'applying' && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Menyimpan data ke portfolio...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-4 gap-3">
          <span className="text-4xl"></span>
          <p className="text-green-400 text-sm font-medium">Portfolio berhasil diupdate!</p>
          <p className="text-gray-500 text-xs text-center">Refresh halaman untuk melihat perubahan</p>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-200 underline">Upload CV lain</button>
        </div>
      )}
    </div>
  );
}

/* --- Sub-components --- */

function ConfidenceBadge({ score }: { score: number }) {
  let color = 'bg-red-600';
  let label = 'Low';
  if (score >= 80) { color = 'bg-green-600'; label = 'High'; }
  else if (score >= 50) { color = 'bg-yellow-600'; label = 'Medium'; }
  return (
    <span className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full ${color}`}>
      {label} ({score}%)
    </span>
  );
}

function Section({ title, children, enabled, onToggle }: { title: string; children: React.ReactNode; enabled?: boolean; onToggle?: () => void }) {
  return (
    <div className={`bg-gray-800/60 rounded-lg p-3 ${enabled === false ? 'opacity-40' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-purple-400 text-xs font-semibold uppercase tracking-wide">{title}</div>
        {onToggle && (
          <button onClick={onToggle} className="text-[10px] text-gray-500 hover:text-gray-300">
            {enabled ? 'OK aktif' : ' lewati'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ArraySection({ title, count, children, enabled, onToggle }: { title: string; count: number; children: React.ReactNode; enabled?: boolean; onToggle?: () => void }) {
  if (!count) return null;
  return <Section title={`${title} (${count})`} enabled={enabled} onToggle={onToggle}>{children}</Section>;
}

function Row({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div className="mb-1">
      <span className="text-gray-500 text-xs">{label}: </span>
      <span className={`text-gray-300 text-xs ${multiline ? 'block mt-0.5 leading-relaxed' : ''}`}>{value}</span>
    </div>
  );
}
