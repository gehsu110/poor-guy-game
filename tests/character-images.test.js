import test from "node:test";
import assert from "node:assert/strict";
import { createCharacterImageLoader } from "../src/components/atelier/characterImages.js";

test("a character waits for its slowest part and shares pending decodes", async () => {
  const pending = new Map();
  const calls = [];
  const load = createCharacterImageLoader((src) => {
    calls.push(src);
    return new Promise((resolve) => pending.set(src, resolve));
  });
  let visible = false;
  const character = load(["body", "head", "book", "head"]).then(() => {
    visible = true;
  });
  const portrait = load(["head"]);
  await Promise.resolve();
  pending.get("head")();
  await portrait;
  assert.equal(visible, false);
  pending.get("book")();
  await Promise.resolve();
  assert.equal(visible, false);
  pending.get("body")();
  await character;
  assert.equal(visible, true);
  assert.deepEqual(calls.sort(), ["body", "book", "head"]);
  await load(["head"]);
  assert.equal(calls.length, 3);
});

test("failed parts reject the assembly and can retry without reloading good parts", async () => {
  const calls = [];
  const load = createCharacterImageLoader(async (src) => {
    calls.push(src);
    if (src === "hat" && calls.filter((item) => item === "hat").length === 1) {
      throw new Error("offline");
    }
  });
  await assert.rejects(load(["body", "hat"]), /offline/);
  await load(["body", "hat"]);
  assert.deepEqual(calls, ["body", "hat", "hat"]);
});
