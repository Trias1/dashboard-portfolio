import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { liveScreenshotUrl, projectImage } from "./project-screenshot.ts";

test("builds an mShots URL for web links only", () => {
  assert.equal(liveScreenshotUrl("https://linkhub.example.dev/"), "https://s.wordpress.com/mshots/v1/https%3A%2F%2Flinkhub.example.dev%2F?w=1200&h=800");
  assert.equal(liveScreenshotUrl("javascript:alert(1)"), null);
  assert.equal(liveScreenshotUrl("not a url"), null);
  assert.equal(liveScreenshotUrl(""), null);
  assert.equal(liveScreenshotUrl(undefined), null);
});

test("a project's own image wins over the screenshot", () => {
  assert.equal(projectImage({ image_url: "https://cdn.example/p.png", demo_url: "https://a.dev" }), "https://cdn.example/p.png");
  assert.match(projectImage({ image_url: "", demo_url: "https://a.dev" }) || "", /^https:\/\/s\.wordpress\.com\/mshots\/v1\//);
  assert.equal(projectImage({ image_url: null, demo_url: null }), null);
});
