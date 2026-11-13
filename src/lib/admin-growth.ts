/** Time buckets for the admin Overview charts. No imports so the tests can load it directly. All dates in UTC. */

const DAY = 864e5;
const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Start (00:00 UTC) of the Monday on or before `ms`. */
function mondayOf(ms: number) {
  const d = new Date(ms);
  const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return start - ((new Date(start).getUTCDay() + 6) % 7) * DAY;
}

/** One entry per day for the last `days` days (today included), zero-filled, oldest first. */
export function dayBuckets(dates: (string | null | undefined)[], days: number, now = Date.now()) {
  const today = Date.parse(dayKey(now));
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) buckets.set(dayKey(today - i * DAY), 0);
  for (const value of dates) {
    const ms = value ? Date.parse(value) : NaN;
    if (!Number.isFinite(ms)) continue;
    const key = dayKey(ms);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets].map(([date, count]) => ({ date, count }));
}

/** One entry per week (starting Monday) for the last `weeks` weeks (this week included), zero-filled. */
export function weekBuckets(dates: (string | null | undefined)[], weeks: number, now = Date.now()) {
  const thisWeek = mondayOf(now);
  const buckets = new Map<string, number>();
  for (let i = weeks - 1; i >= 0; i--) buckets.set(dayKey(thisWeek - i * 7 * DAY), 0);
  for (const value of dates) {
    const ms = value ? Date.parse(value) : NaN;
    if (!Number.isFinite(ms)) continue;
    const key = dayKey(mondayOf(ms));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets].map(([week, count]) => ({ week, count }));
}
