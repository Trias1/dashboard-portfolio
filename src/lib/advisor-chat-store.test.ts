import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { clearAdvisorChats, loadAdvisorChat, saveAdvisorChat } from "./advisor-chat-store.ts";

/** Minimal sessionStorage stand-in on a fake window, like the browser's. */
function fakeWindow() {
  const data = new Map<string, string>();
  const sessionStorage = {
    get length() { return data.size; },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, String(v)); },
    removeItem: (k: string) => { data.delete(k); },
  };
  (globalThis as { window?: unknown }).window = { sessionStorage };
  return data;
}

type Msg = { role: string; content: string };

test("saves and restores one conversation per account", () => {
  fakeWindow();
  saveAdvisorChat<Msg>(7, { messages: [{ role: "user", content: "hi" }, { role: "assistant", content: "hello" }], score: { score: 5, total: 6 } });
  assert.deepEqual(loadAdvisorChat<Msg>(7), { messages: [{ role: "user", content: "hi" }, { role: "assistant", content: "hello" }], score: { score: 5, total: 6 } });
  assert.equal(loadAdvisorChat<Msg>(8), null);
  assert.equal(loadAdvisorChat<Msg>(undefined), null);
});

test("keeps only the last 40 messages", () => {
  fakeWindow();
  const messages = Array.from({ length: 50 }, (_, i) => ({ role: "user", content: String(i) }));
  saveAdvisorChat<Msg>(1, { messages, score: null });
  const back = loadAdvisorChat<Msg>(1)!;
  assert.equal(back.messages.length, 40);
  assert.equal(back.messages[0].content, "10");
});

test("ignores broken or foreign data", () => {
  const data = fakeWindow();
  data.set("advisor-chat:1", "{not json");
  assert.equal(loadAdvisorChat<Msg>(1), null);
  data.set("advisor-chat:2", JSON.stringify({ messages: [{ role: "system", content: "x" }, { role: "user" }, null], score: { score: "a" } }));
  assert.equal(loadAdvisorChat<Msg>(2), null);
  data.set("advisor-chat:3", JSON.stringify({ messages: [{ role: "user", content: "ok" }], score: { score: "a", total: 6 } }));
  assert.deepEqual(loadAdvisorChat<Msg>(3), { messages: [{ role: "user", content: "ok" }], score: null });
});

test("clears one account, or every stored chat on sign-out", () => {
  const data = fakeWindow();
  data.set("other", "keep");
  saveAdvisorChat<Msg>(1, { messages: [{ role: "user", content: "a" }], score: null });
  saveAdvisorChat<Msg>(2, { messages: [{ role: "user", content: "b" }], score: null });
  clearAdvisorChats(1);
  assert.equal(loadAdvisorChat<Msg>(1), null);
  assert.ok(loadAdvisorChat<Msg>(2));
  clearAdvisorChats();
  assert.equal(loadAdvisorChat<Msg>(2), null);
  assert.equal(data.get("other"), "keep");
});

test("does nothing when storage is blocked", () => {
  (globalThis as { window?: unknown }).window = { get sessionStorage() { throw new Error("SecurityError"); } };
  assert.doesNotThrow(() => saveAdvisorChat<Msg>(1, { messages: [], score: null }));
  assert.equal(loadAdvisorChat<Msg>(1), null);
  assert.doesNotThrow(() => clearAdvisorChats());
});
