import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { buildPortfolioSeo } from "./portfolio-seo.ts";

test("uses the portfolio page on the main domain as canonical URL", () => {
  const seo = buildPortfolioSeo({ slug: "trias", title: "Trias Portfolio", name: "Trias", bio: "Fullstack developer", photoUrl: "https://example.com/trias.jpg" });
  assert.equal(seo.url, "https://portfolio.west-solutions.web.id/portfolio/trias");
  assert.equal(seo.title, "Trias \u2014 Portfolio");
  assert.equal(seo.description, "Fullstack developer");
  assert.equal(seo.image, "https://example.com/trias.jpg");
});

test("falls back to the main domain and application image", () => {
  const seo = buildPortfolioSeo({ slug: "alex", title: "Alex Rivera" });
  assert.equal(seo.url, "https://portfolio.west-solutions.web.id/portfolio/alex");
  assert.equal(seo.description, "Alex Rivera's portfolio");
  assert.equal(seo.image, "https://portfolio.west-solutions.web.id/og-image.png");
});

// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { buildPersonJsonLd, jsonLdScript, shareCardColors } from "./portfolio-seo.ts";

test("describes the owner as a Person without email or phone", () => {
  const ld = buildPersonJsonLd({
    slug: "trias",
    title: "Trias Portfolio",
    about: { name: "Trias", title: "Fullstack Developer", bio: "I build web apps.", photo_url: "https://cdn.example.com/p.jpg" },
    contact: { linkedin_url: "https://linkedin.com/in/trias", github_url: "javascript:alert(1)" },
    skills: [{ skills: "React, Next.js, React" }, { skills: "Go" }],
  });
  assert.equal(ld["@type"], "ProfilePage");
  assert.equal(ld.url, "https://portfolio.west-solutions.web.id/portfolio/trias");
  assert.equal(ld.mainEntity.name, "Trias");
  assert.equal(ld.mainEntity.jobTitle, "Fullstack Developer");
  assert.equal(ld.mainEntity.image, "https://cdn.example.com/p.jpg");
  assert.deepEqual(ld.mainEntity.sameAs, ["https://linkedin.com/in/trias"]);
  assert.deepEqual(ld.mainEntity.knowsAbout, ["React", "Next.js", "Go"]);
  assert.ok(!JSON.stringify(ld).includes("email"));
});

test("falls back to the title, headline and subheadline", () => {
  const ld = buildPersonJsonLd({ slug: "alex", title: "Alex", hero: { headline: "Designer", subheadline: "Brand work" } });
  assert.equal(ld.mainEntity.name, "Alex");
  assert.equal(ld.mainEntity.jobTitle, "Designer");
  assert.equal(ld.mainEntity.description, "Brand work");
  assert.equal(ld.mainEntity.sameAs, undefined);
  assert.equal(ld.mainEntity.image, undefined);
});

test("JSON-LD can't close its script tag", () => {
  const out = jsonLdScript({ name: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("<"));
  assert.equal(JSON.parse(out).name, "</script><script>alert(1)</script>");
});

test("share card text and accent stay readable on both themes", () => {
  const dark = shareCardColors("#111214", "#5b8def");
  assert.equal(dark.ink, "#f4f4f2");
  assert.equal(dark.accent, "#5b8def");
  const light = shareCardColors("#ffffff", "#1f45c9");
  assert.equal(light.ink, "#141414");
  assert.equal(light.accent, "#1f45c9");
  // A pale accent on white fails 4.5:1, so the card uses the text colour instead
  assert.equal(shareCardColors("#ffffff", "#9fd3ff").accent, "#141414");
});
