'use client';
import { useLayoutEffect, useRef } from 'react';

function normalizeSectionOrder(sections: any[]): any[] {
  const order = [...sections];
  const heroIdx = order.findIndex((s: any) => s.type === 'hero' || s.id === 'hero');
  if (heroIdx > 0) {
    const [hero] = order.splice(heroIdx, 1);
    order.unshift(hero);
  }
  const contactIdx = order.findIndex((s: any) => s.type === 'contact' || s.id === 'contact');
  if (contactIdx !== -1 && contactIdx < order.length - 1) {
    const [contact] = order.splice(contactIdx, 1);
    const footerIdx = order.findIndex((s: any) => s.type === 'footer' || s.id === 'footer');
    order.splice(footerIdx !== -1 ? footerIdx : order.length, 0, contact);
  }
  return order;
}

export default function OrderSections({ sections_order, children }: { sections_order: any[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ordered = useRef(false);

  useLayoutEffect(() => {
    if (!sections_order?.length || ordered.current) return;

    const normalized = normalizeSectionOrder(sections_order);

    const orderMap: Record<string, number> = {};
    normalized.forEach((s: any, i: number) => {
      const key = s.type === 'custom' && s.label
        ? `custom-${s.label.toLowerCase().replace(/\s+/g, '-')}`
        : (s.type || s).split('-')[0];
      if (key) orderMap[key] = i;
    });

    const root = ref.current?.firstElementChild;
    if (!root) return;

    const doOrder = () => {
      const sections = root.querySelectorAll<HTMLElement>('section[id]');
      if (sections.length < 2) return false;

      const sorted = Array.from(sections).sort((a, b) => {
        if (a.id === 'contact' || b.id === 'contact') {
          if (a.id === 'contact') return 1;
          if (b.id === 'contact') return -1;
        }
        return (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999);
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
