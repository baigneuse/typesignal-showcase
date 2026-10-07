import assert from "node:assert/strict";
import test from "node:test";
import { createClientId } from "../src/client-id.js";

test("uses the supplied randomUUID implementation when available", () => {
  const expected = "00000000-0000-4000-8000-000000000000";
  assert.equal(createClientId({
    randomUUID: () => expected,
    getRandomValues: () => { throw new Error("randomUUID should be preferred"); },
  }), expected);
});

test("getRandomValues fallback formats a version 4 identifier", () => {
  const source = { getRandomValues: (bytes: Uint8Array) => bytes.fill(0) } as unknown as Crypto;
  assert.equal(createClientId(source), "00000000-0000-4000-8000-000000000000");
});

test("non-crypto fallback is explicitly local and not a security credential", () => {
  const source = {} as Crypto;
  const first = createClientId(source);
  const second = createClientId(source);
  assert.match(first, /^local-/);
  assert.notEqual(first, second);
});
