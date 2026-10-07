import assert from "node:assert/strict";
import test from "node:test";
import { scanText, scanFileName } from "./check-public.mjs";

test("release gate catches representative token classes without echoing their values", () => {
  for (const value of ["sk_" + "test_" + "x".repeat(24), "gh" + "p_" + "x".repeat(30), "wh" + "sec_" + "x".repeat(24)]) {
    const result = scanText("example.ts", value);
    assert.ok(result.some((item) => item.category === "credential"));
    assert.ok(!JSON.stringify(result).includes(value));
  }
});

test("private paths, personal mail, provider URLs and database strings fail closed", () => {
  const inputs = [
    ["C:" + "\\" + "Users" + "\\" + "fictional" + "\\" + "file", "private-path"],
    ["fictional" + "@" + "example.invalid", "personal-email"],
    ["postgre" + "sql://" + "placeholder", "database-connection"],
    ["https:" + "//" + "fictional." + "supabase.co", "provider-host"],
    ["https:" + "//" + "typesignal.app/report/fictional", "unapproved-url"],
  ];
  for (const [input, category] of inputs) assert.ok(scanText("fixture.ts", input).some((item) => item.category === category));
});

test("only approved public product links and noreply identities are accepted", () => {
  assert.deepEqual(scanText("README.md", "https://typesignal.app/ja"), []);
  assert.deepEqual(scanText("git/commit", "reviewer" + "@users.noreply.github.com"), []);
  assert.ok(scanText("README.md", "https://typesignal.app/ja?" + "state=fictional").length);
});

test("unreviewed and source-map files cannot enter the public allowlist", () => {
  const names = new Set(["src/context.ts"]);
  assert.deepEqual(scanFileName("src/context.ts", names), []);
  assert.equal(scanFileName("src/new-engine.ts", names)[0].category, "not-allowlisted");
  assert.equal(scanFileName("src/context.js.map", names)[0].category, "prohibited-file");
  assert.equal(scanFileName(".env.local", names)[0].category, "prohibited-file");
});
