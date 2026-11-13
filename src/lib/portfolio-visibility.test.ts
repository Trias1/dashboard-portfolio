import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { isPubliclyVisible, storagePathsIn, visibilityStatus } from "./portfolio-visibility.ts";

test("the public sees only published, not taken down, active-owner portfolios", () => {
  assert.equal(isPubliclyVisible({ is_published: true }, true), true);
  assert.equal(isPubliclyVisible({ is_published: true, taken_down_at: null }, undefined), true);
  assert.equal(isPubliclyVisible({ is_published: false }, true), false);
  assert.equal(isPubliclyVisible({ is_published: true, taken_down_at: "2026-11-13T00:00:00Z" }, true), false);
  assert.equal(isPubliclyVisible({ is_published: true }, false), false);
  assert.equal(isPubliclyVisible(null, true), false);
});

test("status explains why a portfolio is hidden, takedown first", () => {
  assert.equal(visibilityStatus(null, true), "none");
  assert.equal(visibilityStatus({ is_published: false, taken_down_at: "x" }, false), "taken-down");
  assert.equal(visibilityStatus({ is_published: true }, false), "owner-inactive");
  assert.equal(visibilityStatus({ is_published: true }, true), "live");
  assert.equal(visibilityStatus({ is_published: false }, true), "draft");
});

test("finds our own upload paths and nothing else", () => {
  const base = "https://abc.supabase.co/storage/v1/object/public/uploads";
  const text = JSON.stringify([
    { photo_url: `${base}/photos/about-2-1f2e.jpg?v=3` },
    { cv: `${base}/cv/cv-2-aa11.pdf` },
    { again: `${base}/photos/about-2-1f2e.jpg` },
    { other: "https://abc.supabase.co/storage/v1/object/public/other-bucket/photos/x.jpg" },
    { outside: "https://cdn.example.com/storage/v1/object/public/uploadsX/photos/y.jpg" },
    { google: "https://lh3.googleusercontent.com/a/photo" },
  ]);
  assert.deepEqual(storagePathsIn(text, "uploads").sort(), ["cv/cv-2-aa11.pdf", "photos/about-2-1f2e.jpg"]);
});
