'use client';
import { useLayoutEffect, useRef } from 'react';

function sectionKey(id: string) {
  const aliases: Record<string, string> = { team: 'about', work: 'projects', connect: 'contact' };
  return aliases[id] || id;
}

function normalizeSectionOrder(sections: any[]): any[] {
  return [...sections];
}

export default function OrderSections({ sections_order, children }: { sections_order: any[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ordered = useRef(false);

  useLayoutEffect(() => {
    if (!sections_order?.length) return;
    ordered.current = false;

    const normalized = normalizeSectionOrder(sections_order);

    const orderMap: Record<string, number> = {};
    normalized.forEach((s: any, i: number) => {
      const key = s.type === 'custom' && s.label
        ? `custom-${s.label.toLowerCase().replace(/\s+/g, '-')}`
        : (s.type || s).split('-')[0];
      if (key) orderMap[sectionKey(key)] = i;
    });

    const disabled = new Set(normalized.filter((section: any) => section.enabled === false).map((section: any) => {
      const key = section.type === 'custom' && section.label
        ? `custom-${section.label.toLowerCase().replace(/\s+/g, '-')}`
        : (section.type || section).split('-')[0];
      return sectionKey(key);
    }));

    const root = ref.current;
    if (!root) return;

    const doOrder = () => {
      const sections = root.querySelectorAll<HTMLElement>('section[id], div[id]');
      if (!sections.length) return false;
      sections.forEach((section) => {
        section.hidden = disabled.has(sectionKey(section.id));
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
