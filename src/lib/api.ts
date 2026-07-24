import axios from 'axios';

let memoryToken: string | null = null;
let memoryUser: any = null;

export const setToken = (token: string | null) => { memoryToken = token; };
export const getToken = () => memoryToken;
export const getApiErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
export const setUser = (user: any) => {
  memoryUser = user;
  if (user) localStorage.setItem('user', JSON.stringify({ role: user.role }));
  else localStorage.removeItem('user');
};
export const getUser = () => {
  if (memoryUser) return memoryUser;
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (memoryToken) config.headers.Authorization = `Bearer ${memoryToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        memoryToken = res.data.accessToken;
        original.headers.Authorization = `Bearer ${memoryToken}`;
        return api(original);
      } catch {
        memoryToken = null;
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const initAuth = async (): Promise<boolean> => {
  try {
    const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
    memoryToken = res.data.accessToken;
    return true;
  } catch { memoryToken = null; return false; }
};

export default api;