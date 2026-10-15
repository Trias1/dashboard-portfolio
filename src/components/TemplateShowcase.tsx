'use client';
import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

export interface ShowcaseTemplate { id: string; name: string; desc: string }

const FRAME_W = 1280;
const FRAME_H = 860;
const INTERVAL_MS = 5000;
const FADE_MS = 500;

// Auto-play only on wide screens, without reduced motion and off slow or data-saving connections
const autoplayQuery = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
type NetworkInfo = { saveData?: boolean; effectiveType?: string };
const onSlowConnection = () => {
  const c = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  return !!c && (c.saveData === true || ['slow-2g', '2g', '3g'].includes(c.effectiveType ?? ''));
};
const subscribeAutoplay = (cb: () => void) => {
  const mq = window.matchMedia(autoplayQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const subscribeTabVisibility = (cb: () => void) => {
  document.addEventListener('visibilitychange', cb);
  return () => document.removeEventListener('visibilitychange', cb);
};

type Pair<T> = [T, T];
type State = {
  index: number;                 // template on screen (in the front frame)
  front: 0 | 1;
  leaving: 0 | 1 | null;         // previous front frame, kept visible while the new one fades in
  mounted: Pair<number | null>;  // template each frame was created with; its src never changes afterwards
  rendered: Pair<number | null>; // template each frame has actually painted
  wanted: number | null;         // template being prepared in the back frame
  inView: boolean;
};
type Action =
  | { type: 'start' }
  | { type: 'view'; inView: boolean }
  | { type: 'show'; idx: number }
  | { type: 'rendered'; frame: 0 | 1; idx: number }
  | { type: 'loaded'; frame: 0 | 1 }
  | { type: 'settled' };

const set = <T,>(pair: Pair<T>, i: 0 | 1, value: T): Pair<T> => (i === 0 ? [value, pair[1]] : [pair[0], value]);

function swapIfReady(s: State): State {
  const back = (1 - s.front) as 0 | 1;
  if (s.wanted === null || s.rendered[back] !== s.wanted) return s;
  return { ...s, leaving: s.front, front: back, index: s.wanted, wanted: null };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return s.mounted[s.front] === null ? { ...s, mounted: set(s.mounted, s.front, s.index) } : s;
    case 'view':
      return { ...s, inView: a.inView };
    case 'show': {
      if (a.idx === (s.wanted ?? s.index)) return s;
      if (a.idx === s.index) return { ...s, wanted: null };
      const back = (1 - s.front) as 0 | 1;
      let mounted = s.mounted[s.front] === null ? set(s.mounted, s.front, s.index) : s.mounted;
      if (mounted[back] === null) mounted = set(mounted, back, a.idx);
      return swapIfReady({ ...s, mounted, wanted: a.idx });
    }
    case 'rendered':
      return swapIfReady({ ...s, rendered: set(s.rendered, a.frame, a.idx) });
    case 'loaded': {
      // Fallback for a missed message: the frame shows the template it was created with
      const idx = s.mounted[a.frame];
      return s.rendered[a.frame] !== null || idx === null ? s : swapIfReady({ ...s, rendered: set(s.rendered, a.frame, idx) });
    }
    case 'settled':
      return { ...s, leaving: null };
  }
}

/**
 * Live, scaled-down previews of the real templates (demo data).
 * Two frames take turns: the hidden one switches template by message (no reload), reports once painted,
 * then cross-fades in. Frames load only after the page has loaded and the card is on screen, so the
 * landing page itself stays light; auto-play pauses on hover/focus, off screen and in hidden tabs.
 */
export default function TemplateShowcase({ templates }: { templates: ShowcaseTemplate[] }) {
  const [state, dispatch] = useReducer(reducer, {
    index: 0, front: 0, leaving: null, mounted: [null, null], rendered: [null, null], wanted: null, inView: false,
  });
  const [paused, setPaused] = useState(false);
  const [scale, setScale] = useState(0.3);
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameEls = useRef<Pair<HTMLIFrameElement | null>>([null, null]);
  const posted = useRef<Pair<number | null>>([null, null]);
  const autoplay = useSyncExternalStore(subscribeAutoplay, () => window.matchMedia(autoplayQuery).matches && !onSlowConnection(), () => false);
  const tabVisible = useSyncExternalStore(subscribeTabVisibility, () => !document.hidden, () => true);

  // Fit the 1280px-wide page into the card.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Start loading frames once the page itself has finished loading and the card is near the viewport.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const start = () => dispatch({ type: 'start' });
    const io = new IntersectionObserver(([entry]) => {
      dispatch({ type: 'view', inView: entry.isIntersecting });
      if (!entry.isIntersecting) return;
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start, { once: true });
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener('load', start); };
  }, []);

  // Frames report the template they painted.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const msg = e.data as { type?: unknown; template?: unknown };
      if (msg?.type !== 'pk:showcase-rendered') return;
      const frame = frameEls.current.findIndex((f) => f?.contentWindow === e.source);
      const idx = templates.findIndex((t) => t.id === msg.template);
      if ((frame === 0 || frame === 1) && idx >= 0) dispatch({ type: 'rendered', frame, idx });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [templates]);

  // Ask the back frame for the wanted template once its app is running.
  const back = (1 - state.front) as 0 | 1;
  const backAlive = state.rendered[back] !== null;
  useEffect(() => {
    if (state.wanted === null || !backAlive || state.rendered[back] === state.wanted || posted.current[back] === state.wanted) return;
    posted.current[back] = state.wanted;
    frameEls.current[back]?.contentWindow?.postMessage({ type: 'pk:showcase-template', template: templates[state.wanted].id }, window.location.origin);
  }, [state.wanted, state.rendered, back, backAlive, templates]);

  useEffect(() => {
    if (state.leaving === null) return;
    const id = window.setTimeout(() => dispatch({ type: 'settled' }), FADE_MS);
    return () => window.clearTimeout(id);
  }, [state.leaving]);

  const ready = state.rendered[state.front] !== null;
  useEffect(() => {
    if (!autoplay || paused || !tabVisible || !state.inView || !ready || state.wanted !== null) return;
    const id = window.setTimeout(() => dispatch({ type: 'show', idx: (state.index + 1) % templates.length }), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, paused, tabVisible, state.inView, ready, state.wanted, state.index, templates.length]);

  const current = templates[state.index];
  const selected = state.wanted ?? state.index;

  return (
    <div
      ref={rootRef}
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
          {!ready && <p className="absolute inset-0 flex items-center justify-center text-xs text-ink-soft">Loading preview…</p>}
          {([0, 1] as const).map((i) => {
            const mountedIdx = state.mounted[i];
            if (mountedIdx === null) return null;
            const shown = (i === state.front && state.rendered[i] !== null) || i === state.leaving;
            return (
              <iframe
                key={i}
                ref={(el) => { frameEls.current[i] = el; }}
                title={`${templates[state.rendered[i] ?? mountedIdx].name} template preview`}
                src={`/portfolio/demo?preview=true&showcase=1&template=${templates[mountedIdx].id}&theme=dark-space&demo=alex`}
                tabIndex={-1}
                aria-hidden="true"
                onLoad={() => dispatch({ type: 'loaded', frame: i })}
                className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left border-0"
                style={{
                  width: FRAME_W, minWidth: FRAME_W, height: FRAME_H, transform: `scale(${scale})`,
                  opacity: shown ? 1 : 0, zIndex: i === state.front ? 2 : 1,
                  transition: i === state.front ? `opacity ${FADE_MS}ms ease` : 'none',
                }}
              />
            );
          })}
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
            aria-selected={i === selected}
            aria-label={tpl.name}
            title={tpl.name}
            onClick={() => dispatch({ type: 'show', idx: i })}
            className={`h-1.5 rounded-full transition-all ${i === selected ? 'w-6 bg-ink' : 'w-1.5 bg-rule hover:bg-ink-soft'}`}
          />
        ))}
      </div>
    </div>
  );
}
