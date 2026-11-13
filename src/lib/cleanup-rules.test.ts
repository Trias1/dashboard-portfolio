import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { ORPHAN_MAX_DELETES, isCronAuthorized, pickOrphans } from "./cleanup-rules.ts";

const SECRET = "s3cret-value-long-enough";
const NOW = Date.parse("2026-11-13T00:00:00Z");
const daysAgo = (n: number) => new Date(NOW - n * 864e5).toISOString();

test("cron auth needs the exact bearer secret, and a configured secret", () => {
  assert.equal(isCronAuthorized(`Bearer ${SECRET}`, SECRET), true);
  assert.equal(isCronAuthorized(`Bearer ${SECRET}x`, SECRET), false);
  assert.equal(isCronAuthorized(SECRET, SECRET), false);
  assert.equal(isCronAuthorized(null, SECRET), false);
  assert.equal(isCronAuthorized("Bearer ", ""), false);
  assert.equal(isCronAuthorized("Bearer undefined", undefined), false);
  assert.equal(isCronAuthorized("Bearer short", "short"), false);
});

test("only unused files older than a week are removed", () => {
  const files = [
    { path: "cv/old-unused.pdf", createdAt: daysAgo(30) },
    { path: "cv/new-unused.pdf", createdAt: daysAgo(2) },
    { path: "photos/used.jpg", createdAt: daysAgo(90) },
    { path: "photos/no-date.jpg", createdAt: null },
    { path: "projects/a.png", createdAt: daysAgo(10) },
    { path: "projects/b.png", createdAt: daysAgo(10) },
  ];
  const referenced = JSON.stringify([{ photo_url: "https://x.supabase.co/storage/v1/object/public/uploads/photos/used.jpg?v=2" },
    { image_url: ".../projects/a.png" }, { image_url: ".../projects/b.png" }]);
  const result = pickOrphans(files, referenced, NOW);
  assert.deepEqual(result.remove, ["cv/old-unused.pdf"]);
  assert.equal(result.unused, 3);
  assert.equal(result.skipped, null);
});

test("refuses to delete when most of the bucket looks unused", () => {
  const files = Array.from({ length: 30 }, (_, i) => ({ path: `photos/p${i}.jpg`, createdAt: daysAgo(30) }));
  const result = pickOrphans(files, "", NOW);
  assert.deepEqual(result.remove, []);
  assert.match(result.skipped || "", /too many/);
});

test("a small bucket may lose up to ten files, and a run never removes more than the cap", () => {
  const few = Array.from({ length: 4 }, (_, i) => ({ path: `cv/c${i}.pdf`, createdAt: daysAgo(30) }));
  assert.equal(pickOrphans(few, "", NOW).remove.length, 4);
  const many = Array.from({ length: 1000 }, (_, i) => ({ path: `cv/c${i}.pdf`, createdAt: daysAgo(30) }));
  const used = many.slice(0, 600).map((f) => f.path).join(",");
  assert.equal(pickOrphans(many, used, NOW).remove.length, Math.min(400, ORPHAN_MAX_DELETES));
});
