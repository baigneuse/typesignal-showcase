import assert from "node:assert/strict";
import test from "node:test";
import { comparisons, current, explanations, previous, sequence, third } from "../examples/synthetic-drift.js";
import { compareSnapshots } from "../src/comparison.js";
import { explainComparison } from "../src/explanation.js";

test("synthetic sequence exposes direction and largest magnitude without inferring causes", () => {
  assert.deepEqual(sequence.map((snapshot) => snapshot.displayedType), ["INTP", "INTJ", "INTP"]);
  assert.equal(comparisons.length, 2);
  const first = explanations[0];
  assert.equal(first.status, "descriptive");
  if (first.status !== "descriptive") return;
  assert.equal(first.labelSummary, "The supplied label changed from INTP to INTJ.");
  const largest = first.dimensionObservations.filter((observation) => observation.largestAbsoluteChange);
  assert.equal(largest.length, 1);
  assert.equal(largest[0].dimension, "J-P");
  assert.equal(largest[0].delta, -6);
  assert.match(largest[0].text, /6 points toward J/);
  assert.match(first.dimensionObservations[0].text, /1 point toward I/);
  assert.match(first.dimensionObservations[2].text, /no numerical change/);
  assert.match(first.limitation, /not probabilities, evidence of a cause or a diagnosis/);
  const second = explanations[1];
  assert.equal(second.status, "descriptive");
  if (second.status !== "descriptive") return;
  assert.match(second.dimensionObservations[3].text, /5 points toward P/);
  const total = compareSnapshots(previous, third);
  assert.equal(total.status, "comparable");
  if (total.status === "comparable") {
    assert.equal(total.label.changed, false);
    assert.equal(total.deltas["J-P"], -1);
  }
});

test("ties are narrated as ties, including decimal differences", () => {
  const result = compareSnapshots(
    { ...previous, dimensions: { "E-I": 0.2, "S-N": 0.1, "T-F": 0, "J-P": 0 } },
    { ...current, dimensions: { "E-I": 0.3, "S-N": 0.2, "T-F": 0, "J-P": 0 } },
  );
  const explanation = explainComparison(result);
  assert.equal(explanation.status, "descriptive");
  if (explanation.status !== "descriptive") return;
  const largest = explanation.dimensionObservations.filter((observation) => observation.largestAbsoluteChange);
  assert.equal(largest.length, 2);
  for (const observation of largest) assert.match(observation.text, /tied for the largest/);
});

test("no movement is not described as a strongest signal or a causal explanation", () => {
  const explanation = explainComparison(compareSnapshots(previous, { ...current, dimensions: previous.dimensions }));
  assert.equal(explanation.status, "descriptive");
  if (explanation.status !== "descriptive") return;
  assert.match(explanation.labelSummary, /supplied label changed/);
  for (const observation of explanation.dimensionObservations) {
    assert.equal(observation.largestAbsoluteChange, false);
    assert.match(observation.text, /no numerical change/);
  }
});

test("incompatible records produce no directional narrative", () => {
  const explanation = explainComparison(compareSnapshots(previous, { ...current, locale: "ja" }));
  assert.equal(explanation.status, "insufficient_evidence");
  if (explanation.status !== "insufficient_evidence") return;
  assert.equal(explanation.reason, "LOCALE_MISMATCH");
  assert.match(explanation.summary, /No change interpretation is generated/);
  assert.equal("dimensionObservations" in explanation, false);
});

test("unchanged labels do not suppress dimension narration", () => {
  const explanation = explainComparison(compareSnapshots(previous, { ...current, displayedType: previous.displayedType }));
  assert.equal(explanation.status, "descriptive");
  if (explanation.status !== "descriptive") return;
  assert.match(explanation.labelSummary, /stayed INTP; compare the dimensions separately/);
  assert.match(explanation.dimensionObservations[3].text, /6 points toward J/);
});
