'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminStats } from '@/types';

const card = 'rounded-lg border border-rule bg-white p-5';
const ACCENT = '#1f45c9';
const axisTick = { fill: '#55555a', fontSize: 11 };
const tooltipStyle = { background: '#ffffff', border: '1px solid #dcdcd5', borderRadius: 6, fontSize: 12, color: '#141414' };

const shortDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Status colours (good / neutral / warning / critical), always shown with the name and the count. */
const STATUS_PARTS = [
  { key: 'live', label: 'Live', color: '#0ca30c', text: '#ffffff' },
  { key: 'draft', label: 'Draft', color: '#b0b0a8', text: '#141414' },
  { key: 'owner-inactive', label: 'Hidden (owner inactive)', color: '#fab219', text: '#141414' },
  { key: 'taken-down', label: 'Taken down', color: '#d03b3b', text: '#ffffff' },
] as const;

/** One whole split into parts: a tall segmented bar instead of a pie, with a legend that doubles as the table. */
function StatusBar({ share }: { share: NonNullable<AdminStats['statusShare']> }) {
  const total = STATUS_PARTS.reduce((sum, part) => sum + share[part.key], 0);
  if (!total) return <p className="text-sm text-ink-soft">No portfolios yet.</p>;
  const described = STATUS_PARTS.filter((p) => share[p.key] > 0).map((p) => `${p.label} ${share[p.key]}`).join(', ');
  return (
    <div>
      <div role="img" aria-label={`Portfolio status: ${described}`} className="flex h-7 gap-0.5">
        {STATUS_PARTS.filter((part) => share[part.key] > 0).map((part) => {
          const pct = (share[part.key] / total) * 100;
          return (
            <div key={part.key} title={`${part.label}: ${share[part.key]} (${Math.round(pct)}%)`} className="flex items-center overflow-hidden rounded px-2 font-mono text-[11px]"
              style={{ width: `${pct}%`, backgroundColor: part.color, color: part.text }}>
              {pct >= 12 ? `${Math.round(pct)}%` : ''}
            </div>
          );
        })}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {STATUS_PARTS.map((part) => (
          <div key={part.key} className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-ink-soft"><span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ backgroundColor: part.color }} />{part.label}</dt>
            <dd className="font-mono tabular-nums text-ink">{share[part.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SingleBars({ data, xKey, label, format }: { data: Record<string, unknown>[]; xKey: string; label: string; format: (v: string) => string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap={2} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#e6e6df" vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={format} tick={axisTick} axisLine={{ stroke: '#dcdcd5' }} tickLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={40} />
        <Tooltip cursor={{ fill: '#efefe9' }} contentStyle={tooltipStyle} labelFormatter={(v) => format(String(v))} formatter={(v) => [v, label]} />
        <Bar dataKey="count" name={label} fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminGrowthSection({ stats }: { stats: AdminStats | null }) {
  if (!stats?.visitsByDay) return null;
  const top = stats.topPortfolios || [];
  const topMax = Math.max(1, ...top.map((t) => t.visits));
  const signups12 = (stats.signupsByWeek || []).reduce((sum, w) => sum + w.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h3 className="text-sm font-medium text-ink">Visits per day</h3>
          <p className="mb-3 text-xs text-ink-soft">All portfolios, last 30 days · <span className="font-mono tabular-nums text-ink">{stats.visits30 ?? 0}</span> visits</p>
          <SingleBars data={stats.visitsByDay} xKey="date" label="Visits" format={shortDay} />
        </section>
        <section className={card}>
          <h3 className="text-sm font-medium text-ink">Sign-ups per week</h3>
          <p className="mb-3 text-xs text-ink-soft">Last 12 weeks · <span className="font-mono tabular-nums text-ink">{signups12}</span> new accounts</p>
          <SingleBars data={stats.signupsByWeek || []} xKey="week" label="Sign-ups" format={(w) => `wk ${shortDay(w)}`} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={card}>
          <h3 className="mb-3 text-sm font-medium text-ink">Portfolio status</h3>
          {stats.statusShare && <StatusBar share={stats.statusShare} />}
        </section>
        <section className={card}>
          <h3 className="text-sm font-medium text-ink">Most visited</h3>
          <p className="mb-3 text-xs text-ink-soft">Last 30 days</p>
          {top.length ? (
            <ol className="space-y-2.5">
              {top.map((t) => (
                <li key={t.slug}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <a href={`/portfolio/${t.slug}`} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-xs text-accent underline-offset-2 hover:text-accent-dark hover:underline">/{t.slug}</a>
                    <span className="font-mono text-xs tabular-nums text-ink">{t.visits}</span>
                  </div>
                  <div aria-hidden="true" className="mt-1 h-1 rounded-full bg-[#e3e8f7]"><div className="h-1 rounded-full" style={{ width: `${(t.visits / topMax) * 100}%`, backgroundColor: ACCENT }} /></div>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-ink-soft">No visits in the last 30 days.</p>}
        </section>
        <section className={card}>
          <h3 className="text-sm font-medium text-ink">Contact messages</h3>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-ink">{stats.messages30 ?? 0}</p>
          <p className="mt-1 text-xs text-ink-soft">sent through portfolio contact forms in the last 30 days. Only the count is shown here: what people wrote stays in each owner&apos;s own inbox.</p>
        </section>
      </div>
    </div>
  );
}
