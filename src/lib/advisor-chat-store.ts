/**
 * Keeps the dashboard Advisor conversation for the browser tab (sessionStorage, one key per account), so it
 * survives switching dashboard menus and reloads, and is gone when the tab closes or the user logs out.
 * Nothing is sent to the server. Storage can be blocked (private mode, quotas), so every call is best-effort.
 */
const PREFIX = 'advisor-chat:';
const MAX_MESSAGES = 40;

export interface StoredChat<M> {
  messages: M[];
  score: { score: number; total: number } | null;
}

const keyFor = (userId: number | string) => `${PREFIX}${userId}`;

export function loadAdvisorChat<M extends { role: string; content: string }>(userId: number | string | undefined): StoredChat<M> | null {
  if (userId === undefined || typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredChat<M>>;
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages.filter((m): m is M => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      : [];
    if (!messages.length) return null;
    const s = parsed.score;
    const score = s && Number.isFinite(s.score) && Number.isFinite(s.total) ? { score: s.score, total: s.total } : null;
    return { messages, score };
  } catch {
    return null;
  }
}

export function saveAdvisorChat<M>(userId: number | string | undefined, chat: StoredChat<M>): void {
  if (userId === undefined || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(keyFor(userId), JSON.stringify({ ...chat, messages: chat.messages.slice(-MAX_MESSAGES) }));
  } catch {}
}

export function clearAdvisorChats(userId?: number | string): void {
  if (typeof window === 'undefined') return;
  try {
    const store = window.sessionStorage;
    if (userId !== undefined) { store.removeItem(keyFor(userId)); return; }
    for (let i = store.length - 1; i >= 0; i--) {
      const key = store.key(i);
      if (key?.startsWith(PREFIX)) store.removeItem(key);
    }
  } catch {}
}
