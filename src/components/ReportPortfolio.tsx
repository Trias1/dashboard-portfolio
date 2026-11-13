'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Keep in step with REPORT_REASONS in src/app/api/public/[slug]/report/route.ts
const REASONS = [
  { value: 'spam', label: 'Spam, scam or misleading links' },
  { value: 'impersonation', label: "Pretends to be someone else, or uses someone's work" },
  { value: 'offensive', label: 'Offensive or harmful content' },
  { value: 'other', label: 'Something else' },
] as const;

/**
 * "Report this portfolio": a small flag button next to Share/QR. Neutral white styling like the QR card, so it
 * looks the same on every template. Sends to /api/public/[slug]/report; no account needed.
 */
export default function ReportPortfolio({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!reason) return setError('Pick a reason.');
    if (reason === 'other' && !details.trim()) return setError('Tell us briefly what is wrong.');
    setState('sending');
    try {
      const res = await fetch(`/api/public/${encodeURIComponent(slug)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.message === 'string' ? body.message : 'Your report could not be sent.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your report could not be sent.');
      setState('idle');
    }
  };

  return (
    <>
      {open && (
        <div ref={panelRef} role="dialog" aria-labelledby={titleId} className="absolute bottom-full left-0 mb-3 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl bg-white p-4 text-sm text-gray-900 shadow-2xl">
          {state === 'sent' ? (
            <div role="status">
              <p id={titleId} className="font-semibold">Thanks for letting us know.</p>
              <p className="mt-1 text-gray-600">An admin will look at this portfolio. You won&apos;t get a reply, and the owner isn&apos;t told who reported it.</p>
              <button type="button" onClick={() => { setOpen(false); buttonRef.current?.focus(); }} className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50">Close</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p id={titleId} className="font-semibold">Report this portfolio</p>
              <p className="mt-0.5 text-gray-600">What&apos;s wrong with it?</p>
              <fieldset className="mt-3 space-y-1.5">
                <legend className="sr-only">Reason</legend>
                {REASONS.map((r) => (
                  <label key={r.value} className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-gray-50">
                    <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="mt-0.5 accent-gray-900" />
                    <span>{r.label}</span>
                  </label>
                ))}
              </fieldset>
              <label htmlFor={`${titleId}-details`} className="mt-3 block text-gray-600">Details {reason === 'other' ? '' : '(optional)'}</label>
              <textarea id={`${titleId}-details`} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} rows={3}
                className="mt-1 w-full resize-none rounded-md border border-gray-300 px-2.5 py-1.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
              {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => { setOpen(false); buttonRef.current?.focus(); }} className="rounded-md px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={state === 'sending'} className="rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-black disabled:opacity-60">
                  {state === 'sending' ? 'Sending…' : 'Send report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <button ref={buttonRef} type="button" onClick={() => { setOpen((v) => !v); setState((s) => (s === 'sent' ? 'idle' : s)); }} aria-expanded={open} aria-label="Report this portfolio" title="Report this portfolio"
        className="grid h-12 w-12 place-items-center rounded-full bg-white text-gray-700 shadow-xl hover:text-gray-900">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M5 17V3.5 M5 4h9l-1.8 3.2L14 10.5H5" />
        </svg>
      </button>
    </>
  );
}
