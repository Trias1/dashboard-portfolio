const MAIN_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://portfolio.west-solutions.web.id').replace(/\/$/, '');

type PortfolioSeoInput = {
  slug: string;
  title?: string | null;
  name?: string | null;
  bio?: string | null;
  subheadline?: string | null;
  photoUrl?: string | null;
};

export function buildPortfolioSeo(input: PortfolioSeoInput) {
  const name = input.name || input.title || input.slug;
  const url = `${MAIN_URL}/portfolio/${input.slug}`;

  return {
    title: `${name} \u2014 Portfolio`,
    description: (input.bio || input.subheadline || `${name}'s portfolio`).slice(0, 160),
    image: input.photoUrl || `${MAIN_URL}/og-image.png`,
    url,
  };
}

export { MAIN_URL };

type JsonLdInput = {
  slug: string;
  title?: string | null;
  about?: { name?: unknown; title?: unknown; bio?: unknown; photo_url?: unknown } | null;
  hero?: { headline?: unknown; subheadline?: unknown } | null;
  contact?: { linkedin_url?: unknown; github_url?: unknown } | null;
  skills?: { skills?: unknown }[] | null;
};

const text = (value: unknown, max: number) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined);
const httpsUrl = (value: unknown) => (typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value.trim()) ? value.trim() : undefined);

/**
 * schema.org ProfilePage with the owner as its Person, for search engines. Only what the page already shows
 * publicly; no email or phone (scraped for spam). Fields that are empty or not https links are left out.
 */
export function buildPersonJsonLd(input: JsonLdInput) {
  const url = `${MAIN_URL}/portfolio/${input.slug}`;
  const sameAs = [input.contact?.linkedin_url, input.contact?.github_url].map(httpsUrl).filter((u): u is string => !!u);
  const knowsAbout = [...new Set((input.skills || [])
    .flatMap((group) => (typeof group?.skills === 'string' ? group.skills.split(',') : []))
    .map((skill) => skill.trim())
    .filter((skill) => skill && skill.length <= 60))].slice(0, 30);
  const person = {
    '@type': 'Person',
    name: text(input.about?.name, 120) || text(input.title, 120) || input.slug,
    jobTitle: text(input.about?.title, 120) || text(input.hero?.headline, 120),
    description: text(input.about?.bio, 300) || text(input.hero?.subheadline, 300),
    image: httpsUrl(input.about?.photo_url),
    url,
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: knowsAbout.length ? knowsAbout : undefined,
  };
  return { '@context': 'https://schema.org', '@type': 'ProfilePage', url, mainEntity: person };
}

/** JSON for a <script type="application/ld+json">: "<" escaped so text in it can never close the script tag. */
export const jsonLdScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/** Share-card colours from the portfolio theme: text that reads on the background, and an accent that does too. */
export function shareCardColors(bg: string, accent: string) {
  const lum = (hex: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return 0;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const dark = lum(bg) < 0.4;
  const ink = dark ? '#f4f4f2' : '#141414';
  return {
    bg,
    ink,
    soft: dark ? '#b4b4ba' : '#55555c',
    rule: dark ? '#2c2d31' : '#e3e3de',
    accent: contrast(accent, bg) >= 4.5 ? accent : ink,
  };
}
