import assert from "node:assert/strict";
import test from "node:test";
import { current, previous } from "../examples/synthetic-drift.js";
import { compareSnapshots, type ComparisonResult } from "../src/comparison.js";
import { validateSnapshot } from "../src/validation.js";

function expectInsufficient(result: ComparisonResult, reason: string): void {
  assert.equal(result.status, "insufficient_evidence");
  if (result.status === "insufficient_evidence") assert.equal(result.reason, reason);
}

test("synthetic label flip reports arithmetic changes, not personality or causal conclusions", () => {
  const result = compareSnapshots(previous, current);
  assert.equal(result.status, "comparable");
  if (result.status !== "comparable") return;
  assert.deepEqual(result.label, { previous: "INTP", current: "INTJ", changed: true });
  assert.deepEqual(result.deltas, { "E-I": 1, "S-N": -1, "T-F": 0, "J-P": -6 });
  assert.equal(result.limitation, "DESCRIPTIVE_DIFFERENCES_ONLY_CAUSE_NOT_ESTABLISHED");
});

test("the same label can accompany a changed profile", () => {
  const result = compareSnapshots(previous, { ...current, displayedType: "INTP" });
  assert.equal(result.status, "comparable");
  if (result.status !== "comparable") return;
  assert.equal(result.label.changed, false);
  assert.equal(result.deltas["J-P"], -6);
});

test("different supplied labels do not imply different scores or trigger classification", () => {
  const result = compareSnapshots(previous, { ...current, dimensions: previous.dimensions });
  assert.equal(result.status, "comparable");
  if (result.status !== "comparable") return;
  assert.equal(result.label.changed, true);
  assert.deepEqual(Object.values(result.deltas), [0, 0, 0, 0]);
});

test("changing market alone does not prevent comparison", () => {
  assert.equal(compareSnapshots(previous, { ...current, market: "JP" }).status, "comparable");
});

test("language and instrument compatibility are explicit requirements", () => {
  for (const [field, value, reason] of [
    ["locale", "ja", "LOCALE_MISMATCH"],
    ["schemaVersion", "showcase-v2", "SCHEMA_VERSION_MISMATCH"],
    ["modelVersion", "illustrative-v2", "MODEL_VERSION_MISMATCH"],
    ["questionnaireVersion", "fictional-instrument-v2", "QUESTIONNAIRE_VERSION_MISMATCH"],
  ]) expectInsufficient(compareSnapshots(previous, { ...current, [field]: value }), reason);
});

test("invalid scores, incomplete dimensions and extra dimensions are rejected", () => {
  for (const score of [NaN, Infinity, -Infinity, -1, 101, "54", null]) {
    expectInsufficient(compareSnapshots(previous, { ...current, dimensions: { ...current.dimensions, "J-P": score } }), "INVALID_SNAPSHOT");
  }
  expectInsufficient(compareSnapshots(previous, { ...current, dimensions: { "J-P": 48 } }), "INVALID_SNAPSHOT");
  expectInsufficient(compareSnapshots(previous, { ...current, dimensions: { ...current.dimensions, extra: 12 } }), "INVALID_SNAPSHOT");
  assert.equal(compareSnapshots(previous, { ...current, dimensions: { "E-I": 0, "S-N": 100, "T-F": 0, "J-P": 100 } }).status, "comparable");
});

test("date parsing cannot silently normalize impossible dates", () => {
  for (const capturedAt of ["2026-02-30T12:00:00.000Z", "yesterday", "2026-02-01", "2026-02-01T12:00:00+09:00"]) {
    expectInsufficient(compareSnapshots(previous, { ...current, capturedAt }), "INVALID_SNAPSHOT");
  }
  expectInsufficient(compareSnapshots(current, previous), "NON_CHRONOLOGICAL");
  expectInsufficient(compareSnapshots(previous, previous), "NON_CHRONOLOGICAL");
});

test("invalid versions, labels and context cannot bypass validation", () => {
  for (const patch of [{ schemaVersion: "" }, { modelVersion: " " }, { questionnaireVersion: null }, { displayedType: "UNKNOWN" }, { locale: "TW" }, { market: "en" }]) {
    expectInsufficient(compareSnapshots(previous, { ...current, ...patch }), "INVALID_SNAPSHOT");
  }
  for (const value of [null, undefined, [], "snapshot"]) expectInsufficient(compareSnapshots(value, current), "INVALID_SNAPSHOT");
});

test("comparison output and validation errors do not echo extra input fields", () => {
  const extraValue = "synthetic-private-field";
  const input = { ...current, excludedExample: extraValue };
  const result = compareSnapshots(previous, input);
  assert.equal(JSON.stringify(result).includes(extraValue), false);
  const validation = validateSnapshot(input);
  assert.equal(validation.valid, true);
  assert.equal(JSON.stringify(validation).includes(extraValue), false);
  const error = compareSnapshots(previous, { ...input, modelVersion: extraValue + "!" });
  assert.equal(JSON.stringify(error).includes(extraValue), false);
});

test("comparison does not mutate input snapshots", () => {
  const before = JSON.stringify([previous, current]);
  compareSnapshots(previous, current);
  assert.equal(JSON.stringify([previous, current]), before);
});

test("decimal artifacts are normalized without imposing a zero tolerance", () => {
  const before = { ...previous, dimensions: { "E-I": 0.2, "S-N": 0.1, "T-F": 0, "J-P": 0.5 } };
  const after = { ...current, dimensions: { "E-I": 0.3, "S-N": 0.2, "T-F": 1e-15, "J-P": 0.5 } };
  const result = compareSnapshots(before, after);
  assert.equal(result.status, "comparable");
  if (result.status !== "comparable") return;
  assert.equal(result.deltas["E-I"], 0.1);
  assert.equal(result.deltas["S-N"], 0.1);
  assert.equal(result.deltas["T-F"], 1e-15);
  assert.equal(result.deltas["J-P"], 0);
});
