'use client';
import { useEffect, useState, type ReactNode } from 'react';

// Tints follow the text colour, so boxes stay readable on light and dark chat themes.
const tint = { backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)' };
const linkClass = 'underline underline-offset-2 break-words hover:opacity-80';

// `code` | **bold** | *italic* | [label](https://…) | bare https://… link
const INLINE = /`([^`\n]+)`|\*\*(.+?)\*\*|\*(?=\S)([^*\n]+?)(?<=\S)\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"*])/g;

function inline(text: string, links = true): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = out.length;
    if (m[1] !== undefined) out.push(<code key={key} className="rounded px-1 py-0.5 font-mono text-[0.9em]" style={tint}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={key} className="font-semibold">{inline(m[2], links)}</strong>);
    else if (m[3] !== undefined) out.push(<em key={key}>{inline(m[3], links)}</em>);
    else if (m[4] !== undefined) {
      out.push(links
        ? <a key={key} href={m[5]} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>{inline(m[4], false)}</a>
        : <span key={key}>{inline(m[4], false)}</span>);
    } else if (m[6] !== undefined) {
      out.push(links ? <a key={key} href={m[6]} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>{m[6]}</a> : m[6]);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block = { code: true; text: string } | { code: false; lines: string[]; boxed?: boolean };
type Fence = { lang: string; lines: string[] };

const NOTE = '\u0000note:';

/**
 * Prose lines with HTML comments dropped. Inside an example box a comment alone on its line ("<!-- Good -->") is
 * how the AI labels the example, so there it becomes a small label.
 */
function proseLines(lines: string[], labels = false): string[] {
  return lines
    .map((l) => labels ? l.replace(/^\s*<!--\s*(.*?)\s*-->\s*$/, (_, note: string) => (note ? NOTE + note : '')) : l)
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!--[\s\S]*$/, '')
    .split('\n');
}

/**
 * Splits out ``` fenced blocks; an unclosed fence (still streaming) runs to the end. A ```markdown fence is the AI
 * showing example text, so it is rendered as formatted text in a box rather than as raw source.
 */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let prose: string[] = [];
  let fence: Fence | null = null;
  const flushProse = () => {
    if (prose.length) blocks.push({ code: false, lines: proseLines(prose) });
    prose = [];
  };
  const closeFence = (f: Fence) => {
    if (/^(markdown|md)$/i.test(f.lang)) blocks.push({ code: false, boxed: true, lines: proseLines(f.lines, true) });
    else blocks.push({ code: true, text: f.lines.join('\n') });
  };
  for (const line of text.split('\n')) {
    const marker = line.match(/^\s*```\s*([\w+-]*)/);
    if (marker) {
      if (fence) { closeFence(fence); fence = null; }
      else { flushProse(); fence = { lang: marker[1] || '', lines: [] }; }
      continue;
    }
    if (fence) fence.lines.push(line); else prose.push(line);
  }
  if (fence) closeFence(fence);
  flushProse();
  return blocks;
}

function Line({ line }: { line: string }) {
  if (!line.trim()) return <div className="h-2" aria-hidden="true" />;
  if (line.startsWith(NOTE)) return <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-70">{line.slice(NOTE.length)}</p>;
  if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return <hr className="my-2 border-current opacity-15" />;
  const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
  if (heading) return <p className="mt-1 font-semibold">{inline(heading[1])}</p>;
  const bullet = line.match(/^\s*[-*•+]\s+(.*)$/);
  if (bullet) return <p className="flex gap-2"><span aria-hidden="true">•</span><span className="min-w-0">{inline(bullet[1])}</span></p>;
  const numbered = line.match(/^\s*(\d{1,3})[.)]\s+(.*)$/);
  if (numbered) return <p className="flex gap-2"><span className="tabular-nums">{numbered[1]}.</span><span className="min-w-0">{inline(numbered[2])}</span></p>;
  const quote = line.match(/^\s*>\s?(.*)$/);
  if (quote) return <p className="border-l-2 pl-2.5 opacity-80" style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}>{inline(quote[1])}</p>;
  return <p>{inline(line)}</p>;
}

/**
 * Renders an AI reply as React elements (never raw HTML): **bold**, *italic*, `code`, ``` code blocks (wrapped),
 * [links](https://…) and bare https links, "#" headings, "-"/"1." lists, "---" rules and "> " quotes.
 */
export default function MessageText({ text }: { text: string }) {
  return (
    <>
      {toBlocks(text).map((block, i) => {
        if (block.code) {
          return <pre key={i} className="my-1.5 rounded-md px-3 py-2 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap break-words" style={tint}><code>{block.text}</code></pre>;
        }
        const lines = block.lines.map((line, j) => <Line key={`${i}-${j}`} line={line} />);
        return block.boxed ? <div key={i} className="my-1.5 rounded-md px-3 py-2" style={tint}>{lines}</div> : lines;
      })}
    </>
  );
}

/** Seconds since this element mounted, e.g. "4s"; hidden from screen readers so the status isn't re-read every second. */
export function ElapsedSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span aria-hidden="true" className="ml-1 tabular-nums">{seconds}s</span>;
}
