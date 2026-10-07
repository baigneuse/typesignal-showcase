import { compareSnapshots } from "../src/comparison.js";
import { explainComparison } from "../src/explanation.js";
import type { Snapshot } from "../src/model.js";

/**
 * Hand-authored fictional values. Not a user record, production output, validated
 * instrument or reproduction of TypeSignal's scoring. Labels are supplied.
 * Two observations describe differences; they cannot establish their cause.
 */
export const previous: Snapshot = {
  id: "synthetic-previous",
  schemaVersion: "showcase-v1",
  modelVersion: "illustrative-v1",
  questionnaireVersion: "fictional-instrument-v1",
  capturedAt: "2026-01-01T12:00:00.000Z",
  locale: "en",
  market: "GLOBAL_EN",
  displayedType: "INTP",
  dimensions: { "E-I": 65, "S-N": 68, "T-F": 32, "J-P": 54 },
};

export const current: Snapshot = {
  ...previous,
  id: "synthetic-current",
  capturedAt: "2026-02-01T12:00:00.000Z",
  displayedType: "INTJ",
  dimensions: { "E-I": 66, "S-N": 67, "T-F": 32, "J-P": 48 },
};

export const comparison = compareSnapshots(previous, current);

export const third: Snapshot = {
  ...previous,
  id: "synthetic-third",
  capturedAt: "2026-03-01T12:00:00.000Z",
  displayedType: "INTP",
  dimensions: { "E-I": 65, "S-N": 68, "T-F": 32, "J-P": 53 },
};

// Chronological pairs only. Three fictional records do not establish a trend,
// population statistic, measurement reliability or psychological explanation.
export const sequence = [previous, current, third] as const;
export const comparisons = [comparison, compareSnapshots(current, third)];
export const explanations = comparisons.map(explainComparison);

// Safe to print: this module contains only the explicit fictional fixture above.
if (process.argv[1]?.replaceAll("\\", "/").endsWith("/synthetic-drift.js")) {
  console.log(JSON.stringify({
    notice: "SYNTHETIC_ILLUSTRATION_NOT_PRODUCTION_DATA",
    labels: sequence.map((snapshot) => snapshot.displayedType),
    pairs: comparisons.map((pair, index) => ({
      from: `T${index + 1}`,
      to: `T${index + 2}`,
      comparison: pair,
      explanation: explanations[index],
    })),
  }, null, 2));
}
