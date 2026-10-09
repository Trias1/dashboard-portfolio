"use client";

import { useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";

interface InboxMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const when = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
};

const btn = "rounded-md border border-rule bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink disabled:opacity-50";

/** Messages visitors sent through the contact form on the public portfolio. */
export default function InboxPanel({ onUnreadChange }: { onUnreadChange?: (unread: number) => void }) {
  const [messages, setMessages] = useState<InboxMessage[] | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let alive = true;
    api.get<InboxMessage[]>("/api/contact/messages")
      .then((res) => { if (alive) setMessages(res.data); })
      .catch((err) => { if (alive) setError(getApiErrorMessage(err, "Couldn't load your messages.")); });
    return () => { alive = false; };
  }, []);

  const unread = useMemo(() => (messages || []).filter((m) => !m.is_read).length, [messages]);
  useEffect(() => { if (messages) onUnreadChange?.(unread); }, [unread, messages, onUnreadChange]);

  const shown = (messages || []).filter((m) => filter === "all" || !m.is_read);
  const open = (messages || []).find((m) => m.id === openId) || null;

  const setRead = async (m: InboxMessage, isRead: boolean) => {
    setMessages((prev) => prev && prev.map((x) => (x.id === m.id ? { ...x, is_read: isRead } : x)));
    try { await api.patch(`/api/contact/messages/${m.id}`, { is_read: isRead }); }
    catch { setMessages((prev) => prev && prev.map((x) => (x.id === m.id ? { ...x, is_read: !isRead } : x))); }
  };

  const select = (m: InboxMessage) => {
    setOpenId(m.id);
    setConfirmDelete(false);
    if (!m.is_read) void setRead(m, true);
  };

  const remove = async (m: InboxMessage) => {
    setBusy(true);
    try {
      await api.delete(`/api/contact/messages/${m.id}`);
      setMessages((prev) => prev && prev.filter((x) => x.id !== m.id));
      setOpenId(null);
      setConfirmDelete(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't delete the message."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Inbox</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Messages from the contact form on your portfolio{messages ? ` · ${messages.length} total, ${unread} unread` : ""}.
          </p>
        </div>
        <div role="radiogroup" aria-label="Show" className="inline-flex overflow-hidden rounded-md border border-rule bg-white text-sm">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} type="button" role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 capitalize transition-colors ${filter === f ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mx-5 mt-4 rounded-md border border-[#e9b9b4] bg-[#fbeeec] px-3 py-2 text-sm text-[#a3261f] sm:mx-6">{error}</p>}

      {!messages && !error && <p className="px-6 py-10 text-sm text-ink-soft" role="status">Loading messages…</p>}

      {messages && messages.length === 0 && (
        <div className="px-6 py-14 text-center">
          <p className="font-medium">No messages yet</p>
          <p className="mt-1 text-sm text-ink-soft">When someone uses the contact form on your published portfolio, it shows up here and in your email.</p>
        </div>
      )}

      {messages && messages.length > 0 && (
        <div className="flex min-h-0 flex-1">
          {/* List */}
          <ul className={`min-h-0 w-full overflow-y-auto border-rule md:w-[340px] md:shrink-0 md:border-r ${open ? "hidden md:block" : ""}`} aria-label="Messages">
            {shown.length === 0 && <li className="px-5 py-8 text-sm text-ink-soft">No unread messages.</li>}
            {shown.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => select(m)} aria-current={openId === m.id ? "true" : undefined}
                  className={`flex w-full gap-3 border-b border-rule px-5 py-3.5 text-left transition-colors ${openId === m.id ? "bg-white" : "hover:bg-white/60"}`}>
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.is_read ? "bg-transparent" : "bg-accent"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${m.is_read ? "text-ink" : "font-semibold text-ink"}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-ink-soft">{when(m.created_at)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-soft">{m.message}</span>
                    {!m.is_read && <span className="sr-only">Unread</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Reading pane */}
          <section className={`min-h-0 flex-1 overflow-y-auto ${open ? "" : "hidden md:block"}`} aria-label="Message">
            {!open ? (
              <p className="px-6 py-14 text-center text-sm text-ink-soft">Pick a message to read it.</p>
            ) : (
              <article className="px-5 py-5 sm:px-8 sm:py-7">
                <button type="button" onClick={() => setOpenId(null)} className="mb-4 text-sm text-ink-soft hover:text-ink md:hidden">← All messages</button>
                <h3 className="font-display text-xl font-semibold tracking-tight">{open.name}</h3>
                <p className="mt-0.5 text-sm text-ink-soft">
                  <a href={`mailto:${open.email}`} className="underline-offset-4 hover:underline">{open.email}</a>
                  {" · "}
                  {new Date(open.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="mt-5 max-w-[68ch] whitespace-pre-wrap break-words leading-relaxed text-ink">{open.message}</p>

                <div className="mt-7 flex flex-wrap items-center gap-2">
                  <a className="rounded-md bg-ink px-3.5 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-black"
                    href={`mailto:${encodeURIComponent(open.email)}?subject=${encodeURIComponent("Re: your message on my portfolio")}`}>
                    Reply by email
                  </a>
                  <button type="button" className={btn} onClick={() => setRead(open, !open.is_read)}>
                    Mark as {open.is_read ? "unread" : "read"}
                  </button>
                  {!confirmDelete ? (
                    <button type="button" className={btn} onClick={() => setConfirmDelete(true)}>Delete</button>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-ink-soft">Delete this message?</span>
                      <button type="button" disabled={busy} onClick={() => remove(open)}
                        className="rounded-md bg-[#a3261f] px-3 py-1.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                        Delete
                      </button>
                      <button type="button" className={btn} onClick={() => setConfirmDelete(false)}>Keep</button>
                    </span>
                  )}
                </div>
              </article>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
