'use client';
import api from '@/lib/api';

interface Props {
  githubUsername: string;
  setGithubUsername: (v: string) => void;
  githubPreview: any;
  setGithubPreview: (v: any) => void;
  githubLoading: boolean;
  setGithubLoading: (v: boolean) => void;
  githubImporting: boolean;
  setGithubImporting: (v: boolean) => void;
  githubMsg: string;
  setGithubMsg: (v: string) => void;
  githubOptions: { bio: boolean; skills: boolean; projects: boolean };
  setGithubOptions: (v: any) => void;
  selectedProjects: string[];
  setSelectedProjects: (v: any) => void;
  loadPreview: () => void;
  onImport?: (sectionsImported: string[]) => void;
}

export default function GitHubPanel({ githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects, loadPreview, onImport }: Props) {
  const handleSearch = async () => {
    if (!githubUsername) return;
    setGithubLoading(true); setGithubPreview(null); setGithubMsg('');
    try {
      const res = await api.get(`/api/github/preview?username=${githubUsername}`);
      setGithubPreview(res.data);
      setSelectedProjects(res.data.projects.map((p: any) => p.name));
    } catch (err: any) { setGithubMsg(' ' + (err.response?.data?.message || 'User tidak ditemukan')); }
    finally { setGithubLoading(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2"> GitHub Import</h2>
        <p className="text-gray-400 text-sm mb-6">Import data dari GitHub profile kamu  -  bio, skills, dan projects otomatis masuk ke portfolio!</p>
        <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Username</label>
          <div className="flex gap-3">
            <input value={githubUsername} onChange={e => setGithubUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !githubLoading && handleSearch()}
              className="flex-1 bg-[#1a1a3a] border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="contoh: torvalds" />
            <button onClick={handleSearch} disabled={githubLoading || !githubUsername}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition font-medium">
              {githubLoading ? '' : ' Cari'}
            </button>
          </div>
          {githubMsg && !githubPreview && <p className="mt-3 text-sm text-red-400">{githubMsg}</p>}
        </div>

        {githubPreview && (
          <div className="space-y-4">
            <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <img src={githubPreview.profile.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-purple-500" />
                <div>
                  <h3 className="text-lg font-bold text-white">{githubPreview.profile.name}</h3>
                  {githubPreview.profile.bio && <p className="text-sm text-gray-400 mt-1">{githubPreview.profile.bio}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span> {githubPreview.profile.public_repos} repos</span>
                    <span> {githubPreview.profile.followers} followers</span>
                    {githubPreview.profile.location && <span> {githubPreview.profile.location}</span>}
                  </div>
                </div>
              </div>
              {githubPreview.languages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Top Languages:</p>
                  <div className="flex flex-wrap gap-2">
                    {githubPreview.languages.map((l: string) => (
                      <span key={l} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {githubPreview.projects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Pilih projects ({selectedProjects.length}/{githubPreview.projects.length} dipilih):</p>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProjects(githubPreview.projects.map((p: any) => p.name))} className="text-xs text-purple-400 hover:text-purple-300">Pilih Semua</button>
                      <span className="text-gray-600">|</span>
                      <button onClick={() => setSelectedProjects([])} className="text-xs text-gray-400 hover:text-gray-300">Reset</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {githubPreview.projects.map((p: any, i: number) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-[#1a1a3a] rounded-lg cursor-pointer hover:bg-[#1a1a4a] transition">
                        <input type="checkbox" checked={selectedProjects.includes(p.name)}
                          onChange={e => { if (e.target.checked) setSelectedProjects((prev: string[]) => [...prev, p.name]); else setSelectedProjects((prev: string[]) => prev.filter((n: string) => n !== p.name)); }}
                          className="accent-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate">{p.description || 'Tidak ada deskripsi'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.tech_stack && <span className="text-xs text-gray-500">{p.tech_stack}</span>}
                          {p.stars > 0 && <span className="text-xs text-yellow-500">{p.stars}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Pilih yang mau diimport:</h3>
              <div className="space-y-3 mb-6">
                {[
                  { key: 'bio', label: 'Bio/Deskripsi', desc: githubPreview.profile.bio || 'Tidak ada bio' },
                  { key: 'skills', label: 'Skills (dari languages)', desc: githubPreview.languages.join(', ') || 'Tidak ada' },
                  { key: 'projects', label: `Projects (${selectedProjects.length} dipilih)`, desc: 'GitHub repositories yang kamu centang' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={githubOptions[opt.key as keyof typeof githubOptions]}
                      onChange={e => setGithubOptions((prev: any) => ({...prev, [opt.key]: e.target.checked}))}
                      className="mt-1 accent-purple-500" />
                    <div>
                      <p className="text-sm text-white font-medium">{opt.label}</p>
                      <p className="text-xs text-gray-500 truncate max-w-md">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {githubMsg && <p className="mb-3 text-sm" style={{ color: githubMsg.includes('') ? '#22c55e' : '#ef4444' }}>{githubMsg}</p>}
              <button onClick={async () => {
                setGithubImporting(true); setGithubMsg('');
                try {
                  const res = await api.post('/api/github/import', { username: githubUsername, options: { ...githubOptions, selectedProjects } });
                  setGithubMsg(` Berhasil import: ${res.data.imported.join(', ')}!`);
                  loadPreview();
                  if (onImport) onImport(res.data.imported || []);
                } catch (err: any) { setGithubMsg(' ' + (err.response?.data?.message || 'Import gagal')); }
                finally { setGithubImporting(false); }
              }} disabled={githubImporting || !Object.values(githubOptions).some(Boolean)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition text-sm">
                {githubImporting ? ' Mengimport...' : ' Import ke Portfolio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
