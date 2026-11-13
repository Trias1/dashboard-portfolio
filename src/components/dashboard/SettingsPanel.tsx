'use client';

import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import { buttonQuiet, input, SudoPrompt } from '@/components/dashboard/UsersPanelParts';

type Announcement = { text: string; level: 'info' | 'warning' };
type Settings = { signupsOpen: boolean; aiEnabled: boolean; announcement: Announcement | null; reservedSlugs: string[] };
type Loaded = { settings: Settings; missingTable: boolean; aiAllowedByDeploy: boolean; cacheSeconds: number };

const card = 'rounded-lg border border-rule bg-white p-5';

/** On/off switch drawn as a button with aria-pressed; the state is also written out next to it. */
function Switch({ label, on, disabled, onChange }: { label: string; on: boolean; disabled?: boolean; onChange: (next: boolean) => void }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? 'bg-accent' : 'bg-[#c9c9c2]'}`}>
      <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const warning = announcement.level === 'warning';
  return (
    <div role="status" className={`rounded-md border px-3 py-2 text-sm ${warning ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-[#c9d3f2] bg-[#eef2fc] text-ink'}`}>
      <span className="font-medium">{warning ? 'Heads up: ' : 'Note: '}</span>{announcement.text}
    </div>
  );
}

export default function SettingsPanel() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [level, setLevel] = useState<'info' | 'warning'>('info');
  const [slugs, setSlugs] = useState('');
  const [inUse, setInUse] = useState<string[]>([]);
  const [needsSudo, setNeedsSudo] = useState(false);

  const apply = (loaded: Loaded) => {
    setData(loaded);
    setText(loaded.settings.announcement?.text || '');
    setLevel(loaded.settings.announcement?.level || 'info');
    setSlugs(loaded.settings.reservedSlugs.join('\n'));
  };
  useEffect(() => {
    let cancelled = false;
    api.get<Loaded>('/api/admin/settings')
      .then((res) => { if (!cancelled) apply(res.data); })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, 'Settings could not be loaded.')); });
    return () => { cancelled = true; };
  }, []);

  const save = async (name: keyof Settings, value: unknown, done: string) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await api.put<{ value: unknown; inUse: string[] }>('/api/admin/settings', { name, value });
      setData((current) => current && { ...current, settings: { ...current.settings, [name]: res.data.value } });
      if (name === 'reservedSlugs') { setInUse(res.data.inUse || []); setSlugs(((res.data.value as string[]) || []).join('\n')); }
      setNotice(`${done} Visitors see it within ${data?.cacheSeconds ?? 30} seconds.`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'That setting could not be saved.'));
    } finally { setBusy(false); }
  };

  const download = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await fetch('/api/admin/backup', { credentials: 'same-origin' });
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (body.needsSudo) { setNeedsSudo(true); return; }
        throw new Error(body.message || 'Forbidden');
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'The backup could not be made.');
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || 'portfoliokit-backup.json';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setNotice(`Saved ${name}. Keep it somewhere private: it holds every member's data.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The backup could not be made.');
    } finally { setBusy(false); }
  };

  const s = data?.settings;
  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="mt-1 text-sm text-ink-soft">Switches that take effect without a redeploy.</p>
        </div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {busy && !needsSudo && <p role="status" className="rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink-soft">Working…</p>}
        {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>}
        {data?.missingTable && <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">Run <span className="font-mono">supabase/migrations/010_app_settings.sql</span> in Supabase to save settings. Until then the defaults below apply.</p>}
        {!data && !error && <p className="text-sm text-ink-soft">Loading…</p>}

        {s && (
          <>
            <section className={`${card} divide-y divide-rule py-1`}>
              <div className="flex items-start justify-between gap-6 py-4">
                <div>
                  <h3 className="text-sm font-medium">New accounts</h3>
                  <p className="mt-0.5 text-sm text-ink-soft">{s.signupsOpen ? 'Anyone can sign up.' : 'Closed: sign-up and first-time Google sign-in are refused. Existing members can still log in.'}</p>
                </div>
                <Switch label="Allow new accounts" on={s.signupsOpen} disabled={busy} onChange={(v) => save('signupsOpen', v, v ? 'Sign-ups are open.' : 'Sign-ups are closed.')} />
              </div>
              <div className="flex items-start justify-between gap-6 py-4">
                <div>
                  <h3 className="text-sm font-medium">AI assistant</h3>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {!data.aiAllowedByDeploy ? 'Off for this deployment (NEXT_PUBLIC_AI_ENABLED is not true), so this switch has no effect.'
                      : s.aiEnabled ? 'The Advisor and the visitor chat are on.' : 'Off: the Advisor and the visitor chat are hidden. Turn it off while the AI provider is down.'}
                  </p>
                </div>
                <Switch label="AI assistant on" on={s.aiEnabled} disabled={busy} onChange={(v) => save('aiEnabled', v, v ? 'AI assistant is on.' : 'AI assistant is off.')} />
              </div>
            </section>

            <section className={card}>
              <h3 className="text-sm font-medium">Announcement</h3>
              <p className="mt-0.5 text-sm text-ink-soft">A banner at the top of every member&apos;s dashboard, e.g. planned maintenance.</p>
              <label htmlFor="announcement-text" className="mt-3 block text-xs font-medium text-ink-soft">Message</label>
              <textarea id="announcement-text" rows={2} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} className={`mt-1 resize-none ${input}`} placeholder="Maintenance tonight 22:00–22:30 WIB; saving may fail for a few minutes." />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <fieldset className="flex gap-3 text-sm">
                  <legend className="sr-only">Tone</legend>
                  {(['info', 'warning'] as const).map((l) => (
                    <label key={l} className="flex items-center gap-1.5"><input type="radio" name="announcement-level" checked={level === l} onChange={() => setLevel(l)} className="accent-ink" />{l === 'info' ? 'Note' : 'Heads up'}</label>
                  ))}
                </fieldset>
                <div className="ml-auto flex gap-2">
                  {s.announcement && <button type="button" disabled={busy} onClick={() => { setText(''); void save('announcement', null, 'Announcement removed.'); }} className={buttonQuiet}>Remove</button>}
                  <button type="button" disabled={busy || !text.trim()} onClick={() => save('announcement', { text, level }, 'Announcement saved.')} className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-black disabled:opacity-50">Save</button>
                </div>
              </div>
              {text.trim() && <div className="mt-3"><p className="mb-1 text-xs text-ink-soft">Preview</p><AnnouncementBanner announcement={{ text: text.trim(), level }} /></div>}
            </section>

            <section className={card}>
              <h3 className="text-sm font-medium">Reserved slugs</h3>
              <p className="mt-0.5 text-sm text-ink-soft">Addresses nobody can pick for their portfolio, one per line. Built in already: demo, admin, api, dashboard, login, register, settings and a few more.</p>
              <label htmlFor="reserved-slugs" className="sr-only">Reserved slugs</label>
              <textarea id="reserved-slugs" rows={4} value={slugs} onChange={(e) => setSlugs(e.target.value)} className={`mt-3 font-mono ${input}`} placeholder={'support\nhelp\nofficial'} />
              <div className="mt-2 flex justify-end">
                <button type="button" disabled={busy} onClick={() => save('reservedSlugs', slugs.split(/[\s,]+/).filter(Boolean), 'Reserved slugs saved.')} className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-black disabled:opacity-50">Save</button>
              </div>
              {inUse.length > 0 && <p className="mt-2 text-sm text-amber-900">Already in use, left as they are: {inUse.map((x) => `/${x}`).join(', ')}. Only new picks are blocked.</p>}
            </section>
          </>
        )}

        <section className={card}>
          <h3 className="text-sm font-medium">Backup</h3>
          <p className="mt-0.5 text-sm text-ink-soft">Every table as one JSON file. Password hashes and login tokens are left out, contact messages stay encrypted, and uploaded files are not included (only their links). It holds every member&apos;s data, so keep it private.</p>
          {needsSudo ? (
            <div className="mt-3"><SudoPrompt onCancel={() => setNeedsSudo(false)} onConfirmed={() => { setNeedsSudo(false); void download(); }} /></div>
          ) : (
            <button type="button" disabled={busy} onClick={download} className={`mt-3 ${buttonQuiet}`}>{busy ? 'Working…' : 'Download backup'}</button>
          )}
        </section>
      </div>
    </div>
  );
}
