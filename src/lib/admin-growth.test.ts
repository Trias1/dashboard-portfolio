import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { dayBuckets, weekBuckets } from "./admin-growth.ts";

const NOW = Date.parse("2026-11-13T10:00:00Z"); // a Friday

test("day buckets are zero-filled, oldest first, and ignore dates outside the range", () => {
  const out = dayBuckets(["2026-11-13T01:00:00Z", "2026-11-13T23:59:00Z", "2026-11-11T12:00:00Z", "2026-10-01T00:00:00Z", null, "nope"], 3, NOW);
  assert.deepEqual(out, [
    { date: "2026-11-11", count: 1 },
    { date: "2026-11-12", count: 0 },
    { date: "2026-11-13", count: 2 },
  ]);
});

test("week buckets start on Monday (UTC) and include the current week", () => {
  const out = weekBuckets(["2026-11-09T00:00:00Z", "2026-11-08T23:59:59Z", "2026-11-13T09:00:00Z", "2026-01-01T00:00:00Z"], 2, NOW);
  assert.deepEqual(out, [
    { week: "2026-11-02", count: 1 },
    { week: "2026-11-09", count: 2 },
  ]);
});
