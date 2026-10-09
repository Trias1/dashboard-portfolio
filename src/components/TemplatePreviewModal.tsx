'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface PreviewTemplate { id: string; name: string; desc: string }

const THEMES = [
  { id: 'dark-space', label: 'Dark' },
  { id: 'white', label: 'Light' },
] as const;

/**
 * Live preview of one template with sample content, opened from the landing page list.
 * Nothing loads until it opens; only one preview iframe exists at a time and it is dropped on close.
 * Uses the native <dialog> for focus handling, Esc to close and an inert page behind it.
 */
export default function TemplatePreviewModal({
  templates, index, onIndexChange, onClose,
}: {
  templates: PreviewTemplate[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [theme, setTheme] = useState<(typeof THEMES)[number]['id']>('dark-space');
  const [loadedSrc, setLoadedSrc] = useState('');
  const open = index !== null;
  const current = open ? templates[index] : null;
  const src = current ? `/portfolio/demo?preview=true&template=${current.id}&theme=${theme}&demo=alex` : '';

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Left/right arrows step through the templates while the preview is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndexChange((index! + 1) % templates.length);
      if (e.key === 'ArrowLeft') onIndexChange((index! - 1 + templates.length) % templates.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, templates.length, onIndexChange]);

  const step = (d: number) => onIndexChange(((index ?? 0) + d + templates.length) % templates.length);
  const navBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-rule bg-white text-ink transition-colors hover:border-ink';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-labelledby="tpl-preview-title"
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-paper p-0 text-ink backdrop:bg-ink/60 sm:m-auto sm:h-[88vh] sm:w-[min(1180px,94vw)] sm:rounded-lg sm:border sm:border-rule"
    >
      {current && (
        <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-4 py-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <h2 id="tpl-preview-title" className="font-display text-lg font-semibold tracking-tight">
                <span className="mr-2 font-mono text-xs font-normal text-ink-soft">{String(index! + 1).padStart(2, '0')}</span>
                {current.name}
              </h2>
              <p className="truncate text-sm text-ink-soft">{current.desc} · sample content</p>
            </div>
            <div role="radiogroup" aria-label="Colour theme" className="inline-flex overflow-hidden rounded-md border border-rule bg-white text-sm">
              {THEMES.map((th) => (
                <button key={th.id} type="button" role="radio" aria-checked={theme === th.id} onClick={() => setTheme(th.id)}
                  className={`px-3 py-1.5 transition-colors ${theme === th.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}>
                  {th.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" className={navBtn} onClick={() => step(-1)} aria-label="Previous template">←</button>
              <button type="button" className={navBtn} onClick={() => step(1)} aria-label="Next template">→</button>
              <button type="button" className={`${navBtn} ml-1`} onClick={onClose} aria-label="Close preview">✕</button>
            </div>
          </header>

          <div className="relative min-h-0 flex-1 bg-paper-deep">
            {loadedSrc !== src && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-soft" role="status">Loading {current.name}…</p>
            )}
            <iframe
              key={src}
              src={src}
              title={`${current.name} template with sample content`}
              onLoad={() => setLoadedSrc(src)}
              className="relative h-full w-full border-0 bg-white transition-opacity duration-300"
              style={{ opacity: loadedSrc === src ? 1 : 0 }}
            />
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-rule px-4 py-3 sm:px-5">
            <Link href={`/demo?template=${current.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
              Open full demo ↗
            </Link>
            <Link href="/register" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-black">
              Use this template
            </Link>
          </footer>
        </div>
      )}
    </dialog>
  );
}
