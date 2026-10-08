"use client";

import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";

interface NotifyStatus {
  accountEmail: string;
  email: string;
  verified: boolean;
  pending: boolean;
  expired: boolean;
  deliversTo: string;
}

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const smallBtn = "rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink disabled:opacity-50";

/** Where contact-form messages are delivered. A new address only takes effect after its owner confirms it. */
export default function NotifyEmailSettings() {
  const [status, setStatus] = useState<NotifyStatus | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await api.get<NotifyStatus>("/api/contact/notify-email");
      setStatus(res.data);
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => {
    let alive = true;
    api.get<NotifyStatus>("/api/contact/notify-email")
      .then((res) => { if (alive) setStatus(res.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const send = async (email: string) => {
    setBusy(true);
    setNote(null);
    try {
      const res = await api.post<{ verified?: boolean }>("/api/contact/notify-email", { email });
      setNote(res.data?.verified
        ? { tone: "ok", text: "That address is already confirmed." }
        : { tone: "ok", text: `Confirmation link sent to ${email}. Open it to start receiving messages there.` });
      setDraft("");
      await load();
    } catch (err) {
      setNote({ tone: "bad", text: getApiErrorMessage(err, "Couldn't send the confirmation email.") });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setNote(null);
    try {
      await api.delete("/api/contact/notify-email");
      setNote({ tone: "ok", text: "Messages go to your account email again." });
      await load();
    } catch (err) {
      setNote({ tone: "bad", text: getApiErrorMessage(err, "Couldn't change it.") });
    } finally {
      setBusy(false);
    }
  };

  if (!status) return null;

  return (
    <section className="rounded-md border border-rule bg-paper p-4" aria-labelledby="notify-email-title">
      <h3 id="notify-email-title" className="text-sm font-semibold text-ink">Contact form messages</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Delivered to <span className="font-medium text-ink">{status.deliversTo || "—"}</span>
        {status.verified ? " (confirmed)" : " (your account email)"}. Visitors never see this address.
      </p>

      {status.pending && (
        <div className="mt-3 rounded-md border border-dashed border-rule bg-white p-3 text-sm">
          <p className="text-ink">
            Waiting for confirmation: <span className="font-medium">{status.email}</span>
            {status.expired ? " — the link has expired." : ". Check that inbox for the link."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={smallBtn} disabled={busy} onClick={() => send(status.email)}>Resend link</button>
            <button type="button" className={smallBtn} disabled={busy} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      <form
        className="mt-3 flex flex-col gap-2"
        onSubmit={(e) => { e.preventDefault(); if (draft.trim()) void send(draft.trim()); }}
      >
        <label htmlFor="notify-email-input" className="sr-only">Send messages to another email</label>
        <input
          id="notify-email-input"
          type="email"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Send messages to another email…"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="self-start rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          Send confirmation link
        </button>
      </form>

      {status.verified && (
        <button type="button" className={`${smallBtn} mt-2`} disabled={busy} onClick={reset}>
          Use my account email instead
        </button>
      )}

      {note && (
        <p role="status" className={`mt-3 text-sm ${note.tone === "ok" ? "text-[#1d6b3a]" : "text-[#a3261f]"}`}>{note.text}</p>
      )}
    </section>
  );
}
