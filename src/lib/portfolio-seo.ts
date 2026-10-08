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
