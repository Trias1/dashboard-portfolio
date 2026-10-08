import { useCallback, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { AdminStats, ManagedUser, VercelLogEntry } from '@/types';

export function useDashboardAdmin() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [vercelLogs, setVercelLogs] = useState<VercelLogEntry[]>([]);
  const [vercelLogsLoading, setVercelLogsLoading] = useState(false);
  const [vercelLogsError, setVercelLogsError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get<ManagedUser[]>('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await api.get<AdminStats>('/api/admin/stats');
      setAdminStats(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchVercelLogs = useCallback(async () => {
    setVercelLogsLoading(true);
    setVercelLogsError('');
    try {
      const response = await api.get<VercelLogEntry[]>('/api/admin/vercel-logs');
      setVercelLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setVercelLogsError(getApiErrorMessage(error, 'Unable to load Vercel logs'));
    } finally {
      setVercelLogsLoading(false);
    }
  }, []);

  return { users, adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchUsers, fetchAdminStats, fetchVercelLogs };
}
