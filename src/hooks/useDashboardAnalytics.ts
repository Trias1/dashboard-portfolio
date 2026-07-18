import { useCallback, useState } from 'react';
import api from '@/lib/api';

function initialDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function useDashboardAnalytics() {
  const [visits, setVisits] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState(() => initialDate(30));
  const [dateTo, setDateTo] = useState(() => initialDate());
  const fetchVisits = useCallback(async (from?: string, to?: string) => {
    try {
      const response = await api.get(`/api/portfolios/visits?from=${from || dateFrom}&to=${to || dateTo}`);
      setVisits(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [dateFrom, dateTo]);
  return { visits, setVisits, dateFrom, setDateFrom, dateTo, setDateTo, fetchVisits };
}
