'use client';
import { useState } from 'react';

export interface PagerState<T> {
  items: T[];
  page: number;
  /** Position of the first shown item in the full list (for numbering). */
  start: number;
  pages: number;
  setPage: (page: number) => void;
  /** Section to bring back into view when the page changes. */
  anchor: string;
}

/** Show `perPage` items at a time. */
export function usePager<T>(all: T[], perPage: number, anchor: string): PagerState<T> {
  const [page, setPageState] = useState(0);
  const pages = Math.max(1, Math.ceil(all.length / perPage));
  const current = Math.min(page, pages - 1);
  const setPage = (next: number) => {
    setPageState(Math.max(0, Math.min(next, pages - 1)));
    const el = typeof document !== 'undefined' ? document.getElementById(anchor) : null;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return { items: all.slice(current * perPage, current * perPage + perPage), page: current, start: current * perPage, pages, setPage, anchor };
}

/** Previous / page numbers / next. Takes the surrounding text colour so it fits any template. */
export default function Pager<T>({ pager, className = '' }: { pager: PagerState<T>; className?: string }) {
  const { page, pages, setPage } = pager;
  if (pages <= 1) return null;
  const faint = { borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' };
  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-35';
  return (
    <nav aria-label="Projects pages" className={`mt-8 flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <button type="button" className={btn} style={faint} onClick={() => setPage(page - 1)} disabled={page === 0}>
        ← Prev
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1}`}
          aria-current={i === page ? 'page' : undefined}
          className={`${btn} ${i === page ? 'font-bold' : 'opacity-70 hover:opacity-100'}`}
          style={i === page ? { borderColor: 'currentColor', borderWidth: 2 } : faint}
          onClick={() => setPage(i)}
        >
          {i + 1}
        </button>
      ))}
      <button type="button" className={btn} style={faint} onClick={() => setPage(page + 1)} disabled={page === pages - 1}>
        Next →
      </button>
    </nav>
  );
}
