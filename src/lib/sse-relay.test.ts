import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { relayCompletionTokens } from "./sse-relay.ts";

const sse = (tokens: string[]) =>
  tokens.map((t) => `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`).join("") + "data: [DONE]\n\n";

const streamOf = (chunks: string[]) => {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(c) { chunks.forEach((ch) => c.enqueue(enc.encode(ch))); c.close(); },
  });
};

async function collect(chunks: string[]) {
  const events: { token?: string; done?: true }[] = [];
  await relayCompletionTokens(streamOf(chunks), (e) => events.push(e));
  return events;
}

const tokens = ["Core skills: ", "**Backend:** Spring Boot (Java), ", "**Databases:** PostgreSQL, MySQL"];

test("keeps every token when a data line is split across network chunks", async () => {
  const body = sse(tokens);
  // Cut the stream into 7-byte chunks so most lines end mid-JSON
  const chunks = body.match(/[\s\S]{1,7}/g)!;
  const events = await collect(chunks);
  assert.equal(events.filter((e) => e.token).map((e) => e.token).join(""), tokens.join(""));
  assert.deepEqual(events.at(-1), { done: true });
});

test("keeps multi-byte characters split between chunks", async () => {
  const bytes = new TextEncoder().encode(sse(["Keahlian – é ✓"]));
  const stream = new ReadableStream<Uint8Array>({
    start(c) { for (let i = 0; i < bytes.length; i += 3) c.enqueue(bytes.slice(i, i + 3)); c.close(); },
  });
  const events: { token?: string }[] = [];
  await relayCompletionTokens(stream, (e) => events.push(e));
  assert.equal(events.map((e) => e.token ?? "").join(""), "Keahlian – é ✓");
});

test("handles a last line without a trailing newline", async () => {
  const events = await collect([`data: ${JSON.stringify({ choices: [{ delta: { content: "end" } }] })}`]);
  assert.deepEqual(events, [{ token: "end" }]);
});
