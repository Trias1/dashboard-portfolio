import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { normalizeDraft, parseModelJson, splitSkills, isDraftSection } from "./advisor-drafts.ts";

test("parses JSON wrapped in prose and code fences", () => {
  assert.deepEqual(parseModelJson('Sure!\n```json\n{"bio": "Hi"}\n```'), { bio: "Hi" });
  assert.deepEqual(parseModelJson('[{"title":"A","description":"B"}]'), [{ title: "A", description: "B" }]);
  assert.equal(parseModelJson("no json here"), null);
  assert.equal(parseModelJson("{broken"), null);
});

test("ignores prose with brackets after the JSON, and brackets inside strings", () => {
  // Shape seen from 9Router: the JSON, then an extra remark
  assert.deepEqual(parseModelJson('{"ok":true}\n\nLazier alternative: HTTP 204 (zero bytes) {not json}.'), { ok: true });
  assert.deepEqual(parseModelJson('Note [draft]: {"bio": "Builds APIs {fast} and [clean] \\"code\\"."} done'), { bio: 'Builds APIs {fast} and [clean] "code".' });
  assert.deepEqual(parseModelJson('{"a": 1} {"b": 2}'), { a: 1 });
});

test("only bio, hero, skills and services can be drafted", () => {
  for (const s of ["bio", "hero", "skills", "services"]) assert.equal(isDraftSection(s), true);
  for (const s of ["experience", "projects", "testimonials", "gallery", "contact", "__proto__"]) assert.equal(isDraftSection(s), false);
});

test("bio and hero are trimmed, stripped of markdown and length-limited", () => {
  assert.deepEqual(normalizeDraft("bio", { bio: "  **Backend** developer.  " }), { bio: "Backend developer." });
  assert.equal(normalizeDraft("bio", { bio: "   " }), null);
  const hero = normalizeDraft("hero", { headline: "x".repeat(500), subheadline: 42 }) as { headline: string; subheadline: string };
  assert.equal(hero.headline.length, 120);
  assert.equal(hero.subheadline, "");
  assert.equal(normalizeDraft("hero", { subheadline: "only sub" }), null);
});

test("skills: accepts arrays or comma lists, dedupes, drops empty categories", () => {
  const d = normalizeDraft("skills", { categories: [
    { title: "Backend", skills: ["Java", "java", " Spring Boot "] },
    { title: "Data", skills: "PostgreSQL, MySQL, , PostgreSQL" },
    { title: "", skills: "x" },
    { title: "Empty", skills: "" },
  ] });
  assert.deepEqual(d, { categories: [{ title: "Backend", skills: "Java, Spring Boot" }, { title: "Data", skills: "PostgreSQL, MySQL" }] });
  assert.equal(normalizeDraft("skills", { categories: "nope" }), null);
});

test("services: keeps complete items only and caps the count", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ title: `S${i}`, description: "Does things." }));
  assert.equal((normalizeDraft("services", many) as unknown[]).length, 6);
  assert.deepEqual(normalizeDraft("services", [{ title: "API work", description: "" }, { title: "Cloud", description: "Sets up infra." }]), [{ title: "Cloud", description: "Sets up infra." }]);
  assert.equal(normalizeDraft("services", { title: "not a list" }), null);
});

test("splitSkills ignores non-strings", () => {
  assert.deepEqual(splitSkills(["Go", 5, null, "Rust"]), ["Go", "Rust"]);
  assert.deepEqual(splitSkills(undefined), []);
});
