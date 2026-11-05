import type { CustomCard, CustomLink, CustomSectionContent } from '@/types';

/** Content types a free-form custom section can have; every template renders all four. */
export const GENERIC_CUSTOM_TYPES = ['text', 'list', 'cards', 'links'] as const;
export type GenericCustomType = (typeof GENERIC_CUSTOM_TYPES)[number];

/** Older rows may say "html" (no template ever rendered it): treat those, and anything unknown, as text. */
export const genericType = (value: unknown): GenericCustomType =>
  (GENERIC_CUSTOM_TYPES as readonly string[]).includes(value as string) ? (value as GenericCustomType) : 'text';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** A link the user typed, as an https URL; null when it isn't a web link (e.g. javascript:). */
export function webLink(value: unknown): string | null {
  const v = str(value);
  if (!v) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * The content to store for a free-form custom section: only the field its type uses, with blank
 * entries dropped. (The editor used to save `{ body }` whatever the type, so lists, cards and links
 * came out empty on the portfolio.)
 */
export function buildGenericContent(type: GenericCustomType, content: CustomSectionContent | undefined): CustomSectionContent {
  const c = content || {};
  switch (type) {
    case 'list':
      return { items: (Array.isArray(c.items) ? c.items : []).map(str).filter(Boolean) };
    case 'cards':
      return {
        cards: (Array.isArray(c.cards) ? c.cards : [])
          .map((card: CustomCard) => ({ title: str(card?.title), desc: str(card?.desc) }))
          .filter((card) => card.title || card.desc),
      };
    case 'links':
      return {
        links: (Array.isArray(c.links) ? c.links : [])
          .map((link: CustomLink) => {
            const url = webLink(link?.url);
            return url ? { label: str(link?.label) || url, url } : null;
          })
          .filter((link): link is { label: string; url: string } => link !== null),
      };
    default:
      return { body: typeof c.body === 'string' ? c.body : '' };
  }
}

/** `base`, or `base 2`, `base 3`… so a new section never shares its name (and its saved rows) with another. */
export function uniqueLabel(base: string, taken: string[]): string {
  const used = new Set(taken.map((t) => t.trim().toLowerCase()));
  if (!used.has(base.trim().toLowerCase())) return base;
  for (let n = 2; ; n++) if (!used.has(`${base} ${n}`.toLowerCase())) return `${base} ${n}`;
}
