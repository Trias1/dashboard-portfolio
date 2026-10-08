'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminStats, PresenceUser } from '@/types';

const card = 'rounded-lg border border-rule bg-white';
const cardTitle = 'text-sm font-medium text-ink';

function StatusDot({ on }: { on: boolean }) {
  return <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-600' : 'bg-[#b0b0a8]'}`} />;
}

export default function AdminOverviewPanel({ stats, onRefresh }: { stats: AdminStats | null; onRefresh: () => void }) {
  const templates = Object.entries(stats?.templateCounts || {}).map(([template, count]) => ({ template, count }));
  const cards: [string, number][] = [
    ['Users', stats?.users ?? 0],
    ['Portfolios', stats?.portfolios ?? 0],
    ['Published', stats?.published ?? 0],
    ['Draft', stats?.draft ?? 0],
  ];
  const onlineUsers: PresenceUser[] = stats?.onlineUsers || [];
  const offlineUsers: PresenceUser[] = stats?.offlineUsers || [];

  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Overview</h2>
            <p className="mt-1 text-sm text-ink-soft">Counts straight from the database.</p>
          </div>
          <button type="button" onClick={onRefresh} className="rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-soft">Refresh</button>
        </div>

        <dl className={`${card} grid grid-cols-2 md:grid-cols-4`}>
          {cards.map(([label, value], index) => (
            <div key={label} className={`px-5 py-4 ${index % 2 === 1 ? 'border-l border-rule' : ''} ${index >= 2 ? 'border-t border-rule md:border-t-0' : ''} ${index === 2 ? 'md:border-l' : ''}`}>
              <dt className="text-xs text-ink-soft">{label}</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${card} p-5`}>
            <h3 className={`${cardTitle} mb-4`}>Portfolios by template</h3>
            {templates.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={templates}>
                  <CartesianGrid stroke="#e6e6df" vertical={false} />
                  <XAxis dataKey="template" tick={{ fill: '#55555a', fontSize: 11 }} axisLine={{ stroke: '#dcdcd5' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#55555a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#efefe9' }} contentStyle={{ background: '#ffffff', border: '1px solid #dcdcd5', borderRadius: 6, fontSize: 12, color: '#141414' }} />
                  <Bar dataKey="count" fill="#1f45c9" radius={[2, 2, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-20 text-center text-sm text-ink-soft">No portfolio data.</p>}
          </section>
          <section className={`${card} p-5`}>
            <h3 className={`${cardTitle} mb-2`}>Recent portfolios</h3>
            <div className="divide-y divide-rule">
              {(stats?.recentPortfolios || []).map((portfolio) => (
                <div key={portfolio.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{portfolio.title || portfolio.slug}</p>
                    <p className="truncate font-mono text-xs text-ink-soft">{portfolio.template || 'modern'} · {portfolio.slug}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-soft"><StatusDot on={!!portfolio.is_published} />{portfolio.is_published ? 'Published' : 'Draft'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className={`${card} p-5`}>
          <h3 className={cardTitle}>Presence</h3>
          <div className="mt-3 flex gap-8">
            <div><p className="flex items-center gap-1.5 text-xs text-ink-soft"><StatusDot on />Online now</p><p className="mt-1 font-mono text-2xl tabular-nums">{stats?.usersOnline ?? 0}</p></div>
            <div><p className="flex items-center gap-1.5 text-xs text-ink-soft"><StatusDot on={false} />Offline</p><p className="mt-1 font-mono text-2xl tabular-nums">{stats?.usersOffline ?? 0}</p></div>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 border-b border-rule pb-2 text-xs font-medium text-ink-soft">Online</p>
              {onlineUsers.length ? onlineUsers.map((user) => (
                <div key={user.id} className="flex justify-between border-b border-rule py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-ink">{user.name || "Unnamed user"}</p>
                    <p className="truncate text-xs text-ink-soft">{user.email}</p>
                    <p className="font-mono text-[11px] text-ink-soft">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                  </div>
                  <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-xs text-emerald-700"><StatusDot on />Active now</span>
                </div>
              )) : <p className="py-2 text-sm text-ink-soft">No users online.</p>}
            </div>
            <div>
              <p className="mb-1 border-b border-rule pb-2 text-xs font-medium text-ink-soft">Offline</p>
              {offlineUsers.length ? offlineUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="border-b border-rule py-2 text-sm">
                  <p className="truncate text-ink">{user.name || "Unnamed user"}</p>
                  <p className="truncate text-xs text-ink-soft">{user.email}</p>
                  <p className="font-mono text-[11px] text-ink-soft">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                  <p className="font-mono text-[11px] text-ink-soft">{user.last_seen_at ? `Last seen ${new Date(user.last_seen_at).toLocaleString()}` : 'Never seen'}</p>
                </div>
              )) : <p className="py-2 text-sm text-ink-soft">No users offline.</p>}
            </div>
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h3 className={cardTitle}>Login devices</h3>
          <div className="mt-2 divide-y divide-rule">
            {[...onlineUsers, ...offlineUsers].slice(0, 10).map((user) => (
              <div key={`device-${user.id}`} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{user.name || "Unnamed user"}</p>
                  <p className="truncate text-xs text-ink-soft">{user.email}</p>
                </div>
                <span className="max-w-[50%] truncate font-mono text-xs text-ink-soft">{user.last_device || "Unknown device"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
