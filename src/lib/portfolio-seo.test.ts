import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { buildPortfolioSeo } from "./portfolio-seo.ts";

test("uses custom domain as canonical URL", () => {
  const seo = buildPortfolioSeo({ slug: "trias", title: "Trias Portfolio", customDomain: "portfolio.zeen.my.id", name: "Trias", bio: "Fullstack developer", photoUrl: "https://example.com/trias.jpg" });
  assert.equal(seo.url, "https://portfolio.zeen.my.id");
  assert.equal(seo.title, "Trias \u2014 Portfolio");
  assert.equal(seo.description, "Fullstack developer");
  assert.equal(seo.image, "https://example.com/trias.jpg");
});

test("falls back to the main domain and application image", () => {
  const seo = buildPortfolioSeo({ slug: "alex", title: "Alex Rivera" });
  assert.equal(seo.url, "https://portfolio.tzm.web.id/portfolio/alex");
  assert.equal(seo.description, "Alex Rivera's portfolio");
  assert.equal(seo.image, "https://portfolio.tzm.web.id/og-image.png");
});
