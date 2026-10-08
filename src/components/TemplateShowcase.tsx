'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

export interface ShowcaseTemplate { id: string; name: string; desc: string }

const FRAME_W = 1280;
const FRAME_H = 860;
const INTERVAL_MS = 3800;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/**
 * Live, scaled-down previews of the real templates (demo data), cycling one after another.
 * Each layer is an iframe; a new one fades in once it has loaded, then the old one is dropped.
 * Pauses on hover/focus and when the tab is hidden; no auto-play for reduced-motion users.
 */
export default function TemplateShowcase({ templates }: { templates: ShowcaseTemplate[] }) {
  const [index, setIndex] = useState(0);
  const [layers, setLayers] = useState<{ key: number; idx: number; ready: boolean }[]>([{ key: 0, idx: 0, ready: false }]);
  const [paused, setPaused] = useState(false);
  const [scale, setScale] = useState(0.3);
  const boxRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => true);

  // Fit the 1280px-wide page into the card.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const show = (next: number) => {
    const idx = ((next % templates.length) + templates.length) % templates.length;
    keyRef.current += 1;
    setIndex(idx);
    setLayers((prev) => [...prev.slice(-1), { key: keyRef.current, idx, ready: false }]);
  };

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setInterval(() => { if (!document.hidden) show(index + 1); }, INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- show() only depends on index, which is listed
  }, [index, paused, reducedMotion]);

  const markReady = (key: number) => {
    setLayers((prev) => prev.map((l) => (l.key === key ? { ...l, ready: true } : l)));
    // Drop the previous layer after the fade.
    window.setTimeout(() => setLayers((prev) => (prev.length > 1 && prev[prev.length - 1].key === key ? prev.slice(-1) : prev)), 450);
  };

  const current = templates[index];

  return (
    <div
      className="mx-auto w-full max-w-md"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      <div className="rounded-md border border-rule bg-white p-1.5 shadow-[6px_8px_0_0_var(--color-paper-deep)]">
        <div className="mb-1.5 flex items-center gap-1.5 px-1 pt-0.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-rule" /><span className="h-2 w-2 rounded-full bg-rule" /><span className="h-2 w-2 rounded-full bg-rule" />
          <span className="ml-2 truncate font-mono text-[10px] text-ink-soft">/portfolio/alex-rivera · {current.name.toLowerCase()}</span>
        </div>
        <div ref={boxRef} className="relative w-full overflow-hidden rounded-sm bg-paper-deep" style={{ height: FRAME_H * scale }}>
          {layers.map((layer) => (
            <iframe
              key={layer.key}
              title={`${templates[layer.idx].name} template preview`}
              src={`/portfolio/demo?preview=true&template=${templates[layer.idx].id}&theme=dark-space&demo=alex`}
              tabIndex={-1}
              aria-hidden="true"
              onLoad={() => markReady(layer.key)}
              className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left border-0 transition-opacity duration-500"
              style={{ width: FRAME_W, minWidth: FRAME_W, height: FRAME_H, transform: `scale(${scale})`, opacity: layer.ready ? 1 : 0 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-sm" aria-live="polite">
          <span className="font-medium text-ink">{current.name}</span>
          <span className="text-ink-soft"> — {current.desc}</span>
        </p>
        <Link href={`/demo`} className="shrink-0 text-sm font-medium text-accent underline-offset-4 hover:underline">Try it →</Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Templates">
        {templates.map((tpl, i) => (
          <button
            key={tpl.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={tpl.name}
            title={tpl.name}
            onClick={() => show(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-ink' : 'w-1.5 bg-rule hover:bg-ink-soft'}`}
          />
        ))}
      </div>
    </div>
  );
}
