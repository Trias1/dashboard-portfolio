'use client';
import { useEffect, useState } from 'react';

const inline = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part));

/** Renders an AI reply: **bold**, "- " / "* " bullets and "---" rules as React elements; never injects raw HTML. */
export default function MessageText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" aria-hidden="true" />;
        if (line.trim() === '---') return <hr key={i} className="my-2 border-[#dcdcd5]" />;
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        return bullet
          ? <p key={i} className="flex gap-2"><span aria-hidden="true">•</span><span>{inline(bullet[1])}</span></p>
          : <p key={i}>{inline(line)}</p>;
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
