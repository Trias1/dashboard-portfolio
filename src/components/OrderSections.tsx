'use client';
import { useLayoutEffect, useRef } from 'react';
import type { TemplateSectionOrder } from '@/types';

type SectionOrderEntry = TemplateSectionOrder | string;

function sectionKey(id: string) {
  const aliases: Record<string, string> = { team: 'about', work: 'projects', connect: 'contact' };
  return aliases[id] || id;
}

function normalizeSectionOrder(sections: readonly SectionOrderEntry[]): SectionOrderEntry[] {
  return [...sections];
}

function entryKey(s: SectionOrderEntry): string {
  if (typeof s === 'string') return s.split('-')[0];
  if (s.type === 'custom' && s.label) return `custom-${s.label.toLowerCase().replace(/\s+/g, '-')}`;
  return (s.type || '').split('-')[0];
}

export default function OrderSections({ sections_order, children }: { sections_order?: readonly SectionOrderEntry[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ordered = useRef(false);

  useLayoutEffect(() => {
    if (!sections_order?.length) return;
    ordered.current = false;

    const normalized = normalizeSectionOrder(sections_order);

    const orderMap: Record<string, number> = {};
    normalized.forEach((s, i: number) => {
      const key = entryKey(s);
      if (key) orderMap[sectionKey(key)] = i;
    });

    const disabled = new Set(
      normalized
        .filter((section) => typeof section !== 'string' && section.enabled === false)
        .map((section) => sectionKey(entryKey(section)))
    );

    const root = ref.current;
    if (!root) return;

    const doOrder = () => {
      const sections = root.querySelectorAll<HTMLElement>('section[id], div[id]');
      if (!sections.length) return false;
      sections.forEach((section) => {
        section.hidden = disabled.has(sectionKey(section.id));
      });
      // Menu links pointing at a hidden or missing section would lead nowhere.
      root.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]').forEach((link) => {
        const target = document.getElementById(link.getAttribute('href')!.slice(1));
        link.hidden = !target || target.hidden;
      });

      const sorted = Array.from(sections).sort((a, b) => {
        const aKey = sectionKey(a.id);
        const bKey = sectionKey(b.id);
        return (orderMap[aKey] ?? 999) - (orderMap[bKey] ?? 999);
      });

      const parent = sorted[0]?.parentElement;
      if (!parent) return false;

      let moved = false;
      sorted.forEach(el => {
        if (el.parentElement === parent) { parent.appendChild(el); moved = true; }
      });
      return moved;
    };

    if (doOrder()) { ordered.current = true; return; }

    const raf = requestAnimationFrame(() => {
      if (doOrder()) ordered.current = true;
    });

    return () => cancelAnimationFrame(raf);
  }, [sections_order]);

  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>;
}
