import { useCallback, useState } from 'react';
import api from '@/lib/api';
import type { VisitStats } from '@/types';

/** YYYY-MM-DD in the user's local time zone (toISOString() is UTC and gave "yesterday" before 07:00 WIB). */
export function localISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function initialDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return localISODate(date);
}

export function useDashboardAnalytics() {
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [dateFrom, setDateFrom] = useState(() => initialDate(30));
  const [dateTo, setDateTo] = useState(() => initialDate());
  const fetchVisits = useCallback(async (from?: string, to?: string) => {
    try {
      const response = await api.get<VisitStats>(`/api/portfolios/visits?from=${from || dateFrom}&to=${to || dateTo}`);
      setVisits(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [dateFrom, dateTo]);
  return { visits, setVisits, dateFrom, setDateFrom, dateTo, setDateTo, fetchVisits };
}
