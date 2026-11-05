import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { buildGenericContent, genericType, uniqueLabel, webLink } from "./custom-content.ts";

test("old html rows and unknown types are edited as text", () => {
  assert.equal(genericType("html"), "text");
  assert.equal(genericType(undefined), "text");
  assert.equal(genericType("cards"), "cards");
});

test("each type stores only its own field, without blank entries", () => {
  assert.deepEqual(buildGenericContent("list", { items: [" A ", "", "B"], body: "stale" }), { items: ["A", "B"] });
  assert.deepEqual(buildGenericContent("cards", { cards: [{ title: "T", desc: " d ", icon: "x" }, { title: "", desc: "" }] }), { cards: [{ title: "T", desc: "d" }] });
  assert.deepEqual(buildGenericContent("text", { body: "Hello\nworld", items: ["x"] }), { body: "Hello\nworld" });
  assert.deepEqual(buildGenericContent("text", undefined), { body: "" });
});

test("links keep web URLs only and fall back to the URL as label", () => {
  const out = buildGenericContent("links", { links: [
    { label: "Site", url: "example.com" },
    { label: "", url: "https://x.dev/a" },
    { label: "Bad", url: "javascript:alert(1)" },
    { label: "Empty", url: "" },
  ] });
  assert.deepEqual(out, { links: [{ label: "Site", url: "https://example.com/" }, { label: "https://x.dev/a", url: "https://x.dev/a" }] });
  assert.equal(webLink("mailto:a@b.c"), null);
});

test("new section names never collide", () => {
  assert.equal(uniqueLabel("Custom Section", ["About"]), "Custom Section");
  assert.equal(uniqueLabel("Custom Section", ["custom section", "Custom Section 2"]), "Custom Section 3");
});
