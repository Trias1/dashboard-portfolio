import type { CSSProperties } from 'react';

/** Split a description into its points: one per line, without the "-", "*" or "•" someone typed in front. */
export function descItems(text?: string | null): string[] {
  return (text || '').split(/\n+/).map((s) => s.replace(/^\s*[-*•●▪]\s*/, '').trim()).filter(Boolean);
}

/** One point reads as a sentence; several read as a bulleted list, one per line. */
export function DescItems({ items }: { items: string[] }) {
  if (items.length <= 1) return <>{items.map((l, i) => <p key={i}>{l}</p>)}</>;
  return (
    <ul className="space-y-1.5">
      {items.map((l, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden="true" className="shrink-0">•</span>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

/** A description block: a paragraph for a single line, a bulleted list when it has several lines. */
export default function DescText({ text, className, style }: { text?: string | null; className?: string; style?: CSSProperties }) {
  const items = descItems(text);
  if (!items.length) return null;
  if (items.length === 1) return <p className={className} style={style}>{items[0]}</p>;
  return (
    <ul className={`${className ?? ''} space-y-1.5`} style={style}>
      {items.map((l, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden="true" className="shrink-0">•</span>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}
