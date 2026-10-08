'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { getApiErrorMessage } from '@/lib/api';
import { localISODate } from '@/hooks/useDashboardAnalytics';
import type { VisitChartPoint, VisitStats } from '@/types';

const ACCENT = '#1f45c9';
const INK_SOFT = '#55555a';
const GRID = '#e6e6df';

function VisitorChart({ data }: { data: VisitChartPoint[] }) {
  const chartData = data.map((d) => ({
    // Dates are plain YYYY-MM-DD; format in UTC so the label never shifts a day.
    date: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
    visitor: Number(d.count) || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
        <XAxis dataKey="date" tick={{ fill: INK_SOFT, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={16} />
        <YAxis tick={{ fill: INK_SOFT, fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace' }} axisLine={false} tickLine={false} allowDecimals={false} width={44} />
        <Tooltip
          cursor={{ stroke: GRID }}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #dcdcd5', borderRadius: 6, boxShadow: 'none', fontSize: 12, color: '#141414' }}
          labelStyle={{ color: INK_SOFT, marginBottom: 2 }}
          formatter={(value) => [value, 'Kunjungan']}
        />
        <Line type="monotone" dataKey="visitor" stroke={ACCENT} strokeWidth={1.75} dot={false} activeDot={{ r: 3.5, fill: ACCENT, stroke: '#fff', strokeWidth: 1.5 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface Props {
  visits: VisitStats | null;
  setVisits: (v: VisitStats | null) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
}

const RANGES = [{ label: '7 hari', days: 7 }, { label: '30 hari', days: 30 }, { label: '90 hari', days: 90 }];

const inputCls = 'rounded-md border border-rule bg-white px-3 py-1.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10';

export default function AnalyticsPanel({ visits, setVisits, dateFrom, dateTo, setDateFrom, setDateTo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVisits = async (from?: string, to?: string) => {
    const f = from || dateFrom;
    const t = to || dateTo;
    if (f > t) { setError('Tanggal awal harus sebelum tanggal akhir.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.get<VisitStats>(`/api/portfolios/visits?from=${f}&to=${t}`);
      setVisits(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Data statistik gagal dimuat. Coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  const applyRange = (days: number) => {
    const from = new Date();
    from.setDate(from.getDate() - days);
    const f = localISODate(from);
    const t = localISODate(new Date());
    setDateFrom(f);
    setDateTo(t);
    fetchVisits(f, t);
  };

  const stats = visits ? [
    { label: 'Total kunjungan', value: visits.total },
    { label: 'Hari ini', value: visits.today },
    { label: '7 hari terakhir', value: visits.week },
  ] : [];
  const hasChart = !!visits?.chart?.length;

  return (
    <div className="flex-1 overflow-auto bg-paper">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Statistik</h2>
        <p className="mt-1 text-sm text-ink-soft">Kunjungan ke halaman portfolio yang sudah dipublikasikan.</p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="stats-from" className="mb-1 block text-xs text-ink-soft">Dari</label>
            <input id="stats-from" type="date" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="stats-to" className="mb-1 block text-xs text-ink-soft">Sampai</label>
            <input id="stats-to" type="date" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
          </div>
          <button type="button" onClick={() => fetchVisits()} disabled={loading}
            className="rounded-md bg-ink px-3.5 py-[7px] text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Memuat…' : 'Tampilkan'}
          </button>
          <div className="flex items-center gap-1 sm:ml-auto" role="group" aria-label="Rentang cepat">
            {RANGES.map((r) => (
              <button key={r.days} type="button" onClick={() => applyRange(r.days)} disabled={loading}
                className="rounded-md px-2.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-white hover:text-ink disabled:opacity-60">
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">{error}</div>}

        {visits ? (
          <div className="mt-6 space-y-6">
            <dl className="grid grid-cols-3 divide-x divide-rule rounded-lg border border-rule bg-white">
              {stats.map((s) => (
                <div key={s.label} className="px-4 py-4 sm:px-5">
                  <dt className="text-xs text-ink-soft">{s.label}</dt>
                  <dd className="mt-1 font-mono text-2xl tabular-nums text-ink sm:text-3xl">{Number(s.value || 0).toLocaleString('id-ID')}</dd>
                </div>
              ))}
            </dl>

            <section className="rounded-lg border border-rule bg-white px-4 py-4 sm:px-5" aria-labelledby="stats-chart-title">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="stats-chart-title" className="text-sm font-semibold text-ink">Kunjungan per hari</h3>
                <span className="font-mono text-xs text-ink-soft">{dateFrom} – {dateTo}</span>
              </div>
              {hasChart
                ? <VisitorChart data={visits.chart} />
                : <p className="py-10 text-center text-sm text-ink-soft">Belum ada kunjungan di rentang tanggal ini.</p>}
            </section>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-rule px-5 py-12 text-center">
            <p className="text-sm text-ink">{loading ? 'Memuat statistik…' : 'Belum ada data kunjungan.'}</p>
            {!loading && <p className="mt-1 text-[13px] text-ink-soft">Publikasikan portfolio kamu, lalu bagikan link-nya untuk mulai mencatat kunjungan.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
