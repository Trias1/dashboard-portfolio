'use client';
import type { Dispatch, SetStateAction } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { GitHubImportOptions, GitHubPreview } from '@/types';

interface Props {
  githubUsername: string;
  setGithubUsername: (v: string) => void;
  githubPreview: GitHubPreview | null;
  setGithubPreview: (v: GitHubPreview | null) => void;
  githubLoading: boolean;
  setGithubLoading: (v: boolean) => void;
  githubImporting: boolean;
  setGithubImporting: (v: boolean) => void;
  githubMsg: string;
  setGithubMsg: (v: string) => void;
  githubOptions: GitHubImportOptions;
  setGithubOptions: Dispatch<SetStateAction<GitHubImportOptions>>;
  selectedProjects: string[];
  setSelectedProjects: Dispatch<SetStateAction<string[]>>;
  loadPreview: () => void;
  onImport?: (sectionsImported: string[]) => void;
}

// Success messages start with this word; anything else is shown as an error.
// (The old check `githubMsg.includes('')` was always true, so errors were painted green.)
const SUCCESS_PREFIX = 'Berhasil';

const inputCls = 'w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10';

export default function GitHubPanel({ githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects, loadPreview, onImport }: Props) {
  const username = githubUsername.trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//i, '').replace(/\/.*$/, '');

  const handleSearch = async () => {
    if (!username) return;
    setGithubLoading(true); setGithubPreview(null); setGithubMsg('');
    try {
      const res = await api.get<GitHubPreview>(`/api/github/preview?username=${encodeURIComponent(username)}`);
      setGithubPreview(res.data);
      setSelectedProjects(res.data.projects.map((p) => p.name));
    } catch (err) { setGithubMsg(getApiErrorMessage(err, 'User GitHub tidak ditemukan.')); }
    finally { setGithubLoading(false); }
  };

  const handleImport = async () => {
    setGithubImporting(true); setGithubMsg('');
    try {
      const res = await api.post<{ imported: string[] }>('/api/github/import', { username, options: { ...githubOptions, selectedProjects } });
      const imported = res.data.imported || [];
      setGithubMsg(imported.length ? `${SUCCESS_PREFIX} mengimpor: ${imported.join(', ')}.` : `${SUCCESS_PREFIX}, tapi tidak ada data baru yang diimpor.`);
      loadPreview();
      if (onImport) onImport(imported);
    } catch (err) { setGithubMsg(getApiErrorMessage(err, 'Import gagal. Coba lagi.')); }
    finally { setGithubImporting(false); }
  };

  const isSuccess = githubMsg.startsWith(SUCCESS_PREFIX);
  const projects = githubPreview?.projects || [];
  const allSelected = projects.length > 0 && selectedProjects.length === projects.length;

  return (
    <div className="flex-1 overflow-auto bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Impor dari GitHub</h2>
        <p className="mt-1 text-sm text-ink-soft">Ambil bio, bahasa pemrograman, dan repositori publik dari profil GitHub.</p>

        <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (!githubLoading) handleSearch(); }}>
          <label htmlFor="github-username" className="mb-1.5 block text-sm font-medium text-ink">Username GitHub</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm text-ink-soft">github.com/</span>
              <input id="github-username" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)}
                autoComplete="off" spellCheck={false}
                className={`${inputCls} pl-[6.6rem] font-mono`} placeholder="username" />
            </div>
            <button type="submit" disabled={githubLoading || !username}
              className="shrink-0 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
              {githubLoading ? 'Mencari…' : 'Cari'}
            </button>
          </div>
          {githubMsg && !githubPreview && <p role="alert" className="mt-2 text-[13px] text-red-700">{githubMsg}</p>}
        </form>

        {githubPreview && (
          <div className="mt-6 space-y-6">
            <section className="rounded-lg border border-rule bg-white">
              <div className="flex items-start gap-4 border-b border-rule px-5 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- GitHub avatar, remote host not configured for next/image */}
                <img src={githubPreview.profile.avatar} alt={`Avatar ${githubPreview.profile.name}`} className="h-12 w-12 shrink-0 rounded-full border border-rule" />
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">{githubPreview.profile.name}</h3>
                  {githubPreview.profile.bio && <p className="mt-0.5 text-[13px] text-ink-soft">{githubPreview.profile.bio}</p>}
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-soft">
                    <span><span className="font-mono text-ink">{Number(githubPreview.profile.public_repos).toLocaleString("id-ID")}</span> repo</span>
                    <span><span className="font-mono text-ink">{Number(githubPreview.profile.followers).toLocaleString("id-ID")}</span> pengikut</span>
                    {githubPreview.profile.location && <span>{githubPreview.profile.location}</span>}
                  </p>
                </div>
              </div>

              {githubPreview.languages.length > 0 && (
                <div className="border-b border-rule px-5 py-3 text-[13px]">
                  <span className="text-ink-soft">Bahasa utama: </span>
                  <span className="text-ink">{githubPreview.languages.join(', ')}</span>
                </div>
              )}

              {projects.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <p className="text-[13px] text-ink-soft">
                      Repositori <span className="font-mono text-ink">{selectedProjects.length}/{projects.length}</span> dipilih
                    </p>
                    <button type="button"
                      onClick={() => setSelectedProjects(allSelected ? [] : projects.map((p) => p.name))}
                      className="text-[13px] text-accent underline-offset-2 hover:text-accent-dark hover:underline">
                      {allSelected ? 'Kosongkan' : 'Pilih semua'}
                    </button>
                  </div>
                  <ul className="max-h-80 divide-y divide-rule overflow-y-auto border-t border-rule">
                    {projects.map((p) => {
                      const id = `gh-repo-${p.name}`;
                      return (
                        <li key={p.name}>
                          <label htmlFor={id} className="flex cursor-pointer items-start gap-3 px-5 py-2.5 transition-colors hover:bg-paper">
                            <input id={id} type="checkbox" checked={selectedProjects.includes(p.name)}
                              onChange={(e) => { if (e.target.checked) setSelectedProjects((prev) => [...prev, p.name]); else setSelectedProjects((prev) => prev.filter((n) => n !== p.name)); }}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-[#1f45c9]" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-mono text-[13px] text-ink">{p.title}</span>
                              <span className="block truncate text-[13px] text-ink-soft">{p.description || 'Tanpa deskripsi'}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-3 text-xs text-ink-soft">
                              {p.tech_stack && <span>{p.tech_stack}</span>}
                              {p.stars > 0 && <span className="font-mono" title={`${p.stars} bintang`}>&#9733; {p.stars}</span>}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="px-5 py-4 text-[13px] text-ink-soft">Tidak ada repositori publik.</p>
              )}
            </section>

            <section className="rounded-lg border border-rule bg-white">
              <h3 className="border-b border-rule px-5 py-3 text-sm font-semibold text-ink">Yang diimpor</h3>
              <div className="divide-y divide-rule">
                {[
                  { key: 'bio' as const, label: 'Bio', desc: githubPreview.profile.bio || 'Profil ini tidak punya bio' },
                  { key: 'skills' as const, label: 'Skills dari bahasa pemrograman', desc: githubPreview.languages.join(', ') || 'Tidak ada' },
                  { key: 'projects' as const, label: `Project (${selectedProjects.length} repositori)`, desc: 'Repositori yang dicentang di atas' },
                ].map((opt) => (
                  <label key={opt.key} htmlFor={`gh-opt-${opt.key}`} className="flex cursor-pointer items-start gap-3 px-5 py-3">
                    <input id={`gh-opt-${opt.key}`} type="checkbox" checked={githubOptions[opt.key]}
                      onChange={(e) => setGithubOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 accent-[#1f45c9]" />
                    <span className="min-w-0">
                      <span className="block text-sm text-ink">{opt.label}</span>
                      <span className="block truncate text-[13px] text-ink-soft">{opt.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="space-y-3 border-t border-rule px-5 py-4">
                {githubMsg && (
                  <p role={isSuccess ? 'status' : 'alert'} className={`rounded-md border px-3 py-2 text-[13px] ${isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                    {githubMsg}
                  </p>
                )}
                <button type="button" onClick={handleImport}
                  disabled={githubImporting || !Object.values(githubOptions).some(Boolean) || (githubOptions.projects && !githubOptions.bio && !githubOptions.skills && selectedProjects.length === 0)}
                  className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
                  {githubImporting ? 'Mengimpor…' : 'Impor ke portfolio'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
